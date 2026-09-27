import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  Clock, 
  Zap, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { StateWindow } from '../types/cyber';

interface HighChanceAlertPopupProps {
  currentWindow: StateWindow;
  networkRiskScore: number;
  activeActionId: string | null;
  onApplyAction: (actionId: string) => void;
  onOpenDigitalTwin: () => void;
}

export const HighChanceAlertPopup: React.FC<HighChanceAlertPopupProps> = ({
  currentWindow,
  networkRiskScore,
  activeActionId,
  onApplyAction,
  onOpenDigitalTwin,
}) => {
  // Find highest probability threat across the 3 horizon lookaheads (1m, 2m, 5m)
  const horizons = [
    { key: '1m', label: 't + 1m', ...currentWindow.forecast.t_plus_1min },
    { key: '2m', label: 't + 2m', ...currentWindow.forecast.t_plus_2min },
    { key: '5m', label: 't + 5m', ...currentWindow.forecast.t_plus_5min },
  ];

  const nonBenignHorizons = horizons.filter(h => h.stage !== 'BENIGN');
  const topThreat = nonBenignHorizons.length > 0 
    ? [...nonBenignHorizons].sort((a, b) => b.probability - a.probability)[0]
    : horizons[0];

  const prob = topThreat ? topThreat.probability : 0;
  
  // High chance criteria: probability >= 65% for non-benign stage OR network risk score >= 70
  const isHighChance = (topThreat && topThreat.stage !== 'BENIGN' && prob >= 0.65) || networkRiskScore >= 70;

  // Track dismissals per timeline step index
  const [dismissedStep, setDismissedStep] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // When step changes, if it's a high chance step, reset dismiss so the evaluator immediately sees the new alert
  useEffect(() => {
    setDismissedStep(null);
    setIsMinimized(false);
  }, [currentWindow.window_id]);

  if (!isHighChance) {
    return null;
  }

  // If dismissed for this step, show a sleek floating alert chip so user can still access it anytime
  if (dismissedStep === currentWindow.window_id) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-slideInAlert">
        <button
          onClick={() => setDismissedStep(null)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass-panel bg-white/95 border border-red-500/40 shadow-[0_8px_30px_rgba(239,68,68,0.25)] hover:scale-105 active:scale-95 transition-all text-xs font-semibold text-slate-800 backdrop-blur-xl"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <span className="text-red-700 font-bold">High Chance Alert Active</span>
          <span className="font-mono text-slate-500">({(prob * 100).toFixed(0)}%)</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  const isMitigated = activeActionId !== null;

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-[440px] w-[calc(100vw-2rem)] animate-slideInAlert">
      <div className="relative rounded-2xl glass-panel bg-white/95 border-2 border-red-500/50 shadow-[0_16px_48px_rgba(239,68,68,0.32)] backdrop-blur-2xl p-4 sm:p-5 flex flex-col gap-3.5 overflow-hidden">
        
        {/* Glowing Ambient Danger Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-rose-600" />

        {/* Header Strip: Danger Beacon, Category, Confidence & Close */}
        <div className="flex items-start justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-600 shrink-0 shadow-sm">
              <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-red-700">
                  Critical Forecast Detected
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-900 border border-red-300">
                  {(prob * 100).toFixed(0)}% Probability
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Step {currentWindow.window_id + 1} of 12 · AI Threat Horizon
              </span>
            </div>
          </div>

          <button
            onClick={() => setDismissedStep(currentWindow.window_id)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alert Main Message Body */}
        <div className="flex flex-col gap-1.5 bg-red-50/70 border border-red-200/80 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-950">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>High probability of {topThreat.stage.replace(/_/g, ' ')} traversal!</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            AI world model predicts with <strong className="text-red-900 font-mono font-bold">{(prob * 100).toFixed(1)}% confidence</strong> that adversary will breach <strong className="text-slate-900">{currentWindow.host_id} ({currentWindow.host_ip})</strong> within <strong className="text-cyan-900 font-mono font-bold">+{currentWindow.forecast.forecast_lead_time_sec}s</strong>.
          </p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 pt-1 border-t border-red-200/60 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-700" />
              <span>Lead: ~{(currentWindow.forecast.forecast_lead_time_sec / 60).toFixed(1)} min</span>
            </span>
            <span>·</span>
            <span>Target: <strong className="text-slate-800">{currentWindow.host_id}</strong></span>
          </div>
        </div>

        {/* Explainability Rationale Quote */}
        {currentWindow.explainability?.top_rationale && (
          <div className="text-[11px] text-slate-600 bg-amber-500/10 border border-amber-500/25 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="line-clamp-2 italic">
              "{currentWindow.explainability.top_rationale}"
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-0.5">
          {isMitigated ? (
            <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Quarantine Active · Threat Neutralized</span>
            </div>
          ) : (
            <button
              onClick={() => onApplyAction('act-isolate-ws101')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-[0_4px_16px_rgba(239,68,68,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Apply Preemptive Isolation</span>
            </button>
          )}

          <button
            onClick={onOpenDigitalTwin}
            className="px-3 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 glass-card rounded-xl hover:bg-slate-100 transition-all shrink-0 flex items-center gap-1 shadow-sm"
            title="Inspect on Digital Twin Topology"
          >
            <span>Inspect Twin</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-700" />
          </button>
        </div>

      </div>
    </div>
  );
};
