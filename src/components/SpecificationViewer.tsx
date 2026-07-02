import React, { useState } from 'react';
import { SpecDocument, InterfaceDefinition } from '../types';
import { Copy, Check, FileText, Code, AlertTriangle, Lightbulb, Lock, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface SpecificationViewerProps {
  doc: SpecDocument;
}

export default function SpecificationViewer({ doc }: SpecificationViewerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'interfaces'>('details');
  const [copiedInterface, setCopiedInterface] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInterface(id);
    setTimeout(() => setCopiedInterface(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6" id={`spec-viewer-${doc.id}`}>
      {/* Tab Switcher & Quick Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex gap-2">
          <button
            id="spec-tab-details"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'details'
                ? 'bg-[#15151A] text-indigo-400 border border-white/5 shadow-sm'
                : 'text-white/50 hover:text-white/80 border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            Core Specifications
          </button>
          <button
            id="spec-tab-interfaces"
            onClick={() => setActiveTab('interfaces')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'interfaces'
                ? 'bg-[#15151A] text-indigo-400 border border-white/5 shadow-sm'
                : 'text-white/50 hover:text-white/80 border border-transparent'
            }`}
          >
            <Code className="w-4 h-4" />
            API & Protocol Interfaces
            <span className="bg-indigo-950/60 text-indigo-300 px-1.5 py-0.2 text-[9px] rounded font-mono border border-indigo-900/40 ml-1">
              {doc.interfaces.length}
            </span>
          </button>
        </div>

        {/* Dynamic Architectural Quality Score or Integrity State */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO Spec Compliant</span>
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="text-white/50">
            Phase: <span className="text-white/80">0 (Specification)</span>
          </div>
        </div>
      </div>

      {activeTab === 'details' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Document flow - Left Columns */}
          <div className="xl:col-span-2 space-y-6">
            {/* 1 & 2. Purpose & Overview */}
            <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5 space-y-4">
              <div>
                <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">01. PURPOSE</h3>
                <p className="text-sm text-[#E0E0E6] font-sans leading-relaxed">{doc.purpose}</p>
              </div>
              <div className="border-t border-white/5 pt-4">
                <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">02. OVERVIEW</h3>
                <p className="text-sm text-white/70 font-sans leading-relaxed">{doc.overview}</p>
              </div>
            </div>

            {/* 3. Responsibilities */}
            <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">03. SYSTEM RESPONSIBILITIES</h3>
              <ul className="space-y-2.5">
                {doc.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/70 font-sans leading-relaxed" id={`resp-item-${i}`}>
                    <span className="text-indigo-400 font-mono mt-0.5 select-none">{String(i + 1).padStart(2, '0')}.</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Internal Workflow */}
            <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-4">06. INTERNAL WORKFLOWS</h3>
              <div className="relative pl-6 border-l border-white/5 space-y-6">
                {doc.internalWorkflow.map((step, i) => (
                  <div key={i} className="relative" id={`workflow-step-${i}`}>
                    {/* Visual Indicator Bullet */}
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-black border border-indigo-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    </div>
                    <h4 className="text-xs font-semibold text-indigo-300 font-mono mb-1">STAGE {i + 1}</h4>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Failure Cases */}
            <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-4">08. EXCEPTION & FAILURE ANALYSIS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doc.failureCases.map((f, i) => (
                  <div key={i} className="bg-[#15151A]/80 rounded-lg border border-red-950/20 p-4 space-y-3 flex flex-col justify-between" id={`failure-case-${i}`}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-rose-400 font-sans font-medium text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Scenario {i + 1}: {f.scenario}</span>
                      </div>
                      <p className="text-[11px] text-white/50 font-sans leading-relaxed">
                        <span className="text-white/70 font-mono uppercase text-[9px] block">Potential Impact:</span>
                        {f.impact}
                      </p>
                    </div>
                    <div className="bg-emerald-950/15 border border-emerald-900/20 rounded p-2 text-[11px] text-emerald-400/90 leading-relaxed font-sans">
                      <span className="text-emerald-500 font-mono uppercase text-[9px] block font-medium">Mitigation Standard:</span>
                      {f.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panels - Dependencies, Security, Scalability, Alternatives */}
          <div className="space-y-6">
            {/* 7. Dependencies */}
            <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">07. STACK DEPENDENCIES</h3>
              <div className="space-y-2">
                {doc.dependencies.map((dep, i) => (
                  <div key={i} className="flex items-center gap-2 bg-black/30 border border-white/5 px-3 py-2 rounded text-xs text-white/70 font-mono" id={`dep-${i}`}>
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">{dep}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. Security */}
            <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5 space-y-3">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                09. SECURITY BOUNDARIES
              </h3>
              <div className="space-y-2.5">
                {doc.security.map((sec, i) => (
                  <p key={i} className="text-xs text-white/70 font-sans leading-relaxed border-l-2 border-emerald-600 pl-3 py-0.5" id={`sec-${i}`}>
                    {sec}
                  </p>
                ))}
              </div>
            </div>

            {/* 10. Scalability */}
            <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5 space-y-3">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-400" />
                10. PERFORMANCE & SCALABILITY
              </h3>
              <div className="space-y-2.5">
                {doc.scalability.map((scale, i) => (
                  <p key={i} className="text-xs text-white/70 font-sans leading-relaxed border-l-2 border-sky-600 pl-3 py-0.5" id={`scale-${i}`}>
                    {scale}
                  </p>
                ))}
              </div>
            </div>

            {/* 11. Future Expansion */}
            <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5 space-y-3">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                11. LONGEVITY & EXPANSION
              </h3>
              <div className="space-y-2.5">
                {doc.futureExpansion.map((ext, i) => (
                  <p key={i} className="text-xs text-white/70 font-sans leading-relaxed border-l-2 border-amber-500 pl-3 py-0.5" id={`ext-${i}`}>
                    {ext}
                  </p>
                ))}
              </div>
            </div>

            {/* 12. Decision Summary */}
            <div className="bg-[#15151A]/40 rounded-xl border border-white/5 p-5 space-y-3.5">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">12. DECISION ANALYSIS</h3>
              
              <div className="space-y-2">
                <div className="text-[10px] text-white/30 font-mono uppercase tracking-wide">Alternatives Evaluated:</div>
                <div className="flex flex-wrap gap-1.5">
                  {doc.decisionSummary.alternatives.map((alt, i) => (
                    <span key={i} className="bg-black/30 text-white/50 border border-white/5 text-[10px] px-2 py-0.5 rounded font-sans" id={`alt-${i}`}>
                      {alt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-950/10 border border-indigo-900/20 rounded-lg p-3 space-y-1.5">
                <div className="text-[10px] text-indigo-300 font-mono uppercase tracking-wide">Selected Standard:</div>
                <div className="text-xs font-semibold text-white/90 font-sans">{doc.decisionSummary.selected}</div>
                <p className="text-[11px] text-white/50 leading-relaxed font-sans">{doc.decisionSummary.justification}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Interfaces View */
        <div className="space-y-6">
          {doc.interfaces.map((inf, i) => (
            <div key={i} className="bg-[#15151A]/60 rounded-xl border border-white/5 p-5 space-y-3" id={`interface-${i}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white/90 font-mono">{inf.name}</h4>
                  <p className="text-xs text-white/50 mt-1">{inf.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-black/30 text-white/50 font-mono px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">
                    {inf.type}
                  </span>
                  <button
                    onClick={() => copyToClipboard(inf.code, `${doc.id}-${i}`)}
                    className="p-1.5 rounded-md hover:bg-white/5 text-white/50 hover:text-white/80 transition-colors"
                    title="Copy declaration"
                    id={`copy-btn-${doc.id}-${i}`}
                  >
                    {copiedInterface === `${doc.id}-${i}` ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="relative rounded-lg overflow-hidden bg-black/40 border border-white/5 text-xs font-mono leading-relaxed max-h-[380px] overflow-y-auto">
                <pre className="p-4 overflow-x-auto text-indigo-300">
                  <code>{inf.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
