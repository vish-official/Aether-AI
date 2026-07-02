import { ConfigurationManager } from './config';
import { Logger } from './logger';
import { EventBus } from './event-bus';
import { ModuleLoader, IModule, ModuleContext } from './module-loader';
import { CoreEngine } from './engine';

// --- Simple, compliant, non-blocking core modules ---

class IdentityBridgeModule implements IModule {
  public name = 'IdentityBridge';

  public async init(context: ModuleContext): Promise<void> {
    context.logger.info(this.name, 'Initializing identity verification structures...');
    context.eventBus.publish('identity:init_started', this.name, {});
    // Simulating light async initialization
    await new Promise((resolve) => setTimeout(resolve, 50));
    context.logger.info(this.name, 'Local sovereign identity cryptographically loaded.');
    context.eventBus.publish('identity:ready', this.name, { nodeId: 'node_aether_alpha_01' });
  }

  public async shutdown(): Promise<void> {
    // Clean cleanup
  }
}

class StorageAdapterModule implements IModule {
  public name = 'StorageAdapter';

  public async init(context: ModuleContext): Promise<void> {
    context.logger.info(this.name, 'Initializing secure local filesystem layers...');
    context.eventBus.publish('storage:init_started', this.name, {});
    await new Promise((resolve) => setTimeout(resolve, 50));
    context.logger.info(this.name, 'Virtual file allocation tables mapped successfully.');
    context.eventBus.publish('storage:ready', this.name, { status: 'mounted', writable: true });
  }

  public async shutdown(): Promise<void> {
    // Clean cleanup
  }
}

class SecurityEnclaveModule implements IModule {
  public name = 'SecurityEnclave';

  public async init(context: ModuleContext): Promise<void> {
    context.logger.info(this.name, 'Connecting to hardware TPM security chip...');
    context.eventBus.publish('security:init_started', this.name, {});
    await new Promise((resolve) => setTimeout(resolve, 50));
    context.logger.info(this.name, 'Symmetric and asymmetric cryptographic enclaves isolated.');
    context.eventBus.publish('security:ready', this.name, { mode: 'hardware_secure' });
  }

  public async shutdown(): Promise<void> {
    // Clean cleanup
  }
}

// --- Main CLI Bootstrap Executor ---

export async function runBootstrap(): Promise<CoreEngine> {
  // 1. Start event bus first (communication backbone)
  const eventBus = new EventBus();

  // 2. Instantiate ConfigurationManager and subscribe it to system.boot.start
  const config = new ConfigurationManager();
  config.subscribeToEvents(eventBus);

  // 3. Instantiate Logger (starting with minimal INFO level, will automatically set itself when config.loaded fires)
  const logger = new Logger('INFO');
  logger.subscribeToEvents(eventBus);

  // Set up dynamic global event listener to output to console for auditing
  eventBus.subscribe('*', (event) => {
    logger.debug('AuditTrail', `[EVENT: ${event.type}] from [${event.source}]`);
  });

  // 4. Create context & ModuleLoader and subscribe it to logger.ready
  const context: ModuleContext = { logger, eventBus };
  const loader = new ModuleLoader(context);
  loader.subscribeToEvents(eventBus);

  // Register only the approved core components
  loader.register(new IdentityBridgeModule());
  loader.register(new StorageAdapterModule());
  loader.register(new SecurityEnclaveModule());

  // 5. Instantiate CoreEngine and subscribe it to modules.loaded
  const engine = new CoreEngine(config, logger, eventBus, loader);
  engine.subscribeToEvents(eventBus);

  // Set up ready tracker
  const readyPromise = new Promise<void>((resolve) => {
    eventBus.subscribe('system.ready', () => {
      logger.info('Bootstrap', '------------------------------------------------------------');
      logger.info('Bootstrap', '✅ AETHER SYSTEM STATUS: SECURE & HEALTHY');
      logger.info('Bootstrap', `Active State: ${engine.getStatus().state}`);
      logger.info('Bootstrap', `Modules Registered & Loaded: ${engine.getStatus().loadedModules.join(', ')}`);
      logger.info('Bootstrap', '------------------------------------------------------------');
      resolve();
    });
  });

  // 6. Kick off the entire reactive bootstrapping protocol by publishing system.boot.start!
  logger.info('Bootstrap', '------------------------------------------------------------');
  logger.info('Bootstrap', '🌟 INITIATING AETHER CORE REACTIVE BOOTSTRAP PROTOCOL (SPRINT 2) 🌟');
  logger.info('Bootstrap', '------------------------------------------------------------');

  eventBus.publish('system.boot.start', 'Bootstrap', {
    systemName: config.get('systemName'),
    version: config.get('version'),
  });

  // Await completion of the reactive boot chain
  await readyPromise;

  return engine;
}

// Check if this script was executed directly (Node.js CLI environment)
const isMain = typeof process !== 'undefined' && process.argv && 
  (process.argv[1]?.endsWith('bootstrap.ts') || process.argv[1]?.endsWith('bootstrap.js') || process.argv[1]?.endsWith('cli.ts') || process.argv[1]?.endsWith('cli.js'));

if (isMain) {
  runBootstrap().catch((err) => {
    console.error('Fatal Bootstrap Failure:', err);
    process.exit(1);
  });
}
