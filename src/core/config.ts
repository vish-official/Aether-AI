export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface AppConfig {
  application: {
    systemName: string;
    version: string;
    environment: string;
    configVersion: string;
  };
  logging: {
    level: LogLevel;
    format: string;
    includeTimestamp: boolean;
  };
  runtime: {
    maxEventQueueSize: number;
    tickRate: number;
    maxLoadedModules: number;
  };
  development: {
    debugMode: boolean;
    mockHardware: boolean;
    hmrDisabled: boolean;
  };
  ai: {
    modelName: string;
    maxTokens: number;
    temperature: number;
  };
  memory: {
    vectorDim: number;
    persistInterval: number;
  };
  communication: {
    port: number;
    protocol: string;
  };
}

export interface SystemConfig {
  systemName: string;
  version: string;
  logLevel: LogLevel;
  environment: string;
  maxEventQueueSize: number;
  modules: string[];
}

const DEFAULT_CONFIG: AppConfig = {
  application: {
    systemName: 'Aether OS',
    version: '1.0.0-bootstrap',
    environment: 'development',
    configVersion: '1.0.0',
  },
  logging: {
    level: 'INFO',
    format: 'structured',
    includeTimestamp: true,
  },
  runtime: {
    maxEventQueueSize: 1000,
    tickRate: 10,
    maxLoadedModules: 10,
  },
  development: {
    debugMode: true,
    mockHardware: true,
    hmrDisabled: true,
  },
  ai: {
    modelName: 'gemini-2.5-flash',
    maxTokens: 2048,
    temperature: 0.7,
  },
  memory: {
    vectorDim: 1536,
    persistInterval: 300,
  },
  communication: {
    port: 3000,
    protocol: 'http',
  },
};

export class ConfigurationManager {
  private config: AppConfig;

  constructor(customConfig?: Partial<AppConfig> | Partial<SystemConfig>) {
    const merged: AppConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    // Try to load from standard JSON configuration file if in Node environment
    const fileConfig = this.loadFromFile();
    if (fileConfig) {
      this.mergeDeep(merged, fileConfig);
    }

    // Apply any custom overrides passed directly into the constructor
    if (customConfig) {
      const mapped = this.mapLegacyToAppConfig(customConfig);
      this.mergeDeep(merged, mapped);
    }

    // Apply standard environment variables overrides if present
    this.applyEnvOverrides(merged);

    // Validate configuration
    try {
      this.validateConfig(merged);
    } catch (err: any) {
      console.error(`[ConfigurationManager] Boot Configuration Validation Failed: ${err.message}`);
      throw err;
    }

    this.config = merged;
  }

  public subscribeToEvents(eventBus: { subscribe: (type: string, handler: (event: any) => void) => () => void, publish: (type: string, source: string, payload: any) => void }): void {
    eventBus.subscribe('system.boot.start', () => {
      this.publishLoaded(eventBus);
    });
  }

  public get<K extends keyof AppConfig>(key: K): Readonly<AppConfig[K]>;
  public get<K extends keyof SystemConfig>(key: K): SystemConfig[K];
  public get(key: string): any {
    // 1. Group level matching
    if (key in this.config) {
      return JSON.parse(JSON.stringify((this.config as any)[key]));
    }

    // 2. Backward compatibility with flat keys
    switch (key) {
      case 'systemName':
        return this.config.application.systemName;
      case 'version':
        return this.config.application.version;
      case 'logLevel':
        return this.config.logging.level;
      case 'environment':
        return this.config.application.environment;
      case 'maxEventQueueSize':
        return this.config.runtime.maxEventQueueSize;
      case 'modules':
        return ['IdentityBridge', 'StorageAdapter', 'SecurityEnclave'];
    }

    // 3. Nested path lookup (e.g. 'application.systemName')
    if (key.includes('.')) {
      const parts = key.split('.');
      let current: any = this.config;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return typeof current === 'object' && current !== null 
        ? JSON.parse(JSON.stringify(current)) 
        : current;
    }

    return undefined;
  }

  public getAll(): AppConfig & SystemConfig {
    return {
      ...JSON.parse(JSON.stringify(this.config)),
      systemName: this.config.application.systemName,
      version: this.config.application.version,
      logLevel: this.config.logging.level,
      environment: this.config.application.environment,
      maxEventQueueSize: this.config.runtime.maxEventQueueSize,
      modules: ['IdentityBridge', 'StorageAdapter', 'SecurityEnclave']
    };
  }

  public publishLoaded(eventBus: { publish: (type: string, source: string, payload: any) => void }): void {
    const payload = this.getAll();
    eventBus.publish('config.loaded', 'ConfigurationManager', payload);
    eventBus.publish('config:loaded', 'ConfigurationManager', payload);
    eventBus.publish('config.validated', 'ConfigurationManager', {
      configVersion: this.config.application.configVersion,
      timestamp: new Date().toISOString()
    });
  }

  public set(key: string, value: any): void {
    const workingConfig = JSON.parse(JSON.stringify(this.config));

    if (key.includes('.')) {
      const parts = key.split('.');
      let current: any = workingConfig;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    } else if (key in workingConfig) {
      workingConfig[key] = value;
    } else {
      switch (key) {
        case 'systemName':
          workingConfig.application.systemName = value;
          break;
        case 'version':
          workingConfig.application.version = value;
          break;
        case 'logLevel':
          workingConfig.logging.level = value;
          break;
        case 'environment':
          workingConfig.application.environment = value;
          break;
        case 'maxEventQueueSize':
          workingConfig.runtime.maxEventQueueSize = value;
          break;
        default:
          throw new Error(`Configuration Error: Key [${key}] is not a recognized configuration parameter.`);
      }
    }

    // Validate changes before saving
    this.validateConfig(workingConfig);

    this.config = workingConfig;
  }

  private validateConfig(config: AppConfig): void {
    if (!config.application || typeof config.application.systemName !== 'string' || config.application.systemName.trim() === '') {
      throw new Error("Validation Error: 'application.systemName' must be a non-empty string.");
    }
    if (typeof config.application.version !== 'string' || config.application.version.trim() === '') {
      throw new Error("Validation Error: 'application.version' must be a non-empty string.");
    }
    if (typeof config.application.configVersion !== 'string' || config.application.configVersion.trim() === '') {
      throw new Error("Validation Error: 'application.configVersion' must be a non-empty string.");
    }
    if (!['development', 'production', 'testing'].includes(config.application.environment)) {
      throw new Error("Validation Error: 'application.environment' must be 'development', 'production', or 'testing'.");
    }
    if (!['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'].includes(config.logging.level)) {
      throw new Error("Validation Error: 'logging.level' must be 'DEBUG', 'INFO', 'WARN', 'ERROR', or 'FATAL'.");
    }
    if (typeof config.logging.format !== 'string') {
      throw new Error("Validation Error: 'logging.format' must be a string.");
    }
    if (typeof config.logging.includeTimestamp !== 'boolean') {
      throw new Error("Validation Error: 'logging.includeTimestamp' must be a boolean.");
    }
    if (typeof config.runtime.maxEventQueueSize !== 'number' || config.runtime.maxEventQueueSize <= 0) {
      throw new Error("Validation Error: 'runtime.maxEventQueueSize' must be a positive number.");
    }
    if (typeof config.runtime.tickRate !== 'number' || config.runtime.tickRate <= 0) {
      throw new Error("Validation Error: 'runtime.tickRate' must be a positive number.");
    }
    if (typeof config.runtime.maxLoadedModules !== 'number' || config.runtime.maxLoadedModules <= 0) {
      throw new Error("Validation Error: 'runtime.maxLoadedModules' must be a positive number.");
    }
    if (typeof config.development.debugMode !== 'boolean') {
      throw new Error("Validation Error: 'development.debugMode' must be a boolean.");
    }
    if (typeof config.development.mockHardware !== 'boolean') {
      throw new Error("Validation Error: 'development.mockHardware' must be a boolean.");
    }
    if (typeof config.development.hmrDisabled !== 'boolean') {
      throw new Error("Validation Error: 'development.hmrDisabled' must be a boolean.");
    }
    if (!config.ai || typeof config.ai.modelName !== 'string') {
      throw new Error("Validation Error: 'ai.modelName' must be a string.");
    }
    if (!config.memory || typeof config.memory.vectorDim !== 'number') {
      throw new Error("Validation Error: 'memory.vectorDim' must be a number.");
    }
    if (!config.communication || typeof config.communication.port !== 'number') {
      throw new Error("Validation Error: 'communication.port' must be a number.");
    }
  }

  private loadFromFile(customPath?: string): any {
    if (typeof window !== 'undefined') {
      return null;
    }
    try {
      // Use eval to prevent bundlers from statically analyzing and failing browser builds
      const req = eval('require');
      const fs = req('fs');
      const path = req('path');
      
      const searchPath = customPath || 'aether.config.json';
      const absolutePath = path.isAbsolute(searchPath) 
        ? searchPath 
        : path.join(process.cwd(), searchPath);

      if (fs.existsSync(absolutePath)) {
        const content = fs.readFileSync(absolutePath, 'utf8');
        return JSON.parse(content);
      }
    } catch {
      // Ignore errors when file is not accessible
    }
    return null;
  }

  private mergeDeep(target: any, source: any): void {
    if (!source || typeof source !== 'object') return;
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  private mapLegacyToAppConfig(input: any): Partial<AppConfig> {
    const result: any = {};
    if (input.application || input.logging || input.runtime || input.development || input.ai || input.memory || input.communication) {
      return input;
    }

    if (input.systemName !== undefined) {
      if (!result.application) result.application = {};
      result.application.systemName = input.systemName;
    }
    if (input.version !== undefined) {
      if (!result.application) result.application = {};
      result.application.version = input.version;
    }
    if (input.environment !== undefined) {
      if (!result.application) result.application = {};
      result.application.environment = input.environment;
    }
    if (input.logLevel !== undefined) {
      if (!result.logging) result.logging = {};
      result.logging.level = input.logLevel;
    }
    if (input.maxEventQueueSize !== undefined) {
      if (!result.runtime) result.runtime = {};
      result.runtime.maxEventQueueSize = input.maxEventQueueSize;
    }
    return result;
  }

  private applyEnvOverrides(config: AppConfig): void {
    if (typeof process === 'undefined' || !process.env) return;

    const env = process.env;

    const stringOverride = (envKey: string, setFn: (val: string) => void) => {
      if (env[envKey] !== undefined) {
        setFn(env[envKey]!);
      }
    };

    const numberOverride = (envKey: string, setFn: (val: number) => void) => {
      if (env[envKey] !== undefined) {
        const parsed = parseInt(env[envKey]!, 10);
        if (!isNaN(parsed)) {
          setFn(parsed);
        }
      }
    };

    const booleanOverride = (envKey: string, setFn: (val: boolean) => void) => {
      if (env[envKey] !== undefined) {
        const val = env[envKey]!.toLowerCase();
        setFn(val === 'true' || val === '1' || val === 'yes');
      }
    };

    stringOverride('AETHER_SYSTEM_NAME', (v) => config.application.systemName = v);
    stringOverride('AETHER_VERSION', (v) => config.application.version = v);
    stringOverride('AETHER_ENVIRONMENT', (v) => config.application.environment = v);
    if (env.NODE_ENV) {
      config.application.environment = env.NODE_ENV;
    }
    stringOverride('AETHER_CONFIG_VERSION', (v) => config.application.configVersion = v);

    stringOverride('AETHER_LOG_LEVEL', (v) => {
      if (['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'].includes(v.toUpperCase())) {
        config.logging.level = v.toUpperCase() as LogLevel;
      }
    });
    stringOverride('AETHER_LOG_FORMAT', (v) => config.logging.format = v);
    booleanOverride('AETHER_LOG_INCLUDE_TIMESTAMP', (v) => config.logging.includeTimestamp = v);

    numberOverride('AETHER_MAX_EVENT_QUEUE_SIZE', (v) => config.runtime.maxEventQueueSize = v);
    numberOverride('AETHER_TICK_RATE', (v) => config.runtime.tickRate = v);
    numberOverride('AETHER_MAX_LOADED_MODULES', (v) => config.runtime.maxLoadedModules = v);

    booleanOverride('AETHER_DEBUG_MODE', (v) => config.development.debugMode = v);
    booleanOverride('AETHER_MOCK_HARDWARE', (v) => config.development.mockHardware = v);
    booleanOverride('AETHER_HMR_DISABLED', (v) => config.development.hmrDisabled = v);

    stringOverride('AETHER_AI_MODEL_NAME', (v) => config.ai.modelName = v);
    numberOverride('AETHER_AI_MAX_TOKENS', (v) => config.ai.maxTokens = v);
    if (env.AETHER_AI_TEMPERATURE !== undefined) {
      const parsed = parseFloat(env.AETHER_AI_TEMPERATURE);
      if (!isNaN(parsed)) {
        config.ai.temperature = parsed;
      }
    }

    numberOverride('AETHER_MEMORY_VECTOR_DIM', (v) => config.memory.vectorDim = v);
    numberOverride('AETHER_MEMORY_PERSIST_INTERVAL', (v) => config.memory.persistInterval = v);

    numberOverride('AETHER_COMM_PORT', (v) => config.communication.port = v);
    stringOverride('AETHER_COMM_PROTOCOL', (v) => config.communication.protocol = v);
  }
}

