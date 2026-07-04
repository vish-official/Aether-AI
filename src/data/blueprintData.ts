export interface BlueprintSubsystem {
  id: string;
  name: string;
  isDetailed: boolean;
  description: string;
  components?: string[];
}

export interface BlueprintPrinciple {
  title: string;
  description: string;
  iconName: string;
}

export interface RoadmapPhase {
  phase: number;
  name: string;
  status: 'completed' | 'in-progress' | 'planned';
  timeline: string;
}

export interface CodingStandard {
  title: string;
  description: string;
}

export const BLUEPRINT_DATA = {
  version: "0.1",
  title: "Aether Master Blueprint v0.1",
  purpose: "Aether is envisioned as a modular, local-first AI operating system rather than a simple chatbot. It combines conversational AI, long-term memory, planning, tools, automation, voice, and vision behind a unified runtime.",
  
  principles: [
    {
      title: "Modular Architecture",
      description: "Subsystems are treated as strictly decoupled black boxes communicating exclusively via Protocol Buffer serialized events over the Event Mesh.",
      iconName: "Layers"
    },
    {
      title: "Provider-Agnostic AI",
      description: "Treat neural networks as swap-in device drivers. Support Ollama, llama.cpp, and OpenAI-compatible APIs without vendor lock-in.",
      iconName: "Cpu"
    },
    {
      title: "Local-First, Cloud Optional",
      description: "Core loops, memory structures, and planning execute entirely on local hardware. Cloud services are strict, user-authorized pipelines.",
      iconName: "Globe"
    },
    {
      title: "Event-Driven Runtime",
      description: "An asynchronous system bus processes interactions as schema-validated events, avoiding performance bottlenecks.",
      iconName: "Network"
    },
    {
      title: "Security by Design",
      description: "Enforces zero ambient authority, cryptographic permission tokens, and sandboxed WebAssembly execution contexts.",
      iconName: "Shield"
    },
    {
      title: "Extensibility Through Plugins",
      description: "A secure Plugin SDK with restricted access boundaries enables safe user customization and third-party extensions.",
      iconName: "Wrench"
    },
    {
      title: "Maintainability Over Shortcuts",
      description: "Strict adherence to SOLID design principles, comprehensive test suites, and compile-time verified system contracts.",
      iconName: "Sparkles"
    }
  ] as BlueprintPrinciple[],

  subsystems: [
    {
      id: "runtime",
      name: "Core Runtime",
      isDetailed: false,
      description: "The execution core mapping platform-independent virtual operations to the native host kernel."
    },
    {
      id: "brain",
      name: "Brain (LLM abstraction)",
      isDetailed: true,
      description: "Provides LLM provider abstractions supporting Ollama, llama.cpp, and OpenAI-compatible APIs. Manages conversation sessions, prompt pipelines, streaming, and local/remote routing.",
      components: ["Ollama adapter", "llama.cpp connection driver", "OpenAI-compatible client broker", "Session state manager"]
    },
    {
      id: "planner",
      name: "Planner",
      isDetailed: true,
      description: "Converts high-level user goals into structured, executable plans. Chooses tools, observes run results, recovers from failures, and reflects before generating the final output.",
      components: ["Goal decomposer", "Dynamic tool selector", "Error correction loops", "Self-reflection engine"]
    },
    {
      id: "memory",
      name: "Memory Engine",
      isDetailed: true,
      description: "Manages tiered memory consolidation: volatile L1 cache, local structured L2 databases, and L3 semantic vector databases with forgetting and consolidation algorithms.",
      components: ["L1 Volatile Cache manager", "L2 local database (SQLite/IndexedDB)", "L3 Vector Embeddings indexer", "Consolidation scheduler"]
    },
    {
      id: "tools",
      name: "Tool Framework",
      isDetailed: true,
      description: "Permission-aware tool manager governing tool lifecycles, sandboxed subprocess constraints, progress telemetry, cancellation triggers, and dynamic imports.",
      components: ["ITool registration broker", "Sandbox confinement driver", "Progress telemetry channels", "Cancellation monitors"]
    },
    {
      id: "voice",
      name: "Voice",
      isDetailed: true,
      description: "Low-latency voice interactions, wake-word listeners, speech-to-text translators, text-to-speech generators, and real-time audio interruption controls.",
      components: ["Wake word listener", "Speech-to-Text (STT) worker", "Text-to-Speech (TTS) synthesizer", "Interruption handler"]
    },
    {
      id: "vision",
      name: "Vision",
      isDetailed: true,
      description: "High-performance visual processing including OCR scanning, screen/window context understanding, live camera capture streams, and spatial models.",
      components: ["Optical Character Recognition", "Screenshot analyzer", "Camera frame listener", "Spatial layout detector"]
    },
    {
      id: "automation",
      name: "Automation",
      isDetailed: true,
      description: "Safe system orchestration wrappers driving third-party applications, virtual filesystem navigation, headless web browsers, inputs, and office utilities.",
      components: ["Application controllers", "Headless browser sandbox", "System input emulator", "Email & calendar adapter"]
    },
    {
      id: "plugin",
      name: "Plugin SDK",
      isDetailed: false,
      description: "Standard hooks and types enabling developers to build sandbox-safe plugins and extend the core Event Mesh."
    },
    {
      id: "desktop",
      name: "Desktop UI",
      isDetailed: true,
      description: "The visual portal presenting chat enclaves, configuration settings, memory explorers, plugin directories, developer logs, and diagnostics.",
      components: ["Chat console", "Memory graph explorer", "Plugin marketplace view", "System logs console"]
    },
    {
      id: "mobile",
      name: "Mobile Companion",
      isDetailed: false,
      description: "Lightweight mobile nodes synchronized to the primary desktop mesh over secure P2P channels."
    },
    {
      id: "configuration",
      name: "Configuration",
      isDetailed: false,
      description: "Centralized settings, environmental variables, and security parameters validation schemas."
    },
    {
      id: "security",
      name: "Security",
      isDetailed: true,
      description: "The core shield enforcing capability token authorizations, AES-256 encrypted secrets vaults, sandboxed runtimes, and audit ledger chains.",
      components: ["Capability evaluator", "Secrets encryption vault", "Sandboxing jail manager", "Tamper-resistant audit log"]
    },
    {
      id: "logging",
      name: "Logging",
      isDetailed: false,
      description: "Structured cryptographic audit records log streams capturing all mesh event traces."
    },
    {
      id: "testing",
      name: "Testing",
      isDetailed: false,
      description: "Continuous contract verifications, mock environments, and end-to-end integration test harnesses."
    }
  ] as BlueprintSubsystem[],

  roadmap: [
    { phase: 1, name: "Runtime stabilization", status: "completed", timeline: "Sprint 1-2" },
    { phase: 2, name: "Brain Integration", status: "completed", timeline: "Sprint 3" },
    { phase: 3, name: "Planner Core", status: "in-progress", timeline: "Sprint 4" },
    { phase: 4, name: "Memory Engine", status: "planned", timeline: "Sprint 5" },
    { phase: 5, name: "Tools & Sandbox", status: "planned", timeline: "Sprint 6" },
    { phase: 6, name: "Voice Interface", status: "planned", timeline: "Sprint 7" },
    { phase: 7, name: "Vision Pipeline", status: "planned", timeline: "Sprint 8" },
    { phase: 8, name: "Desktop Portal", status: "planned", timeline: "Sprint 9" },
    { phase: 9, name: "Plugin SDK Engine", status: "planned", timeline: "Sprint 10" },
    { phase: 10, name: "System Automation", status: "planned", timeline: "Sprint 11" },
    { phase: 11, name: "Verification & Tests", status: "planned", timeline: "Sprint 12" },
    { phase: 12, name: "Release Candidates", status: "planned", timeline: "Final Candidate" }
  ] as RoadmapPhase[],

  codingStandards: [
    {
      title: "Strict Modularity",
      description: "Independent execution contexts communicating solely via message brokers. Direct calls across boundaries are strictly prohibited."
    },
    {
      title: "SOLID Principles",
      description: "All interfaces must have single responsibilities, follow open/closed extensions, and use explicit dependency injection patterns."
    },
    {
      title: "Comprehensive Tests",
      description: "Every feature require high-coverage unit tests verifying boundary failures and normal lifecycle flows before merging."
    },
    {
      title: "Documentation with Every Feature",
      description: "No code changes without inline, API, and architectural documentation updates. Stale docs are considered compile errors."
    },
    {
      title: "No Placeholder Implementations",
      description: "No stubbed methods, hardcoded mocks in production paths, or temporary 'TODO' hacks. Code must be complete."
    },
    {
      title: "Repository Always Buildable",
      description: "Automated checks run linting and compilation steps on every commit. Unbuildable code automatically blocks delivery."
    }
  ] as CodingStandard[]
};
