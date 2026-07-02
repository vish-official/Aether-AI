export interface SystemEvent<T = any> {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  payload: T;
  correlationId?: string;
}

export type EventHandler<T = any> = (event: SystemEvent<T>) => void;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private logger: any;

  constructor(logger?: any) {
    this.logger = logger;
  }

  public publish<T>(type: string, source: string, payload: T, correlationId?: string): void {
    const event: SystemEvent<T> = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      timestamp: new Date().toISOString(),
      source,
      payload,
      correlationId,
    };

    if (this.logger) {
      this.logger.debug('EventBus', `Publishing [${type}] from [${source}] (ID: ${event.id})`);
    }

    const eventHandlers = this.handlers.get(type);
    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (err: any) {
          if (this.logger) {
            this.logger.error('EventBus', `Error in handler for [${type}]: ${err.message}`);
          }
        }
      });
    }

    // Wildcard subscriber pattern support (e.g. '*')
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (err: any) {
          if (this.logger) {
            this.logger.error('EventBus', `Error in wildcard handler: ${err.message}`);
          }
        }
      });
    }
  }

  public subscribe<T>(type: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    if (this.logger) {
      this.logger.debug('EventBus', `Subscribed handler to event type [${type}]`);
    }

    return () => {
      const set = this.handlers.get(type);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }
}
