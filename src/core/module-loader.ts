import { EventBus } from './event-bus';
import { Logger } from './logger';

export interface ModuleContext {
  logger: Logger;
  eventBus: EventBus;
}

export type ModuleStatus =
  | 'UNINITIALIZED'
  | 'INITIALIZING'
  | 'INITIALIZED'
  | 'STARTING'
  | 'STARTED'
  | 'STOPPING'
  | 'STOPPED'
  | 'FAILED';

export interface IModule {
  name: string;
  dependencies?: string[];
  isCritical?: boolean;
  initialize(context: ModuleContext): Promise<void>;
  start(context: ModuleContext): Promise<void>;
  stop(): Promise<void>;
  getStatus(): ModuleStatus;

  // Backwards compatibility fields so existing systems don't break
  init?(context: ModuleContext): Promise<void>;
  shutdown?(): Promise<void>;
}

export class ModuleLoader {
  private modules: Map<string, IModule> = new Map();
  private context: ModuleContext;
  private loaded = false;

  constructor(context: ModuleContext) {
    this.context = context;
  }

  public subscribeToEvents(eventBus: EventBus): void {
    eventBus.subscribe('logger.ready', async () => {
      this.context.logger.info('ModuleLoader', '[Event Reactive] Captured logger.ready. Initializing module load sequence...');
      try {
        await this.loadAll();
      } catch (err: any) {
        this.context.logger.error('ModuleLoader', `Failed reactive loading of modules: ${err.message}`);
      }
    });
  }

  public register(module: IModule): void {
    if (this.modules.has(module.name)) {
      const errMsg = `Module [${module.name}] already registered. Duplicate registration is prevented.`;
      this.context.logger.error('ModuleLoader', errMsg);
      throw new Error(errMsg);
    }
    
    this.modules.set(module.name, module);
    this.context.logger.info('ModuleLoader', `Registered module [${module.name}]`);
    
    // Publish Sprint 3 event
    this.context.eventBus.publish('module.registered', 'ModuleLoader', { moduleName: module.name });
    // Legacy support
    this.context.eventBus.publish('system:module_registered', 'ModuleLoader', { moduleName: module.name });
  }

  public getModule(name: string): IModule | undefined {
    return this.modules.get(name);
  }

  public getModules(): IModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Sort modules topologically based on their declared dependencies.
   * Reports circular dependencies and missing dependencies clearly.
   */
  public getSortedModules(): IModule[] {
    const sorted: IModule[] = [];
    const visited: Map<string, 'VISITING' | 'VISITED'> = new Map();

    const visit = (moduleName: string) => {
      const state = visited.get(moduleName);
      if (state === 'VISITING') {
        throw new Error(`Circular dependency detected involving module [${moduleName}]`);
      }
      if (state === 'VISITED') {
        return;
      }

      visited.set(moduleName, 'VISITING');

      const module = this.modules.get(moduleName);
      if (!module) {
        throw new Error(`Missing dependency: module [${moduleName}] is not registered.`);
      }

      const deps = module.dependencies || [];
      for (const dep of deps) {
        visit(dep);
      }

      visited.set(moduleName, 'VISITED');
      sorted.push(module);
    };

    for (const name of this.modules.keys()) {
      visit(name);
    }

    return sorted;
  }

  public async loadAll(): Promise<void> {
    if (this.loaded) return;

    // 1. Dependency validation and sorting
    let sortedModules: IModule[];
    try {
      sortedModules = this.getSortedModules();
    } catch (err: any) {
      this.context.logger.fatal('ModuleLoader', `Dependency validation failed: ${err.message}`);
      throw err;
    }

    this.context.logger.info('ModuleLoader', `Loading ${sortedModules.length} registered modules in validated topological order...`);

    // 2. Initialize and Start each module in topological order
    for (const module of sortedModules) {
      const name = module.name;
      const isCritical = module.isCritical !== false; // Default to critical

      try {
        // --- 2a. INITIALIZATION PHASE ---
        this.context.logger.info('ModuleLoader', `Initializing module [${name}]...`);
        this.context.eventBus.publish('system:module_loading', 'ModuleLoader', { moduleName: name });

        // Prefer Sprint 3 initialize(), fallback to legacy init() if present
        if (module.initialize) {
          await module.initialize(this.context);
        } else if (module.init) {
          await module.init(this.context);
        }

        this.context.logger.info('ModuleLoader', `Module [${name}] initialized successfully.`);
        
        // Publish Sprint 3 event
        this.context.eventBus.publish('module.initialized', 'ModuleLoader', { moduleName: name });
        // Legacy support
        this.context.eventBus.publish('system:module_loaded', 'ModuleLoader', { moduleName: name });

        // --- 2b. START PHASE ---
        this.context.logger.info('ModuleLoader', `Starting module [${name}]...`);
        
        if (module.start) {
          await module.start(this.context);
        }
        
        this.context.logger.info('ModuleLoader', `Module [${name}] started successfully.`);
        this.context.eventBus.publish('module.started', 'ModuleLoader', { moduleName: name });

      } catch (err: any) {
        this.context.logger.error('ModuleLoader', `Failed to load module [${name}]: ${err.message}`);
        this.context.eventBus.publish('module.failed', 'ModuleLoader', { moduleName: name, error: err.message });
        
        if (isCritical) {
          throw err;
        } else {
          this.context.logger.warn('ModuleLoader', `Continuing bootstrap because non-critical module [${name}] failed.`);
        }
      }
    }

    this.loaded = true;
    this.context.eventBus.publish('modules.loaded', 'ModuleLoader', {
      loadedModules: sortedModules.map(m => m.name),
      timestamp: new Date().toISOString()
    });
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public async shutdownAll(): Promise<void> {
    this.context.logger.info('ModuleLoader', 'Shutting down all modules in reverse dependency order...');
    
    let sortedModules: IModule[];
    try {
      sortedModules = this.getSortedModules();
    } catch {
      sortedModules = Array.from(this.modules.values());
    }

    const reverseModules = [...sortedModules].reverse();

    for (const module of reverseModules) {
      const name = module.name;
      try {
        this.context.logger.info('ModuleLoader', `Stopping module [${name}]...`);
        
        if (module.stop) {
          await module.stop();
        } else if (module.shutdown) {
          await module.shutdown();
        }

        this.context.logger.info('ModuleLoader', `Module [${name}] shut down cleanly.`);
        this.context.eventBus.publish('module.stopped', 'ModuleLoader', { moduleName: name });
      } catch (err: any) {
        this.context.logger.error('ModuleLoader', `Error shutting down module [${name}]: ${err.message}`);
        this.context.eventBus.publish('module.failed', 'ModuleLoader', { moduleName: name, phase: 'stop', error: err.message });
      }
    }
  }

  public getLoadedModules(): string[] {
    return Array.from(this.modules.keys());
  }

  public getModuleStatuses(): Record<string, ModuleStatus> {
    const statuses: Record<string, ModuleStatus> = {};
    for (const [name, module] of this.modules) {
      statuses[name] = module.getStatus ? module.getStatus() : 'UNINITIALIZED';
    }
    return statuses;
  }
}
