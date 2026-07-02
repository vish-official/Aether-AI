import { EventBus } from './event-bus';
import { Logger } from './logger';

export interface ModuleContext {
  logger: Logger;
  eventBus: EventBus;
}

export interface IModule {
  name: string;
  init(context: ModuleContext): Promise<void>;
  shutdown(): Promise<void>;
}

export class ModuleLoader {
  private modules: Map<string, IModule> = new Map();
  private context: ModuleContext;

  constructor(context: ModuleContext) {
    this.context = context;
  }

  public register(module: IModule): void {
    if (this.modules.has(module.name)) {
      this.context.logger.warn('ModuleLoader', `Module [${module.name}] already registered. Overwriting.`);
    }
    this.modules.set(module.name, module);
    this.context.logger.info('ModuleLoader', `Registered module [${module.name}]`);
    this.context.eventBus.publish('system:module_registered', 'ModuleLoader', { moduleName: module.name });
  }

  public async loadAll(): Promise<void> {
    this.context.logger.info('ModuleLoader', `Loading ${this.modules.size} registered modules...`);
    for (const [name, module] of this.modules) {
      try {
        this.context.logger.info('ModuleLoader', `Initializing module [${name}]...`);
        this.context.eventBus.publish('system:module_loading', 'ModuleLoader', { moduleName: name });
        await module.init(this.context);
        this.context.logger.info('ModuleLoader', `Module [${name}] initialized successfully.`);
        this.context.eventBus.publish('system:module_loaded', 'ModuleLoader', { moduleName: name });
      } catch (err: any) {
        this.context.logger.error('ModuleLoader', `Failed to load module [${name}]: ${err.message}`);
        throw err;
      }
    }
  }

  public async shutdownAll(): Promise<void> {
    this.context.logger.info('ModuleLoader', 'Shutting down all modules...');
    for (const [name, module] of this.modules) {
      try {
        await module.shutdown();
        this.context.logger.info('ModuleLoader', `Module [${name}] shut down cleanly.`);
      } catch (err: any) {
        this.context.logger.error('ModuleLoader', `Error shutting down module [${name}]: ${err.message}`);
      }
    }
  }

  public getLoadedModules(): string[] {
    return Array.from(this.modules.keys());
  }
}
