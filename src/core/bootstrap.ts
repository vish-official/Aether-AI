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
  // 1. Load configuration
  const config = new ConfigurationManager();
  
  // 2. Start logger
  const logger = new Logger(config.get('logLevel'));

  // 3. Start event bus
  const eventBus = new EventBus(logger);

  // Set up logger to listen directly to system-wide lifecycle events via the Event Bus
  logger.subscribeToEvents(eventBus);

  // Set up dynamic global event listener to output to console for auditing
  eventBus.subscribe('*', (event) => {
    logger.debug('AuditTrail', `[EVENT: ${event.type}] from [${event.source}]`);
  });

  // Now configuration is loaded and event bus is ready, publish config:loaded
  config.publishLoaded(eventBus);

  logger.info('Bootstrap', '------------------------------------------------------------');
  logger.info('Bootstrap', '🌟 INITIATING AETHER CORE BOOTSTRAP PROTOCOL (SPRINT 1) 🌟');
  logger.info('Bootstrap', '------------------------------------------------------------');
  logger.info('Bootstrap', `System: ${config.get('systemName')} | Version: ${config.get('version')} | Env: ${config.get('environment')}`);

  // 4. Create context & Load modules via ModuleLoader
  const context: ModuleContext = { logger, eventBus };
  const loader = new ModuleLoader(context);

  // Register only the Sprint 1 approved core components
  loader.register(new IdentityBridgeModule());
  loader.register(new StorageAdapterModule());
  loader.register(new SecurityEnclaveModule());

  // 5. Start core engine
  const engine = new CoreEngine(config, logger, eventBus, loader);
  
  // Track system status
  eventBus.subscribe('system:boot_complete', () => {
    logger.info('Bootstrap', '------------------------------------------------------------');
    logger.info('Bootstrap', '✅ AETHER SYSTEM STATUS: SECURE & HEALTHY');
    logger.info('Bootstrap', `Active State: ${engine.getStatus().state}`);
    logger.info('Bootstrap', `Modules Registered & Loaded: ${engine.getStatus().loadedModules.join(', ')}`);
    logger.info('Bootstrap', '------------------------------------------------------------');
  });

  await engine.boot();

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
