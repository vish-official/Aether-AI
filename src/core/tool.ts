import { ModuleContext } from './module-loader';

/**
 * Supported categories for Aether system tools.
 */
export type ToolCategory =
  | 'system'
  | 'filesystem'
  | 'web'
  | 'media'
  | 'hardware'
  | 'utility'
  | 'ai'
  | 'memory'
  | 'communication'
  | 'custom';

/**
 * Operating platforms supported by Aether tools.
 */
export type ToolPlatform = 'web' | 'desktop' | 'mobile' | 'terminal' | 'any';

/**
 * Execution and operational status of a tool.
 */
export type ToolStatus =
  | 'uninitialized'
  | 'ready'
  | 'executing'
  | 'disabled'
  | 'error';

/**
 * Metadata definition for identifying, detailing, and validating a tool's capabilities.
 */
export interface ToolMetadata {
  id: string;             // Unique identifier (e.g. 'file-read', 'web-search')
  name: string;           // Display name
  description: string;    // Brief description of the tool's purpose
  category: ToolCategory; // Category classification
  version: string;        // Semantic version
  requiredPermissions?: string[]; // Scopes or permission tags required
  supportedPlatforms?: ToolPlatform[]; // Platforms where this tool can execute
}

/**
 * Standardized structure returned by all tool executions.
 */
export interface ToolResult<T = any> {
  success: boolean;
  output?: T;             // Structured output on successful execution
  error?: {
    code: string;         // Standardized error code
    message: string;      // Human-readable error message
    details?: any;        // Additional error context
  };
  durationMs: number;     // Execution duration in milliseconds
  timestamp: string;      // ISO-8601 timestamp of execution completion
}

/**
 * Common Tool Interface that every future tool in Aether must implement.
 */
export interface ITool<TArgs = any, TResult = any> {
  /**
   * The immutable metadata identifying this tool.
   */
  readonly metadata: ToolMetadata;

  /**
   * Retrieves the current operational status of the tool.
   */
  getStatus(): ToolStatus;

  /**
   * Performs asynchronous one-time initialization of the tool, supplying necessary context.
   */
  initialize(context: ModuleContext): Promise<void>;

  /**
   * Validates arguments before execution to guarantee safety and correctness.
   */
  validate(args: TArgs): Promise<boolean>;

  /**
   * Executes the tool with the provided arguments, returning a structured ToolResult.
   */
  execute(args: TArgs): Promise<ToolResult<TResult>>;

  /**
   * Runs clean-up procedures, releasing any allocated resources or handles.
   */
  cleanup(): Promise<void>;
}

/**
 * Event payloads published to the EventBus by the Tool System.
 */
export interface ToolEventPayloads {
  'tool.registered': { toolId: string; metadata: ToolMetadata };
  'tool.executing': { toolId: string; timestamp: string; args?: any };
  'tool.completed': { toolId: string; result: ToolResult; timestamp: string };
  'tool.failed': { toolId: string; error: string; timestamp: string };
  'tool.unloaded': { toolId: string; timestamp: string };
}
