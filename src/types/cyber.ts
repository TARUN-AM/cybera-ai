export type MitreStage = 
  | 'BENIGN'
  | 'RECONNAISSANCE'
  | 'INITIAL_ACCESS'
  | 'DISCOVERY'
  | 'PRIVILEGE_ESCALATION'
  | 'LATERAL_MOVEMENT'
  | 'COMMAND_AND_CONTROL'
  | 'EXFILTRATION_IMPACT';

export interface DualLevelFeatureVector {
  src_ip: string;
  dst_ip: string;
  dst_port: number;
  protocol: number;
  flow_duration_ms: number;
  fwd_pkts_per_sec: number;
  bwd_pkts_per_sec: number;
  flow_bytes_per_sec: number;
  pkt_len_mean: number;
  pkt_len_std: number;
  fwd_iat_mean: number;
  bwd_iat_mean: number;
  syn_flag_count: number;
  rst_flag_count: number;
  ack_flag_count: number;
  fin_flag_count: number;
  psh_flag_count: number;
  down_up_ratio: number;
  avg_init_win_bytes: number;
  tcp_win_variance: number;
  ttl_mean: number;
  ttl_variance: number;
  payload_entropy: number;
  port_entropy: number;
  dst_entropy: number;
  proto_entropy: number;
  conn_rate_entropy: number;
  subnetwork_fanout: number;
}

export interface StateWindow {
  window_id: number;
  timestamp_offset_sec: number;
  host_id: string;
  host_ip: string;
  host_role: 'workstation' | 'server' | 'domain_controller' | 'dmz_gateway' | 'iot_device' | 'database';
  campaign_id: string;
  campaign_name: string;
  dataset_source: 'CIC-IDS2018' | 'CTU-13';
  is_held_out: boolean;
  actual_stage: MitreStage;
  baseline_predicted_stage: MitreStage;
  baseline_stage_probs: Record<MitreStage, number>;
  baseline_detection_lead_sec: number;
  features: DualLevelFeatureVector;
  forecast: {
    t_plus_1min: { stage: MitreStage; probability: number; ranked_probs: { stage: MitreStage; prob: number }[] };
    t_plus_2min: { stage: MitreStage; probability: number; ranked_probs: { stage: MitreStage; prob: number }[] };
    t_plus_5min: { stage: MitreStage; probability: number; ranked_probs: { stage: MitreStage; prob: number }[] };
    confidence_score: number;
    forecast_lead_time_sec: number;
  };
  explainability: {
    attention_weights: { feature: string; weight: number; contribution_pct: number; raw_val: number; benchmark: number }[];
    top_rationale: string;
    shap_factors: { factor: string; direction: 'increases_risk' | 'decreases_risk'; impact: number }[];
  };
}

export interface TopologyNode {
  id: string;
  ip: string;
  label: string;
  role: 'workstation' | 'server' | 'domain_controller' | 'dmz_gateway' | 'iot_device' | 'database' | 'attacker';
  subnet: string;
  os: string;
  current_state: MitreStage;
  predicted_state_5m: MitreStage;
  risk_score: number;
  compromised: boolean;
  isolated: boolean;
  x: number;
  y: number;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  protocol: string;
  port: number;
  bytes_per_sec: number;
  flow_count: number;
  threat_level: 'nominal' | 'suspicious' | 'critical';
  blocked: boolean;
}

export interface CounterfactualAction {
  id: string;
  action_type: 'block_ip' | 'isolate_host' | 'block_port' | 'segment_network';
  target: string;
  label: string;
  description: string;
  simulated_risk_before: number;
  simulated_risk_after: number;
  risk_reduction_pct: number;
  blast_radius_nodes_saved: number;
  before_forecast: Record<MitreStage, number>;
  after_forecast: Record<MitreStage, number>;
  recommendation_strength: 'CRITICAL_RECOMMENDED' | 'HIGH_RECOMMENDED' | 'MODERATE' | 'NOT_ADVISED';
  technical_command: string;
}

export interface BaselineComparisonData {
  baseline_name: string;
  world_model_name: string;
  evaluation_date: string;
  metrics: {
    mean_forecast_lead_time_sec: {
      baseline: number;
      nexus_world_model: number;
      lead_time_delta_sec: number;
    };
    multi_step_accuracy: {
      t_plus_1min: { baseline: number; nexus_world_model: number };
      t_plus_2min: { baseline: number; nexus_world_model: number };
      t_plus_3min: { baseline: number; nexus_world_model: number };
      t_plus_5min: { baseline: number; nexus_world_model: number };
    };
    unseen_campaign_generalization_f1: {
      apt29_infiltration_cic: { baseline: number; nexus_world_model: number };
      ctu13_rbot_polymorphic: { baseline: number; nexus_world_model: number };
      ctu13_p2p_lateral: { baseline: number; nexus_world_model: number };
      overall_held_out_mean: { baseline: number; nexus_world_model: number };
    };
    false_forecast_rate: {
      baseline_false_alarm_rate: number;
      nexus_false_forecast_rate: number;
    };
    calibration_brier_score: {
      baseline: number;
      nexus_world_model: number;
    };
  };
  confusion_matrix: {
    stages: MitreStage[];
    baseline_matrix: number[][];
    nexus_matrix: number[][];
  };
}

export interface DemoDataset {
  campaigns: { id: string; name: string; dataset: string; is_held_out: boolean; target_host: string }[];
  topology_nodes: TopologyNode[];
  topology_edges: TopologyEdge[];
  counterfactual_actions: CounterfactualAction[];
  state_windows: StateWindow[];
  baseline_comparison: BaselineComparisonData;
}
