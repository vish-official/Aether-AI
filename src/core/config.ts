export interface SystemConfig {
  systemName: string;
  version: string;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  environment: string;
  maxEventQueueSize: number;
  modules: string[];
}

export class ConfigurationManager {
  private config: SystemConfig;

  constructor(customConfig?: Partial<SystemConfig>) {
    this.config = {
      systemName: 'Aether OS',
      version: '1.0.0-bootstrap',
      logLevel: 'INFO',
      environment: 'development',
      maxEventQueueSize: 1000,
      modules: ['IdentityBridge', 'StorageAdapter', 'SecurityEnclave'],
      ...customConfig
    };
  }

  public get<K extends keyof SystemConfig>(key: K): SystemConfig[K] {
    return this.config[key];
  }

  public getAll(): SystemConfig {
    return { ...this.config };
  }

  public set<K extends keyof SystemConfig>(key: K, value: SystemConfig[K]): void {
    this.config[key] = value;
  }
}
