import { ToolManager } from './tool-manager';
import { EventBus } from './event-bus';
import { Logger } from './logger';
import { ITool, ToolResult } from './tool';
import { ModuleContext } from './module-loader';
import { PermissionManager } from './permission-manager';
import { ToolError, ToolExecutionError } from './errors';

/**
 * ToolRunner is responsible for orchestrating the execution lifecycle of registered tools.
 * It manages initialization, parameter validation, asynchronous execution, error handling,
 * execution timing, and guaranteed resource cleanup.
 */
export class ToolRunner {
  private toolManager: ToolManager;
  private permissionManager: PermissionManager;
  private eventBus: EventBus;
  private logger: Logger;
  private context: ModuleContext;

  constructor(
    toolManager: ToolManager,
    permissionManager: PermissionManager,
    eventBus: EventBus,
    logger: Logger,
    context?: ModuleContext
  ) {
    if (!toolManager) throw new ToolError('ToolManager is required.', 'MISSING_DEPENDENCY');
    if (!permissionManager) throw new ToolError('PermissionManager is required.', 'MISSING_DEPENDENCY');
    if (!eventBus) throw new ToolError('EventBus is required.', 'MISSING_DEPENDENCY');
    if (!logger) throw new ToolError('Logger is required.', 'MISSING_DEPENDENCY');

    this.toolManager = toolManager;
    this.permissionManager = permissionManager;
    this.eventBus = eventBus;
    this.logger = logger;
    this.context = context || { eventBus, logger };
    this.logger.info('ToolRunner', 'ToolRunner execution engine initialized.');
  }

  /**
   * Helper method to construct a standardized failed ToolResult.
   */
  private createFailedResult<TResult = unknown>(
    code: string,
    message: string,
    durationMs: number,
    details?: unknown
  ): ToolResult<TResult> {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {})
      },
      durationMs,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Orchestrates the complete execution lifecycle of a tool by its ID.
   * 
   * @param toolId The unique identifier of the tool to execute
   * @param args The input arguments for the tool
   * @returns A promise resolving to a standardized ToolResult
   */
  public async execute<TArgs = unknown, TResult = unknown>(
    toolId: string,
    args: TArgs
  ): Promise<ToolResult<TResult>> {
    const startTime = performance.now();

    // 1. Retrieve the tool from the Tool Manager
    if (!this.toolManager.has(toolId)) {
      const errorMsg = `Tool [${toolId}] is not registered.`;
      this.logger.error('ToolRunner', `Execution failed: ${errorMsg}`);
      
      const result = this.createFailedResult<TResult>('TOOL_NOT_FOUND', errorMsg, 0);

      this.eventBus.publish('tool.failed', 'ToolRunner', {
        toolId,
        error: errorMsg,
        timestamp: result.timestamp
      });

      return result;
    }

    const tool = this.toolManager.get(toolId)!;

    // 2. Check if the tool is disabled
    try {
      const status = this.toolManager.getStatus(toolId);
      if (status === 'disabled') {
        const errorMsg = `Tool [${toolId}] is disabled and cannot be executed.`;
        this.logger.warn('ToolRunner', `Execution blocked: ${errorMsg}`);

        const result = this.createFailedResult<TResult>('TOOL_DISABLED', errorMsg, 0);

        this.eventBus.publish('tool.failed', 'ToolRunner', {
          toolId,
          error: errorMsg,
          timestamp: result.timestamp
        });

        return result;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const errorMsg = `Failed to check status for tool [${toolId}]: ${message}`;
      this.logger.error('ToolRunner', errorMsg);

      const result = this.createFailedResult<TResult>('STATUS_CHECK_ERROR', errorMsg, 0, err);

      this.eventBus.publish('tool.failed', 'ToolRunner', {
        toolId,
        error: errorMsg,
        timestamp: result.timestamp
      });

      return result;
    }

    // 2.5. Evaluate execution permissions via PermissionManager
    const requiredPermissions = tool.metadata.requiredPermissions;
    const permissionDecision = this.permissionManager.evaluateRequest(toolId, requiredPermissions);

    if (!permissionDecision.allowed) {
      const errorMsg = permissionDecision.reason;
      this.logger.warn('ToolRunner', `Execution blocked: ${errorMsg}`);

      const result = this.createFailedResult<TResult>('PERMISSION_DENIED', errorMsg, 0);

      this.eventBus.publish('permission.denied', 'ToolRunner', {
        toolId,
        reason: errorMsg,
        timestamp: result.timestamp
      });

      this.eventBus.publish('tool.failed', 'ToolRunner', {
        toolId,
        error: errorMsg,
        timestamp: result.timestamp
      });

      return result;
    }

    // 3. Handle asynchronous initialization if the tool is uninitialized
    if (tool.getStatus() === 'uninitialized') {
      try {
        this.logger.info('ToolRunner', `Initializing tool [${toolId}] before execution...`);
        await tool.initialize(this.context);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        const errorMsg = `Asynchronous initialization failed for tool [${toolId}]: ${message}`;
        this.logger.error('ToolRunner', errorMsg);

        const durationMs = Math.round(performance.now() - startTime);
        const result = this.createFailedResult<TResult>('INITIALIZATION_FAILED', errorMsg, durationMs, err);

        this.eventBus.publish('tool.failed', 'ToolRunner', {
          toolId,
          error: errorMsg,
          timestamp: result.timestamp
        });

        return result;
      }
    }

    // 4. Publish executing event
    this.logger.info('ToolRunner', `Executing tool [${toolId}] with arguments.`);
    this.eventBus.publish('tool.executing', 'ToolRunner', {
      toolId,
      timestamp: new Date().toISOString(),
      args
    });

    let toolResult: ToolResult<TResult>;

    try {
      // 5. Validate tool arguments before execution
      let isValid = false;
      try {
        isValid = await tool.validate(args);
      } catch (validationErr: unknown) {
        const message = validationErr instanceof Error ? validationErr.message : String(validationErr);
        const errorMsg = `Validation threw an error for tool [${toolId}]: ${message}`;
        this.logger.error('ToolRunner', errorMsg);

        const durationMs = Math.round(performance.now() - startTime);
        toolResult = this.createFailedResult<TResult>('VALIDATION_ERROR', errorMsg, durationMs, validationErr);

        this.eventBus.publish('tool.failed', 'ToolRunner', {
          toolId,
          error: errorMsg,
          timestamp: toolResult.timestamp
        });

        return toolResult;
      }

      if (!isValid) {
        const errorMsg = `Argument validation failed for tool [${toolId}].`;
        this.logger.warn('ToolRunner', errorMsg);

        const durationMs = Math.round(performance.now() - startTime);
        toolResult = this.createFailedResult<TResult>('VALIDATION_FAILED', errorMsg, durationMs);

        this.eventBus.publish('tool.failed', 'ToolRunner', {
          toolId,
          error: errorMsg,
          timestamp: toolResult.timestamp
        });

        return toolResult;
      }

      // 6. Execute the tool
      try {
        const executionResult = await tool.execute(args);
        
        const durationMs = Math.round(performance.now() - startTime);
        toolResult = {
          ...executionResult,
          durationMs, // Keep the overall duration measured by the runner
          timestamp: new Date().toISOString()
        };
      } catch (executionErr: unknown) {
        const message = executionErr instanceof Error ? executionErr.message : String(executionErr);
        const errorMsg = `Execution threw an error for tool [${toolId}]: ${message}`;
        this.logger.error('ToolRunner', errorMsg);

        const durationMs = Math.round(performance.now() - startTime);
        toolResult = this.createFailedResult<TResult>('EXECUTION_ERROR', errorMsg, durationMs, executionErr);
      }
    } finally {
      // 7. Guaranteed resource cleanup
      try {
        await tool.cleanup();
      } catch (cleanupErr: unknown) {
        const message = cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr);
        this.logger.error('ToolRunner', `Cleanup failed for tool [${toolId}]: ${message}`);
        // We do not overwrite the main execution result if cleanup fails, but we log it
      }
    }

    // 8. Publish completion or failure event depending on success
    if (toolResult.success) {
      this.logger.info('ToolRunner', `Tool [${toolId}] completed successfully in ${toolResult.durationMs}ms.`);
      this.eventBus.publish('tool.completed', 'ToolRunner', {
        toolId,
        result: toolResult,
        timestamp: toolResult.timestamp
      });
    } else {
      const errorMsg = toolResult.error?.message || `Execution failed for tool [${toolId}].`;
      this.logger.warn('ToolRunner', `Tool [${toolId}] execution failed.`);
      this.eventBus.publish('tool.failed', 'ToolRunner', {
        toolId,
        error: errorMsg,
        timestamp: toolResult.timestamp
      });
    }

    return toolResult;
  }
}

