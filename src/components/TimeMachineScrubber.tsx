import React from 'react';
import { 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { StateWindow, MitreStage } from '../types/cyber';

interface TimeMachineScrubberProps {
  windows: StateWindow[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const STAGE_BADGES: Record<MitreStage, { short: string; color: string; bg: string }> = {
  BENIGN: { short: 'BENIGN', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  RECONNAISSANCE: { short: 'RECON', color: 'text-sky-700', bg: 'bg-sky-100' },
  INITIAL_ACCESS: { short: 'INIT_ACC', color: 'text-amber-800', bg: 'bg-amber-100' },
  DISCOVERY: { short: 'DISCOV', color: 'text-yellow-800', bg: 'bg-yellow-100' },
  PRIVILEGE_ESCALATION: { short: 'PRIV_ESC', color: 'text-orange-800', bg: 'bg-orange-100' },
  LATERAL_MOVEMENT: { short: 'LAT_MOV', color: 'text-rose-800', bg: 'bg-rose-100' },
  COMMAND_AND_CONTROL: { short: 'C2', color: 'text-red-800', bg: 'bg-red-100' },
  EXFILTRATION_IMPACT: { short: 'EXFIL', color: 'text-purple-800', bg: 'bg-purple-100' }
};

export const TimeMachineScrubber: React.FC<TimeMachineScrubberProps> = ({
  windows,
  currentIndex,
  onSelectIndex,
  isPlaying,
  onTogglePlay
}) => {
  const current = windows[currentIndex] || windows[0];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
      {/* Header with Timeline Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-amber-900/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-300 flex items-center justify-center text-cyan-700 shrink-0 shadow-sm">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Attack Progression Timeline</span>
              <span className="text-[11px] font-mono text-cyan-800 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-300 font-semibold">
                5s Continuous Telemetry
              </span>
            </h2>
          </div>
        </div>

        {/* Step Nav Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-600 font-mono font-medium">
            Window <span className="text-cyan-800 font-bold">{currentIndex + 1}</span> of {windows.length}
          </span>
          <div className="flex items-center gap-1.5 glass-card rounded-full p-1 shadow-sm">
            <button
              onClick={() => onSelectIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 rounded-full transition-all"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePlay}
              className="px-3 py-1 text-xs font-mono text-cyan-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-full flex items-center gap-1.5 transition-all font-bold shadow-sm"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-700" /> : <Play className="w-3.5 h-3.5 text-cyan-700" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => onSelectIndex(Math.min(windows.length - 1, currentIndex + 1))}
              disabled={currentIndex === windows.length - 1}
              className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 rounded-full transition-all"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrubber Strip */}
      <div className="relative pt-7 pb-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[760px] relative px-4">
          
          {/* Connecting line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-amber-900/10 rounded-full -z-0" />
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full -z-0 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            style={{ 
              width: `${(currentIndex / Math.max(1, windows.length - 1)) * 92}%` 
            }}
          />

          {windows.map((win, idx) => {
            const isCurrent = idx === currentIndex;
            const isPast = idx < currentIndex;
            const badge = STAGE_BADGES[win.actual_stage] || STAGE_BADGES.BENIGN;

            return (
              <div 
                key={win.window_id}
                onClick={() => onSelectIndex(idx)}
                className="flex flex-col items-center cursor-pointer group relative z-10"
              >
                {/* "YOU ARE HERE" Indicator */}
                {isCurrent && (
                  <div className="absolute -top-8 flex flex-col items-center animate-bounce">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-extrabold tracking-tight shadow-[0_2px_8px_rgba(245,158,11,0.6)]">
                      ACTIVE T
                    </span>
                    <MapPin className="w-3.5 h-3.5 text-amber-500 -mt-1" />
                  </div>
                )}

                {/* Node Pill */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[11px] font-bold transition-all duration-200 border ${
                    isCurrent
                      ? 'bg-amber-500 text-white border-white shadow-[0_4px_16px_rgba(245,158,11,0.5)] scale-110'
                      : isPast
                      ? 'bg-white text-slate-800 border-amber-300 shadow-sm hover:border-amber-500'
                      : 'bg-[#fffaf0] text-slate-500 border-amber-900/15 hover:border-slate-400'
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Stage Label Below */}
                <span className={`text-[10.5px] font-mono mt-2 tracking-tight whitespace-nowrap ${
                  isCurrent ? `${badge.color} font-bold` : isPast ? 'text-slate-800 font-semibold' : 'text-slate-500 font-medium'
                }`}>
                  {badge.short}
                </span>

                {/* Timestamp */}
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                  +{win.timestamp_offset_sec}s
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trajectory Forecast Horizon Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs glass-card rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-4 h-4 text-cyan-700 shrink-0" />
          <span className="text-slate-600 font-medium">Active Window Elapsed:</span>
          <span className="font-mono text-cyan-900 font-bold">T + {current.timestamp_offset_sec}s</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-mono text-[11px]">t+1m:</span>
            <span className="font-mono text-cyan-800 font-bold">
              {current.forecast.t_plus_1min.stage} ({(current.forecast.t_plus_1min.probability * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-mono text-[11px]">t+2m:</span>
            <span className="font-mono text-amber-800 font-bold">
              {current.forecast.t_plus_2min.stage} ({(current.forecast.t_plus_2min.probability * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-mono text-[11px]">t+5m:</span>
            <span className="font-mono text-rose-800 font-bold">
              {current.forecast.t_plus_5min.stage} ({(current.forecast.t_plus_5min.probability * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
