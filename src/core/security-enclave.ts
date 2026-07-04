import * as crypto from 'crypto';
import { IModule, ModuleContext, ModuleStatus } from './module-loader';

/**
 * Interface defining the cryptographic operations exposed by the SecurityEnclave module.
 */
export interface ISecurityEnclave {
  /**
   * Encrypts data using AES-256-GCM.
   * If key is not provided, uses the default system key.
   */
  encrypt(data: string | Buffer, key?: Buffer): { iv: string; encrypted: string; tag: string };

  /**
   * Decrypts AES-256-GCM encrypted data.
   * If key is not provided, uses the default system key.
   */
  decrypt(encryptedHex: string, ivHex: string, tagHex: string, key?: Buffer): Buffer;

  /**
   * Generates a stable signature key pair (secp256k1 or prime256v1).
   */
  generateKeyPair(): { publicKey: string; privateKey: string };

  /**
   * Signs a data payload with a private key.
   */
  sign(data: string | Buffer, privateKey: string): string;

  /**
   * Verifies a signature against a data payload and public key.
   */
  verify(data: string | Buffer, signatureHex: string, publicKey: string): boolean;

  /**
   * Returns the system default derived encryption key.
   */
  getSystemKey(): Buffer;
}

/**
 * Production SecurityEnclaveModule implementing TPM-like cryptographic operations in Node.js.
 */
export class SecurityEnclaveModule implements IModule, ISecurityEnclave {
  public name = 'SecurityEnclave';
  public dependencies: string[] = [];
  public isCritical = true;

  private status: ModuleStatus = 'UNINITIALIZED';
  private systemKey!: Buffer;
  private logger!: any;

  /**
   * Initialize module dependencies and derive default system master key.
   */
  public async initialize(context: ModuleContext): Promise<void> {
    this.status = 'INITIALIZING';
    this.logger = context.logger;
    this.logger.info(this.name, 'Initializing Security Enclave module...');
    context.eventBus.publish('security:init_started', this.name, {});

    try {
      // Configuration fallback or environment parameters
      const passphrase = process.env.AETHER_MASTER_PASSPHRASE || 'aether-default-sovereign-master-passphrase';
      const salt = process.env.AETHER_MASTER_SALT || 'aether-system-salt-parameters';
      
      // Derive system encryption key using PBKDF2 (AES-256 requires 32 bytes)
      this.systemKey = crypto.pbkdf2Sync(passphrase, salt, 10000, 32, 'sha256');

      this.logger.info(this.name, 'Cryptographic enclaves derived default master keys.');
      this.status = 'INITIALIZED';
    } catch (err: unknown) {
      this.status = 'FAILED';
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(this.name, `Failed to initialize cryptographic enclaves: ${msg}`);
      throw new Error(`SecurityEnclave initialization failure: ${msg}`);
    }
  }

  public async start(context: ModuleContext): Promise<void> {
    this.status = 'STARTING';
    context.eventBus.publish('security:ready', this.name, { mode: 'hardware_secure' });
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
    await this.start(context);
  }

  public async shutdown(): Promise<void> {
    await this.stop();
  }

  // --- ISecurityEnclave Implementation ---

  public getSystemKey(): Buffer {
    if (this.status !== 'STARTED' && this.status !== 'INITIALIZED') {
      throw new Error('SecurityEnclave is not initialized.');
    }
    return this.systemKey;
  }

  public encrypt(data: string | Buffer, key?: Buffer): { iv: string; encrypted: string; tag: string } {
    const activeKey = key || this.systemKey;
    if (!activeKey) {
      throw new Error('Encryption key is unavailable.');
    }

    try {
      const iv = crypto.randomBytes(12); // GCM standard IV is 12 bytes
      const cipher = crypto.createCipheriv('aes-256-gcm', activeKey, iv);
      
      const buffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
      const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
      const tag = cipher.getAuthTag();

      return {
        iv: iv.toString('hex'),
        encrypted: encrypted.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Encryption failed: ${msg}`);
    }
  }

  public decrypt(encryptedHex: string, ivHex: string, tagHex: string, key?: Buffer): Buffer {
    const activeKey = key || this.systemKey;
    if (!activeKey) {
      throw new Error('Decryption key is unavailable.');
    }

    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        activeKey,
        Buffer.from(ivHex, 'hex')
      );
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

      const buffer = Buffer.from(encryptedHex, 'hex');
      return Buffer.concat([decipher.update(buffer), decipher.final()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Decryption failed: ${msg}`);
    }
  }

  public generateKeyPair(): { publicKey: string; privateKey: string } {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      return { publicKey, privateKey };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Key pair generation failed: ${msg}`);
    }
  }

  public sign(data: string | Buffer, privateKey: string): string {
    try {
      const signer = crypto.createSign('SHA256');
      signer.update(data);
      signer.end();
      return signer.sign(privateKey, 'hex');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Signing operation failed: ${msg}`);
    }
  }

  public verify(data: string | Buffer, signatureHex: string, publicKey: string): boolean {
    try {
      const verifier = crypto.createVerify('SHA256');
      verifier.update(data);
      verifier.end();
      return verifier.verify(publicKey, signatureHex, 'hex');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(this.name, `Signature verification encountered an error: ${msg}`);
      return false;
    }
  }
}
