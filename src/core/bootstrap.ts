import { ConfigurationManager } from './config';
import { Logger } from './logger';
import { EventBus } from './event-bus';
import { ModuleLoader, IModule, ModuleContext, ModuleStatus } from './module-loader';
import { CoreEngine } from './engine';
import { runToolDemo } from './demo';
import { SecurityEnclaveModule } from './security-enclave';
import { StorageAdapterModule } from './storage-adapter';
import { IdentityBridgeModule } from './identity-bridge';

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
  runBootstrap().then(async (engine) => {
    await runToolDemo(engine);
  }).catch((err) => {
    console.error('Fatal Bootstrap Failure:', err);
    process.exit(1);
  });
}
