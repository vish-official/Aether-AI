import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Cpu,
  Globe,
  Network,
  Shield,
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  FileText,
  Info,
  ChevronRight,
  ShieldAlert,
  Code,
  FileCheck,
  Calendar,
  Lock,
  MessageSquare,
  Volume2,
  Eye,
  Sliders,
  Terminal,
  Activity
} from 'lucide-react';
import { BLUEPRINT_DATA, BlueprintSubsystem, RoadmapPhase, CodingStandard } from '../data/blueprintData';

export default function MasterBlueprint() {
  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subsystems' | 'roadmap' | 'standards'>('overview');

  const getIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Layers': return <Layers className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'Network': return <Network className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Wrench': return <Wrench className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      default: return <Info className={className} />;
    }
  };

  const getSubsystemIcon = (id: string, className = "w-5 h-5 text-indigo-400") => {
    switch (id) {
      case 'runtime': return <Layers className={`${className} text-slate-400`} />;
      case 'brain': return <Cpu className={`${className} text-purple-400`} />;
      case 'planner': return <Activity className={`${className} text-pink-400`} />;
      case 'memory': return <Network className={`${className} text-sky-400`} />;
      case 'tools': return <Wrench className={`${className} text-indigo-400`} />;
      case 'voice': return <Volume2 className={`${className} text-cyan-400`} />;
      case 'vision': return <Eye className={`${className} text-teal-400`} />;
      case 'automation': return <Terminal className={`${className} text-emerald-400`} />;
      case 'plugin': return <Code className={`${className} text-orange-400`} />;
      case 'desktop': return <Sliders className={`${className} text-amber-400`} />;
      case 'mobile': return <Globe className={`${className} text-rose-400`} />;
      case 'configuration': return <FileText className={`${className} text-blue-400`} />;
      case 'security': return <Lock className={`${className} text-red-400`} />;
      case 'logging': return <MessageSquare className={`${className} text-yellow-400`} />;
      case 'testing': return <FileCheck className={`${className} text-green-400`} />;
      default: return <Info className={className} />;
    }
  };

  return (
    <div className="flex flex-col gap-6" id="master-blueprint-viewport">
      
      {/* Blueprint Sub-Header Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex gap-2">
          {([
            { id: 'overview', label: 'Blueprint Overview', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'subsystems', label: '15 Major Subsystems', icon: <Layers className="w-4 h-4" /> },
            { id: 'roadmap', label: 'Development Roadmap', icon: <Calendar className="w-4 h-4" /> },
            { id: 'standards', label: 'Coding Standards', icon: <FileCheck className="w-4 h-4" /> }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              id={`blueprint-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#15151A] text-indigo-400 border border-white/5 shadow-sm'
                  : 'text-white/50 hover:text-white/80 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Attestation Code */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Blueprint v{BLUEPRINT_DATA.version}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: OVERVIEW & PURPOSE */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Purpose Hero */}
            <div className="relative rounded-2xl border border-white/5 bg-gradient-to-r from-[#15151A] to-indigo-950/15 p-6 md:p-8 overflow-hidden shadow-2xl">
              <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>AETHER MASTER VISION</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
                  The Sovereign AI Operating System Framework
                </h2>
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  {BLUEPRINT_DATA.purpose}
                </p>
              </div>
            </div>

            {/* Core Principles Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest pl-1">Core Principles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {BLUEPRINT_DATA.principles.map((p, idx) => (
                  <motion.div
                    whileHover={{ y: -3, scale: 1.01 }}
                    key={idx}
                    className="bg-[#15151A]/60 rounded-xl border border-white/5 p-5 space-y-2.5 transition-all hover:bg-[#15151A]/90 hover:border-white/10 hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)]"
                  >
                    <div className="flex items-center gap-2.5 font-semibold text-white/90 text-xs font-mono uppercase text-indigo-400">
                      {getIcon(p.iconName, "w-4.5 h-4.5 text-indigo-400")}
                      {p.title}
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      {p.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Handbook Callout */}
            <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 max-w-2xl">
                <Info className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-white/60 leading-relaxed">
                  This document serves as the high-level master blueprint. The Aether specification portal details technical APIs, protocol buffer descriptors, and lifecycle flow logic across all active components.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('subsystems')}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[11px] px-3.5 py-2 rounded-lg font-medium tracking-tight shadow transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                <span>Explore Subsystems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 2: 15 MAJOR SUBSYSTEMS */}
        {activeTab === 'subsystems' && (
          <motion.div
            key="subsystems"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-sans">Major Architectural Subsystems</h2>
              <p className="text-xs text-white/40 font-sans">Aether is divided into 15 independent, decoupled subsystems coordinating cognitive compute operations. Click highlighted subsystems to view components.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {BLUEPRINT_DATA.subsystems.map((sub) => {
                const isSelected = selectedSubsystem === sub.id;
                
                return (
                  <motion.div
                    layout
                    key={sub.id}
                    onClick={() => sub.isDetailed && setSelectedSubsystem(isSelected ? null : sub.id)}
                    className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                      sub.isDetailed 
                        ? 'cursor-pointer hover:bg-[#15151A]/80 hover:border-white/15' 
                        : 'opacity-75'
                    } ${
                      isSelected 
                        ? 'bg-[#15151A] border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.15)] col-span-1 md:col-span-2 xl:col-span-1' 
                        : 'bg-[#15151A]/40 border-white/5'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {getSubsystemIcon(sub.id)}
                          <span className="font-semibold text-white/90 text-sm tracking-tight">{sub.name}</span>
                        </div>
                        {sub.isDetailed && (
                          <span className="text-[9px] bg-indigo-950/80 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded font-mono uppercase tracking-wider scale-90">
                            Detailed Spec
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed font-sans">
                        {sub.description}
                      </p>

                      <AnimatePresence>
                        {isSelected && sub.components && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-white/5 mt-3 space-y-2 overflow-hidden"
                          >
                            <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Core Components</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {sub.components.map((comp, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-1.5 text-[11px] text-white/50 font-sans">
                                  <div className="w-1 h-1 bg-indigo-500 rounded-full shrink-0"></div>
                                  <span>{comp}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {sub.isDetailed && !isSelected && (
                      <div className="flex items-center justify-end text-[10px] font-mono text-white/30 group mt-4">
                        <span className="group-hover:text-indigo-400 transition-colors">Expand details</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: DEVELOPMENT ROADMAP */}
        {activeTab === 'roadmap' && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-sans">Aether Core Development Roadmap</h2>
              <p className="text-xs text-white/40 font-sans">Twelve developmental phases designed to incrementally stabilize the local-first kernel, semantic indexer, and tool execution boundaries.</p>
            </div>

            {/* Timelines Cards */}
            <div className="relative border-l border-white/5 ml-3 pl-6 space-y-5 py-2">
              {BLUEPRINT_DATA.roadmap.map((phase) => (
                <div key={phase.phase} className="relative group">
                  
                  {/* Phase Node Dot */}
                  <div className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors bg-[#0A0A0C] ${
                    phase.status === 'completed' 
                      ? 'border-emerald-500/80 text-emerald-400' 
                      : phase.status === 'in-progress' 
                      ? 'border-amber-500/80 text-amber-400 animate-pulse' 
                      : 'border-white/10 text-white/30'
                  }`}>
                    {phase.status === 'completed' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                    {phase.status === 'in-progress' && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>}
                  </div>

                  <div className="bg-[#15151A]/40 border border-white/5 hover:border-white/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-indigo-400 font-semibold">PHASE {phase.phase}</span>
                        <span className="font-medium text-white/90 text-sm tracking-tight">{phase.name}</span>
                      </div>
                      <p className="text-xs text-white/40 font-mono">{phase.timeline}</p>
                    </div>

                    <div className="flex items-center">
                      <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded border uppercase tracking-wider ${
                        phase.status === 'completed' 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' 
                          : phase.status === 'in-progress' 
                          ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' 
                          : 'bg-white/2 text-white/30 border-white/5'
                      }`}>
                        {phase.status === 'completed' ? 'Completed' : phase.status === 'in-progress' ? 'Active In Dev' : 'Planned'}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: CODING STANDARDS */}
        {activeTab === 'standards' && (
          <motion.div
            key="standards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-sans">Constitutional Coding Standards</h2>
              <p className="text-xs text-white/40 font-sans">Engineering mandates that govern all Aether contributions, ensuring the repository remains sovereign, safe, and verifiable.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BLUEPRINT_DATA.codingStandards.map((std, idx) => (
                <div key={idx} className="bg-[#15151A]/60 border border-white/5 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white/90 text-xs font-mono uppercase text-indigo-400">{std.title}</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    {std.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Warning regarding placeholders */}
            <div className="bg-rose-950/20 border border-rose-500/10 rounded-xl p-5 flex items-start gap-3.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">Zero Ambient Authority & No Placeholders</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Placeholder stubs or non-functional APIs are structurally banned. Every subsystem must run complete implementations inside its designated sandbox context. Commits violating code modularity or adding placeholder stubs will fail automated checks.
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
