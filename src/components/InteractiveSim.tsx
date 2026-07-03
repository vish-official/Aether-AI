import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Terminal, ArrowRight, Shield, Cpu, Database, Network, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import actual Aether Core modules from public entry point
import {
  ConfigurationManager,
  Logger as RealLogger,
  EventBus as RealEventBus,
  ModuleLoader as RealModuleLoader,
  IModule,
  ModuleContext,
  CoreEngine as RealCoreEngine,
  ModuleStatus
} from '../core';

interface SimulationEvent {
  id: string;
  name: string;
  subsystem: string;
  description: string;
  steps: {
    component: string;
    action: string;
    status: 'success' | 'warning' | 'info';
    payload: string;
  }[];
}

const SIM_EVENTS: SimulationEvent[] = [
  {
    id: 'real-bootstrap',
    name: 'Aether Core Bootstrap (Sprint 3 Live)',
    subsystem: 'AetherCore',
    description: 'Instantiate and execute the genuine Aether Core engine in the browser context. Witness Configuration, Logger, Event Bus, and the advanced Module Loader with dependency-sorted, lifecycle-managed modules in real-time.',
    steps: [
      { component: 'ConfigurationManager', action: 'Initialize settings and environmental variables', status: 'success', payload: 'LogLevel: INFO, Version: 1.0.0-bootstrap' },
      { component: 'Logger', action: 'Initialize structured leveled logging output stream', status: 'success', payload: 'Levels: DEBUG, INFO, WARN, ERROR, FATAL' },
      { component: 'EventBus', action: 'Start the decoupled publish-subscribe event broker', status: 'success', payload: 'Channel: Wildcard * audit stream enabled' },
      { component: 'ModuleLoader', action: 'Register system-approved modules and resolve topological dependencies', status: 'success', payload: 'Sorted: SecurityEnclave -> StorageAdapter, IdentityBridge' },
      { component: 'CoreEngine', action: 'Execute core engine boot sequence & load modules', status: 'success', payload: 'Initiating 3 core system modules in dependency order' },
      { component: 'AetherCore', action: 'Complete boot flow and transition system state to RUNNING', status: 'success', payload: 'System status: SECURE & HEALTHY' }
    ]
  },
  {
    id: 'handshake',
    name: 'P2P Mutual Trust Discovery',
    subsystem: 'AetherIdentity',
    description: 'A trusted peer companion device is detected nearby. Trigger a secure asymmetric zero-knowledge cryptographic handshake.',
    steps: [
      { component: 'mDNS local scanner', action: 'Broadcast local peer presence query', status: 'info', payload: 'Query: _aether-sync._tcp.local' },
      { component: 'TPM Key Derivation Engine', action: 'Retrieve derived Curve25519 node key pair', status: 'success', payload: 'Node ID: device_watch_58f; PubKey: 0x8f3c...b091' },
      { component: 'AetherMesh local broker', action: 'Establish secure local UDP backchannel', status: 'info', payload: 'Target: 192.168.1.142:3000' },
      { component: 'AetherIdentity Engine', action: 'Perform asymmetric key handshake, verify signatures', status: 'success', payload: 'Handshake accepted; Zero-knowledge proof verified' },
      { component: 'AetherGuard policy module', action: 'Provision dynamic companion sync token', status: 'success', payload: 'Capability: mesh.federate.sync; Expiry: 3600s' },
      { component: 'AetherMesh router', action: 'Federate active communication pipelines', status: 'success', payload: 'Route: watch.aether.mind.* synced successfully' }
    ]
  },
  {
    id: 'memory-recall',
    name: 'Semantic Context Tiering Recall',
    subsystem: 'AetherMemory',
    description: 'The cognitive core requests associative context for "Draft recap of this mornings project meeting".',
    steps: [
      { component: 'Unified Memory Controller', action: 'Inspect active context buffers in L1 RAM', status: 'info', payload: 'L1: Not found (Cache Miss)' },
      { component: 'L2 local structured engine', action: 'Search structured index for "this morning"', status: 'success', payload: 'Found 4 raw file entries from 08:30 to 10:00' },
      { component: 'L3 Semantic Embedding vector DB', action: 'Perform Cosine Similarity matching over local space', status: 'success', payload: 'Query Vector: [0.12, -0.42, 0.98...]; Top K: 3 match nodes' },
      { component: 'Memory consolidator', action: 'Fetch raw chunks, decrypt with host unique AES-GCM key', status: 'success', payload: 'Decryption verified; Integrity hashes match' },
      { component: 'Unified Memory Controller', action: 'Hydrate L1 volatile cache with results', status: 'success', payload: 'Stored 24.5 KB active context cluster' },
      { component: 'AetherMind Cognitive Loop', action: 'Forward formulated context package', status: 'success', payload: 'Success: Context delivered to reasoning pipeline' }
    ]
  },
  {
    id: 'sandbox-execution',
    name: 'Isolate Running Third-Party Script',
    subsystem: 'AetherRuntime',
    description: 'A third-party math plugin requests code compilation and execution inside the local workspace.',
    steps: [
      { component: 'AetherGuard security check', action: 'Inspect signature and requesting capability token', status: 'info', payload: 'Token: plugin_math_node_9a1; Capabilities: runtime.sandbox.execute' },
      { component: 'Sandbox Execution Manager', action: 'Allocate isolated Low-Integrity subprocess worker', status: 'success', payload: 'Worker allocated; Memory budget: 128 MB' },
      { component: 'WASM Compiler / Virtual Disk', action: 'Mount virtual directories and build code source', status: 'info', payload: 'Mounted /vfs/sandbox_9a1; Compiling: plugin.ts' },
      { component: 'Sandbox Jail Environment', action: 'Trigger execution bounds verification loops', status: 'success', payload: 'CPU: OK (12%); Sockets: Blocked by default policy' },
      { component: 'AetherRuntime platform bridge', action: 'Capture stdout, pipe buffers out safely', status: 'success', payload: 'Result: { output: 42.0001, time: "14ms" }' },
      { component: 'Sandbox Execution Manager', action: 'Kill worker subprocess cleanly, reclaim memory allocations', status: 'success', payload: 'Memory reclaimed: 128 MB' }
    ]
  },
  {
    id: 'security-override',
    name: 'AetherGuard Resource Block',
    subsystem: 'AetherGuard',
    description: 'A compromised background utility tries to access the physical microphone raw stream directly without user confirmation.',
    steps: [
      { component: 'Unified Platform Bridge', action: 'Intercept system microphone capture allocation request', status: 'warning', payload: 'Requested by node: utility_transcriber_2b4' },
      { component: 'AetherGuard Access Evaluator', action: 'Audit active capabilities of utility_transcriber_2b4', status: 'warning', payload: 'Checking token: token_2b4; Required: hardware.microphone.stream' },
      { component: 'Access Evaluator Core', action: 'Flag ambient authority mismatch (Capability is absent)', status: 'warning', payload: 'Access rejected' },
      { component: 'Tamper-Resistant Audit Log', action: 'Append cryptographic security alert block', status: 'warning', payload: 'Block: #140221; ThreatLevel: HIGH; Signature: 0x9a4f' },
      { component: 'User Consent overlay manager', action: 'Prompt active desktop UI with system bypass choices', status: 'warning', payload: 'Awaiting visual confirmation (Desktop popup locked)' },
      { component: 'Sandbox Jail Manager', action: 'Suspend utility_transcriber_2b4 execution threads', status: 'success', payload: 'Process paused cleanly pending response' }
    ]
  }
];

export default function InteractiveSim() {
  const [activeEvent, setActiveEvent] = useState<SimulationEvent>(SIM_EVENTS[0]);
  const [simStepIndex, setSimStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Handle auto playing of simulated steps
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && activeEvent.id !== 'real-bootstrap' && simStepIndex < activeEvent.steps.length - 1) {
      timer = setTimeout(() => {
        const nextStep = simStepIndex + 1;
        setSimStepIndex(nextStep);
        const step = activeEvent.steps[nextStep];
        addLog(`${step.component.toUpperCase()} -> ${step.action} (${step.payload})`);
      }, 1500);
    } else if (simStepIndex === activeEvent.steps.length - 1 && activeEvent.id !== 'real-bootstrap') {
      setIsPlaying(false);
      addLog(`SYSTEM VERIFICATION COMPLETE: ${activeEvent.name} validation holds.`);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, simStepIndex, activeEvent]);

  // Execute real core engine components in browser memory!
  const executeRealBootstrap = async () => {
    addLog(`INITIATING REAL-TIME SYSTEM BOOTSTRAP IN BROWSER CONTEXT...`);
    
    await new Promise(r => setTimeout(r, 600));

    // 1. Create Config
    const config = new ConfigurationManager();
    addLog(`CONFIG_LOAD -> Config variables and environmental profiles initialized.`);
    await new Promise(r => setTimeout(r, 600));

    // 2. Create Logger
    const logger = new RealLogger(config.get('logLevel'));
    
    // Subscribe our React logs state to the logger outputs
    const unsubscribeLogger = logger.subscribe((logMsg) => {
      setLogs((prev) => [
        ...prev,
        `[${logMsg.timestamp.split('T')[1].slice(0, 8)}] [${logMsg.level}] [${logMsg.source}] ${logMsg.message}`
      ]);
    });

    // 3. Create EventBus
    const eventBus = new RealEventBus(logger);

    // Subscribe logger directly to system events via the Event Bus
    logger.subscribeToEvents(eventBus);
    
    // Event Bus wildcard listener
    const unsubscribeEventBus = eventBus.subscribe('*', (event) => {
      setLogs((prev) => [...prev, `[EVENT_BUS] -> Intercepted Event [${event.type}] from [${event.source}]`]);
    });

    // Publish configuration loaded event via Event Bus
    config.publishLoaded(eventBus);

    logger.info('Bootstrap', '------------------------------------------------------------');
    logger.info('Bootstrap', '🌟 INITIATING AETHER CORE BOOTSTRAP PROTOCOL (SPRINT 1) 🌟');
    logger.info('Bootstrap', '------------------------------------------------------------');
    logger.info('Bootstrap', `System: ${config.get('systemName')} | Version: ${config.get('version')} | Env: ${config.get('environment')}`);
    
    setSimStepIndex(1);
    await new Promise(r => setTimeout(r, 800));

    logger.info('Bootstrap', 'Asynchronous decentralized Event Bus initialized and subscribed.');
    setSimStepIndex(2);
    await new Promise(r => setTimeout(r, 800));

    // 4. Create Module Loader and context
    const context: ModuleContext = { logger, eventBus };
    const loader = new RealModuleLoader(context);

    // Register modules
    class BrowserIdentityModule implements IModule {
      public name = 'IdentityBridge';
      public dependencies = ['SecurityEnclave'];
      public isCritical = true;
      private status: ModuleStatus = 'UNINITIALIZED';

      public async initialize(ctx: ModuleContext): Promise<void> {
        this.status = 'INITIALIZING';
        ctx.logger.info(this.name, 'Initializing identity verification structures...');
        await new Promise(r => setTimeout(r, 250));
        ctx.logger.info(this.name, 'Local sovereign identity cryptographically loaded.');
        this.status = 'INITIALIZED';
      }

      public async start(ctx: ModuleContext): Promise<void> {
        this.status = 'STARTING';
        ctx.eventBus.publish('identity:ready', this.name, { nodeId: 'node_aether_alpha_01' });
        this.status = 'STARTED';
      }

      public async stop(): Promise<void> {
        this.status = 'STOPPING';
        this.status = 'STOPPED';
      }

      public getStatus(): ModuleStatus {
        return this.status;
      }
    }

    class BrowserStorageModule implements IModule {
      public name = 'StorageAdapter';
      public dependencies = ['SecurityEnclave'];
      public isCritical = true;
      private status: ModuleStatus = 'UNINITIALIZED';

      public async initialize(ctx: ModuleContext): Promise<void> {
        this.status = 'INITIALIZING';
        ctx.logger.info(this.name, 'Initializing secure local filesystem layers...');
        await new Promise(r => setTimeout(r, 250));
        ctx.logger.info(this.name, 'Virtual file allocation tables mapped successfully.');
        this.status = 'INITIALIZED';
      }

      public async start(ctx: ModuleContext): Promise<void> {
        this.status = 'STARTING';
        ctx.eventBus.publish('storage:ready', this.name, { status: 'mounted', writable: true });
        this.status = 'STARTED';
      }

      public async stop(): Promise<void> {
        this.status = 'STOPPING';
        this.status = 'STOPPED';
      }

      public getStatus(): ModuleStatus {
        return this.status;
      }
    }

    class BrowserSecurityModule implements IModule {
      public name = 'SecurityEnclave';
      public dependencies = [];
      public isCritical = true;
      private status: ModuleStatus = 'UNINITIALIZED';

      public async initialize(ctx: ModuleContext): Promise<void> {
        this.status = 'INITIALIZING';
        ctx.logger.info(this.name, 'Connecting to hardware TPM security chip...');
        await new Promise(r => setTimeout(r, 250));
        ctx.logger.info(this.name, 'Symmetric and asymmetric cryptographic enclaves isolated.');
        this.status = 'INITIALIZED';
      }

      public async start(ctx: ModuleContext): Promise<void> {
        this.status = 'STARTING';
        ctx.eventBus.publish('security:ready', this.name, { mode: 'hardware_secure' });
        this.status = 'STARTED';
      }

      public async stop(): Promise<void> {
        this.status = 'STOPPING';
        this.status = 'STOPPED';
      }

      public getStatus(): ModuleStatus {
        return this.status;
      }
    }

    loader.register(new BrowserIdentityModule());
    loader.register(new BrowserStorageModule());
    loader.register(new BrowserSecurityModule());

    setSimStepIndex(3);
    await new Promise(r => setTimeout(r, 800));

    // 5. Create Core Engine and Boot
    const engine = new RealCoreEngine(config, logger, eventBus, loader);

    setSimStepIndex(4);
    await new Promise(r => setTimeout(r, 600));

    try {
      await engine.boot();
      setSimStepIndex(5);
      
      logger.info('Bootstrap', '------------------------------------------------------------');
      logger.info('Bootstrap', '✅ AETHER SYSTEM STATUS: SECURE & HEALTHY');
      logger.info('Bootstrap', `Active State: ${engine.getStatus().state}`);
      logger.info('Bootstrap', `Modules Registered & Loaded: ${engine.getStatus().loadedModules.join(', ')}`);
      logger.info('Bootstrap', '------------------------------------------------------------');

    } catch (err: any) {
      logger.fatal('Bootstrap', `Browser engine boot failed: ${err.message}`);
    } finally {
      setIsPlaying(false);
      unsubscribeLogger();
      unsubscribeEventBus();
    }
  };

  const startSimulation = () => {
    setLogs([]);
    setSimStepIndex(0);
    setIsPlaying(true);
    
    if (activeEvent.id === 'real-bootstrap') {
      executeRealBootstrap();
    } else {
      addLog(`INITIATING DESIGN VERIFICATION: ${activeEvent.name} ...`);
      const step = activeEvent.steps[0];
      addLog(`${step.component.toUpperCase()} -> ${step.action} (${step.payload})`);
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setSimStepIndex(-1);
    setLogs([]);
  };

  const selectEvent = (event: SimulationEvent) => {
    setIsPlaying(false);
    setSimStepIndex(-1);
    setLogs([]);
    setActiveEvent(event);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full" id="interactive-sim-container">
      {/* Event Selection & Controller - Left Col */}
      <div className="xl:col-span-1 flex flex-col gap-5 bg-[#15151A]/40 rounded-xl border border-white/5 p-5">
        <div>
          <h3 className="text-sm font-semibold text-white/90 font-sans">Design Verification Environment</h3>
          <p className="text-xs text-white/50 font-sans mt-1">
            Prove the logical relationships, routing constraints, and safety boundaries defined in Phase 0.
          </p>
        </div>

        {/* Event List */}
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
          {SIM_EVENTS.map((event) => (
            <button
              key={event.id}
              onClick={() => selectEvent(event)}
              className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col gap-1.5 ${
                activeEvent.id === event.id
                  ? 'bg-indigo-600/10 border-indigo-500/40 shadow-sm'
                  : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
              }`}
              id={`sim-event-btn-${event.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white/90">{event.name}</span>
                <span className="text-[9px] font-mono bg-black text-indigo-400 px-2 py-0.2 rounded border border-white/5">
                  {event.subsystem}
                </span>
              </div>
              <p className="text-white/50 font-sans leading-relaxed text-[11px] line-clamp-2">
                {event.description}
              </p>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2 border-t border-white/5 pt-4 mt-2">
          <button
            onClick={startSimulation}
            disabled={isPlaying}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs py-2.5 px-4 rounded-lg shadow-md transition-all font-sans cursor-pointer"
            id="sim-run-btn"
          >
            <Play className="w-4 h-4 fill-current" />
            Verify Model
          </button>
          <button
            onClick={resetSimulation}
            className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/80 p-2.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
            title="Reset Simulation"
            id="sim-reset-btn"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Component State Flow - Middle Col */}
      <div className="xl:col-span-2 flex flex-col bg-[#15151A]/60 rounded-xl border border-white/5 p-5 shadow-inner relative overflow-hidden">
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#15151A] px-2.5 py-1 rounded-md border border-white/5 text-xs text-white/50 font-mono">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>COGNITIVE FLOW LOGIC SIMULATION</span>
        </div>

        {/* Steps Flow Chart */}
        <div className="flex-1 flex flex-col justify-center py-10 space-y-3 relative z-10">
          <AnimatePresence>
            {simStepIndex >= 0 ? (
              <div className="space-y-4">
                {activeEvent.steps.map((step, idx) => {
                  const isPassed = idx < simStepIndex;
                  const isCurrent = idx === simStepIndex;
                  const isFuture = idx > simStepIndex;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start gap-4 p-3 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.15)] text-indigo-100'
                          : isPassed
                          ? 'bg-[#15151A]/40 border-white/5 opacity-60 text-white/70'
                          : 'bg-black/20 border-white/5 opacity-20 text-white/30'
                      }`}
                      id={`sim-step-${idx}`}
                    >
                      {/* Step Number Badge */}
                      <div className={`w-5 h-5 rounded-full font-mono text-[10px] flex items-center justify-center shrink-0 border ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : isPassed
                          ? 'bg-indigo-950 text-indigo-400 border-indigo-900'
                          : 'bg-black text-white/30 border-white/5'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Step Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-mono text-xs uppercase tracking-wide font-semibold ${isCurrent ? 'text-indigo-400' : 'text-white/50'}`}>
                            {step.component}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-mono text-indigo-400 animate-pulse font-semibold">
                              PROCESSING...
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-sans mt-0.5 font-medium leading-normal">
                          {step.action}
                        </p>
                        {isCurrent && (
                          <div className="mt-1.5 p-1.5 rounded bg-black/80 font-mono text-[10px] text-indigo-300 break-all leading-normal border border-white/5">
                            Payload: {step.payload}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-950/40 border border-indigo-900/40 flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white/80">Simulation Offline</h4>
                  <p className="text-xs text-white/50 max-w-sm mt-1 mx-auto leading-relaxed">
                    Select an operational event scenario on the left panel, and click "Verify Model" to watch key verification handshakes map across the Aether subsystems.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Console / Diagnostics Terminal */}
        <div className="h-44 bg-black rounded-lg border border-white/5 flex flex-col mt-4 font-mono">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-black/80 text-xs text-white/30">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Diagnostic Console Stream</span>
            </div>
            <span className="text-[10px] text-indigo-500/80">AetherDVE-Terminal</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 text-[11px] leading-relaxed text-indigo-400/90 space-y-1">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap font-mono" id={`console-log-${i}`}>
                  {log}
                </div>
              ))
            ) : (
              <div className="text-white/20 italic">Console idle. Awaiting compilation...</div>
            )}
            <div ref={terminalEndRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
