import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Activity, 
  Database, 
  SlidersHorizontal, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { DualLevelFeatureVector, StateWindow } from '../types/cyber';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentWindow: StateWindow;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onClose,
  currentWindow
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'all' | 'flow' | 'packet' | 'entropy'>('all');
  const feat = currentWindow.features;

  const featureList = [
    // Flow Level
    { name: 'src_ip', level: 'flow', value: feat.src_ip, benchmark: 'Internal CIDR', desc: 'Source IP Address' },
    { name: 'dst_ip', level: 'flow', value: feat.dst_ip, benchmark: '10.0.x.x', desc: 'Destination IP Address' },
    { name: 'dst_port', level: 'flow', value: feat.dst_port, benchmark: '80, 443, 445', desc: 'Destination Service Port' },
    { name: 'protocol', level: 'flow', value: feat.protocol === 6 ? 'TCP (6)' : 'UDP (17)', benchmark: 'TCP', desc: 'Transport Protocol' },
    { name: 'flow_duration_ms', level: 'flow', value: `${feat.flow_duration_ms} ms`, benchmark: '< 500 ms', desc: 'Flow Duration' },
    { name: 'fwd_pkts_per_sec', level: 'flow', value: feat.fwd_pkts_per_sec.toFixed(1), benchmark: '20 - 150', desc: 'Forward Packet Rate' },
    { name: 'bwd_pkts_per_sec', level: 'flow', value: feat.bwd_pkts_per_sec.toFixed(1), benchmark: '10 - 100', desc: 'Backward Packet Rate' },
    { name: 'flow_bytes_per_sec', level: 'flow', value: `${(feat.flow_bytes_per_sec / 1024).toFixed(1)} KB/s`, benchmark: '< 100 KB/s', desc: 'Network Throughput' },
    { name: 'syn_flag_count', level: 'flow', value: feat.syn_flag_count, benchmark: '< 15', desc: 'SYN Flags (Scan indicator)' },
    { name: 'rst_flag_count', level: 'flow', value: feat.rst_flag_count, benchmark: '< 5', desc: 'RST Flags (Teardowns)' },
    { name: 'psh_flag_count', level: 'flow', value: feat.psh_flag_count, benchmark: '< 10', desc: 'PSH Flags (Payload push)' },
    { name: 'down_up_ratio', level: 'flow', value: feat.down_up_ratio.toFixed(2), benchmark: '0.8 - 2.5', desc: 'Down/Up Traffic Asymmetry' },
    
    // Packet Level
    { name: 'avg_init_win_bytes', level: 'packet', value: feat.avg_init_win_bytes.toFixed(0), benchmark: '64,240 B', desc: 'TCP Initial Receive Window' },
    { name: 'tcp_win_variance', level: 'packet', value: feat.tcp_win_variance.toFixed(2), benchmark: '> 50.0', desc: 'TCP Window Variance' },
    { name: 'ttl_mean', level: 'packet', value: feat.ttl_mean.toFixed(1), benchmark: '64.0 (Linux/BSD)', desc: 'Mean Time-to-Live' },
    { name: 'ttl_variance', level: 'packet', value: feat.ttl_variance.toFixed(2), benchmark: '< 0.5', desc: 'TTL Routing Jitter' },
    { name: 'payload_entropy', level: 'packet', value: `${feat.payload_entropy.toFixed(2)} bits/byte`, benchmark: '3.0 - 5.5', desc: 'Payload Shannon Entropy (Encryption)' },

    // Behavioral Entropy
    { name: 'port_entropy (H_port)', level: 'entropy', value: feat.port_entropy.toFixed(3), benchmark: '< 1.20', desc: 'Target Port Entropy (Horizontal/Vertical)' },
    { name: 'dst_entropy (H_dst)', level: 'entropy', value: feat.dst_entropy.toFixed(3), benchmark: '< 1.00', desc: 'Target Destination IP Entropy' },
    { name: 'proto_entropy (H_proto)', level: 'entropy', value: feat.proto_entropy.toFixed(3), benchmark: '< 0.50', desc: 'Protocol Diversity Entropy' },
    { name: 'conn_rate_entropy (H_iat)', level: 'entropy', value: feat.conn_rate_entropy.toFixed(3), benchmark: '> 2.00', desc: 'Inter-Arrival Regularity (Beaconing)' },
    { name: 'subnetwork_fanout', level: 'entropy', value: feat.subnetwork_fanout.toFixed(3), benchmark: '< 0.10', desc: 'Subnet Fan-out Index (Lateral Spread)' }
  ];

  const filtered = activeTab === 'all' ? featureList : featureList.filter(f => f.level === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full glass-panel bg-[#fffaf0]/95 backdrop-blur-2xl border-l border-amber-900/15 p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto shadow-2xl">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-3 sm:pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-300 flex items-center justify-center text-cyan-700 shrink-0 shadow-sm">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Dual-Level Telemetry Inspector</h2>
              <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                Flow + Packet + Entropy vectors from {currentWindow.dataset_source}
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

        {/* Current Window Metadata */}
        <div className="p-3.5 rounded-xl glass-card border border-amber-900/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs shadow-sm">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Observed Stage</span>
            <span className="font-mono font-bold text-cyan-900">{currentWindow.actual_stage}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Host IP</span>
            <span className="font-mono font-bold text-slate-800">{currentWindow.host_ip}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Window Elapsed</span>
            <span className="font-mono font-bold text-slate-800">+{currentWindow.timestamp_offset_sec}s</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Generalization Split</span>
            <span className="font-mono font-bold text-amber-900">
              {currentWindow.is_held_out ? 'Held-Out Unseen' : 'Training Set'}
            </span>
          </div>
        </div>

        {/* Level Filters - with horizontal scroll on small devices */}
        <div className="flex items-center gap-1.5 p-1 glass-card rounded-full text-xs overflow-x-auto no-scrollbar shadow-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1 font-bold rounded-full transition-all ${
              activeTab === 'all' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            All Features ({featureList.length})
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3.5 py-1 font-bold rounded-full transition-all ${
              activeTab === 'flow' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            Flow Level (12)
          </button>
          <button
            onClick={() => setActiveTab('packet')}
            className={`px-3.5 py-1 font-bold rounded-full transition-all ${
              activeTab === 'packet' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            Packet Level (5)
          </button>
          <button
            onClick={() => setActiveTab('entropy')}
            className={`px-3.5 py-1 font-bold rounded-full transition-all ${
              activeTab === 'entropy' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            Behavioral Entropy (5)
          </button>
        </div>

        {/* Feature Table */}
        <div className="border border-amber-900/10 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 border-b border-amber-900/10 font-mono text-[11px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Feature Name</th>
                <th className="py-2.5 px-3">Telemetry Level</th>
                <th className="py-2.5 px-3">Observed Value</th>
                <th className="py-2.5 px-3">Nominal Baseline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10 font-mono">
              {filtered.map((item) => (
                <tr key={item.name} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-2 px-3">
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-500 font-sans font-medium">{item.desc}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      item.level === 'entropy' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                      item.level === 'packet' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-cyan-100 text-cyan-900 border border-cyan-300'
                    }`}>
                      {item.level}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-cyan-900">{item.value}</td>
                  <td className="py-2 px-3 text-slate-600 font-medium">{item.benchmark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
