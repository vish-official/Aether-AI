import { ConfigurationManager } from './config';
import { Logger } from './logger';
import { EventBus } from './event-bus';
import { ModuleLoader } from './module-loader';

export type SystemState = 'UNINITIALIZED' | 'BOOTING' | 'RUNNING' | 'TERMINATING' | 'FAILED';

export class CoreEngine {
  private state: SystemState = 'UNINITIALIZED';
  private config: ConfigurationManager;
  private logger: Logger;
  private eventBus: EventBus;
  private loader: ModuleLoader;

  constructor(
    config: ConfigurationManager,
    logger: Logger,
    eventBus: EventBus,
    loader: ModuleLoader
  ) {
    this.config = config;
    this.logger = logger;
    this.eventBus = eventBus;
    this.loader = loader;
  }

  public subscribeToEvents(eventBus: EventBus): void {
    eventBus.subscribe('modules.loaded', async () => {
      this.logger.info('CoreEngine', '[Event Reactive] Captured modules.loaded. Initiating CoreEngine boot...');
      try {
        await this.boot();
      } catch (err: any) {
        this.logger.fatal('CoreEngine', `Failed to boot engine reactively: ${err.message}`);
      }
    });
  }

  public async boot(): Promise<void> {
    if (this.state === 'RUNNING' || this.state === 'BOOTING') {
      return;
    }

    if (this.state !== 'UNINITIALIZED') {
      throw new Error(`Invalid state transition. Cannot boot from [${this.state}]`);
    }

    this.state = 'BOOTING';
    this.logger.info('CoreEngine', 'Core engine booting sequence started...');

    try {
      // Legacy compatibility check: If modules are not loaded, load them
      if (!this.loader.isLoaded()) {
        await this.loader.loadAll();
      }

      this.state = 'RUNNING';
      this.logger.info('CoreEngine', 'Aether Core engine is now RUNNING.');

      // Publish Sprint 2 events
      this.eventBus.publish('engine.started', 'CoreEngine', {
        status: 'healthy',
        timestamp: new Date().toISOString()
      });

      this.eventBus.publish('system.ready', 'CoreEngine', {
        status: 'secure_and_healthy',
        timestamp: new Date().toISOString()
      });

      // Legacy boot complete
      this.eventBus.publish('system:boot_complete', 'CoreEngine', {
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      this.state = 'FAILED';
      this.logger.fatal('CoreEngine', `System boot failure: ${err.message}`);
      throw err;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.state !== 'RUNNING') {
      this.logger.warn('CoreEngine', 'Shutdown requested but system is not in RUNNING state.');
    }

    this.state = 'TERMINATING';
    this.logger.info('CoreEngine', 'Initiating clean system shutdown...');

    try {
      this.eventBus.publish('system:shutdown_started', 'CoreEngine', {});
      await this.loader.shutdownAll();
      this.state = 'UNINITIALIZED';
      this.logger.info('CoreEngine', 'Aether Core shut down gracefully.');
    } catch (err: any) {
      this.state = 'FAILED';
      this.logger.error('CoreEngine', `System shutdown encountered errors: ${err.message}`);
    }
  }

  public getStatus() {
    return {
      state: this.state,
      systemName: this.config.get('systemName'),
      version: this.config.get('version'),
      loadedModules: this.loader.getLoadedModules(),
      timestamp: new Date().toISOString(),
    };
  }
}
