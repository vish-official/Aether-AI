import React, { useState } from 'react';
import { ArchitectureDiagramData, DiagramNode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Database, Cpu, HelpCircle, Network, Brain, Laptop } from 'lucide-react';

interface ArchitectureDiagramProps {
  data: ArchitectureDiagramData;
}

export default function ArchitectureDiagram({ data }: ArchitectureDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<DiagramNode | null>(null);
  const [activeNode, setActiveNode] = useState<DiagramNode | null>(null);

  // Position mapping to place nodes in an elegant grid based on index/type
  const getNodePosition = (nodeId: string, index: number, total: number) => {
    // Elegant radial or layered layout
    const radiusX = 260;
    const radiusY = 140;
    const centerX = 360;
    const centerY = 200;

    if (total <= 1) return { x: centerX, y: centerY };

    // Custom hand-tuned layouts for key subsystems to make diagrams highly readable and logical
    if (nodeId === 'root-key') return { x: centerX, y: 70 };
    if (nodeId === 'local-runtime') return { x: centerX - 180, y: 190 };
    if (nodeId === 'presence-router') return { x: centerX + 180, y: 190 };
    if (nodeId === 'cloud-sync-vault') return { x: centerX, y: 310 };

    if (nodeId === 'mem-controller') return { x: centerX, y: 70 };
    if (nodeId === 'l1-cache') return { x: centerX - 200, y: 220 };
    if (nodeId === 'l2-store') return { x: centerX, y: 230 };
    if (nodeId === 'l3-vector') return { x: centerX + 200, y: 220 };

    if (nodeId === 'mesh-broker') return { x: centerX, y: 180 };
    if (nodeId === 'local-app') return { x: centerX - 200, y: 90 };
    if (nodeId === 'p2p-mesh') return { x: centerX + 200, y: 270 };
    if (nodeId === 'audit-engine') return { x: centerX - 200, y: 270 };

    if (nodeId === 'platform-bridge') return { x: centerX, y: 70 };
    if (nodeId === 'sandbox-manager') return { x: centerX + 180, y: 190 };
    if (nodeId === 'hardware-driver') return { x: centerX - 180, y: 190 };
    if (nodeId === 'wasmer-node') return { x: centerX + 180, y: 310 };

    if (nodeId === 'mind-core') return { x: centerX, y: 70 };
    if (nodeId === 'local-slm') return { x: centerX - 200, y: 210 };
    if (nodeId === 'remote-llm') return { x: centerX, y: 310 };
    if (nodeId === 'tool-broker') return { x: centerX + 200, y: 210 };

    if (nodeId === 'evaluator') return { x: centerX, y: 70 };
    if (nodeId === 'policy-store') return { x: centerX - 200, y: 210 };
    if (nodeId === 'audit-log') return { x: centerX, y: 290 };
    if (nodeId === 'prompt-engine') return { x: centerX + 200, y: 210 };

    // Default layered layout if nodes change
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * radiusX * 0.8,
      y: centerY + Math.sin(angle) * radiusY * 0.9,
    };
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="w-5 h-5 text-emerald-400" id="icon-security" />;
      case 'storage':
        return <Database className="w-5 h-5 text-sky-400" id="icon-storage" />;
      case 'kernel':
        return <Cpu className="w-5 h-5 text-indigo-400" id="icon-kernel" />;
      case 'bus':
        return <Network className="w-5 h-5 text-amber-400" id="icon-bus" />;
      case 'intelligence':
        return <Brain className="w-5 h-5 text-purple-400" id="icon-intelligence" />;
      case 'cloud':
        return <Cpu className="w-5 h-5 text-rose-400" id="icon-cloud" />;
      case 'client':
      default:
        return <Laptop className="w-5 h-5 text-white/50" id="icon-client" />;
    }
  };

  const getNodeColorClass = (type: string, isActive: boolean) => {
    if (isActive) {
      switch (type) {
        case 'security': return 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
        case 'storage': return 'border-sky-500 bg-sky-950/40 shadow-[0_0_15px_rgba(14,165,233,0.3)]';
        case 'kernel': return 'border-indigo-500 bg-indigo-950/40 shadow-[0_0_15px_rgba(99,102,241,0.3)]';
        case 'bus': return 'border-amber-500 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
        case 'intelligence': return 'border-purple-500 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
        case 'cloud': return 'border-rose-500 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
        default: return 'border-white/20 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]';
      }
    }

    switch (type) {
      case 'security': return 'border-emerald-800 bg-emerald-950/10 hover:border-emerald-600 hover:bg-emerald-950/20';
      case 'storage': return 'border-sky-800 bg-sky-950/10 hover:border-sky-600 hover:bg-sky-950/20';
      case 'kernel': return 'border-indigo-800 bg-indigo-950/10 hover:border-indigo-600 hover:bg-indigo-950/20';
      case 'bus': return 'border-amber-800 bg-amber-950/10 hover:border-amber-600 hover:bg-amber-950/20';
      case 'intelligence': return 'border-purple-800 bg-purple-950/10 hover:border-purple-600 hover:bg-purple-950/20';
      case 'cloud': return 'border-rose-900 bg-rose-950/10 hover:border-rose-700 hover:bg-rose-950/20';
      default: return 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10';
    }
  };

  const nodePositions = data.nodes.reduce((acc, node, index) => {
    acc[node.id] = getNodePosition(node.id, index, data.nodes.length);
    return acc;
  }, {} as Record<string, { x: number; y: number }>);

  const displayNode = activeNode || hoveredNode;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full" id="architecture-diagram-container">
      {/* SVG Canvas Workspace */}
      <div className="flex-1 bg-[#15151A]/40 rounded-xl border border-white/5 p-4 relative overflow-hidden flex items-center justify-center min-h-[440px] shadow-inner">
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#15151A] px-2.5 py-1 rounded-md border border-white/5 text-xs text-white/50 font-mono">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
          <span>SYSTEM SCHEMATIC WORKSPACE</span>
        </div>

        <svg className="w-full max-w-[720px] h-[380px]" viewBox="0 0 720 380">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(255,255,255,0.2)" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
          </defs>

          {/* Render Connections/Edges */}
          {data.edges.map((edge, i) => {
            const start = nodePositions[edge.from];
            const end = nodePositions[edge.to];
            if (!start || !end) return null;

            const isRelated =
              displayNode?.id === edge.from || displayNode?.id === edge.to;

            return (
              <g key={`edge-${i}`} id={`edge-group-${i}`}>
                {/* Visual Connector Line */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={isRelated ? '#6366f1' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={isRelated ? 2 : 1.5}
                  markerEnd={isRelated ? 'url(#arrow-active)' : 'url(#arrow)'}
                  className="transition-all duration-300"
                />

                {/* Animated Pulsing Data Packet */}
                <circle r="4" fill={isRelated ? '#a5b4fc' : '#4f46e5'} className="filter drop-shadow-[0_0_4px_#4f46e5]">
                  <animateMotion
                    dur="3.5s"
                    repeatCount="indefinite"
                    path={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                  />
                </circle>

                {/* Optional Connection Label on hover */}
                {isRelated && (
                  <foreignObject
                    x={(start.x + end.x) / 2 - 80}
                    y={(start.y + end.y) / 2 - 10}
                    width="160"
                    height="24"
                  >
                    <div className="text-[10px] bg-[#15151A]/90 text-indigo-300 font-mono text-center rounded border border-indigo-950/40 px-1 py-0.5 truncate shadow-sm backdrop-blur-sm">
                      {edge.label}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* Render Component Nodes */}
          {data.nodes.map((node, i) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isHovered = hoveredNode?.id === node.id;
            const isActive = activeNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x - 70}, ${pos.y - 30})`}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setActiveNode(isActive ? null : node)}
                className="cursor-pointer"
                id={`node-group-${node.id}`}
              >
                {/* Node Box */}
                <foreignObject width="140" height="60">
                  <div
                    className={`w-full h-full border rounded-lg p-2.5 flex flex-col justify-between transition-all duration-300 ${getNodeColorClass(
                      node.type,
                      isActive || isHovered
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      {getIcon(node.type)}
                      <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                        {node.type}
                      </span>
                    </div>
                    <div className="text-[11px] font-sans font-medium text-[#E0E0E6] tracking-tight leading-tight truncate">
                      {node.label}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Inspector Panel */}
      <div className="w-full lg:w-80 flex flex-col justify-between bg-[#15151A]/40 rounded-xl border border-white/5 p-5 font-sans relative" id="inspector-panel">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-mono font-medium tracking-wider text-indigo-400 uppercase">
              Component Inspector
            </h3>
            {displayNode && (
              <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-900">
                ACTIVE
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {displayNode ? (
              <motion.div
                key={displayNode.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white/90">
                    {displayNode.label}
                  </h4>
                  <p className="text-[10px] font-mono text-white/50 uppercase tracking-wide mt-1">
                    Class: {displayNode.type} Subsystem
                  </p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-white/70 text-xs leading-relaxed font-sans">
                  {displayNode.description}
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/30 p-2.5 rounded-lg">
                  <div className="text-[10px] text-indigo-300 font-mono uppercase tracking-wider mb-1">
                    Mesh Interactions
                  </div>
                  <div className="text-[11px] text-white/50 leading-normal font-sans">
                    Communicates with adjacent layers through signed, protobuf-encoded micro-events across the localized Event Loop.
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <HelpCircle className="w-8 h-8 text-white/20 mb-2 stroke-[1.5]" />
                <p className="text-xs text-white/50 font-sans max-w-[200px]">
                  Hover or click any node in the system schema to inspect its operational characteristics, local data bounds, and dependency connections.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-white/5 pt-4 mt-6">
          <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest leading-normal">
            AETHER SCHEMATIC V0.1
          </div>
          <div className="text-[11px] text-white/50 mt-1 leading-normal font-sans">
            Designed to guarantee complete decoupling. Nodes are interchangeable and expose standardized API abstractions.
          </div>
        </div>
      </div>
    </div>
  );
}
