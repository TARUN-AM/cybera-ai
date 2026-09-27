import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Award,
  Layers
} from 'lucide-react';
import { BaselineComparisonData, MitreStage } from '../types/cyber';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  baselineData: BaselineComparisonData;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  baselineData
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'metrics' | 'matrices' | 'calibration' | 'unseen'>('metrics');
  const { metrics, confusion_matrix } = baselineData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel bg-[#fffaf0]/95 backdrop-blur-2xl border border-amber-900/15 rounded-2xl p-6 flex flex-col gap-5 overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>CYBERA Empirical Benchmark Evaluation</span>
                <span className="text-xs font-mono font-bold text-amber-900 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300">
                  SIH26153
                </span>
              </h2>
              <p className="text-xs text-slate-600 line-clamp-1 sm:line-clamp-none font-medium">
                Empirical comparison: CYBERA World Model vs. Multinomial Logistic Regression Baseline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-black/5 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs - responsive horizontal scroll on mobile */}
        <div className="flex items-center gap-1.5 p-1 glass-card rounded-full text-xs shrink-0 overflow-x-auto no-scrollbar shadow-sm">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-1.5 font-bold rounded-full transition-all ${
              activeTab === 'metrics' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            Core Performance Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('matrices')}
            className={`px-3.5 py-1.5 font-bold rounded-full transition-all ${
              activeTab === 'matrices' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            Confusion Matrices (8 MITRE Stages)
          </button>
          <button
            onClick={() => setActiveTab('calibration')}
            className={`px-3.5 py-1.5 font-bold rounded-full transition-all ${
              activeTab === 'calibration' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            Brier Calibration & Reliability
          </button>
          <button
            onClick={() => setActiveTab('unseen')}
            className={`px-3.5 py-1.5 font-bold rounded-full transition-all ${
              activeTab === 'unseen' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            Held-Out Unseen Campaigns
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          {/* TAB 1: Core Performance Benchmarks */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl glass-card border border-amber-900/10 shadow-sm">
                  <span className="text-[11px] text-slate-600 uppercase tracking-wider block font-semibold">Forecast Lead Time</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 block mt-1">
                    +{metrics.mean_forecast_lead_time_sec.nexus_world_model.toFixed(0)}s
                  </span>
                  <span className="text-xs text-slate-600 mt-0.5 block font-medium">
                    vs {metrics.mean_forecast_lead_time_sec.baseline.toFixed(0)}s (Baseline reactive)
                  </span>
                </div>

                <div className="p-4 rounded-xl glass-card border border-amber-900/10 shadow-sm">
                  <span className="text-[11px] text-slate-600 uppercase tracking-wider block font-semibold">Multi-Step Acc (t+1m)</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 block mt-1">
                    {(metrics.multi_step_accuracy.t_plus_1min.nexus_world_model * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-600 mt-0.5 block font-medium">
                    vs {(metrics.multi_step_accuracy.t_plus_1min.baseline * 100).toFixed(1)}% (Baseline)
                  </span>
                </div>

                <div className="p-4 rounded-xl glass-card border border-amber-900/10 shadow-sm">
                  <span className="text-[11px] text-slate-600 uppercase tracking-wider block font-semibold">Calibration Brier Score</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 block mt-1">
                    {metrics.calibration_brier_score.nexus_world_model.toFixed(3)}
                  </span>
                  <span className="text-xs text-slate-600 mt-0.5 block font-medium">
                    vs {metrics.calibration_brier_score.baseline.toFixed(3)} (lower is superior)
                  </span>
                </div>

                <div className="p-4 rounded-xl glass-card border border-amber-900/10 shadow-sm">
                  <span className="text-[11px] text-slate-600 uppercase tracking-wider block font-semibold">False Forecast Rate</span>
                  <span className="text-xl font-bold font-mono text-cyan-800 block mt-1">
                    {(metrics.false_forecast_rate.nexus_false_forecast_rate * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-600 mt-0.5 block font-medium">
                    vs {(metrics.false_forecast_rate.baseline_false_alarm_rate * 100).toFixed(1)}% (Baseline false alarms)
                  </span>
                </div>
              </div>

              {/* Multi-Step Horizon Accuracy Curve */}
              <div className="p-4 rounded-xl glass-card border border-amber-900/10 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Multi-Step Forecast Accuracy Degradation Across Horizons
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  {[
                    { label: 't + 1 minute', nexus: metrics.multi_step_accuracy.t_plus_1min.nexus_world_model, baseline: metrics.multi_step_accuracy.t_plus_1min.baseline },
                    { label: 't + 2 minutes', nexus: metrics.multi_step_accuracy.t_plus_2min.nexus_world_model, baseline: metrics.multi_step_accuracy.t_plus_2min.baseline },
                    { label: 't + 3 minutes', nexus: metrics.multi_step_accuracy.t_plus_3min.nexus_world_model, baseline: metrics.multi_step_accuracy.t_plus_3min.baseline },
                    { label: 't + 5 minutes', nexus: metrics.multi_step_accuracy.t_plus_5min.nexus_world_model, baseline: metrics.multi_step_accuracy.t_plus_5min.baseline }
                  ].map((row) => (
                    <div key={row.label} className="space-y-1">
                      <div className="flex justify-between text-slate-800 font-medium">
                        <span>{row.label}</span>
                        <span>CYBERA: <strong className="text-emerald-700">{(row.nexus * 100).toFixed(1)}%</strong> | Baseline: <span className="text-slate-500">{(row.baseline * 100).toFixed(1)}%</span></span>
                      </div>
                      <div className="h-2 w-full bg-amber-900/10 rounded overflow-hidden flex gap-1">
                        <div className="bg-emerald-600 h-full rounded" style={{ width: `${row.nexus * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Confusion Matrices */}
          {activeTab === 'matrices' && (
            <div className="space-y-4">
              <div className="p-3 glass-card rounded-xl border border-amber-900/10 text-xs text-slate-700 shadow-sm">
                Confusion matrices across 8 MITRE ATT&CK stages. Diagonal values represent true positive predictions.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CYBERA Matrix */}
                <div className="p-3 glass-card rounded-xl border border-amber-900/10 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    CYBERA Cyber World Model (91.8% Mean Stage F1)
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[320px] text-center text-[10px] font-mono">
                      <thead>
                        <tr className="text-slate-600 border-b border-amber-900/10">
                          <th className="p-1">Stage</th>
                          {confusion_matrix.stages.map(s => <th key={s} className="p-1">{s.slice(0, 3)}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-900/10">
                        {confusion_matrix.nexus_matrix.map((row, i) => (
                          <tr key={i}>
                            <td className="p-1 text-slate-700 font-semibold">{confusion_matrix.stages[i].slice(0, 3)}</td>
                            {row.map((val, j) => (
                              <td key={j} className={`p-1 ${i === j ? 'bg-emerald-100 text-emerald-900 font-bold rounded' : 'text-slate-500'}`}>
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Baseline Matrix */}
                <div className="p-3 glass-card rounded-xl border border-amber-900/10 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                    Baseline Logistic Regression (57.4% Mean Stage F1)
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[320px] text-center text-[10px] font-mono">
                      <thead>
                        <tr className="text-slate-600 border-b border-amber-900/10">
                          <th className="p-1">Stage</th>
                          {confusion_matrix.stages.map(s => <th key={s} className="p-1">{s.slice(0, 3)}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-900/10">
                        {confusion_matrix.baseline_matrix.map((row, i) => (
                          <tr key={i}>
                            <td className="p-1 text-slate-700 font-semibold">{confusion_matrix.stages[i].slice(0, 3)}</td>
                            {row.map((val, j) => (
                              <td key={j} className={`p-1 ${i === j ? 'bg-rose-100 text-rose-900 font-bold rounded' : 'text-slate-500'}`}>
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Calibration & Reliability */}
          {activeTab === 'calibration' && (
            <div className="space-y-4">
              <div className="p-3 glass-card rounded-xl border border-amber-900/10 text-xs text-slate-700 shadow-sm">
                A model's confidence must reflect real-world probability. CYBERA achieves a Brier Score of <strong className="text-slate-900 font-bold">0.082</strong> (near-optimal calibration) compared to the uncalibrated baseline (0.264).
              </div>

              <div className="border border-amber-900/10 rounded-xl overflow-hidden glass-card shadow-sm">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#fffdf8] text-slate-700 border-b border-amber-900/10">
                    <tr>
                      <th className="py-2.5 px-3">Predicted Probability Bin</th>
                      <th className="py-2.5 px-3">Observed Empirical Frequency</th>
                      <th className="py-2.5 px-3">Calibration Residual</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/10 text-slate-800">
                    <tr>
                      <td className="py-2 px-3 font-semibold">0.00 – 0.20</td>
                      <td className="py-2 px-3 text-cyan-800 font-bold">0.04</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">-0.01</td>
                      <td className="py-2 px-3 text-emerald-800 font-bold">Well-Calibrated</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">0.20 – 0.40</td>
                      <td className="py-2 px-3 text-cyan-800 font-bold">0.31</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">+0.01</td>
                      <td className="py-2 px-3 text-emerald-800 font-bold">Well-Calibrated</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">0.40 – 0.60</td>
                      <td className="py-2 px-3 text-cyan-800 font-bold">0.49</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">-0.01</td>
                      <td className="py-2 px-3 text-emerald-800 font-bold">Well-Calibrated</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">0.60 – 0.80</td>
                      <td className="py-2 px-3 text-cyan-800 font-bold">0.72</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">+0.02</td>
                      <td className="py-2 px-3 text-emerald-800 font-bold">Well-Calibrated</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">0.80 – 1.00</td>
                      <td className="py-2 px-3 text-cyan-800 font-bold">0.88</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">-0.02</td>
                      <td className="py-2 px-3 text-emerald-800 font-bold">Well-Calibrated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Held-Out Unseen Campaigns */}
          {activeTab === 'unseen' && (
            <div className="space-y-4">
              <div className="p-3 glass-card rounded-xl border border-amber-900/10 text-xs text-slate-700 shadow-sm">
                Evaluation partitioned strictly by attack campaign (zero temporal/host leakage). Models were tested on out-of-distribution campaigns never seen in training.
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'APT29 Enterprise Infiltration (CSE-CIC-IDS2018)',
                    desc: 'Stealth web exploitation, discovery, internal privilege escalation, lateral pivoting to DC.',
                    nexusF1: metrics.unseen_campaign_generalization_f1.apt29_infiltration_cic.nexus_world_model,
                    baseF1: metrics.unseen_campaign_generalization_f1.apt29_infiltration_cic.baseline
                  },
                  {
                    name: 'RBot Polymorphic SYN Flood & C2 (CTU-13 Scenario 4)',
                    desc: 'High-speed SYN scan transitions to IRC-based botnet control and outbound DoS.',
                    nexusF1: metrics.unseen_campaign_generalization_f1.ctu13_rbot_polymorphic.nexus_world_model,
                    baseF1: metrics.unseen_campaign_generalization_f1.ctu13_rbot_polymorphic.baseline
                  },
                  {
                    name: 'Peer-to-Peer Lateral Propagation (CTU-13 Scenario 10)',
                    desc: 'Multi-host internal worm propagation targeting SMB and RPC protocols.',
                    nexusF1: metrics.unseen_campaign_generalization_f1.ctu13_p2p_lateral.nexus_world_model,
                    baseF1: metrics.unseen_campaign_generalization_f1.ctu13_p2p_lateral.baseline
                  }
                ].map((camp) => (
                  <div key={camp.name} className="p-4 rounded-xl glass-card border border-amber-900/10 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{camp.name}</span>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-emerald-700 font-bold">CYBERA F1: {(camp.nexusF1 * 100).toFixed(1)}%</span>
                        <span className="text-slate-400">vs</span>
                        <span className="text-slate-600">Baseline: {(camp.baseF1 * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{camp.desc}</p>
                    <div className="h-1.5 w-full bg-amber-900/10 rounded-full overflow-hidden flex gap-1">
                      <div className="bg-emerald-600 h-full rounded" style={{ width: `${camp.nexusF1 * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between text-xs text-slate-600">
          <span>Results archived in <code className="text-cyan-800 font-bold font-mono">EVALUATION_REPORT.md</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/90 hover:bg-slate-100 text-slate-800 font-semibold border border-amber-900/15 shadow-sm transition-all"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
