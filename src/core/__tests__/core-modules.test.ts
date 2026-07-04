import { test, describe, before, after } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventBus } from '../event-bus';
import { Logger } from '../logger';
import { ModuleLoader, ModuleContext } from '../module-loader';
import { SecurityEnclaveModule } from '../security-enclave';
import { StorageAdapterModule } from '../storage-adapter';
import { IdentityBridgeModule } from '../identity-bridge';
import { runBootstrap } from '../bootstrap';

describe('Aether Phase 1 Core Modules', () => {
  let context: ModuleContext;
  let eventBus: EventBus;
  let logger: Logger;
  
  let securityEnclave: SecurityEnclaveModule;
  let storageAdapter: StorageAdapterModule;
  let identityBridge: IdentityBridgeModule;

  before(async () => {
    eventBus = new EventBus();
    logger = new Logger('ERROR'); // Mute console chatter during tests
    context = { logger, eventBus };

    // Configure test directory
    process.env.AETHER_STORAGE_DIR = '.aether-test-storage';
    process.env.AETHER_MASTER_PASSPHRASE = 'test-passphrase-only';
    process.env.AETHER_MASTER_SALT = 'test-salt-only';

    securityEnclave = new SecurityEnclaveModule();
    storageAdapter = new StorageAdapterModule();
    identityBridge = new IdentityBridgeModule();

    // Export variables to global scope so modules can resolve them when start() is called
    (global as any).__aether_security_enclave = securityEnclave;
    (global as any).__aether_storage_adapter = storageAdapter;
  });

  after(async () => {
    // Clean up test directories
    try {
      const testStorageDir = path.resolve(process.cwd(), '.aether-test-storage');
      await fs.rm(testStorageDir, { recursive: true, force: true });
    } catch {}
    
    delete (global as any).__aether_security_enclave;
    delete (global as any).__aether_storage_adapter;
  });

  describe('SecurityEnclaveModule', () => {
    test('Initialization & default key derivation', async () => {
      await securityEnclave.initialize(context);
      await securityEnclave.start(context);
      
      const key = securityEnclave.getSystemKey();
      assert.strictEqual(key.length, 32); // AES-256 requires 32-byte key
      assert.strictEqual(securityEnclave.getStatus(), 'STARTED');
    });

    test('AES-256-GCM encryption & decryption correctness', () => {
      const data = 'Hello Sovereign AI Operating System!';
      
      // Encrypt
      const block = securityEnclave.encrypt(data);
      assert.ok(block.iv);
      assert.ok(block.encrypted);
      assert.ok(block.tag);
      assert.notStrictEqual(block.encrypted, data);

      // Decrypt
      const decrypted = securityEnclave.decrypt(block.encrypted, block.iv, block.tag);
      assert.strictEqual(decrypted.toString('utf8'), data);
    });

    test('AES-256-GCM verification fails when cipher block is tampered', () => {
      const data = 'Confidential payload';
      const block = securityEnclave.encrypt(data);
      
      // Tamper ciphertext
      const tamperedBytes = Buffer.from(block.encrypted, 'hex');
      tamperedBytes[0] ^= 0xff; // Flip first byte
      const tamperedHex = tamperedBytes.toString('hex');

      assert.throws(() => {
        securityEnclave.decrypt(tamperedHex, block.iv, block.tag);
      }, /Decryption failed/);
    });

    test('Asymmetric key generation & signing/verification loops', () => {
      const keys = securityEnclave.generateKeyPair();
      assert.ok(keys.publicKey.includes('PUBLIC KEY'));
      assert.ok(keys.privateKey.includes('PRIVATE KEY'));

      const payload = 'I attest this event is legitimate.';
      const signature = securityEnclave.sign(payload, keys.privateKey);
      assert.ok(signature);

      const isValid = securityEnclave.verify(payload, signature, keys.publicKey);
      assert.strictEqual(isValid, true);

      // Tampered data check
      const isInvalid = securityEnclave.verify(payload + ' altered', signature, keys.publicKey);
      assert.strictEqual(isInvalid, false);
    });
  });

  describe('StorageAdapterModule', () => {
    test('Initialization & transparent directory mapping', async () => {
      await storageAdapter.initialize(context);
      await storageAdapter.start(context);
      
      const storagePath = storageAdapter.getStoragePath();
      assert.ok(storagePath.endsWith('.aether-test-storage'));
      
      // Verify folder actually exists
      const stat = await fs.stat(storagePath);
      assert.ok(stat.isDirectory());
    });

    test('Secure file writing with transparent encryption at rest', async () => {
      const filename = 'confidential.txt';
      const content = 'Sovereign encryption test!';

      await storageAdapter.writeSecureFile(filename, content);

      // Check raw file directly from filesystem (it must be encrypted JSON structure, not plaintext)
      const rawFilePath = path.join(storageAdapter.getStoragePath(), filename);
      const rawText = await fs.readFile(rawFilePath, 'utf8');
      
      assert.ok(rawText.includes('"encrypted"'));
      assert.ok(rawText.includes('"iv"'));
      assert.ok(rawText.includes('"tag"'));
      assert.strictEqual(rawText.includes(content), false); // Raw text must NOT contain plaintext

      // Check safe reading (must transparently decrypt back to original plaintext)
      const decrypted = await storageAdapter.readSecureFile(filename);
      assert.ok(decrypted);
      assert.strictEqual(decrypted.toString('utf8'), content);
    });

    test('Secure file traversal check prevention', async () => {
      assert.rejects(async () => {
        await storageAdapter.writeSecureFile('../out-of-bounds.txt', 'illegal file location');
      }, /Path traversal violation/);

      assert.rejects(async () => {
        await storageAdapter.readSecureFile('../../etc/passwd');
      }, /Path traversal violation/);
    });

    test('Secure file deletion & listing operations', async () => {
      const filename = 'transient-cache.txt';
      await storageAdapter.writeSecureFile(filename, 'short lived session cache');

      const filesBefore = await storageAdapter.listSecureFiles();
      assert.ok(filesBefore.includes(filename));

      await storageAdapter.deleteSecureFile(filename);
      
      const filesAfter = await storageAdapter.listSecureFiles();
      assert.strictEqual(filesAfter.includes(filename), false);
      
      const nonExistent = await storageAdapter.readSecureFile(filename);
      assert.strictEqual(nonExistent, null);
    });
  });

  describe('IdentityBridgeModule', () => {
    test('Initialization & sovereign identity persistence', async () => {
      await identityBridge.initialize(context);
      await identityBridge.start(context);

      const did = identityBridge.getDID();
      assert.ok(did.startsWith('did:key:z'));

      const pubKey = identityBridge.getPublicKey();
      assert.ok(pubKey.includes('PUBLIC KEY'));

      // Check that identity keys are persisted in secure files
      const files = await storageAdapter.listSecureFiles();
      assert.ok(files.includes('identity.json'));

      // Stop current instance and restart a new one to verify persistence
      const newIdentityBridge = new IdentityBridgeModule();
      await newIdentityBridge.initialize(context);
      await newIdentityBridge.start(context);

      // DIDs must match since they are loaded from storage
      assert.strictEqual(newIdentityBridge.getDID(), did);
    });

    test('Identity signing & verification attestation', () => {
      const payload = 'Signed system-wide mesh telemetry heartbeat';
      const signature = identityBridge.signPayload(payload);
      assert.ok(signature);

      const isValid = identityBridge.verifyPayload(payload, signature, identityBridge.getPublicKey());
      assert.strictEqual(isValid, true);
    });
  });

  describe('ModuleLoader Dependency Topological Sorting', () => {
    test('Correct module initialization sort order', () => {
      const loader = new ModuleLoader(context);
      
      // Register in arbitrary out-of-order sequence
      loader.register(identityBridge);
      loader.register(storageAdapter);
      loader.register(securityEnclave);

      const sorted = loader.getSortedModules();
      
      // Assert that SecurityEnclave precedes StorageAdapter
      const securityIndex = sorted.indexOf(securityEnclave);
      const storageIndex = sorted.indexOf(storageAdapter);
      const identityIndex = sorted.indexOf(identityBridge);

      assert.ok(securityIndex < storageIndex);
      assert.ok(storageIndex < identityIndex);
    });

    test('Circular dependency failure detection', () => {
      const loader = new ModuleLoader(context);
      
      // Simulate circular dependency loop
      const modA = {
        name: 'ModA',
        dependencies: ['ModB'],
        initialize: async () => {},
        start: async () => {},
        stop: async () => {},
        getStatus: () => 'UNINITIALIZED' as const
      };
      const modB = {
        name: 'ModB',
        dependencies: ['ModA'],
        initialize: async () => {},
        start: async () => {},
        stop: async () => {},
        getStatus: () => 'UNINITIALIZED' as const
      };

      loader.register(modA);
      loader.register(modB);

      assert.throws(() => {
        loader.getSortedModules();
      }, /Circular dependency/);
    });
  });

  describe('Core Reactive Bootloader Integration', () => {
    test('runBootstrap executes successfully', async () => {
      // Re-configure storage location specifically for system test run
      process.env.AETHER_STORAGE_DIR = '.aether-system-run-storage';
      
      const engine = await runBootstrap();
      
      assert.strictEqual(engine.getStatus().state, 'RUNNING');
      
      const loaded = engine.getStatus().loadedModules;
      assert.ok(loaded.includes('SecurityEnclave'));
      assert.ok(loaded.includes('StorageAdapter'));
      assert.ok(loaded.includes('IdentityBridge'));

      // Clean up system run files
      try {
        const testStorageDir = path.resolve(process.cwd(), '.aether-system-run-storage');
        await fs.rm(testStorageDir, { recursive: true, force: true });
      } catch {}
    });
  });
});
