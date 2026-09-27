import React from 'react';
import { 
  X, 
  FileText, 
  Clock, 
  MousePointer, 
  Mic, 
  Sparkles, 
  CheckCircle2,
  Sliders,
  TrendingUp,
  Award
} from 'lucide-react';

interface DemoScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoScriptModal: React.FC<DemoScriptModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[88vh] glass-panel bg-[#fffaf0]/95 backdrop-blur-2xl border border-amber-900/15 rounded-2xl p-6 flex flex-col gap-5 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>CYBERA Live Demo Runbook & Script</span>
                <span className="text-xs font-mono font-bold text-amber-900 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300">
                  DEMO_SCRIPT.md
                </span>
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Exact 3-minute presentation choreography, mouse actions, and judges' pitch
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

        {/* Script Steps List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl glass-card border border-amber-900/10 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 font-mono font-bold border border-cyan-300">
                  0:00 – 0:30
                </span>
                <span className="font-bold text-sm text-slate-900">The Core Problem & Reactive Posture</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px] font-medium">Zone 1 + Baseline Strip</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 font-medium">
              <MousePointer className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
              <span><strong>Action:</strong> Point to Header risk score and the persistent Baseline Comparison Strip at the bottom of the display.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-slate-800 italic flex items-start gap-2 leading-relaxed">
              <Mic className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                "Respected judges, every modern SOC solution today is fundamentally reactive. They detect an intrusion after the payload has dropped or credentials are stolen. Problem Statement SIH26153 demands proactive attack forecasting. CYBERA is a Cyber Digital Twin that uses dual-level telemetry to predict upcoming MITRE ATT&CK stages up to 5.7 minutes ahead of execution, compared to our baseline logistic regression which triggers only after the fact."
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl glass-card border border-amber-900/10 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 font-mono font-bold border border-cyan-300">
                  0:30 – 1:05
                </span>
                <span className="font-bold text-sm text-slate-900">Dual-Level Telemetry & Horizon Forecasting</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px] font-medium">Zones 2 & 4</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 font-medium">
              <MousePointer className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
              <span><strong>Action:</strong> Click "Dual Telemetry" in the top bar to display the 28-field inspector, then scrub the Time Machine to Window 3 (+90s, Initial Access).</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-slate-800 italic flex items-start gap-2 leading-relaxed">
              <Mic className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                "CYBERA doesn't just read packet headers. It computes dual-level behavioral features: Shannon entropy of ports, destination IPs, inter-arrival time regularities, and TCP window variance. Right here at Window 3, while current observed telemetry is still at Initial Access, our temporal world model already projects an 84% probability of Privilege Escalation at t+1m, and Lateral Movement targeting our Domain Controller at t+5m."
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl glass-card border border-amber-900/10 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 font-mono font-bold border border-cyan-300">
                  1:05 – 1:40
                </span>
                <span className="font-bold text-sm text-slate-900">Explainable AI (XAI): Self-Attention & SHAP</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px] font-medium">Zone 5</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 font-medium">
              <MousePointer className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
              <span><strong>Action:</strong> Direct attention to the Explainability Engine panel on the middle right.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-slate-800 italic flex items-start gap-2 leading-relaxed">
              <Mic className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                "Black-box neural networks cannot be trusted blindly in defense operations. CYBERA extracts temporal self-attention weights and SHAP risk attributions in real time. We can verify that high destination port entropy (+38%) and the SYN-to-RST flag anomaly (+27%) are the exact causal drivers compelling this forecast."
              </span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl glass-card border border-amber-900/10 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold border border-emerald-300">
                  1:40 – 2:25
                </span>
                <span className="font-bold text-sm text-slate-900">The Key Differentiator: Counterfactual Defense Simulator</span>
              </div>
              <span className="text-emerald-700 font-mono text-[11px] font-bold">Zones 6 & 3</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 font-medium">
              <MousePointer className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Action:</strong> Click "Isolate Compromised Host (WS-101)" in the Counterfactual Simulator panel.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-slate-800 italic flex items-start gap-2 leading-relaxed">
              <Mic className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                "And here is the game-changer: rather than just warning the analyst, CYBERA provides a Counterfactual Defense Simulator. With one click, we simulate host isolation or VLAN segmentation on our digital twin topology. Watch the forward rollout: our simulated risk immediately collapses by 84.1%, cutting off the adversary's lateral pivot to the Domain Controller and saving 4 downstream enterprise assets."
              </span>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl glass-card border border-amber-900/10 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 font-mono font-bold border border-cyan-300">
                  2:25 – 3:00
                </span>
                <span className="font-bold text-sm text-slate-900">Generalization to Unseen Campaigns & Conclusion</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px] font-medium">Evaluation Modal</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 font-medium">
              <MousePointer className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
              <span><strong>Action:</strong> Click "Evaluation Benchmark" in the top bar to display the 8-stage confusion matrices and Brier scores.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-slate-800 italic flex items-start gap-2 leading-relaxed">
              <Mic className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                "Crucially, our evaluation was performed with zero data leakage on held-out unseen attack campaigns from CIC-IDS2018 and CTU-13. CYBERA retains an 81.4% F1 score on campaigns it has never encountered before, giving defensive teams +371 seconds of proactive lead time. Thank you, we welcome your questions."
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-900/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm"
          >
            Close Runbook
          </button>
        </div>

      </div>
    </div>
  );
};
