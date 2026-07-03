/**
 * Represents the platform operating system.
 */
export type PlatformOS = 'win32' | 'darwin' | 'linux' | 'unknown';

/**
 * Interface defining the lightweight Runtime abstraction to isolate platform-specific operations.
 */
export interface IRuntime {
  /**
   * Retrieves the current operating system platform.
   */
  getPlatform(): PlatformOS;

  /**
   * Spawns or executes a system terminal command.
   * Resolves with stdout and stderr, or throws an error.
   */
  executeCommand(command: string): Promise<{ stdout: string; stderr: string }>;

  /**
   * Retrieves an environment variable by name.
   */
  getEnv(name: string): string | undefined;

  /**
   * Checks if a specific tool or application is available in the system PATH.
   */
  isAppAvailable(appName: string): Promise<boolean>;
}

/**
 * Standard implementation of the Runtime abstraction using Node.js APIs.
 * This isolates Node.js imports such as 'child_process' from the core logic.
 */
export class NodeRuntime implements IRuntime {
  public getPlatform(): PlatformOS {
    if (typeof process === 'undefined') {
      return 'unknown';
    }
    const platform = process.platform;
    if (platform === 'win32' || platform === 'darwin' || platform === 'linux') {
      return platform;
    }
    return 'unknown';
  }

  public async executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    if (typeof process === 'undefined') {
      throw new Error('Terminal execution is not supported in the current environment.');
    }
    // Using /* @vite-ignore */ to prevent Vite compilation issues in browser-targeted builds
    const { exec } = await import(/* @vite-ignore */ 'child_process');
    return new Promise((resolve, reject) => {
      exec(command, (error: unknown, stdout: string, stderr: string) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  public getEnv(name: string): string | undefined {
    if (typeof process === 'undefined') {
      return undefined;
    }
    return process.env[name];
  }

  public async isAppAvailable(appName: string): Promise<boolean> {
    const platform = this.getPlatform();
    if (platform === 'unknown') {
      return false;
    }
    const checkCommand = platform === 'win32' ? `where "${appName}"` : `which "${appName}"`;
    try {
      await this.executeCommand(checkCommand);
      return true;
    } catch {
      return false;
    }
  }
}
