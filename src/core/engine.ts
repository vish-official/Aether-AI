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

  public async boot(): Promise<void> {
    if (this.state !== 'UNINITIALIZED') {
      throw new Error(`Invalid state transition. Cannot boot from [${this.state}]`);
    }

    this.state = 'BOOTING';
    this.logger.info('CoreEngine', 'Core engine booting sequence started...');

    try {
      // Announce boot
      this.eventBus.publish('system:boot_started', 'CoreEngine', {
        systemName: this.config.get('systemName'),
        version: this.config.get('version'),
      });

      // Loading Modules via the ModuleLoader
      await this.loader.loadAll();

      this.state = 'RUNNING';
      this.logger.info('CoreEngine', 'Aether Core engine is now RUNNING.');
      
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
