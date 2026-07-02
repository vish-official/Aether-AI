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

  public subscribeToEvents(eventBus: { subscribe: (type: string, handler: (event: any) => void) => () => void }): void {
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
