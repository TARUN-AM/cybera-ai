import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Crosshair, 
  CheckCircle,
  HelpCircle,
  Shield
} from 'lucide-react';
import { StateWindow, MitreStage } from '../types/cyber';

interface ForecastPanelProps {
  currentWindow: StateWindow;
}

const STAGE_COLORS: Record<MitreStage, { text: string; bg: string; border: string }> = {
  BENIGN: { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  RECONNAISSANCE: { text: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  INITIAL_ACCESS: { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-300' },
  DISCOVERY: { text: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  PRIVILEGE_ESCALATION: { text: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-300' },
  LATERAL_MOVEMENT: { text: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-300' },
  COMMAND_AND_CONTROL: { text: 'text-red-800', bg: 'bg-red-50', border: 'border-red-300' },
  EXFILTRATION_IMPACT: { text: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-300' }
};

export const ForecastPanel: React.FC<ForecastPanelProps> = ({ currentWindow }) => {
  const [activeHorizon, setActiveHorizon] = useState<'1m' | '2m' | '5m'>('1m');

  const forecastData = 
    activeHorizon === '1m' ? currentWindow.forecast.t_plus_1min :
    activeHorizon === '2m' ? currentWindow.forecast.t_plus_2min :
    currentWindow.forecast.t_plus_5min;

  const currentStageStyle = STAGE_COLORS[currentWindow.actual_stage] || STAGE_COLORS.BENIGN;
  const targetStageStyle = STAGE_COLORS[forecastData.stage] || STAGE_COLORS.BENIGN;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4.5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-300 flex items-center justify-center text-cyan-700 shrink-0 shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
              Multi-Step Attack Horizon Forecast
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Continuous 5-minute lookahead trajectory</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs glass-card px-3 py-1.5 rounded-full shadow-sm">
          <Clock className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
          <span className="text-slate-600 font-medium">Lead Time:</span>
          <span className="font-mono text-cyan-900 font-bold tabular-nums">
            +{currentWindow.forecast.forecast_lead_time_sec}s (~{(currentWindow.forecast.forecast_lead_time_sec / 60).toFixed(1)}m)
          </span>
        </div>
      </div>

      {/* Current State vs Forecast Target */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Current State Box */}
        <div className={`p-4 rounded-xl border glass-card shadow-sm ${currentStageStyle.bg} ${currentStageStyle.border}`}>
          <div className="text-[11px] text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between font-bold">
            <span>Observed Current State (t)</span>
            <span className="font-mono text-[10px] text-slate-500 font-semibold">Ground Truth</span>
          </div>
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <span className={`text-lg sm:text-xl font-extrabold tracking-tight ${currentStageStyle.text}`}>
              {currentWindow.actual_stage.replace(/_/g, ' ')}
            </span>
            <span className="text-xs font-mono text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm font-semibold">
              Host: <span className="text-cyan-800 font-bold">{currentWindow.host_id}</span>
            </span>
          </div>
        </div>

        {/* Projected Future State Box */}
        <div className={`p-4 rounded-xl border glass-card shadow-sm ${targetStageStyle.bg} ${targetStageStyle.border}`}>
          <div className="text-[11px] text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between font-bold">
            <span>Predicted Next Stage (t + {activeHorizon})</span>
            <span className="font-mono text-[10px] text-cyan-800 font-bold">Confidence: {(forecastData.probability * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <span className={`text-lg sm:text-xl font-extrabold tracking-tight ${targetStageStyle.text}`}>
              {forecastData.stage.replace(/_/g, ' ')}
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold shadow-sm">
              {(forecastData.probability * 100).toFixed(0)}% Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Horizon Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <span className="text-xs text-slate-700 font-bold">Forecast Lookahead Horizon:</span>
        <div className="flex items-center gap-1.5 p-1 glass-card rounded-full self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setActiveHorizon('1m')}
            className={`px-3.5 py-1 text-xs font-mono font-semibold rounded-full transition-all ${
              activeHorizon === '1m'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            t + 1 min
          </button>
          <button
            onClick={() => setActiveHorizon('2m')}
            className={`px-3.5 py-1 text-xs font-mono font-semibold rounded-full transition-all ${
              activeHorizon === '2m'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            t + 2 min
          </button>
          <button
            onClick={() => setActiveHorizon('5m')}
            className={`px-3.5 py-1 text-xs font-mono font-semibold rounded-full transition-all ${
              activeHorizon === '5m'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            t + 5 min
          </button>
        </div>
      </div>

      {/* Probability Distribution Spectrum */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span className="font-bold">Ranked MITRE ATT&CK Stage Probabilities</span>
          <span className="font-mono text-[11px] text-slate-500 font-semibold">World Model Softmax Distribution</span>
        </div>

        <div className="space-y-2">
          {forecastData.ranked_probs.slice(0, 5).map((item) => {
            const pct = Math.round(item.prob * 100);
            const isTop = item.stage === forecastData.stage;
            const style = STAGE_COLORS[item.stage] || STAGE_COLORS.BENIGN;

            return (
              <div key={item.stage} className="group glass-card rounded-xl p-2.5 transition-all shadow-sm">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`font-mono text-xs ${isTop ? `${style.text} font-bold` : 'text-slate-700 font-medium'}`}>
                    {item.stage.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-xs text-slate-800 font-bold tabular-nums">
                    {(item.prob * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isTop ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cyber World Model Rationale Banner */}
      <div className="p-3.5 glass-card rounded-xl text-xs text-slate-700 leading-relaxed flex items-start gap-3 shadow-sm border border-amber-900/10">
        <Crosshair className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Model Transition Rationale: </span>
          <span className="text-slate-700 font-medium">{currentWindow.explainability.top_rationale}</span>
        </div>
      </div>
    </div>
  );
};
