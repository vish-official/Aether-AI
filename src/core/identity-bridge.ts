import * as crypto from 'crypto';
import { IModule, ModuleContext, ModuleStatus } from './module-loader';
import { SecurityEnclaveModule } from './security-enclave';
import { StorageAdapterModule } from './storage-adapter';

/**
 * Interface defining identity and authentication operations in Aether.
 */
export interface IIdentityBridge {
  /**
   * Retrieves the Decentralized Identifier (DID) for this local runtime node.
   */
  getDID(): string;

  /**
   * Retrieves the raw PEM-encoded public key.
   */
  getPublicKey(): string;

  /**
   * Signs a data payload with the local sovereign identity private key.
   */
  signPayload(payload: string | Buffer): string;

  /**
   * Verifies a signature against a payload using a target public key.
   */
  verifyPayload(payload: string | Buffer, signature: string, publicKey: string): boolean;
}

/**
 * Production IdentityBridgeModule that generates, persists, and utilizes sovereign cryptographically verified DIDs.
 */
export class IdentityBridgeModule implements IModule, IIdentityBridge {
  public name = 'IdentityBridge';
  public dependencies = ['SecurityEnclave', 'StorageAdapter'];
  public isCritical = true;

  private status: ModuleStatus = 'UNINITIALIZED';
  private did!: string;
  private publicKeyPem!: string;
  private privateKeyPem!: string;

  private logger!: any;
  private eventBus!: any;
  private enclave!: SecurityEnclaveModule;
  private storage!: StorageAdapterModule;

  public async initialize(context: ModuleContext): Promise<void> {
    this.status = 'INITIALIZING';
    this.logger = context.logger;
    this.eventBus = context.eventBus;
    this.logger.info(this.name, 'Initializing identity verification structures...');
    this.eventBus.publish('identity:init_started', this.name, {});

    // Dependency references will be resolved inside start() when active
    this.status = 'INITIALIZED';
  }

  public async start(context: ModuleContext): Promise<void> {
    this.status = 'STARTING';

    const loader = (context as any).loader;
    const enclaveModule = loader?.getModule('SecurityEnclave') || (global as any).__aether_security_enclave;
    const storageModule = loader?.getModule('StorageAdapter') || (global as any).__aether_storage_adapter;

    if (!enclaveModule || !storageModule) {
      this.status = 'FAILED';
      throw new Error('IdentityBridge is missing required modules (SecurityEnclave/StorageAdapter).');
    }

    this.enclave = enclaveModule as SecurityEnclaveModule;
    this.storage = storageModule as StorageAdapterModule;

    try {
      const identityFile = 'identity.json';
      let loadedKeys: { publicKey: string; privateKey: string } | null = null;

      // 1. Try reading identity keys from secure encrypted storage
      try {
        const fileContent = await this.storage.readSecureFile(identityFile);
        if (fileContent) {
          loadedKeys = JSON.parse(fileContent.toString('utf8'));
        }
      } catch (err) {
        this.logger.warn(this.name, 'Failed to read identity from secure storage. Generating new identity...');
      }

      // 2. Generate new keys if none were found
      if (!loadedKeys) {
        this.logger.info(this.name, 'Generating new sovereign cryptographic key pair...');
        loadedKeys = this.enclave.generateKeyPair();
        
        // Persist securely to encrypted storage
        await this.storage.writeSecureFile(identityFile, JSON.stringify(loadedKeys));
      }

      this.publicKeyPem = loadedKeys.publicKey;
      this.privateKeyPem = loadedKeys.privateKey;

      // Derive did:key format (simple SHA-256 fingerprint representation)
      const keyBuffer = Buffer.from(this.publicKeyPem, 'utf8');
      const hash = crypto.createHash('sha256').update(keyBuffer).digest('hex');
      this.did = `did:key:z${hash.substring(0, 32)}`;

      this.logger.info(this.name, `Local sovereign identity loaded. DID: ${this.did}`);
      this.eventBus.publish('identity:ready', this.name, { nodeId: this.did });
      
      this.status = 'STARTED';
    } catch (err: unknown) {
      this.status = 'FAILED';
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(this.name, `Failed to load or generate identity: ${msg}`);
      throw new Error(`IdentityBridge start failure: ${msg}`);
    }
  }

  public async stop(): Promise<void> {
    this.status = 'STOPPING';
    this.status = 'STOPPED';
  }

  public getStatus(): ModuleStatus {
    return this.status;
  }

  // Backwards compatibility APIs
  public async init(context: ModuleContext): Promise<void> {
    await this.initialize(context);
    
    if (!(context as any).loader) {
      (context as any).loader = {
        getModule: (name: string) => {
          if (name === 'SecurityEnclave') return (global as any).__aether_security_enclave;
          if (name === 'StorageAdapter') return (global as any).__aether_storage_adapter;
          return undefined;
        }
      };
    }
    
    await this.start(context);
  }

  public async shutdown(): Promise<void> {
    await this.stop();
  }

  // --- IIdentityBridge Implementation ---

  public getDID(): string {
    if (this.status !== 'STARTED') {
      throw new Error('IdentityBridge is not started.');
    }
    return this.did;
  }

  public getPublicKey(): string {
    if (this.status !== 'STARTED') {
      throw new Error('IdentityBridge is not started.');
    }
    return this.publicKeyPem;
  }

  public signPayload(payload: string | Buffer): string {
    if (this.status !== 'STARTED') {
      throw new Error('IdentityBridge is not started.');
    }
    return this.enclave.sign(payload, this.privateKeyPem);
  }

  public verifyPayload(payload: string | Buffer, signatureHex: string, publicKeyPem: string): boolean {
    if (this.status !== 'STARTED') {
      throw new Error('IdentityBridge is not started.');
    }
    return this.enclave.verify(payload, signatureHex, publicKeyPem);
  }
}
