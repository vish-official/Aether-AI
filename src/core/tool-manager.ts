import { ITool, ToolStatus, ToolMetadata } from './tool';
import { EventBus } from './event-bus';
import { Logger } from './logger';

/**
 * ToolManager is responsible for managing the lifecycle of all registered tools
 * within the Aether OS runtime. It acts as the central registry and status authority.
 */
export class ToolManager {
  private tools = new Map<string, ITool>();
  private disabledTools = new Set<string>();
  private eventBus: EventBus;
  private logger: Logger;

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.logger.info('ToolManager', 'ToolManager subsystem initialized.');
  }

  /**
   * Registers a new tool. Prevents duplicate tool IDs.
   * Publishes a 'tool.registered' event.
   * 
   * @param tool The tool instance to register
   */
  public register(tool: ITool): void {
    if (!tool || !tool.metadata || !tool.metadata.id) {
      throw new Error('Tool Registration Error: Invalid tool instance or missing metadata.');
    }

    const id = tool.metadata.id;
    if (this.tools.has(id)) {
      throw new Error(`Tool Registration Error: Tool with ID [${id}] is already registered.`);
    }

    this.tools.set(id, tool);
    this.logger.info('ToolManager', `Registered tool: ${tool.metadata.name} (id: ${id}, category: ${tool.metadata.category})`);

    this.eventBus.publish('tool.registered', 'ToolManager', {
      toolId: id,
      metadata: tool.metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Unregisters an existing tool by its ID.
   * Publishes a 'tool.unregistered' event.
   * 
   * @param id The unique identifier of the tool to remove
   */
  public unregister(id: string): void {
    if (!this.tools.has(id)) {
      this.logger.warn('ToolManager', `Attempted to unregister non-existent tool with ID: [${id}]`);
      return;
    }

    const tool = this.tools.get(id)!;
    this.tools.delete(id);
    this.disabledTools.delete(id);
    this.logger.info('ToolManager', `Unregistered tool: ${tool.metadata.name} (id: ${id})`);

    this.eventBus.publish('tool.unregistered', 'ToolManager', {
      toolId: id,
      metadata: tool.metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Checks whether a tool with the specified ID is registered.
   * 
   * @param id Tool ID
   * @returns true if registered, false otherwise
   */
  public has(id: string): boolean {
    return this.tools.has(id);
  }

  /**
   * Retrieves a registered tool instance by its ID.
   * 
   * @param id Tool ID
   * @returns The tool instance or undefined if not found
   */
  public get(id: string): ITool | undefined {
    return this.tools.get(id);
  }

  /**
   * Lists all registered tool instances.
   * 
   * @returns Array of registered tools
   */
  public list(): ITool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Returns a list of metadata for all registered tools.
   * 
   * @returns Array of tool metadata
   */
  public listMetadata(): ToolMetadata[] {
    return this.list().map(tool => tool.metadata);
  }

  /**
   * Enables a tool, allowing it to be executed.
   * Publishes a 'tool.enabled' event.
   * 
   * @param id Tool ID
   */
  public enable(id: string): void {
    const tool = this.get(id);
    if (!tool) {
      throw new Error(`Tool Error: Tool with ID [${id}] is not registered.`);
    }

    if (this.disabledTools.has(id)) {
      this.disabledTools.delete(id);
      this.logger.info('ToolManager', `Enabled tool: ${tool.metadata.name} (id: ${id})`);

      this.eventBus.publish('tool.enabled', 'ToolManager', {
        toolId: id,
        metadata: tool.metadata,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Disables a tool, preventing its execution.
   * Publishes a 'tool.disabled' event.
   * 
   * @param id Tool ID
   */
  public disable(id: string): void {
    const tool = this.get(id);
    if (!tool) {
      throw new Error(`Tool Error: Tool with ID [${id}] is not registered.`);
    }

    if (!this.disabledTools.has(id)) {
      this.disabledTools.add(id);
      this.logger.info('ToolManager', `Disabled tool: ${tool.metadata.name} (id: ${id})`);

      this.eventBus.publish('tool.disabled', 'ToolManager', {
        toolId: id,
        metadata: tool.metadata,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Reports the current status of a tool.
   * If the tool has been disabled through the ToolManager, returns 'disabled'.
   * Otherwise, queries the tool itself.
   * 
   * @param id Tool ID
   * @returns ToolStatus
   */
  public getStatus(id: string): ToolStatus {
    const tool = this.get(id);
    if (!tool) {
      throw new Error(`Tool Error: Tool with ID [${id}] is not registered.`);
    }

    if (this.disabledTools.has(id)) {
      return 'disabled';
    }

    return tool.getStatus();
  }
}
