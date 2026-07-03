import { EventBus } from './event-bus';
import { Logger } from './logger';

/**
 * Represents a registered permission in the Aether security framework.
 */
export interface Permission {
  name: string;        // e.g., 'system.launch_application', 'filesystem.read'
  description: string; // Human-readable description
  granted: boolean;    // Current authorization state (true = granted, false = denied)
}

/**
 * Standardized result of a permission evaluation check.
 */
export interface PermissionDecision {
  allowed: boolean;    // Whether the request is authorized
  reason: string;      // Human-readable rationale for the decision
  timestamp: string;   // ISO-8601 timestamp of evaluation
}

/**
 * PermissionManager controls the registration, state mutation (grant/revoke),
 * and evaluation of capability-based permissions for Aether tools.
 */
export class PermissionManager {
  private permissions = new Map<string, Permission>();
  private eventBus: EventBus;
  private logger: Logger;

  constructor(eventBus: EventBus, logger: Logger) {
    if (!eventBus) throw new Error('PermissionManager Error: EventBus is required.');
    if (!logger) throw new Error('PermissionManager Error: Logger is required.');

    this.eventBus = eventBus;
    this.logger = logger;

    this.logger.info('PermissionManager', 'PermissionManager subsystem initialized.');
    this.registerDefaultPermissions();
  }

  /**
   * Registers Aether's default system permissions to seed the framework.
   */
  private registerDefaultPermissions(): void {
    const defaultPermissions: Permission[] = [
      { name: 'system.launch_application', description: 'Allows launching desktop applications on the host OS', granted: true },
      { name: 'filesystem.read', description: 'Allows reading files from local workspace pathways', granted: true },
      { name: 'filesystem.write', description: 'Allows writing files to local workspace pathways', granted: true },
      { name: 'terminal.execute', description: 'Allows spawning or executing platform shell commands', granted: true },
      { name: 'browser.open', description: 'Allows launching or navigating browser processes', granted: true },
      { name: 'microphone.access', description: 'Allows capturing raw audio hardware input streams', granted: true },
      { name: 'camera.access', description: 'Allows capturing raw video or imaging hardware streams', granted: true }
    ];

    for (const permission of defaultPermissions) {
      this.register(permission);
    }
  }

  /**
   * Registers a new permission descriptor. Prevents duplicates.
   * Publishes a 'permission.registered' event.
   */
  public register(permission: Permission): void {
    if (!permission || !permission.name) {
      throw new Error('Permission Error: Invalid permission instance or missing name.');
    }

    const name = permission.name;
    if (this.permissions.has(name)) {
      throw new Error(`Permission Error: Permission with name [${name}] is already registered.`);
    }

    this.permissions.set(name, permission);
    this.logger.info('PermissionManager', `Registered permission: ${name} (${permission.description})`);

    this.eventBus.publish('permission.registered', 'PermissionManager', {
      name,
      description: permission.description,
      granted: permission.granted,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Checks whether a permission with the specified name exists/is registered.
   */
  public has(name: string): boolean {
    return this.permissions.has(name);
  }

  /**
   * Evaluates if a registered permission is currently in the 'granted' state.
   * Returns false if the permission is not registered.
   */
  public isGranted(name: string): boolean {
    const permission = this.permissions.get(name);
    return permission ? permission.granted : false;
  }

  /**
   * Sets a permission's status to granted.
   * Publishes a 'permission.granted' event.
   */
  public grant(name: string): void {
    const permission = this.permissions.get(name);
    if (!permission) {
      throw new Error(`Permission Error: Permission with name [${name}] is not registered.`);
    }

    if (!permission.granted) {
      permission.granted = true;
      this.logger.info('PermissionManager', `Granted permission authorization: ${name}`);
      this.eventBus.publish('permission.granted', 'PermissionManager', {
        name,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Sets a permission's status to revoked (not granted).
   * Publishes a 'permission.revoked' event.
   */
  public revoke(name: string): void {
    const permission = this.permissions.get(name);
    if (!permission) {
      throw new Error(`Permission Error: Permission with name [${name}] is not registered.`);
    }

    if (permission.granted) {
      permission.granted = false;
      this.logger.info('PermissionManager', `Revoked permission authorization: ${name}`);
      this.eventBus.publish('permission.revoked', 'PermissionManager', {
        name,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Evaluates whether a tool request is authorized based on its required permissions.
   * Fail-secure design: if a required permission is unregistered or not granted, it is denied.
   * Publishes a 'permission.evaluated' event.
   */
  public evaluateRequest(toolId: string, requiredPermissions?: string[]): PermissionDecision {
    const timestamp = new Date().toISOString();

    // 1. If no permissions are required, it's allowed by default.
    if (!requiredPermissions || requiredPermissions.length === 0) {
      const decision: PermissionDecision = {
        allowed: true,
        reason: `Access authorized. Tool [${toolId}] requires no explicit permissions.`,
        timestamp
      };

      this.eventBus.publish('permission.evaluated', 'PermissionManager', {
        toolId,
        decision,
        timestamp
      });

      return decision;
    }

    // 2. Scan all required permissions.
    const deniedList: string[] = [];
    const unregisteredList: string[] = [];

    for (const permName of requiredPermissions) {
      if (!this.has(permName)) {
        unregisteredList.push(permName);
      } else if (!this.isGranted(permName)) {
        deniedList.push(permName);
      }
    }

    // 3. Fail secure if any required permission is denied or unregistered.
    if (deniedList.length > 0 || unregisteredList.length > 0) {
      const parts: string[] = [];
      if (deniedList.length > 0) {
        parts.push(`Denied: [${deniedList.join(', ')}]`);
      }
      if (unregisteredList.length > 0) {
        parts.push(`Not Registered: [${unregisteredList.join(', ')}]`);
      }

      const reason = `Access denied for tool [${toolId}]. ${parts.join('; ')}`;
      const decision: PermissionDecision = {
        allowed: false,
        reason,
        timestamp
      };

      this.eventBus.publish('permission.evaluated', 'PermissionManager', {
        toolId,
        decision,
        timestamp
      });

      return decision;
    }

    // 4. Otherwise, authorized.
    const decision: PermissionDecision = {
      allowed: true,
      reason: `Access authorized. All required permissions [${requiredPermissions.join(', ')}] are granted.`,
      timestamp
    };

    this.eventBus.publish('permission.evaluated', 'PermissionManager', {
      toolId,
      decision,
      timestamp
    });

    return decision;
  }

  /**
   * Returns a copy of all registered permissions in the system.
   */
  public list(): Permission[] {
    return Array.from(this.permissions.values()).map(p => ({ ...p }));
  }
}
