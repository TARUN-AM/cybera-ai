import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FileText, 
  BarChart3, 
  Radio,
  Download,
  Sun,
  Moon,
  Network,
  Zap,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { StateWindow } from '../types/cyber';
import { BrandLogo } from './BrandLogo';

export type NavTab = 'overview' | 'twin' | 'forecast' | 'defense' | 'evaluation';

interface HeaderBarProps {
  currentWindow: StateWindow;
  networkRiskScore: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  activeCampaignId: string;
  campaigns: { id: string; name: string; dataset: string; is_held_out: boolean; target_host: string }[];
  onSelectCampaign: (id: string) => void;
  onOpenEvaluation: () => void;
  onOpenDemoScript: () => void;
  onOpenTelemetry: () => void;
  onExportReport: () => void;
  isHighContrast: boolean;
  onToggleTheme: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentWindow,
  networkRiskScore,
  isPlaying,
  onTogglePlay,
  onReset,
  activeCampaignId,
  campaigns,
  onSelectCampaign,
  onOpenEvaluation,
  onOpenDemoScript,
  onOpenTelemetry,
  onExportReport,
  isHighContrast,
  onToggleTheme,
  activeTab,
  onSelectTab
}) => {
  const isCritical = networkRiskScore >= 75;
  const isWarning = networkRiskScore >= 45 && networkRiskScore < 75;

  const NAV_ITEMS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'twin', label: 'Digital Twin', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'forecast', label: 'Threat Forecast', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'defense', label: 'Defense Sandbox', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'evaluation', label: 'Benchmarks', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="border-b border-white/80 bg-white/65 backdrop-blur-2xl sticky top-0 z-40 shadow-[0_8px_32px_rgba(160,120,80,0.09)]">
      
      {/* 1. TOP UTILITY STRIP: Live Engine · Air-Gapped Replay, Host Target, Dataset & Utilities */}
      <div className="border-b border-amber-900/10 bg-white/50 px-4 sm:px-8 py-1.5 backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Top Left: User Requested "Live Engine · Air-Gapped Replay" Prominently on Top */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-mono shadow-sm bg-white/90">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-emerald-800 font-bold text-[11px]">Live Engine</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 text-[11px] font-semibold">Air-Gapped Replay</span>
            </div>

            <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-slate-600">
              <span className="text-slate-400">Target Host:</span>
              <span className="font-bold text-slate-800 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {campaigns.find(c => c.id === activeCampaignId)?.target_host || '10.0.3.15 (DC)'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">Step:</span>
              <span className="font-bold text-cyan-800">
                {currentWindow.window_id + 1} / 12
              </span>
            </div>
          </div>

          {/* Top Right: Dataset, Guide, Telemetry, Export, Theme */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Campaign / Dataset Selector */}
            <div className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1 text-xs shadow-sm bg-white/80">
              <span className="text-slate-500 text-[10.5px] shrink-0 font-medium">Dataset:</span>
              <select
                value={activeCampaignId}
                onChange={(e) => onSelectCampaign(e.target.value)}
                className="bg-transparent text-slate-800 font-mono text-xs focus:outline-none cursor-pointer truncate max-w-[130px] sm:max-w-[170px] font-semibold"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#fffaf0] text-slate-800">
                    {c.is_held_out ? '[Test] ' : '[Train] '}
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Guide / Runbook Pill */}
            <button
              onClick={onOpenDemoScript}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-amber-900 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-full transition-all hover:scale-[1.03] active:scale-[0.98] shadow-sm whitespace-nowrap font-medium"
              title="Open Interactive Evaluation Guide & Runbook"
            >
              <FileText className="w-3 h-3 text-amber-600" />
              <span className="text-[11px]">Guide</span>
            </button>

            {/* Telemetry Modal Pill */}
            <button
              onClick={onOpenTelemetry}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-700 hover:text-cyan-800 glass-card rounded-full transition-all hover:scale-[1.03] active:scale-[0.98] shadow-sm whitespace-nowrap"
              title="Inspect 28-dimensional flow and packet telemetry features"
            >
              <Radio className="w-3 h-3 text-cyan-600" />
              <span className="text-[11px] font-medium hidden sm:inline">Telemetry</span>
            </button>

            {/* Export Report */}
            <button
              onClick={onExportReport}
              className="p-1.5 text-slate-600 hover:text-emerald-700 glass-card rounded-full transition-all hover:scale-110 active:scale-95 shadow-sm"
              title="Export forensic JSON report"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Theme Switcher */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 text-slate-600 hover:text-slate-900 glass-card rounded-full transition-all hover:scale-110 active:scale-95 shadow-sm"
              title={isHighContrast ? 'Standard Floral White Theme' : 'High-Contrast Theme'}
            >
              {isHighContrast ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-cyan-600" />}
            </button>
          </div>

        </div>
      </div>

      {/* 2. MAIN NAVIGATION ROW: Brand Logo + Uncompressed Single-Line Navigation Tabs + Replay Cockpit */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Brand Logo */}
        <div className="shrink-0 flex items-center justify-between w-full md:w-auto">
          <BrandLogo size="md" />

          {/* Mobile Right: Mini Risk Badge on small phone screens */}
          <div className="flex md:hidden items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-bold shadow-sm ${
              isCritical ? 'bg-red-50 text-red-800 border-red-300' : isWarning ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              <span>Risk {networkRiskScore}</span>
            </div>
            <button
              onClick={onTogglePlay}
              className="p-1.5 rounded-full border text-xs bg-amber-500/20 text-amber-900 border-amber-500/40"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Center: Navigation Tabs - GUARANTEED ON THE EXACT SAME LINE ON LAPTOPS */}
        <nav className="flex items-center gap-1 lg:gap-1.5 p-1 glass-card rounded-full shadow-inner flex-nowrap shrink-0 overflow-x-auto max-w-full">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 lg:gap-2 px-3 sm:px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 hover:scale-[1.03] active:scale-[0.98] ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold shadow-[0_4px_16px_rgba(245,158,11,0.35)]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Replay Controls & Risk Score Badge */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          
          {/* Replay Controls */}
          <div className="flex items-center gap-1 glass-card rounded-full p-1 shadow-sm">
            <button
              onClick={onTogglePlay}
              className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-900 border border-amber-500/40' 
                  : 'bg-cyan-500/15 text-cyan-900 hover:bg-cyan-500/25 border border-cyan-500/30'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3 text-amber-700" /> : <Play className="w-3 h-3 text-cyan-700" />}
              <span>{isPlaying ? 'Pause' : 'Replay'}</span>
            </button>
            <button
              onClick={onReset}
              title="Reset Timeline & Mitigations"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-black/5 rounded-full transition-all hover:scale-110 active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Enterprise Risk Score Badge */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-sm transition-colors backdrop-blur-md ${
            isCritical 
              ? 'bg-red-50/80 border-red-300 text-red-900' 
              : isWarning 
              ? 'bg-amber-50/80 border-amber-300 text-amber-900' 
              : 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
          }`}>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Risk</span>
            <span className="text-sm font-bold font-mono tabular-nums leading-none">
              {networkRiskScore}
              <span className="text-[10px] text-slate-400 font-normal">/100</span>
            </span>
            <div className={`w-2 h-2 rounded-full ${
              isCritical ? 'bg-red-500 animate-pulse' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
          </div>

        </div>

      </div>
    </header>
  );
};
