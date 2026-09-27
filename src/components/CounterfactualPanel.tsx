import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  Terminal, 
  AlertTriangle, 
  Sparkles,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { CounterfactualAction, MitreStage } from '../types/cyber';

interface CounterfactualPanelProps {
  actions: CounterfactualAction[];
  onApplyAction: (actionId: string) => void;
  onReset: () => void;
  activeActionId: string | null;
}

const STAGES_LIST: MitreStage[] = [
  'BENIGN',
  'RECONNAISSANCE',
  'INITIAL_ACCESS',
  'DISCOVERY',
  'PRIVILEGE_ESCALATION',
  'LATERAL_MOVEMENT',
  'COMMAND_AND_CONTROL',
  'EXFILTRATION_IMPACT'
];

export const CounterfactualPanel: React.FC<CounterfactualPanelProps> = ({
  actions,
  onApplyAction,
  onReset,
  activeActionId
}) => {
  const selectedAction = actions.find(a => a.id === activeActionId) || actions[0];
  const isApplied = activeActionId !== null;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-amber-900/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-300 flex items-center justify-center text-cyan-700 shrink-0 shadow-sm">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Counterfactual Defense Simulator</span>
              <span className="text-[11px] font-mono text-cyan-800 font-bold px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-300">
                Intervention Engine
              </span>
            </h2>
          </div>
        </div>
        {isApplied && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all self-start sm:self-auto font-bold shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Reset Mitigation</span>
          </button>
        )}
      </div>

      {/* Mandatory Rigorous Disclaimer */}
      <div className="p-3.5 rounded-xl glass-card border border-amber-300 bg-amber-50/80 text-amber-950 text-xs flex items-start gap-2.5 shadow-sm">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <span className="leading-relaxed font-medium">
          <strong className="font-bold text-amber-900">Simulated Defensive Impact:</strong> Projected trajectory outcome derived from empirical Markov & Attention graph transition dynamics — never guaranteed prevention.
        </span>
      </div>

      {/* Action Selector Buttons - responsive grid (1 col mobile, 2 col tablet, 4 col desktop) */}
      <div className="space-y-2.5">
        <span className="text-xs text-slate-700 font-bold">Select Hypothetical Defensive Intervention:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {actions.map((act) => {
            const isCurrent = act.id === activeActionId;
            return (
              <button
                key={act.id}
                onClick={() => onApplyAction(act.id)}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-3 shadow-sm ${
                  isCurrent
                    ? 'glass-card border-cyan-500 bg-cyan-50/90 text-slate-900 shadow-md ring-2 ring-cyan-400'
                    : 'glass-card text-slate-700 hover:border-cyan-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold leading-snug text-slate-900">{act.label}</span>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{act.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-amber-900/10">
                  <span className="text-slate-500 truncate max-w-[120px] text-[11px] font-medium">Target: {act.action_type.replace('_', ' ')}</span>
                  <span className="text-emerald-700 font-bold shrink-0">-{act.risk_reduction_pct.toFixed(0)}% Risk</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Before / After Comparative Projection */}
      {selectedAction && (
        <div className="p-4 sm:p-5 rounded-xl glass-card space-y-4 shadow-sm border border-amber-900/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/10 pb-3.5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                Simulation Outcome: {selectedAction.label}
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">{selectedAction.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Risk Reduction</span>
                <span className="font-mono text-lg sm:text-xl font-extrabold text-emerald-700 tabular-nums">
                  -{selectedAction.risk_reduction_pct.toFixed(1)}%
                </span>
              </div>
              <div className="text-right pl-4 border-l border-amber-900/10">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Blast Radius</span>
                <span className="font-mono text-lg sm:text-xl font-extrabold text-cyan-800 tabular-nums">
                  {selectedAction.blast_radius_nodes_saved} Saved
                </span>
              </div>
            </div>
          </div>

          {/* Probability Comparison Spectrum (Before vs After) */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Before Mitigation */}
              <div className="space-y-2.5 p-3.5 rounded-xl glass-card border border-red-300 bg-red-50/70 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-900">Baseline Trajectory (No Defense)</span>
                  <span className="font-mono text-red-800 font-bold text-xs">Risk: {selectedAction.simulated_risk_before}/100</span>
                </div>
                <div className="space-y-1.5">
                  {STAGES_LIST.slice(1, 6).map((stage) => {
                    const prob = selectedAction.before_forecast[stage] || 0.05;
                    return (
                      <div key={stage} className="text-xs">
                        <div className="flex justify-between text-slate-700 mb-1 font-medium">
                          <span className="font-mono text-[11px]">{stage.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-[11px] font-bold text-slate-900">{(prob * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500 rounded-full"
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* After Mitigation */}
              <div className="space-y-2.5 p-3.5 rounded-xl glass-card border border-emerald-300 bg-emerald-50/70 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900">Counterfactual Trajectory (With Defense)</span>
                  <span className="font-mono text-emerald-800 font-bold text-xs">Risk: {selectedAction.simulated_risk_after}/100</span>
                </div>
                <div className="space-y-1.5">
                  {STAGES_LIST.slice(1, 6).map((stage) => {
                    const prob = selectedAction.after_forecast[stage] || 0.01;
                    return (
                      <div key={stage} className="text-xs">
                        <div className="flex justify-between text-slate-700 mb-1 font-medium">
                          <span className="font-mono text-[11px]">{stage.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-[11px] font-bold text-slate-900">{(prob * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            style={{ width: `${Math.max(1, prob * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Technical Execution CLI Preview */}
          <div className="p-3 rounded-xl glass-card flex items-center justify-between text-xs font-mono shadow-sm border border-amber-900/10 bg-white/80">
            <div className="flex items-center gap-2.5 text-slate-700 overflow-hidden">
              <Terminal className="w-4 h-4 text-cyan-700 shrink-0" />
              <span className="truncate text-slate-800 text-xs font-mono font-medium">{selectedAction.technical_command}</span>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300 shrink-0 ml-2 font-bold font-mono shadow-xs">
              Ready to Dispatch
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
