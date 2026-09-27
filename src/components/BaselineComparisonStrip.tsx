import React from 'react';
import { 
  GitCompare, 
  Clock, 
  Target, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { BaselineComparisonData } from '../types/cyber';

interface BaselineComparisonStripProps {
  baselineData: BaselineComparisonData;
  onOpenEvaluation: () => void;
}

export const BaselineComparisonStrip: React.FC<BaselineComparisonStripProps> = ({
  baselineData,
  onOpenEvaluation
}) => {
  const { metrics } = baselineData;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 shadow-sm">
      {/* Label and Problem Statement Reference */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-300 flex items-center justify-center text-cyan-700 shrink-0 shadow-sm">
          <GitCompare className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 block">
            Baseline Comparison (Mandated by SIH26153)
          </span>
          <span className="text-[11px] text-slate-600 font-medium">
            CYBERA World Model vs. Multinomial Logistic Regression Baseline
          </span>
        </div>
      </div>

      {/* Metric Comparison Counters - Executive KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-1 xl:py-0 border-y xl:border-y-0 border-amber-900/10">
        {/* Lead Time Contrast */}
        <div className="flex flex-col p-3 rounded-xl glass-card shadow-sm border border-amber-900/10">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Forecast Lead</span>
          <div className="flex items-baseline gap-1.5 font-mono text-xs mt-1">
            <span className="text-emerald-700 font-bold tabular-nums text-sm">
              +{metrics.mean_forecast_lead_time_sec.nexus_world_model.toFixed(0)}s
            </span>
            <span className="text-slate-400 text-[10px]">vs</span>
            <span className="text-rose-700 font-medium tabular-nums text-xs">
              {metrics.mean_forecast_lead_time_sec.baseline.toFixed(0)}s
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">CYBERA vs Baseline</span>
        </div>

        {/* Multi-Step Accuracy (t+1m) */}
        <div className="flex flex-col p-3 rounded-xl glass-card shadow-sm border border-amber-900/10">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Acc (t+1m)</span>
          <div className="flex items-baseline gap-1.5 font-mono text-xs mt-1">
            <span className="text-emerald-700 font-bold tabular-nums text-sm">
              {(metrics.multi_step_accuracy.t_plus_1min.nexus_world_model * 100).toFixed(1)}%
            </span>
            <span className="text-slate-400 text-[10px]">vs</span>
            <span className="text-slate-600 tabular-nums text-xs font-medium">
              {(metrics.multi_step_accuracy.t_plus_1min.baseline * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">Top-1 MITRE Stage</span>
        </div>

        {/* Calibration / Brier Score */}
        <div className="flex flex-col p-3 rounded-xl glass-card shadow-sm border border-amber-900/10">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Brier Score</span>
          <div className="flex items-baseline gap-1.5 font-mono text-xs mt-1">
            <span className="text-emerald-700 font-bold tabular-nums text-sm">
              {metrics.calibration_brier_score.nexus_world_model.toFixed(3)}
            </span>
            <span className="text-slate-400 text-[10px]">vs</span>
            <span className="text-rose-700 tabular-nums text-xs font-medium">
              {metrics.calibration_brier_score.baseline.toFixed(3)}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">Optimal Calibration</span>
        </div>

        {/* Unseen Generalization */}
        <div className="flex flex-col p-3 rounded-xl glass-card shadow-sm border border-amber-900/10">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Unseen F1</span>
          <div className="flex items-baseline gap-1.5 font-mono text-xs mt-1">
            <span className="text-cyan-800 font-bold tabular-nums text-sm">
              {(metrics.unseen_campaign_generalization_f1.overall_held_out_mean.nexus_world_model * 100).toFixed(1)}%
            </span>
            <span className="text-slate-400 text-[10px]">vs</span>
            <span className="text-slate-600 tabular-nums text-xs font-medium">
              {(metrics.unseen_campaign_generalization_f1.overall_held_out_mean.baseline * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">Zero Leakage Split</span>
        </div>
      </div>

      {/* Button to Open Full Evaluation Report */}
      <button
        onClick={onOpenEvaluation}
        className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-cyan-900 bg-white/90 hover:bg-cyan-50 border border-cyan-300 glass-pill rounded-full transition-all whitespace-nowrap shrink-0 shadow-sm"
      >
        <span>View Full Benchmark Report</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
