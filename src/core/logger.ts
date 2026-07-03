export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogMessage {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
}

export type LogListener = (log: LogMessage) => void;

export class Logger {
  private listeners: LogListener[] = [];
  private minLevel: LogLevel = 'INFO';
  private levelWeights: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4,
  };

  constructor(minLevel: LogLevel = 'INFO') {
    this.minLevel = minLevel;
  }

  public setLogLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public subscribeToEvents(eventBus: { subscribe: (type: string, handler: (event: any) => void) => () => void, publish: (type: string, source: string, payload: any) => void }): void {
    eventBus.subscribe('system.boot.start', (event) => {
      this.info('Logger', `[Observed Event: system.boot.start] Bootstrap initiated.`);
    });

    eventBus.subscribe('config.loaded', (event) => {
      if (event.payload && event.payload.logLevel) {
        this.setLogLevel(event.payload.logLevel);
      }
      this.info('Logger', `[Observed Event: config.loaded] System Configuration loaded: ${event.payload.systemName} (v${event.payload.version})`);
      eventBus.publish('logger.ready', 'Logger', { timestamp: new Date().toISOString() });
    });

    eventBus.subscribe('logger.ready', () => {
      this.info('Logger', `[Observed Event: logger.ready] Logger subsystem initialized and ready.`);
    });

    // Sprint 3 Module Loader Events auto-logging
    eventBus.subscribe('module.registered', (event) => {
      this.info('Logger', `[Observed Event: module.registered] Module registered: ${event.payload.moduleName}`);
    });

    eventBus.subscribe('module.initialized', (event) => {
      this.info('Logger', `[Observed Event: module.initialized] Module initialized: ${event.payload.moduleName}`);
    });

    eventBus.subscribe('module.started', (event) => {
      this.info('Logger', `[Observed Event: module.started] Module started: ${event.payload.moduleName}`);
    });

    eventBus.subscribe('module.stopped', (event) => {
      this.info('Logger', `[Observed Event: module.stopped] Module stopped: ${event.payload.moduleName}`);
    });

    eventBus.subscribe('module.failed', (event) => {
      this.error('Logger', `[Observed Event: module.failed] Module failed: ${event.payload.moduleName}. Error: ${event.payload.error}`);
    });

    eventBus.subscribe('modules.loaded', (event) => {
      this.info('Logger', `[Observed Event: modules.loaded] All registered modules loaded: ${event.payload.loadedModules?.join(', ')}`);
    });

    // Tool System lifecycle events logging
    eventBus.subscribe('tool.registered', (event) => {
      this.info('Logger', `[Observed Event: tool.registered] Tool registered: ${event.payload.metadata?.name} (id: ${event.payload.toolId})`);
    });

    eventBus.subscribe('tool.unregistered', (event) => {
      this.info('Logger', `[Observed Event: tool.unregistered] Tool unregistered: ${event.payload.metadata?.name} (id: ${event.payload.toolId})`);
    });

    eventBus.subscribe('tool.enabled', (event) => {
      this.info('Logger', `[Observed Event: tool.enabled] Tool enabled: ${event.payload.metadata?.name} (id: ${event.payload.toolId})`);
    });

    eventBus.subscribe('tool.disabled', (event) => {
      this.info('Logger', `[Observed Event: tool.disabled] Tool disabled: ${event.payload.metadata?.name} (id: ${event.payload.toolId})`);
    });

    eventBus.subscribe('tool.executing', (event) => {
      this.info('Logger', `[Observed Event: tool.executing] Tool execution started: ${event.payload.toolId}`);
    });

    eventBus.subscribe('tool.completed', (event) => {
      const duration = event.payload.result?.durationMs ?? 0;
      this.info('Logger', `[Observed Event: tool.completed] Tool completed successfully: ${event.payload.toolId} (duration: ${duration}ms)`);
    });

    eventBus.subscribe('tool.failed', (event) => {
      this.error('Logger', `[Observed Event: tool.failed] Tool failed: ${event.payload.toolId}. Error: ${event.payload.error}`);
    });

    eventBus.subscribe('tool.unloaded', (event) => {
      this.info('Logger', `[Observed Event: tool.unloaded] Tool unloaded: ${event.payload.toolId}`);
    });

    eventBus.subscribe('engine.started', () => {
      this.info('Logger', `[Observed Event: engine.started] Core engine transitioned to RUNNING state.`);
    });

    eventBus.subscribe('system.ready', () => {
      this.info('Logger', `[Observed Event: system.ready] System bootstrap fully complete and secure.`);
    });

    // Legacy backwards compatibility
    eventBus.subscribe('system:boot_started', (event) => {
      this.info('Logger', `[Observed Event: system:boot_started] System ${event.payload.systemName} v${event.payload.version} is starting boot.`);
    });

    eventBus.subscribe('system:boot_complete', (event) => {
      this.info('Logger', `[Observed Event: system:boot_complete] Boot sequence complete. Status: ${event.payload.status}`);
    });

    eventBus.subscribe('system:shutdown_started', () => {
      this.info('Logger', `[Observed Event: system:shutdown_started] Shutdown sequence initiated.`);
    });

    eventBus.subscribe('system:module_registered', (event) => {
      this.debug('Logger', `[Observed Event: system:module_registered] Module registered: ${event.payload.moduleName}`);
    });

    eventBus.subscribe('system:module_loaded', (event) => {
      this.info('Logger', `[Observed Event: system:module_loaded] Module fully initialized: ${event.payload.moduleName}`);
    });

    eventBus.subscribe('config:loaded', (event) => {
      this.info('Logger', `[Observed Event: config:loaded] System Configuration loaded into runtime. SystemName: ${event.payload.systemName}`);
    });
  }

  private log(level: LogLevel, source: string, message: string): void {
    if (this.levelWeights[level] < this.levelWeights[this.minLevel]) {
      return;
    }

    const logMsg: LogMessage = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
    };

    // Notify listeners
    this.listeners.forEach(l => {
      try {
        l(logMsg);
      } catch (err) {
        console.error('Error notifying log listener:', err);
      }
    });

    // Output formatted line to standard system console
    const formatted = `[${logMsg.timestamp}] [${logMsg.level}] [${logMsg.source}] ${logMsg.message}`;
    if (level === 'ERROR' || level === 'FATAL') {
      console.error(formatted);
    } else if (level === 'WARN') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  public debug(source: string, message: string): void { this.log('DEBUG', source, message); }
  public info(source: string, message: string): void { this.log('INFO', source, message); }
  public warn(source: string, message: string): void { this.log('WARN', source, message); }
  public error(source: string, message: string): void { this.log('ERROR', source, message); }
  public fatal(source: string, message: string): void { this.log('FATAL', source, message); }
}
