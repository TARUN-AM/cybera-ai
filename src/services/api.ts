import demoDataRaw from '../data/demo_forecasts.json';
import { 
  DemoDataset, 
  StateWindow, 
  TopologyNode, 
  TopologyEdge, 
  CounterfactualAction, 
  BaselineComparisonData,
  MitreStage
} from '../types/cyber';

const demoData = demoDataRaw as unknown as DemoDataset;

let activeCampaignId = 'apt29-infiltration';
let activeStepIndex = 3;
let activeIsolatedNodes: Set<string> = new Set();
let activeBlockedEdges: Set<string> = new Set();

export const CyberService = {
  getCampaigns() {
    return demoData.campaigns;
  },

  getActiveCampaignId() {
    return activeCampaignId;
  },

  setCampaign(campaignId: string) {
    activeCampaignId = campaignId;
    activeStepIndex = 1;
    activeIsolatedNodes.clear();
    activeBlockedEdges.clear();
  },

  getActiveStepIndex() {
    return activeStepIndex;
  },

  setStepIndex(step: number) {
    const windows = this.getTimelineWindows();
    activeStepIndex = Math.max(0, Math.min(step, windows.length - 1));
  },

  getTimelineWindows(): StateWindow[] {
    const windows = demoData.state_windows.filter(w => w.campaign_id === activeCampaignId);
    return windows.length > 0 ? windows : demoData.state_windows.slice(0, 9);
  },

  getCurrentState(): {
    stepIndex: number;
    totalSteps: number;
    window: StateWindow;
    networkRiskScore: number;
  } {
    const windows = this.getTimelineWindows();
    const currentWindow = windows[Math.min(activeStepIndex, windows.length - 1)] || windows[0];

    // Compute dynamic risk score taking isolated nodes into account
    let baseRisk = 15;
    if (currentWindow.actual_stage === 'RECONNAISSANCE') baseRisk = 42;
    else if (currentWindow.actual_stage === 'INITIAL_ACCESS') baseRisk = 68;
    else if (currentWindow.actual_stage === 'DISCOVERY') baseRisk = 74;
    else if (currentWindow.actual_stage === 'PRIVILEGE_ESCALATION') baseRisk = 82;
    else if (currentWindow.actual_stage === 'LATERAL_MOVEMENT') baseRisk = 89;
    else if (currentWindow.actual_stage === 'COMMAND_AND_CONTROL') baseRisk = 94;
    else if (currentWindow.actual_stage === 'EXFILTRATION_IMPACT') baseRisk = 99;

    if (activeIsolatedNodes.size > 0 || activeBlockedEdges.size > 0) {
      baseRisk = Math.max(12, Math.round(baseRisk * 0.28));
    }

    return {
      stepIndex: activeStepIndex,
      totalSteps: windows.length,
      window: currentWindow,
      networkRiskScore: baseRisk
    };
  },

  getTopology(): {
    nodes: TopologyNode[];
    edges: TopologyEdge[];
  } {
    const state = this.getCurrentState();
    const currentStage = state.window.actual_stage;
    const step = state.stepIndex;

    // Dynamically shade node risk and compromise based on current attack step
    const nodes = demoData.topology_nodes.map(node => {
      const isIsolated = activeIsolatedNodes.has(node.id);
      
      let isCompromised = false;
      let nodeRisk = 14;
      let nodeState: MitreStage = 'BENIGN';

      if (node.role === 'attacker') {
        isCompromised = true;
        nodeRisk = 96;
        nodeState = currentStage === 'BENIGN' ? 'RECONNAISSANCE' : currentStage;
      } else if (node.id === 'node-dmz-proxy') {
        if (step >= 1) {
          nodeRisk = 48;
          nodeState = 'RECONNAISSANCE';
        } else {
          nodeRisk = 18;
          nodeState = 'BENIGN';
        }
      } else if (node.id === 'node-dmz-web') {
        if (step >= 2) {
          isCompromised = true;
          nodeRisk = 78;
          nodeState = step === 2 ? 'INITIAL_ACCESS' : 'DISCOVERY';
        } else if (step === 1) {
          nodeRisk = 38;
          nodeState = 'RECONNAISSANCE';
        } else {
          nodeRisk = 15;
          nodeState = 'BENIGN';
        }
      } else if (node.id === 'node-ws-101') {
        if (step >= 4) {
          isCompromised = true;
          nodeRisk = 88;
          nodeState = step >= 6 ? 'LATERAL_MOVEMENT' : 'PRIVILEGE_ESCALATION';
        } else if (step >= 2) {
          nodeRisk = 35;
          nodeState = 'BENIGN';
        } else {
          nodeRisk = 12;
          nodeState = 'BENIGN';
        }
      } else if (node.id === 'node-ws-102') {
        if (step >= 6) {
          isCompromised = true;
          nodeRisk = 76;
          nodeState = 'LATERAL_MOVEMENT';
        } else if (step >= 4) {
          nodeRisk = 42;
          nodeState = 'BENIGN';
        } else {
          nodeRisk = 14;
          nodeState = 'BENIGN';
        }
      } else if (node.id === 'node-ws-103') {
        if (step >= 7) {
          nodeRisk = 46;
          nodeState = 'DISCOVERY';
        } else {
          nodeRisk = 15;
          nodeState = 'BENIGN';
        }
      } else if (node.id === 'node-srv-dc') {
        if (step >= 8) {
          isCompromised = true;
          nodeRisk = 94;
          nodeState = 'COMMAND_AND_CONTROL';
        } else if (step >= 6) {
          nodeRisk = 52;
          nodeState = 'DISCOVERY';
        } else {
          nodeRisk = 18;
          nodeState = 'BENIGN';
        }
      } else if (node.id === 'node-srv-db') {
        if (step >= 10) {
          isCompromised = true;
          nodeRisk = 99;
          nodeState = 'EXFILTRATION_IMPACT';
        } else if (step >= 8) {
          nodeRisk = 60;
          nodeState = 'COMMAND_AND_CONTROL';
        } else {
          nodeRisk = 16;
          nodeState = 'BENIGN';
        }
      } else if (node.id === 'node-iot-cam') {
        nodeRisk = step >= 3 ? 32 : 12;
        nodeState = 'BENIGN';
      }

      if (isIsolated) {
        nodeRisk = Math.round(nodeRisk * 0.15);
        isCompromised = false;
        nodeState = 'BENIGN';
      }

      return {
        ...node,
        isolated: isIsolated,
        compromised: isCompromised,
        risk_score: nodeRisk,
        current_state: isIsolated ? ('BENIGN' as MitreStage) : nodeState
      };
    });

    const edges = demoData.topology_edges.map(edge => ({
      ...edge,
      blocked: activeBlockedEdges.has(edge.id) || activeIsolatedNodes.has(edge.source) || activeIsolatedNodes.has(edge.target)
    }));

    return { nodes, edges };
  },

  getCounterfactualActions(): CounterfactualAction[] {
    return demoData.counterfactual_actions;
  },

  applyAction(actionId: string): CounterfactualAction {
    const action = demoData.counterfactual_actions.find(a => a.id === actionId) || demoData.counterfactual_actions[0];
    
    if (action.action_type === 'isolate_host') {
      activeIsolatedNodes.add('node-ws-101');
      activeBlockedEdges.add('e-web-ws101');
      activeBlockedEdges.add('e-ws101-ws102');
      activeBlockedEdges.add('e-ws101-dc');
    } else if (action.action_type === 'block_port') {
      activeBlockedEdges.add('e-ws101-ws102');
      activeBlockedEdges.add('e-ws101-dc');
    } else if (action.action_type === 'block_ip') {
      activeBlockedEdges.add('e-ext-dmz');
    } else if (action.action_type === 'segment_network') {
      activeBlockedEdges.add('e-web-ws101');
      activeBlockedEdges.add('e-proxy-web');
    }

    return action;
  },

  toggleEdgeBlock(edgeId: string): boolean {
    if (activeBlockedEdges.has(edgeId)) {
      activeBlockedEdges.delete(edgeId);
      return false;
    } else {
      activeBlockedEdges.add(edgeId);
      return true;
    }
  },

  toggleNodeQuarantine(nodeId: string): boolean {
    if (activeIsolatedNodes.has(nodeId)) {
      activeIsolatedNodes.delete(nodeId);
      return false;
    } else {
      activeIsolatedNodes.add(nodeId);
      return true;
    }
  },

  resetMitigations() {
    activeIsolatedNodes.clear();
    activeBlockedEdges.clear();
  },

  generateIncidentReport() {
    const state = this.getCurrentState();
    const topology = this.getTopology();
    return {
      timestamp: new Date().toISOString(),
      system: 'CYBERA: Predictive Cyber Attack Digital Twin',
      problem_statement: 'SIH26153 - AI-Based Network Attack Forecasting',
      campaign: activeCampaignId,
      current_stage: state.window.actual_stage,
      advance_warning_lead_seconds: state.window.forecast.forecast_lead_time_sec,
      forecast_horizons: {
        t_plus_1min: state.window.forecast.t_plus_1min,
        t_plus_2min: state.window.forecast.t_plus_2min,
        t_plus_5min: state.window.forecast.t_plus_5min,
      },
      explainability: state.window.explainability,
      baseline_comparison: demoData.baseline_comparison.metrics,
      active_quarantines: Array.from(activeIsolatedNodes),
      active_blocked_edges: Array.from(activeBlockedEdges),
      topology_nodes: topology.nodes.map(n => ({ id: n.id, ip: n.ip, risk: n.risk_score, isolated: n.isolated }))
    };
  },

  getBaselineComparison(): BaselineComparisonData {
    return demoData.baseline_comparison;
  }
};
