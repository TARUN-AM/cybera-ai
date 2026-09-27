import React from 'react';
import { 
  HelpCircle, 
  Layers, 
  BarChart, 
  TrendingUp, 
  AlertCircle,
  Activity
} from 'lucide-react';
import { StateWindow } from '../types/cyber';

interface ExplainabilityPanelProps {
  currentWindow: StateWindow;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ currentWindow }) => {
  const { attention_weights, shap_factors, top_rationale } = currentWindow.explainability;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-300 flex items-center justify-center text-cyan-700 shrink-0 shadow-sm">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
              Explainability Engine (XAI): "Why This Forecast?"
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Temporal Attention & SHAP Log-Odds Attribution</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs glass-card px-3 py-1.5 rounded-full shadow-sm">
          <Layers className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
          <span className="font-mono text-cyan-900 font-bold text-xs">Attention & SHAP</span>
        </div>
      </div>

      {/* Primary Attribution Rationale */}
      <div className="p-4 rounded-xl glass-card border border-cyan-200 flex items-start gap-3 shadow-sm">
        <Activity className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed font-medium">
          <span className="font-bold text-slate-900">Empirical Precursor Attribution: </span>
          <span>{top_rationale}</span>
        </div>
      </div>

      {/* Attention Weight Ranking */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span className="font-bold">Ranked Contributing Telemetry Features</span>
          <span className="font-mono text-[11px] text-slate-500 font-semibold">Temporal Attention Weight %</span>
        </div>

        <div className="space-y-2">
          {attention_weights.map((item, idx) => {
            return (
              <div key={item.feature} className="p-3 rounded-xl glass-card shadow-sm">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-cyan-100 border border-cyan-300 text-cyan-900 font-mono text-[11px] flex items-center justify-center font-bold shadow-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{item.feature}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500">
                      Obs: <span className="text-slate-800 font-bold">{item.raw_val.toFixed(2)}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-800 tabular-nums">
                      +{item.contribution_pct}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    style={{ width: `${item.contribution_pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SHAP Factor Impact Breakdown */}
      <div className="space-y-2.5 pt-1 border-t border-amber-900/10">
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span className="font-bold">SHAP Marginal Risk Impact (Baseline Comparison)</span>
          <span className="font-mono text-[11px] text-slate-500 font-semibold">Δ Log-Odds</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {shap_factors.map((factor) => {
            const isIncrease = factor.direction === 'increases_risk';
            return (
              <div 
                key={factor.factor} 
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between glass-card shadow-sm ${
                  isIncrease 
                    ? 'bg-rose-50 border-rose-300 text-rose-900' 
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <span className="truncate pr-2 font-semibold">{factor.factor}</span>
                <span className="font-mono font-bold shrink-0 tabular-nums text-xs">
                  {isIncrease ? `+${factor.impact.toFixed(2)}` : `${factor.impact.toFixed(2)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
