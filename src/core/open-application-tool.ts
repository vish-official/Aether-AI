import { ITool, ToolStatus, ToolMetadata, ToolResult } from './tool';
import { ModuleContext } from './module-loader';

/**
 * Arguments supported by the OpenApplicationTool.
 * Can be a direct string (representing the application name) or a structured object.
 */
export interface OpenApplicationArgs {
  appName: string;
}

/**
 * OpenApplicationTool is a platform-aware system tool that launches a desktop
 * application by name on the host operating system.
 */
export class OpenApplicationTool implements ITool<OpenApplicationArgs | string, unknown> {
  public readonly metadata: ToolMetadata = {
    id: 'open-application',
    name: 'Open Application',
    description: 'Launches a desktop application by name on the host operating system (Windows, Linux, or macOS).',
    category: 'system',
    version: '1.0.0',
    requiredPermissions: ['system.launch_application'],
    supportedPlatforms: ['desktop', 'any']
  };

  private status: ToolStatus = 'uninitialized';
  private context?: ModuleContext;

  /**
   * Retrieves the current operational status of the tool.
   */
  public getStatus(): ToolStatus {
    return this.status;
  }

  /**
   * Performs asynchronous one-time initialization of the tool, supplying necessary context.
   */
  public async initialize(context: ModuleContext): Promise<void> {
    this.context = context;
    this.status = 'ready';
    this.context.logger.info('OpenApplicationTool', 'OpenApplicationTool initialized successfully.');
  }

  /**
   * Validates arguments before execution to guarantee safety, type-correctness, and non-emptiness.
   */
  public async validate(args: unknown): Promise<boolean> {
    if (args === null || args === undefined) {
      if (this.context) {
        this.context.logger.warn('OpenApplicationTool', 'Validation failed: arguments are null or undefined.');
      }
      return false;
    }

    // Direct string argument representing the application name
    if (typeof args === 'string') {
      const isValid = args.trim().length > 0;
      if (!isValid && this.context) {
        this.context.logger.warn('OpenApplicationTool', 'Validation failed: empty application name string.');
      }
      return isValid;
    }

    // Object argument representing structured inputs
    if (typeof args === 'object') {
      const obj = args as Record<string, unknown>;
      const appName = obj.appName ?? obj.name ?? obj.application;
      if (typeof appName !== 'string') {
        if (this.context) {
          this.context.logger.warn('OpenApplicationTool', 'Validation failed: appName must be a non-empty string.');
        }
        return false;
      }
      const isValid = appName.trim().length > 0;
      if (!isValid && this.context) {
        this.context.logger.warn('OpenApplicationTool', 'Validation failed: empty appName inside object.');
      }
      return isValid;
    }

    if (this.context) {
      this.context.logger.warn('OpenApplicationTool', `Validation failed: invalid argument type [${typeof args}].`);
    }
    return false;
  }

  /**
   * Executes the tool with the provided arguments, returning a structured ToolResult.
   */
  public async execute(args: OpenApplicationArgs | string): Promise<ToolResult<unknown>> {
    const startTime = performance.now();
    this.status = 'executing';

    // 1. Extract the application name
    let appName = '';
    if (typeof args === 'string') {
      appName = args.trim();
    } else if (args && typeof args === 'object') {
      const obj = args as unknown as Record<string, unknown>;
      const rawName = obj.appName ?? obj.name ?? obj.application ?? '';
      appName = typeof rawName === 'string' ? rawName.trim() : '';
    }

    const logPrefix = `[AppName: ${appName}]`;
    if (this.context) {
      this.context.logger.info('OpenApplicationTool', `Execution started ${logPrefix}`);
    }

    // 2. Check environment/platform availability
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    if (!isNode) {
      this.status = 'ready';
      const durationMs = Math.round(performance.now() - startTime);
      const errorMsg = 'Launching desktop applications is not supported in browser/web environments.';
      
      if (this.context) {
        this.context.logger.error('OpenApplicationTool', `Execution blocked: ${errorMsg}`);
      }

      return {
        success: false,
        error: {
          code: 'UNSUPPORTED_PLATFORM',
          message: errorMsg,
          details: { env: 'browser' }
        },
        durationMs,
        timestamp: new Date().toISOString()
      };
    }

    const platform = process.platform;
    let command = '';

    // 3. Assemble platform-specific launch command
    if (platform === 'darwin') {
      // macOS: open -a "AppName"
      command = `open -a "${appName}"`;
    } else if (platform === 'win32') {
      // Windows: cmd.exe /c start "" "AppName"
      command = `cmd.exe /c start "" "${appName}"`;
    } else if (platform === 'linux') {
      // Linux: Directly run the binary name. If it's a path or name with spaces, quote it.
      command = `"${appName}"`;
    } else {
      this.status = 'ready';
      const durationMs = Math.round(performance.now() - startTime);
      const errorMsg = `Operating system platform [${platform}] is not supported by OpenApplicationTool.`;
      
      if (this.context) {
        this.context.logger.error('OpenApplicationTool', errorMsg);
      }

      return {
        success: false,
        error: {
          code: 'UNSUPPORTED_PLATFORM',
          message: errorMsg,
          details: { platform }
        },
        durationMs,
        timestamp: new Date().toISOString()
      };
    }

    // 4. Asynchronously execute the command on the host OS
    try {
      // Using /* @vite-ignore */ to prevent Vite compilation issues in browser-targeted builds
      const { exec } = await import(/* @vite-ignore */ 'child_process');

      return new Promise<ToolResult<unknown>>((resolve) => {
        exec(command, (error: unknown, stdout: string, stderr: string) => {
          const durationMs = Math.round(performance.now() - startTime);
          const timestamp = new Date().toISOString();
          this.status = 'ready';

          if (error) {
            const err = error as Error & { code?: string | number; signal?: string };
            let errorCode = 'LAUNCH_FAILED';
            let errorMessage = `Failed to launch application [${appName}]: ${err.message}`;

            // Infer if command/application does not exist or was not found
            // Code 127 on Linux/macOS and ENOENT indicate command not found
            const hasCmdNotFoundKeywords = 
              (stderr && (stderr.toLowerCase().includes('not found') || stderr.toLowerCase().includes('not recognized'))) ||
              (err.message && (err.message.toLowerCase().includes('not found') || err.message.toLowerCase().includes('not recognized')));

            if (err.code === 'ENOENT' || err.code === 127 || hasCmdNotFoundKeywords) {
              errorCode = 'APP_NOT_FOUND';
              errorMessage = `The application [${appName}] could not be found or is not installed on this system.`;
            }

            if (this.context) {
              this.context.logger.error('OpenApplicationTool', `Launch failure: ${errorMessage}`);
            }

            resolve({
              success: false,
              error: {
                code: errorCode,
                message: errorMessage,
                details: { stderr, stdout, code: err.code, signal: err.signal }
              },
              durationMs,
              timestamp
            });
          } else {
            if (this.context) {
              this.context.logger.info('OpenApplicationTool', `Successfully launched application [${appName}] on platform [${platform}].`);
            }

            resolve({
              success: true,
              output: {
                message: `Successfully launched application [${appName}] on platform [${platform}].`,
                stdout,
                stderr
              },
              durationMs,
              timestamp
            });
          }
        });
      });
    } catch (err: unknown) {
      this.status = 'ready';
      const durationMs = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : String(err);
      const errorMsg = `Unexpected error importing child_process or preparing execution: ${message}`;

      if (this.context) {
        this.context.logger.error('OpenApplicationTool', errorMsg);
      }

      return {
        success: false,
        error: {
          code: 'EXECUTION_PREPARATION_ERROR',
          message: errorMsg,
          details: err
        },
        durationMs,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clean-up procedures, resetting operational status.
   */
  public async cleanup(): Promise<void> {
    this.status = 'ready';
    if (this.context) {
      this.context.logger.info('OpenApplicationTool', 'OpenApplicationTool resource cleanup complete.');
    }
  }
}
