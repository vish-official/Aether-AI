import React, { useState } from 'react';
import { SPEC_DOCUMENTS, GLOSSARY } from './data/specs';
import { SpecDocument } from './types';
import SpecificationViewer from './components/SpecificationViewer';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import InteractiveSim from './components/InteractiveSim';
import {
  Shield,
  Database,
  Network,
  Brain,
  Cpu,
  BookOpen,
  Terminal,
  Search,
  Layers,
  Globe,
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
  ExternalLink,
  Lock,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SidebarOption = 'philosophy' | 'glossary' | 'identity' | 'memory' | 'mesh' | 'runtime' | 'mind' | 'guard' | 'simulation' | 'tools';

export default function App() {
  const [selectedOption, setSelectedOption] = useState<SidebarOption>('philosophy');
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [subsystemTab, setSubsystemTab] = useState<'spec' | 'diagram'>('spec');

  const selectedSpec = SPEC_DOCUMENTS.find(doc => doc.id === selectedOption);

  const filteredGlossary = GLOSSARY.filter(item => 
    item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    item.definition.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    item.subsystem.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const getSubsystemIcon = (id: string, size = "w-4.5 h-4.5") => {
    switch (id) {
      case 'identity': return <Shield className={`${size} text-emerald-400`} />;
      case 'memory': return <Database className={`${size} text-sky-400`} />;
      case 'mesh': return <Network className={`${size} text-amber-400`} />;
      case 'runtime': return <Layers className={`${size} text-slate-400`} />;
      case 'mind': return <Brain className={`${size} text-purple-400`} />;
      case 'guard': return <Lock className={`${size} text-rose-400`} />;
      case 'tools': return <Wrench className={`${size} text-indigo-400`} />;
      default: return <Cpu className={`${size} text-indigo-400`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E0E0E6] flex flex-col font-sans selection:bg-indigo-600/30 selection:text-indigo-200" id="aether-root-container">
      
      {/* Primary Systems Command Header */}
      <header className="border-b border-white/5 bg-[#0F0F12]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="portal-header">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <span className="font-mono text-xl font-bold tracking-tighter text-white">Æ</span>
            <div className="absolute inset-0.5 rounded-[10px] border border-white/10"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-sans">AETHER</h1>
              <span className="bg-indigo-950/80 text-indigo-400 border border-indigo-900/50 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold">
                PHASE 0: SPEC
              </span>
            </div>
            <p className="text-xs text-white/50 font-sans mt-0.5">Sovereign Artificial Intelligence Operating System Specification Portal</p>
          </div>
        </div>

        {/* Global Architecture Metrics */}
        <div className="flex flex-wrap items-center gap-5 text-[11px] font-mono text-white/50 bg-[#15151A] border border-white/5 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span>MODEL-AGNOSTIC STATUS: <strong className="text-white font-medium">TRUE</strong></span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>INTERFACES REGISTERED: <strong className="text-white font-medium">12</strong></span>
          </div>
          <div className="hidden md:block h-4 w-px bg-white/10"></div>
          <div className="hidden md:flex items-center gap-1.5">
            <span>OFFLINE ENCLAVE MESH: <strong className="text-emerald-400 font-medium">READY</strong></span>
          </div>
        </div>
      </header>

      {/* Main Structural Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" id="portal-body">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-72 border-r border-white/5 bg-[#0F0F12]/50 p-5 flex flex-col justify-between shrink-0 gap-6" id="portal-sidebar">
          <div className="space-y-6">
            
            {/* System Overview Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-widest pl-2">
                Core System Specs
              </h3>
              <div className="space-y-1">
                <button
                  id="nav-philosophy"
                  onClick={() => setSelectedOption('philosophy')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    selectedOption === 'philosophy'
                      ? 'bg-[#15151A] text-white font-medium shadow-sm border-l-2 border-indigo-500'
                      : 'text-white/50 hover:text-white/80 hover:bg-[#15151A]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>System Philosophy</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
                <button
                  id="nav-glossary"
                  onClick={() => setSelectedOption('glossary')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    selectedOption === 'glossary'
                      ? 'bg-[#15151A] text-white font-medium shadow-sm border-l-2 border-indigo-500'
                      : 'text-white/50 hover:text-[#E0E0E6] hover:bg-[#15151A]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>System Glossary</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              </div>
            </div>

            {/* Foundational Subsystems Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-widest pl-2">
                Core Subsystems
              </h3>
              <div className="space-y-1">
                {SPEC_DOCUMENTS.map((doc) => (
                  <button
                    key={doc.id}
                    id={`nav-subsystem-${doc.id}`}
                    onClick={() => {
                      setSelectedOption(doc.id as SidebarOption);
                      setSubsystemTab('spec');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                      selectedOption === doc.id
                        ? 'bg-[#15151A] text-white font-medium shadow-sm border-l-2 border-indigo-500'
                        : 'text-white/50 hover:text-white/80 hover:bg-[#15151A]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {getSubsystemIcon(doc.id)}
                      <span>{doc.title}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-widest pl-2">
                Validation & Integrity
              </h3>
              <div className="space-y-1">
                <button
                  id="nav-simulation"
                  onClick={() => setSelectedOption('simulation')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    selectedOption === 'simulation'
                      ? 'bg-[#15151A] text-white font-medium shadow-sm border-l-2 border-indigo-500'
                      : 'text-white/50 hover:text-white/80 hover:bg-[#15151A]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span>Design Verification Env</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar Footer Credit */}
          <div className="border-t border-white/5 pt-4 mt-4 text-[11px] font-mono text-white/30 space-y-1">
            <div>CHIEF ARCHITECT CONSOLE</div>
            <div>STATUS: <span className="text-emerald-500 font-semibold animate-pulse">VERIFIED</span></div>
          </div>
        </aside>

        {/* Primary Viewport Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0C] p-6 space-y-6" id="portal-main-viewport">
          
          <AnimatePresence mode="wait">
            
            {/* 1. Philosophy View */}
            {selectedOption === 'philosophy' && (
              <motion.div
                key="philosophy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                id="view-philosophy"
              >
                {/* Introduction Hero Section */}
                <div className="relative rounded-2xl border border-white/5 bg-gradient-to-r from-[#15151A] to-indigo-950/10 p-6 md:p-8 overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="max-w-3xl space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>THE PLATFORM ARCHITECTURE VISION</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
                      Aether: The Private Artificial Intelligence Operating System
                    </h2>
                    <p className="text-sm text-white/70 leading-relaxed font-sans">
                      Aether is not a chat interface, nor is it a simple runtime tool integration wrapper. Aether is a <strong>sovereign AI Operating System</strong>. It maps a single consolidated identity, consistent long-term memory structures, and local cognitive planning loops across any physical device platform—Windows, macOS, Linux, Android, Web Assembly, or robotics frameworks—without locking its foundational capabilities to transient AI APIs or private technology providers.
                    </p>
                  </div>
                </div>

                {/* Grid of Engineering Principles */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="bg-[#15151A]/60 rounded-xl border border-white/5 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-white/90 text-xs font-mono uppercase text-indigo-400">
                      <Shield className="w-4.5 h-4.5" />
                      One AI Identity
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      Your identity, personal profile keys, and verified credential structures belong solely to you, protected by hardware-secured enclaves rather than third-party login providers.
                    </p>
                  </div>

                  <div className="bg-[#15151A]/60 rounded-xl border border-white/5 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-white/90 text-xs font-mono uppercase text-indigo-400">
                      <Database className="w-4.5 h-4.5" />
                      Offline First, Cloud Optional
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      All structured databases, semantic memory shards, and active context retrieval execute on local NVMe clusters. Cloud engines are used strictly as opt-in secure pipelines.
                    </p>
                  </div>

                  <div className="bg-[#15151A]/60 rounded-xl border border-white/5 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-white/90 text-xs font-mono uppercase text-indigo-400">
                      <Network className="w-4.5 h-4.5" />
                      Event Driven Architecture
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      Communication occurs over a low-latency Event Mesh. Every system call and module notification is serialized via protocol buffers to prevent synchronous blocking bottlenecks.
                    </p>
                  </div>

                  <div className="bg-[#15151A]/60 rounded-xl border border-white/5 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-white/90 text-xs font-mono uppercase text-indigo-400">
                      <Layers className="w-4.5 h-4.5" />
                      Platform Independence
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      Aether OS isolates system capability mappings (File I/O, process compilation, sockets) into standard driver models, allowing identical apps to execute on Mobile, PC, or Wearables.
                    </p>
                  </div>

                  <div className="bg-[#15151A]/60 rounded-xl border border-white/5 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-white/90 text-xs font-mono uppercase text-indigo-400">
                      <Lock className="w-4.5 h-4.5" />
                      Zero ambient Authority
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      Third-party scripts do not inherit operating system control. They run inside isolated WebAssembly/Subprocess sandboxes and must explicitly supply valid Capability Tokens.
                    </p>
                  </div>

                  <div className="bg-[#15151A]/60 rounded-xl border border-white/5 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-white/90 text-xs font-mono uppercase text-indigo-400">
                      <Brain className="w-4.5 h-4.5" />
                      Cognitive Plan Routing
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      The active operating agent acts through explicit self-healing planning templates. The cognitive model can swap dynamically from local SLMs to deep-reasoning remote services.
                    </p>
                  </div>
                </div>

                {/* Vendor Independence Statement */}
                <div className="bg-[#15151A] border border-white/5 rounded-xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs font-mono uppercase">
                    <Info className="w-4 h-4 text-indigo-400" />
                    Vendor Independence Specification
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    Aether mandates strict technology abstraction. The system core never locks itself into SQLite, PostgreSQL, OpenAI, Gemini, or any particular host provider. All components communicate strictly across defined interfaces (such as <code className="text-indigo-300 font-mono">IMemoryStore</code> or <code className="text-indigo-300 font-mono">IEventMesh</code>). This ensures absolute future-proofing, enabling engineers to seamlessly swap out local vector models, physical storage backends, or execution runtimes without rewriting a single module of business logic.
                  </p>
                </div>

                {/* High-Level Overall System Topology Diagrams */}
                <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Global Logical Topology</h3>
                    <p className="text-xs text-white/40 mt-1 font-sans">The conceptual integration mapping of Aether components across hardware, sandboxes, and the decentralized peer Event Mesh.</p>
                  </div>
                  
                  <div className="bg-[#0F0F12] border border-white/5 rounded-lg p-5 font-mono text-[11px] leading-normal text-indigo-300/90 overflow-x-auto whitespace-pre">
                    {`
+---------------------------------------------------------------------------------+
|                                AETHER CORE KERNEL                               |
|   +-------------------------------------------------------------------------+   |
|   |         AetherIdentity (SOVEREIGN DECIDED DID & SECURE TPM KEY)        |   |
|   +-------------------------------------------------------------------------+   |
|   |         AetherGuard (ZERO-TRUST CRYPTOGRAPHIC CAPABILITY ROUTING)         |   |
|   +-------------------------------------------------------------------------+   |
+---------------------------------------|-----------------------------------------+
                                        |  [Event Mesh Protocol]
                                        v
+---------------------------------------------------------------------------------+
|                   AetherMesh (LOCAL-FIRST DISTRIBUTED EVENT BUS)                |
|             Maps RPC calls, system notifications, and synchronous data          |
+---------------------------------------|-----------------------------------------+
                    /                   |                    \\
                   v                    v                     v
+-----------------------+   +-----------------------+   +-----------------------+
|     AetherMemory      |   |     AetherRuntime     |   |      AetherMind       |
|  Three-tier memory    |   |  Low-Integrity OS     |   |  Autonomous Planner   |
|  L1 Volatile RAM      |   |  WASM Subprocesses    |   |  Local SLM routing    |
|  L2 local key-val     |   |  Virtualized File I/O |   |  Tool-broker registry |
|  L3 Semantic Vector   |   |  Native system calls  |   |  Deep LLM proxies     |
+-----------------------+   +-----------------------+   +-----------------------+
                    `}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Glossary View */}
            {selectedOption === 'glossary' && (
              <motion.div
                key="glossary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
                id="view-glossary"
              >
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-white font-sans">Core Architectural Glossary</h2>
                  <p className="text-xs text-white/40 font-sans">Standardized terminology to maintain perfect engineering alignment across Aether development teams.</p>
                </div>

                {/* Search Input bar */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search terms, subsystems, or definitions..."
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    className="w-full bg-[#15151A] border border-white/10 text-xs rounded-lg pl-9 pr-4 py-2.5 text-[#E0E0E6] placeholder-white/30 focus:outline-none focus:border-indigo-500/80 transition-colors font-sans"
                    id="glossary-search"
                  />
                </div>

                {/* Glossary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGlossary.length > 0 ? (
                    filteredGlossary.map((item, i) => (
                      <div key={i} className="bg-[#15151A]/60 border border-white/5 p-4 rounded-xl space-y-2" id={`glossary-item-${i}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white/90 text-xs font-mono">{item.term}</span>
                          <span className="text-[10px] bg-black/30 text-indigo-400 border border-white/5 px-2 py-0.5 rounded font-mono">
                            {item.subsystem}
                          </span>
                        </div>
                        <p className="text-xs text-[#A0A0AA] leading-relaxed font-sans">{item.definition}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-[#15151A]/20 border border-dashed border-white/5 rounded-xl">
                      <Globe className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <span className="text-xs text-white/40 font-sans">No matching terms identified in the core specifications repository.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. Subsystem Document & Diagram View */}
            {selectedSpec && (
              <motion.div
                key={selectedSpec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                id={`view-subsystem-${selectedSpec.id}`}
              >
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#15151A]/80 border border-white/5 p-5 rounded-2xl">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {getSubsystemIcon(selectedSpec.id, "w-5 h-5")}
                      <h2 className="text-lg font-bold text-white font-sans tracking-tight">{selectedSpec.title}</h2>
                    </div>
                    <p className="text-xs text-white/40 font-sans">{selectedSpec.subtitle}</p>
                  </div>

                  {/* Tab selectors within Subsystem */}
                  <div className="flex gap-1 bg-[#0F0F12] p-1.5 rounded-lg border border-white/5 self-start md:self-auto">
                    <button
                      id="subsystem-tab-spec"
                      onClick={() => setSubsystemTab('spec')}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-mono font-medium transition-all ${
                        subsystemTab === 'spec'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      Specifications
                    </button>
                    <button
                      id="subsystem-tab-diagram"
                      onClick={() => setSubsystemTab('diagram')}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-mono font-medium transition-all ${
                        subsystemTab === 'diagram'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      Interactive Schema
                    </button>
                  </div>
                </div>

                {/* Subsystem Render Switcher */}
                {subsystemTab === 'spec' ? (
                  <SpecificationViewer doc={selectedSpec} />
                ) : (
                  <div className="space-y-4" id={`diagram-tab-${selectedSpec.id}`}>
                    <div className="bg-[#15151A]/60 border border-white/5 p-4 rounded-xl">
                      <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">
                        Physical Topology Schematic
                      </h3>
                      <p className="text-xs text-white/40 leading-normal font-sans">
                        Shows the directional and bi-directional communications linking the internal components of {selectedSpec.title} to security loggers, event brokers, and memory storages. Hover nodes to view component details.
                      </p>
                    </div>
                    <ArchitectureDiagram data={selectedSpec.architecture.diagram} />
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. Interactive Simulation View */}
            {selectedOption === 'simulation' && (
              <motion.div
                key="simulation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
                id="view-simulation"
              >
                <div className="bg-[#15151A]/80 border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-lg font-bold text-white font-sans tracking-tight">Systems Design Verification</h2>
                    </div>
                    <p className="text-xs text-white/40 font-sans">Trigger system operations to verify model invariants, secure isolation bounds, and packet flow logic across Aether.</p>
                  </div>
                  <div className="bg-indigo-950/60 text-indigo-300 border border-indigo-900/40 px-3 py-1 rounded text-[11px] font-mono select-none self-start md:self-auto">
                    AetherDVE v1.0
                  </div>
                </div>

                <InteractiveSim />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Global Terminal / Status Bar */}
      <footer className="border-t border-white/5 bg-[#0F0F12] px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-white/30" id="portal-footer">
        <div>
          © 2026 Aether Core Architecture Team. NASA Engineering Standard Compliant.
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#E0E0E6] transition-colors">
            <span>Repository API Blueprint</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-white/10">|</span>
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Design Phase: 0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
