import * as fs from 'fs/promises';
import * as path from 'path';
import { IModule, ModuleContext, ModuleStatus } from './module-loader';
import { SecurityEnclaveModule } from './security-enclave';

/**
 * Interface defining secure local file read/write adapters.
 */
export interface IStorageAdapter {
  /**
   * Writes data to an encrypted file at rest.
   */
  writeSecureFile(filename: string, content: string | Buffer): Promise<void>;

  /**
   * Reads and decrypts a file's content.
   * Returns null if file does not exist.
   */
  readSecureFile(filename: string): Promise<Buffer | null>;

  /**
   * Safely deletes a file.
   */
  deleteSecureFile(filename: string): Promise<void>;

  /**
   * Lists the names of all secure files.
   */
  listSecureFiles(): Promise<string[]>;

  /**
   * Gets the absolute path of the secure storage directory.
   */
  getStoragePath(): string;
}

/**
 * Production StorageAdapterModule that provides transparent file encryption using Node fs and SecurityEnclave.
 */
export class StorageAdapterModule implements IModule, IStorageAdapter {
  public name = 'StorageAdapter';
  public dependencies = ['SecurityEnclave'];
  public isCritical = true;

  private status: ModuleStatus = 'UNINITIALIZED';
  private storageDir!: string;
  private logger!: any;
  private eventBus!: any;
  private enclave!: SecurityEnclaveModule;

  public async initialize(context: ModuleContext): Promise<void> {
    this.status = 'INITIALIZING';
    this.logger = context.logger;
    this.eventBus = context.eventBus;
    this.logger.info(this.name, 'Initializing secure local filesystem adapter...');
    this.eventBus.publish('storage:init_started', this.name, {});

    try {
      // Configure target directory relative to workspace root or config parameters
      const configuredDir = process.env.AETHER_STORAGE_DIR || '.aether-storage';
      
      // Resolve path within workspace root to prevent out-of-bounds leakage
      this.storageDir = path.resolve(process.cwd(), configuredDir);

      // Ensure directory exists
      await fs.mkdir(this.storageDir, { recursive: true });

      this.logger.info(this.name, `Secure storage directory initialized at: ${this.storageDir}`);
      this.status = 'INITIALIZED';
    } catch (err: unknown) {
      this.status = 'FAILED';
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(this.name, `Failed to initialize secure storage: ${msg}`);
      throw new Error(`StorageAdapter initialization failure: ${msg}`);
    }
  }

  public async start(context: ModuleContext): Promise<void> {
    this.status = 'STARTING';
    
    // Resolve dependency from loader
    const securityModule = (context as any).loader?.getModule('SecurityEnclave') || 
                           (global as any).__aether_security_enclave; // fallback for custom test setups
    
    if (!securityModule) {
      this.status = 'FAILED';
      throw new Error('SecurityEnclave dependency is missing or not registered.');
    }
    
    this.enclave = securityModule as SecurityEnclaveModule;
    this.eventBus.publish('storage:ready', this.name, { status: 'mounted', writable: true });
    this.status = 'STARTED';
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
    
    // Test environments or bootstrap environments might load modules directly
    // If context doesn't have module registry, mock/resolve SecurityEnclave
    if (!(context as any).loader) {
      (context as any).loader = {
        getModule: (name: string) => (global as any).__aether_security_enclave
      };
    }
    
    await this.start(context);
  }

  public async shutdown(): Promise<void> {
    await this.stop();
  }

  // --- IStorageAdapter Implementation ---

  public getStoragePath(): string {
    return this.storageDir;
  }

  /**
   * Resolves a filename into a safe absolute path, preventing path traversal attacks.
   */
  private resolveSafePath(filename: string): string {
    const resolved = path.resolve(this.storageDir, filename);
    if (!resolved.startsWith(this.storageDir)) {
      throw new Error(`Path traversal violation: target path [${resolved}] is out of bounds.`);
    }
    return resolved;
  }

  public async writeSecureFile(filename: string, content: string | Buffer): Promise<void> {
    if (this.status !== 'STARTED') {
      throw new Error('StorageAdapter is not started.');
    }

    try {
      const targetPath = this.resolveSafePath(filename);
      
      // 1. Perform transparent encryption
      const encryptedBlock = this.enclave.encrypt(content);

      // 2. Write structural JSON payload to disk
      const payloadString = JSON.stringify(encryptedBlock);
      await fs.writeFile(targetPath, payloadString, 'utf8');

      this.logger.debug(this.name, `Successfully wrote secure encrypted file: ${filename}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(this.name, `Failed writing secure file [${filename}]: ${msg}`);
      throw new Error(`Secure write error: ${msg}`);
    }
  }

  public async readSecureFile(filename: string): Promise<Buffer | null> {
    if (this.status !== 'STARTED') {
      throw new Error('StorageAdapter is not started.');
    }

    try {
      const targetPath = this.resolveSafePath(filename);
      
      // Check if file exists
      try {
        await fs.access(targetPath);
      } catch {
        return null;
      }

      // 1. Read encrypted JSON structure from disk
      const payloadString = await fs.readFile(targetPath, 'utf8');
      const encryptedBlock = JSON.parse(payloadString);

      if (!encryptedBlock.iv || !encryptedBlock.encrypted || !encryptedBlock.tag) {
        throw new Error('Invalid secure storage file format.');
      }

      // 2. Decrypt using SecurityEnclave
      const decryptedBuffer = this.enclave.decrypt(
        encryptedBlock.encrypted,
        encryptedBlock.iv,
        encryptedBlock.tag
      );

      return decryptedBuffer;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(this.name, `Failed reading secure file [${filename}]: ${msg}`);
      throw new Error(`Secure read error: ${msg}`);
    }
  }

  public async deleteSecureFile(filename: string): Promise<void> {
    if (this.status !== 'STARTED') {
      throw new Error('StorageAdapter is not started.');
    }

    try {
      const targetPath = this.resolveSafePath(filename);
      await fs.unlink(targetPath);
      this.logger.debug(this.name, `Successfully deleted secure file: ${filename}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(this.name, `Failed to delete file [${filename}]: ${msg}`);
      throw new Error(`Secure delete error: ${msg}`);
    }
  }

  public async listSecureFiles(): Promise<string[]> {
    if (this.status !== 'STARTED') {
      throw new Error('StorageAdapter is not started.');
    }

    try {
      const items = await fs.readdir(this.storageDir, { withFileTypes: true });
      return items
        .filter((item) => item.isFile())
        .map((item) => item.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(this.name, `Failed listing secure directory: ${msg}`);
      throw new Error(`Secure directory list error: ${msg}`);
    }
  }
}
