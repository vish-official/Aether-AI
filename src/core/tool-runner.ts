import { ToolManager } from './tool-manager';
import { EventBus } from './event-bus';
import { Logger } from './logger';
import { ITool, ToolResult } from './tool';
import { ModuleContext } from './module-loader';
import { PermissionManager } from './permission-manager';

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
    if (!toolManager) throw new Error('ToolRunner Error: ToolManager is required.');
    if (!permissionManager) throw new Error('ToolRunner Error: PermissionManager is required.');
    if (!eventBus) throw new Error('ToolRunner Error: EventBus is required.');
    if (!logger) throw new Error('ToolRunner Error: Logger is required.');

    this.toolManager = toolManager;
    this.permissionManager = permissionManager;
    this.eventBus = eventBus;
    this.logger = logger;
    this.context = context || { eventBus, logger };
    this.logger.info('ToolRunner', 'ToolRunner execution engine initialized.');
  }

  /**
   * Orchestrates the complete execution lifecycle of a tool by its ID.
   * 
   * @param toolId The unique identifier of the tool to execute
   * @param args The input arguments for the tool
   * @returns A promise resolving to a standardized ToolResult
   */
  public async execute<TArgs = any, TResult = any>(
    toolId: string,
    args: TArgs
  ): Promise<ToolResult<TResult>> {
    const timestamp = new Date().toISOString();
    const startTime = performance.now();

    // 1. Retrieve the tool from the Tool Manager
    if (!this.toolManager.has(toolId)) {
      const errorMsg = `Tool [${toolId}] is not registered.`;
      this.logger.error('ToolRunner', `Execution failed: ${errorMsg}`);
      
      const result: ToolResult = {
        success: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: errorMsg
        },
        durationMs: 0,
        timestamp: new Date().toISOString()
      };

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

        const result: ToolResult = {
          success: false,
          error: {
            code: 'TOOL_DISABLED',
            message: errorMsg
          },
          durationMs: 0,
          timestamp: new Date().toISOString()
        };

        this.eventBus.publish('tool.failed', 'ToolRunner', {
          toolId,
          error: errorMsg,
          timestamp: result.timestamp
        });

        return result;
      }
    } catch (err: any) {
      const errorMsg = `Failed to check status for tool [${toolId}]: ${err.message}`;
      this.logger.error('ToolRunner', errorMsg);

      const result: ToolResult = {
        success: false,
        error: {
          code: 'STATUS_CHECK_ERROR',
          message: errorMsg,
          details: err
        },
        durationMs: 0,
        timestamp: new Date().toISOString()
      };

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

      const result: ToolResult = {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: errorMsg
        },
        durationMs: 0,
        timestamp: new Date().toISOString()
      };

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
      } catch (err: any) {
        const errorMsg = `Asynchronous initialization failed for tool [${toolId}]: ${err.message}`;
        this.logger.error('ToolRunner', errorMsg);

        const durationMs = Math.round(performance.now() - startTime);
        const result: ToolResult = {
          success: false,
          error: {
            code: 'INITIALIZATION_FAILED',
            message: errorMsg,
            details: err
          },
          durationMs,
          timestamp: new Date().toISOString()
        };

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
      } catch (validationErr: any) {
        const errorMsg = `Validation threw an error for tool [${toolId}]: ${validationErr.message}`;
        this.logger.error('ToolRunner', errorMsg);

        const durationMs = Math.round(performance.now() - startTime);
        toolResult = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: errorMsg,
            details: validationErr
          },
          durationMs,
          timestamp: new Date().toISOString()
        };

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
        toolResult = {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: errorMsg
          },
          durationMs,
          timestamp: new Date().toISOString()
        };

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
      } catch (executionErr: any) {
        const errorMsg = `Execution threw an error for tool [${toolId}]: ${executionErr.message}`;
        this.logger.error('ToolRunner', errorMsg);

        const durationMs = Math.round(performance.now() - startTime);
        toolResult = {
          success: false,
          error: {
            code: 'EXECUTION_ERROR',
            message: errorMsg,
            details: executionErr
          },
          durationMs,
          timestamp: new Date().toISOString()
        };
      }
    } finally {
      // 7. Guaranteed resource cleanup
      try {
        await tool.cleanup();
      } catch (cleanupErr: any) {
        this.logger.error('ToolRunner', `Cleanup failed for tool [${toolId}]: ${cleanupErr.message}`);
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
