/**
 * Base class for all errors in the Aether Tool System.
 */
export class ToolError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'TOOL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when tool registration fails or validation during registration fails.
 */
export class ToolRegistrationError extends ToolError {
  constructor(message: string, code: string = 'TOOL_REGISTRATION_FAILED') {
    super(message, code);
  }
}

/**
 * Thrown during validation or execution of a tool.
 */
export class ToolExecutionError extends ToolError {
  public readonly details?: unknown;

  constructor(message: string, code: string = 'TOOL_EXECUTION_FAILED', details?: unknown) {
    super(message, code);
    this.details = details;
  }
}

/**
 * Thrown when permissions are denied or invalid within the Tool System.
 */
export class PermissionError extends ToolError {
  constructor(message: string, code: string = 'PERMISSION_DENIED') {
    super(message, code);
  }
}
