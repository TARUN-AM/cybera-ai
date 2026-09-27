import React, { useState } from 'react';
import { 
  Network, 
  Server, 
  Laptop, 
  Database, 
  Camera, 
  Skull, 
  Lock, 
  CheckCircle2, 
  Flame, 
  HelpCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info,
  Maximize2,
  Minimize2,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Play,
  Pause
} from 'lucide-react';
import { TopologyNode, TopologyEdge, MitreStage } from '../types/cyber';

interface DigitalTwinGraphProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  currentStage: MitreStage;
  onToggleEdgeBlock?: (edgeId: string) => void;
  onToggleNodeQuarantine?: (nodeId: string) => void;
  layoutMode?: 'panoramic' | 'split';
  onToggleLayoutMode?: () => void;
  isPlaying?: boolean;
  currentStep?: number;
  totalSteps?: number;
  onTogglePlay?: () => void;
}

// Generously spaced node center positions in a 1360 x 500 canvas
// Completely solves any compression or cramped feeling with expansive breathing room
const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  'node-ext-01': { x: 110, y: 250 },      // Zone 1: External Internet
  'node-dmz-proxy': { x: 360, y: 120 },   // Zone 2: DMZ Perimeter Gateway
  'node-dmz-web': { x: 360, y: 250 },     // Zone 2: DMZ Web Server
  'node-iot-cam': { x: 360, y: 380 },     // Zone 2: DMZ IoT Camera
  'node-ws-101': { x: 680, y: 145 },      // Zone 3: Corporate LAN - Engineer PC (Pivot)
  'node-ws-102': { x: 890, y: 145 },      // Zone 3: Corporate LAN - Finance PC
  'node-ws-103': { x: 785, y: 365 },      // Zone 3: Corporate LAN - HR Workstation
  'node-srv-dc': { x: 1170, y: 145 },     // Zone 4: Core Services - Domain Controller
  'node-srv-db': { x: 1170, y: 365 },     // Zone 4: Core Services - Customer SQL DB
};

// Simplified plain-English labels so anyone watching understands instantly
const NODE_LABELS: Record<string, { title: string; subtitle: string }> = {
  'node-ext-01': { title: 'External Attacker', subtitle: 'Threat Actor C2' },
  'node-dmz-proxy': { title: 'DMZ Gateway', subtitle: 'Perimeter Proxy' },
  'node-dmz-web': { title: 'Web App Server', subtitle: 'Public Service' },
  'node-iot-cam': { title: 'Security Camera', subtitle: 'IoT Device' },
  'node-ws-101': { title: 'Engineer Workstation', subtitle: 'Internal Pivot' },
  'node-ws-102': { title: 'Finance PC', subtitle: 'Accounting' },
  'node-ws-103': { title: 'HR Workstation', subtitle: 'Personnel' },
  'node-srv-dc': { title: 'Domain Controller', subtitle: 'Active Directory Core' },
  'node-srv-db': { title: 'Customer Database', subtitle: 'Target SQL Vault' },
};

// The 5-hop Lateral Propagation Attack Kill Chain
const ATTACK_HOPS = [
  { 
    step: 1, 
    source: 'node-ext-01', 
    target: 'node-dmz-proxy', 
    title: '1. Ingress C2',
    name: 'External Ingress',
    technique: 'T1071 (Command & Control)',
    summary: 'Attacker establishes command channel to perimeter gateway.'
  },
  { 
    step: 2, 
    source: 'node-dmz-proxy', 
    target: 'node-dmz-web', 
    title: '2. Web Exploit',
    name: 'Web Server Exploit',
    technique: 'T1190 (Public Exploit)',
    summary: 'Exploits unpatched vulnerability on DMZ Web Server to execute payload.'
  },
  { 
    step: 3, 
    source: 'node-dmz-web', 
    target: 'node-ws-101', 
    title: '3. Lateral Pivot',
    name: 'SSH Lateral Move',
    technique: 'T1021.004 (SSH Pivot)',
    summary: 'Stolen developer credentials used to breach internal firewall onto Engineer PC.'
  },
  { 
    step: 4, 
    source: 'node-ws-101', 
    target: 'node-srv-dc', 
    title: '4. Domain Admin',
    name: 'Kerberoast Escalation',
    technique: 'T1558.003 (Kerberoasting)',
    summary: 'Attacker cracks service tickets to acquire Domain Administrator rights.'
  },
  { 
    step: 5, 
    source: 'node-srv-dc', 
    target: 'node-srv-db', 
    title: '5. Data Theft',
    name: 'Database Exfil',
    technique: 'T1048 (Data Exfiltration)',
    summary: 'Extracts customer records from SQL database to exfiltrate critical assets.'
  }
];

export const DigitalTwinGraph: React.FC<DigitalTwinGraphProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  currentStage,
  onToggleEdgeBlock,
  onToggleNodeQuarantine,
  layoutMode = 'panoramic',
  onToggleLayoutMode,
  isPlaying = false,
  currentStep = 3,
  totalSteps = 12,
  onTogglePlay
}) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [selectedHop, setSelectedHop] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  // Dynamic attack progression helpers
  const isHopUnlocked = (hopStep: number) => {
    if (hopStep === 1) return currentStep >= 1;
    if (hopStep === 2) return currentStep >= 3;
    if (hopStep === 3) return currentStep >= 5;
    if (hopStep === 4) return currentStep >= 7;
    if (hopStep === 5) return currentStep >= 9;
    return false;
  };

  const isCurrentActiveFront = (hopStep: number) => {
    if (hopStep === 1) return currentStep >= 1 && currentStep < 3;
    if (hopStep === 2) return currentStep >= 3 && currentStep < 5;
    if (hopStep === 3) return currentStep >= 5 && currentStep < 7;
    if (hopStep === 4) return currentStep >= 7 && currentStep < 9;
    if (hopStep === 5) return currentStep >= 9;
    return false;
  };

  const getNodePos = (nodeId: string) => {
    return NODE_COORDINATES[nodeId] || { x: 200, y: 200 };
  };

  const getRoleIcon = (role: TopologyNode['role'], size = 18) => {
    switch (role) {
      case 'attacker': return <Skull size={size} className="text-red-400" />;
      case 'domain_controller': return <Server size={size} className="text-purple-400" />;
      case 'server': return <Server size={size} className="text-cyan-400" />;
      case 'database': return <Database size={size} className="text-amber-400" />;
      case 'dmz_gateway': return <Lock size={size} className="text-blue-400" />;
      case 'iot_device': return <Camera size={size} className="text-violet-400" />;
      default: return <Laptop size={size} className="text-slate-300" />;
    }
  };

  const getNodeStyle = (node: TopologyNode) => {
    if (node.isolated) {
      return {
        fill: 'rgba(236, 253, 245, 0.95)',
        border: '#059669',
        text: '#047857',
        titleText: '#064e3b',
        tagBg: 'bg-emerald-100',
        tagText: 'text-emerald-800',
        tagBorder: 'border-emerald-300',
        status: 'AIR-GAPPED'
      };
    }
    if (node.role === 'attacker') {
      return {
        fill: 'rgba(254, 242, 242, 0.95)',
        border: '#dc2626',
        text: '#b91c1c',
        titleText: '#7f1d1d',
        tagBg: 'bg-red-100',
        tagText: 'text-red-800',
        tagBorder: 'border-red-300',
        status: 'ATTACKER'
      };
    }
    if (node.risk_score >= 80) {
      return {
        fill: 'rgba(255, 241, 242, 0.95)',
        border: '#e11d48',
        text: '#be123c',
        titleText: '#881337',
        tagBg: 'bg-rose-100',
        tagText: 'text-rose-800',
        tagBorder: 'border-rose-300',
        status: 'COMPROMISED'
      };
    }
    if (node.risk_score >= 50) {
      return {
        fill: 'rgba(255, 251, 235, 0.95)',
        border: '#d97706',
        text: '#b45309',
        titleText: '#78350f',
        tagBg: 'bg-amber-100',
        tagText: 'text-amber-800',
        tagBorder: 'border-amber-300',
        status: 'VULNERABLE'
      };
    }
    return {
      fill: 'rgba(240, 249, 255, 0.95)',
      border: '#0284c7',
      text: '#0369a1',
      titleText: '#0c4a6e',
      tagBg: 'bg-sky-100',
      tagText: 'text-sky-800',
      tagBorder: 'border-sky-300',
      status: 'PROTECTED'
    };
  };

  // Curved SVG path connecting card edges cleanly
  const getPathData = (src: { x: number; y: number }, tgt: { x: number; y: number }, edgeId: string) => {
    const cardW = 156;
    const cardH = 58;
    const halfW = cardW / 2;
    const halfH = cardH / 2;

    // Special distinct paths to keep layout clean and legible
    if (edgeId === 'e-proxy-web') {
      // Direct vertical drop from proxy to web server
      return `M ${src.x} ${src.y + halfH} L ${tgt.x} ${tgt.y - halfH}`;
    }
    if (edgeId === 'e-proxy-iot') {
      // Curved drop to IoT Camera
      return `M ${src.x - 30} ${src.y + halfH} Q ${src.x - 70} ${(src.y + tgt.y) / 2} ${tgt.x - 30} ${tgt.y - halfH}`;
    }
    if (edgeId === 'e-ws101-dc') {
      // Long bridge arching over Finance PC directly to Domain Controller
      return `M ${src.x + halfW} ${src.y} C ${src.x + 140} 55, ${tgt.x - 140} 55, ${tgt.x - halfW} ${tgt.y}`;
    }
    if (edgeId === 'e-dc-db') {
      // Vertical link in Core
      return `M ${src.x} ${src.y + halfH} L ${tgt.x} ${tgt.y - halfH}`;
    }
    if (edgeId === 'e-ws102-db') {
      // Finance PC to Database
      return `M ${src.x + halfW} ${src.y} C ${src.x + 90} ${src.y + 40}, ${tgt.x - 90} ${tgt.y - 40}, ${tgt.x - halfW} ${tgt.y}`;
    }

    // Default smooth horizontal bezier curve from right of source to left of target
    const startX = src.x + halfW;
    const startY = src.y;
    const endX = tgt.x - halfW;
    const endY = tgt.y;
    const dx = endX - startX;

    return `M ${startX} ${startY} C ${startX + dx * 0.45} ${startY}, ${endX - dx * 0.45} ${endY}, ${endX} ${endY}`;
  };

  const getEdgeWaypoint = (src: { x: number; y: number }, tgt: { x: number; y: number }, edgeId: string) => {
    if (edgeId === 'e-ws101-dc') return { x: (src.x + tgt.x) / 2, y: 72 };
    if (edgeId === 'e-proxy-web') return { x: src.x, y: (src.y + tgt.y) / 2 };
    if (edgeId === 'e-dc-db') return { x: src.x, y: (src.y + tgt.y) / 2 };
    return { x: (src.x + tgt.x) / 2, y: (src.y + tgt.y) / 2 };
  };

  const getAttackHop = (srcId: string, tgtId: string) => {
    return ATTACK_HOPS.find(h => h.source === srcId && h.target === tgtId);
  };

  const isEdgeDimmed = (edge: TopologyEdge) => {
    if (selectedHop !== null) {
      const hop = ATTACK_HOPS.find(h => h.step === selectedHop);
      if (hop) {
        return edge.source !== hop.source || edge.target !== hop.target;
      }
    }
    if (!hoveredNodeId) return false;
    return edge.source !== hoveredNodeId && edge.target !== hoveredNodeId;
  };

  const isNodeDimmed = (nodeId: string) => {
    if (selectedHop !== null) {
      const hop = ATTACK_HOPS.find(h => h.step === selectedHop);
      if (hop) {
        return nodeId !== hop.source && nodeId !== hop.target;
      }
    }
    if (!hoveredNodeId) return false;
    if (hoveredNodeId === nodeId) return false;
    return !edges.some(
      e => (e.source === hoveredNodeId && e.target === nodeId) ||
           (e.target === hoveredNodeId && e.source === nodeId)
    );
  };

  const activeHopData = selectedHop !== null ? ATTACK_HOPS.find(h => h.step === selectedHop) : null;
  const activeEdge = edges.find(e => e.id === hoveredEdgeId);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
      
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-900/10 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-300 flex items-center justify-center text-cyan-700 shrink-0 shadow-sm">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-sans">
                Enterprise Cyber Digital Twin Topology
              </h2>
              
              {/* Dynamic Live Attack Traversal Badge with Radar Ping */}
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-red-900 bg-red-500/12 border border-red-500/35 font-bold shadow-sm backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                </span>
                <span>Live Attack Traversal</span>
              </span>

              {/* Streaming Telemetry Status Chip */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-cyan-800 bg-cyan-50/80 border border-cyan-300/60 font-semibold shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                <span>Active Multi-Hop Propagation</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Simulates perimeter gateways, lateral movement across subnets, live packet telemetry, and counterfactual defense.
            </p>
          </div>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
          
          {/* Quick Play/Pause Simulation Button in Digital Twin Toolbar */}
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
                isPlaying
                  ? 'bg-amber-500/25 text-amber-900 border border-amber-500/50 hover:bg-amber-500/35'
                  : 'bg-cyan-500/15 text-cyan-900 border border-cyan-500/35 hover:bg-cyan-500/25'
              }`}
              title={isPlaying ? 'Pause live playback' : 'Play live attack simulation'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-700" /> : <Play className="w-3.5 h-3.5 text-cyan-700" />}
              <span>{isPlaying ? 'Pause Simulation' : 'Play Simulation'}</span>
            </button>
          )}

          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              showGuide
                ? 'bg-amber-500/25 text-amber-900 border border-amber-500/50'
                : 'glass-pill text-slate-700 hover:text-slate-900'
            }`}
            title="Open explanation guide for evaluators"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Examiner Guide</span>
          </button>

          {onToggleLayoutMode && (
            <button
              onClick={onToggleLayoutMode}
              className="px-3 py-1.5 rounded-full text-xs font-mono glass-pill text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-sm"
            >
              {layoutMode === 'panoramic' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{layoutMode === 'panoramic' ? 'Split View' : 'Full Canvas'}</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 glass-pill rounded-full p-1 shadow-sm">
            <button
              onClick={() => setZoom(prev => Math.max(0.75, prev - 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-700 px-1 tabular-nums font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(1.3, prev + 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoom !== 1 && (
              <button
                onClick={() => setZoom(1)}
                className="p-1 text-cyan-700 hover:text-cyan-900"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Step-by-Step Attack Trajectory Stepper (Clean & Intuitive) */}
      <div className="glass-card rounded-xl p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 shrink-0">
          <Flame className="w-4 h-4 text-red-600 shrink-0" />
          <span className="text-xs font-bold text-red-800 uppercase tracking-wider font-mono">
            Attack Progression:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedHop(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 shadow-sm ${
              selectedHop === null
                ? 'bg-red-600 text-white font-bold shadow-[0_4px_12px_rgba(239,68,68,0.4)]'
                : 'glass-pill text-slate-600 hover:text-slate-900'
            }`}
          >
            All 5 Attack Stages
          </button>

          {ATTACK_HOPS.map((h) => (
            <button
              key={h.step}
              onClick={() => setSelectedHop(h.step)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 flex items-center gap-2 shadow-sm ${
                selectedHop === h.step
                  ? 'bg-red-600 text-white font-bold shadow-[0_4px_14px_rgba(239,68,68,0.4)]'
                  : 'glass-pill text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                selectedHop === h.step ? 'bg-black/30 text-white' : 'bg-red-100 text-red-800'
              }`}>
                {h.step}
              </span>
              <span>{h.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Attack Hop Explanation Bar */}
      {activeHopData && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 flex items-start justify-between gap-3 animate-fadeIn shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              {activeHopData.step}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-red-950 text-sm font-semibold">{activeHopData.name}</strong>
                <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
                  {activeHopData.technique}
                </span>
              </div>
              <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                {activeHopData.summary}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedHop(null)}
            className="text-slate-500 hover:text-slate-900 px-2 py-1 text-sm rounded-lg hover:bg-black/5"
            title="Clear focus"
          >
            ✕
          </button>
        </div>
      )}

      {/* Examiner Guide Walkthrough */}
      {showGuide && (
        <div className="glass-panel border border-amber-500/40 rounded-xl p-4 text-xs text-slate-700 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-amber-900 font-bold border-b border-amber-500/20 pb-2">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Evaluation Guide & Architecture Walkthrough
            </span>
            <button 
              onClick={() => setShowGuide(false)}
              className="text-slate-500 hover:text-slate-800 text-sm px-1.5 py-0.5 rounded hover:bg-black/5"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="glass-card p-3 rounded-xl border border-amber-900/10">
              <strong className="text-cyan-800 block mb-1 font-mono text-xs font-bold">1. Clear Subnet Hierarchy</strong>
              Network is segregated into 4 zones: External Internet (Hacker) → DMZ Perimeter → Corporate Workstations → Secure Core Database.
            </div>
            <div className="glass-card p-3 rounded-xl border border-amber-900/10">
              <strong className="text-red-800 block mb-1 font-mono text-xs font-bold">2. Sequential Kill Chain</strong>
              Follow the red numbered markers (1 → 2 → 3 → 4 → 5). Click any step button above to isolate and examine that specific hop in plain English.
            </div>
            <div className="glass-card p-3 rounded-xl border border-amber-900/10">
              <strong className="text-emerald-800 block mb-1 font-mono text-xs font-bold">3. Real-Time Quarantine</strong>
              Click on the Engineer Workstation card below and tap <strong className="text-emerald-700">"Quarantine Host"</strong> to test immediate air-gap containment!
            </div>
          </div>
        </div>
      )}

      {/* 3. The Uncompressed, Spacious SVG Graph Canvas */}
      <div className="relative w-full overflow-x-auto rounded-2xl border border-amber-900/10 bg-[#fbf7ee]/90 backdrop-blur-md select-none scrollbar-thin shadow-inner">
        {/* Floating Live Attack Replay HUD */}
        <div className="absolute top-4 left-6 z-20 flex items-center gap-2.5 pointer-events-none">
          {isPlaying ? (
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border border-red-500/40 shadow-[0_8px_24px_rgba(239,68,68,0.22)] bg-white/85 animate-pulse-glow backdrop-blur-md">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 shadow-[0_0_10px_rgba(239,68,68,1)]"></span>
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-red-700 tracking-wider uppercase">
                    SIMULATION REPLAY ACTIVE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-900 font-bold border border-red-300">
                    Step {currentStep + 1} / {totalSteps}
                  </span>
                </div>
                <span className="text-[11px] text-slate-700 font-medium">
                  MITRE Stage: <strong className="text-red-900 font-mono font-bold">{currentStage.replace(/_/g, ' ')}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-card px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-slate-300/80 shadow-sm bg-white/75 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-[11px] text-slate-700 font-medium">
                Digital Twin Ready · Step {currentStep + 1} / {totalSteps} ({currentStage.replace(/_/g, ' ')})
              </span>
            </div>
          )}
        </div>

        <div 
          className="min-w-[1360px] h-[520px] lg:h-[550px] relative transition-transform duration-150"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          <svg className="w-full h-full" viewBox="0 0 1360 490" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="twinGrid" width="34" height="34" patternUnits="userSpaceOnUse">
                <path d="M 34 0 L 0 0 0 34" fill="none" stroke="rgba(180, 150, 120, 0.12)" strokeWidth="1" />
              </pattern>

              {/* Laser Arrowheads */}
              <marker
                id="twinAttackArrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626" />
              </marker>

              <marker
                id="twinNormalArrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" opacity="0.7" />
              </marker>

              {/* Attack Particle Glow Filter */}
              <filter id="attackGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur1" />
                <feGaussianBlur stdDeviation="1.5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Benign Particle Glow Filter */}
              <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Linear Gradients for Subnet Scanners */}
              <linearGradient id="scannerRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="scannerAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="scannerCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
                <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="scannerPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Glowing tactical background grid */}
            <rect width="1360" height="490" fill="url(#twinGrid)" />

            {/* 4 Clean Network Subnet Enclosures with Animated Radar Scanners */}
            <g className="subnets">
              {/* Zone 1: External Internet */}
              <g>
                <rect x="20" y="20" width="180" height="450" rx="14" fill="rgba(254, 226, 226, 0.55)" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="5 5" />
                {/* Live Scanner Beam */}
                <line x1="24" y1="20" x2="24" y2="470" stroke="url(#scannerRed)" strokeWidth="8">
                  <animate attributeName="x1" values="24;196;24" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="24;196;24" dur="5s" repeatCount="indefinite" />
                </line>
                <rect x="30" y="30" width="160" height="28" rx="7" fill="rgba(254, 202, 202, 0.85)" />
                <circle cx="44" cy="44" r="3.5" fill="#ef4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
                </circle>
                <text x="114" y="48" textAnchor="middle" fill="#991b1b" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
                  EXTERNAL INTERNET
                </text>
              </g>

              {/* Zone 2: DMZ Perimeter */}
              <g>
                <rect x="230" y="20" width="260" height="450" rx="14" fill="rgba(254, 243, 199, 0.55)" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="5 5" />
                {/* Live Scanner Beam */}
                <line x1="234" y1="20" x2="234" y2="470" stroke="url(#scannerAmber)" strokeWidth="8">
                  <animate attributeName="x1" values="234;486;234" dur="6.5s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="234;486;234" dur="6.5s" repeatCount="indefinite" />
                </line>
                <rect x="240" y="30" width="240" height="28" rx="7" fill="rgba(253, 230, 138, 0.85)" />
                <circle cx="254" cy="44" r="3.5" fill="#f59e0b">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="360" y="48" textAnchor="middle" fill="#92400e" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
                  DMZ PERIMETER (10.0.1.0/24)
                </text>
              </g>

              {/* Zone 3: Corporate LAN */}
              <g>
                <rect x="520" y="20" width="440" height="450" rx="14" fill="rgba(224, 242, 254, 0.55)" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="5 5" />
                {/* Live Scanner Beam */}
                <line x1="524" y1="20" x2="524" y2="470" stroke="url(#scannerCyan)" strokeWidth="8">
                  <animate attributeName="x1" values="524;956;524" dur="8s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="524;956;524" dur="8s" repeatCount="indefinite" />
                </line>
                <rect x="530" y="30" width="420" height="28" rx="7" fill="rgba(186, 230, 253, 0.85)" />
                <circle cx="544" cy="44" r="3.5" fill="#0284c7">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <text x="740" y="48" textAnchor="middle" fill="#075985" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
                  CORPORATE LAN (10.0.2.0/24)
                </text>
              </g>

              {/* Zone 4: Secure Core Vault */}
              <g>
                <rect x="990" y="20" width="350" height="450" rx="14" fill="rgba(243, 232, 255, 0.55)" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="5 5" />
                {/* Live Scanner Beam */}
                <line x1="994" y1="20" x2="994" y2="470" stroke="url(#scannerPurple)" strokeWidth="8">
                  <animate attributeName="x1" values="994;1336;994" dur="7.5s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="994;1336;994" dur="7.5s" repeatCount="indefinite" />
                </line>
                <rect x="1000" y="30" width="330" height="28" rx="7" fill="rgba(233, 213, 255, 0.85)" />
                <circle cx="1014" cy="44" r="3.5" fill="#a855f7">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <text x="1165" y="48" textAnchor="middle" fill="#6b21a8" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
                  SECURE CORE VAULT (10.0.3.0/24)
                </text>
              </g>
            </g>

            {/* Network Connections */}
            <g className="edges">
              {edges.map((edge) => {
                const srcNode = nodes.find(n => n.id === edge.source);
                const tgtNode = nodes.find(n => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;

                const srcPos = getNodePos(srcNode.id);
                const tgtPos = getNodePos(tgtNode.id);
                const isBlocked = edge.blocked;
                const hop = getAttackHop(edge.source, edge.target);
                const isUnlocked = hop ? isHopUnlocked(hop.step) : false;
                const isActiveFront = hop ? isCurrentActiveFront(hop.step) : false;
                const isAttackPath = isUnlocked;
                const isHopFocused = selectedHop !== null && hop?.step === selectedHop;
                const isDimmed = isEdgeDimmed(edge);
                const isHovered = hoveredEdgeId === edge.id;

                const pathData = getPathData(srcPos, tgtPos, edge.id);
                const mid = getEdgeWaypoint(srcPos, tgtPos, edge.id);

                return (
                  <g
                    key={edge.id}
                    className={`transition-opacity duration-200 cursor-pointer ${isDimmed ? 'opacity-15' : 'opacity-100'}`}
                    onClick={() => onToggleEdgeBlock && onToggleEdgeBlock(edge.id)}
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() => setHoveredEdgeId(null)}
                  >
                    {/* Generous mouse target */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="24"
                    />

                    {/* Active Front Glowing Under-Halo */}
                    {isActiveFront && !isBlocked && (
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="9"
                        opacity="0.45"
                        filter="url(#attackGlow)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Base Vector Line */}
                    <path
                      id={`edge-path-${edge.id}`}
                      d={pathData}
                      fill="none"
                      stroke={
                        isBlocked
                          ? '#ef4444'
                          : isActiveFront
                          ? '#dc2626'
                          : isAttackPath || isHopFocused
                          ? '#ef4444'
                          : isHovered
                          ? '#38bdf8'
                          : hop && !isUnlocked
                          ? '#cbd5e1'
                          : '#94a3b8'
                      }
                      strokeWidth={
                        isBlocked
                          ? 2.2
                          : isActiveFront
                          ? 4.2
                          : isHopFocused
                          ? 4.5
                          : isAttackPath
                          ? 3.2
                          : isHovered
                          ? 2.6
                          : 1.8
                      }
                      strokeDasharray={isBlocked ? '6 6' : hop && !isUnlocked ? '4 4' : undefined}
                      markerEnd={!isBlocked && (isAttackPath || isHopFocused) ? 'url(#twinAttackArrow)' : undefined}
                      opacity={isBlocked ? 0.6 : hop && !isUnlocked ? 0.45 : 0.95}
                    />

                    {/* Animated Directional Laser Dash along Attack Paths */}
                    {isAttackPath && !isBlocked && (
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#fee2e2"
                        strokeWidth={isActiveFront ? 3.5 : isHopFocused ? 3 : 2}
                        strokeDasharray="6 8"
                        className="animate-attack-dash pointer-events-none"
                        opacity={0.85}
                      />
                    )}

                    {/* LIVE ATTACK TRAVERSAL: Animated Traveling Energy Packets */}
                    {!isBlocked && (
                      <g className="pointer-events-none">
                        {isAttackPath ? (
                          <>
                            {/* Primary High-Energy Attack Exploit Pulse */}
                            <circle r={isActiveFront ? 7 : isHopFocused ? 6 : 4.8} fill="#ef4444" filter="url(#attackGlow)">
                              <animateMotion
                                dur={isActiveFront ? "1.1s" : isHopFocused ? "1.6s" : "2.2s"}
                                repeatCount="indefinite"
                              >
                                <mpath href={`#edge-path-${edge.id}`} />
                              </animateMotion>
                            </circle>

                            {/* Secondary Amber Payload Ember */}
                            <circle r={isActiveFront ? 5 : isHopFocused ? 4 : 3.2} fill="#f59e0b" opacity="0.95">
                              <animateMotion
                                dur={isActiveFront ? "1.1s" : isHopFocused ? "1.6s" : "2.2s"}
                                begin={isActiveFront ? "0.25s" : "0.38s"}
                                repeatCount="indefinite"
                              >
                                <mpath href={`#edge-path-${edge.id}`} />
                              </animateMotion>
                            </circle>

                            {/* Tertiary Rapid Telemetry Spark */}
                            <circle r="2.2" fill="#ffffff" opacity="0.95">
                              <animateMotion
                                dur={isActiveFront ? "1.1s" : isHopFocused ? "1.6s" : "2.2s"}
                                begin={isActiveFront ? "0.5s" : "0.75s"}
                                repeatCount="indefinite"
                              >
                                <mpath href={`#edge-path-${edge.id}`} />
                              </animateMotion>
                            </circle>
                          </>
                        ) : (
                          /* Calm Benign Internal Traffic Pulse */
                          <circle r="2.8" fill="#0ea5e9" opacity={hop && !isUnlocked ? "0.2" : "0.65"} filter="url(#cyanGlow)">
                            <animateMotion
                              dur="4.5s"
                              repeatCount="indefinite"
                            >
                              <mpath href={`#edge-path-${edge.id}`} />
                            </animateMotion>
                          </circle>
                        )}
                      </g>
                    )}

                    {/* Clean Numbered Attack Badge with Sonar Ping */}
                    {hop && (
                      <g transform={`translate(${mid.x}, ${mid.y})`}>
                        {isUnlocked && !isBlocked ? (
                          <>
                            {/* Live active ring pulse */}
                            <circle
                              r={isActiveFront ? 22 : isHopFocused ? 18 : 14}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth={isActiveFront ? 2.5 : isHopFocused ? 2 : 1.2}
                            >
                              <animate attributeName="r" values={isActiveFront ? "12;32" : isHopFocused ? "14;28" : "11;22"} dur={isActiveFront ? "1.2s" : "1.8s"} repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.9;0" dur={isActiveFront ? "1.2s" : "1.8s"} repeatCount="indefinite" />
                            </circle>
                            <circle
                              r={isActiveFront ? 14 : isHopFocused ? 14 : 11}
                              fill={isActiveFront ? '#dc2626' : isHopFocused ? '#dc2626' : '#991b1b'}
                              stroke="#ffffff"
                              strokeWidth={isActiveFront || isHopFocused ? 2 : 1.5}
                              className="shadow-sm"
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#ffffff"
                              fontSize={isActiveFront || isHopFocused ? "11" : "9.5"}
                              fontWeight="bold"
                              fontFamily="sans-serif"
                            >
                              {hop.step}
                            </text>
                          </>
                        ) : !isBlocked ? (
                          <>
                            <circle
                              r="9"
                              fill="#f8fafc"
                              stroke="#94a3b8"
                              strokeWidth="1.2"
                              strokeDasharray="2 2"
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#64748b"
                              fontSize="8.5"
                              fontWeight="bold"
                              fontFamily="sans-serif"
                            >
                              {hop.step}
                            </text>
                          </>
                        ) : null}
                      </g>
                    )}

                    {/* Blocked Badge with Animated Warning Pulse Ring */}
                    {isBlocked && (
                      <g transform={`translate(${mid.x}, ${mid.y})`}>
                        <circle r="18" fill="none" stroke="#ef4444" strokeWidth="1.5">
                          <animate attributeName="r" values="12;24" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <rect
                          x="-32"
                          y="-11"
                          width="64"
                          height="22"
                          rx="5"
                          fill="#450a0a"
                          stroke="#ef4444"
                          strokeWidth="1.4"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#fecaca"
                          fontSize="9"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                        >
                          BLOCKED
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* High-Readability Node Cards with Sonar & Forcefield Animations */}
            <g className="nodes">
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isDimmed = isNodeDimmed(node.id);
                const style = getNodeStyle(node);
                const pos = getNodePos(node.id);
                const label = NODE_LABELS[node.id] || { title: node.label, subtitle: node.role };

                // Card dimensions: 156 x 58
                const cardW = 156;
                const cardH = 58;
                const cardX = pos.x - cardW / 2;
                const cardY = pos.y - cardH / 2;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${cardX}, ${cardY})`}
                    onClick={() => onSelectNode(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className={`cursor-pointer transition-opacity duration-200 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
                  >
                    {/* Sonar Radar Wave around Attacker or Compromised Host */}
                    {(node.role === 'attacker' || node.compromised) && (
                      <g transform={`translate(78, 29)`} className="pointer-events-none">
                        <circle r="36" fill="none" stroke={node.role === 'attacker' ? '#ef4444' : '#f59e0b'} strokeWidth="1.5">
                          <animate attributeName="r" values="32;72" dur="2.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.85;0" dur="2.4s" repeatCount="indefinite" />
                        </circle>
                        <circle r="36" fill="none" stroke={node.role === 'attacker' ? '#ef4444' : '#f59e0b'} strokeWidth="1.2">
                          <animate attributeName="r" values="32;72" begin="1.2s" dur="2.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.85;0" begin="1.2s" dur="2.4s" repeatCount="indefinite" />
                        </circle>

                        {/* Shockwave detonation ring on compromised hosts */}
                        {node.compromised && node.role !== 'attacker' && (
                          <>
                            <circle r="24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                              <animate attributeName="r" values="24;88" dur="1.3s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.9;0" dur="1.3s" repeatCount="indefinite" />
                            </circle>
                            <circle r="20" fill="none" stroke="#f59e0b" strokeWidth="1.8">
                              <animate attributeName="r" values="20;76" begin="0.35s" dur="1.3s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.85;0" begin="0.35s" dur="1.3s" repeatCount="indefinite" />
                            </circle>
                          </>
                        )}
                      </g>
                    )}

                    {/* Rotating Emerald Forcefield for Quarantined Hosts */}
                    {node.isolated && (
                      <g transform={`translate(78, 29)`} className="pointer-events-none">
                        <circle r="46" fill="rgba(16, 185, 129, 0.08)" stroke="#059669" strokeWidth="2" strokeDasharray="8 5">
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0"
                            to="360"
                            dur="10s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    )}

                    {/* Node Card Box */}
                    <rect
                      width={cardW}
                      height={cardH}
                      rx="10"
                      fill={style.fill}
                      stroke={isSelected ? '#0284c7' : isHovered ? '#38bdf8' : style.border}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                      className="transition-colors shadow-sm"
                    />

                    {/* Icon container */}
                    <rect
                      x="10"
                      y="11"
                      width="34"
                      height="34"
                      rx="8"
                      fill="#ffffff"
                      stroke={style.border}
                      strokeWidth="1"
                    />

                    <foreignObject x="10" y="11" width="34" height="34" className="pointer-events-none">
                      <div className="w-full h-full flex items-center justify-center">
                        {getRoleIcon(node.role, 18)}
                      </div>
                    </foreignObject>

                    {/* Host Name */}
                    <text
                      x="52"
                      y="24"
                      fill="#0f172a"
                      fontSize="10.5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {label.title}
                    </text>

                    {/* Status Pill Tag */}
                    <g transform="translate(52, 31)">
                      <rect
                        width="88"
                        height="16"
                        rx="4"
                        fill="#ffffff"
                        stroke={style.border}
                        strokeWidth="0.8"
                      />
                      <circle
                        cx="12"
                        cy="8"
                        r="2.5"
                        fill={node.isolated ? '#059669' : node.compromised || node.role === 'attacker' ? '#ef4444' : '#0284c7'}
                      >
                        <animate attributeName="opacity" values="1;0.35;1" dur="1.3s" repeatCount="indefinite" />
                      </circle>
                      <text
                        x="48"
                        y="11.5"
                        textAnchor="middle"
                        fill={style.text}
                        fontSize="8"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                      >
                        {style.status}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Hovered link info card */}
          {activeEdge && !hoveredNodeId && (
            <div className="absolute top-3 left-3 bg-[#fffaf0]/95 backdrop-blur-md border border-cyan-400 rounded-xl p-3 text-xs shadow-xl pointer-events-none z-30">
              <div className="flex items-center gap-2 font-mono text-cyan-900 font-bold border-b border-amber-900/10 pb-1.5 mb-1.5">
                <span>{activeEdge.protocol.toUpperCase()} · Port {activeEdge.port}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  activeEdge.blocked ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {activeEdge.blocked ? 'BLOCKED' : 'ACTIVE'}
                </span>
              </div>
              <div className="text-[11px] text-slate-700 flex items-center gap-3 font-mono">
                <span>Throughput: {(activeEdge.bytes_per_sec / 1024).toFixed(1)} KB/s</span>
                <span className="text-amber-800 font-semibold">Click link to block</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Legend & Explanation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 border-t border-amber-900/10 pt-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-500 font-semibold">Legend:</span>
          
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-red-600" />
            <span className="text-slate-700 font-medium">Attack Route (1 to 5)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-sky-500" />
            <span className="text-slate-700 font-medium">Normal Traffic</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-red-600 border border-dashed border-red-300" />
            <span className="text-slate-700 font-medium">Blocked Link</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-700 font-medium">Air-Gapped Host</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span>Click any machine to inspect or trigger 1-click quarantine.</span>
        </div>
      </div>

      {/* 5. Selected Host Control Deck */}
      {selectedNodeId && (
        <div className="glass-panel rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          {(() => {
            const sel = nodes.find(n => n.id === selectedNodeId);
            if (!sel) return null;
            const style = getNodeStyle(sel);
            const label = NODE_LABELS[sel.id] || { title: sel.label, subtitle: sel.role };
            
            return (
              <>
                <div className="flex items-center gap-3.5 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-amber-900/10 flex items-center justify-center shrink-0 shadow-sm">
                      {getRoleIcon(sel.role, 18)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block leading-tight">{label.title}</span>
                      <span className="text-slate-500 text-[11px] font-medium">{label.subtitle} · {sel.subnet}</span>
                    </div>
                  </div>

                  <span className="font-mono text-cyan-900 bg-white px-2.5 py-1 rounded-md border border-cyan-200 font-semibold shadow-sm">
                    IP: {sel.ip}
                  </span>

                  <span className="text-slate-600 hidden md:inline font-medium">
                    OS: <strong className="text-slate-900 font-bold">{sel.os}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end flex-wrap">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-500 font-medium">Risk Score:</span>
                    <strong className={`px-2.5 py-0.5 rounded ${style.tagBg} ${style.tagText} border ${style.tagBorder} font-bold`}>
                      {sel.risk_score} / 100
                    </strong>
                  </div>

                  {onToggleNodeQuarantine && sel.role !== 'attacker' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleNodeQuarantine(sel.id);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 shadow-sm ${
                        sel.isolated
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                      title={sel.isolated ? "Reconnect host to corporate network" : "Isolate host immediately"}
                    >
                      {sel.isolated ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Release Air-Gap</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Quarantine Host</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

    </div>
  );
};
