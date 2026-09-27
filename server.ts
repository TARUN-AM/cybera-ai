import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Load precomputed dataset & forecasts
const dataPath = path.join(__dirname, 'src/data/demo_forecasts.json');
let demoData: any = null;

try {
  if (fs.existsSync(dataPath)) {
    demoData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }
} catch (err) {
  console.error('Failed to load demo_forecasts.json', err);
}

// Current replay simulation state
let currentStepIndex = 3; // Default to initial access / priv esc phase
let currentCampaignId = 'apt29-infiltration';

// --- API Endpoints ---

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CYBERA Cyber Attack Forecasting Engine',
    model_version: 'v2.4-transformer-graph',
    mode: 'dual-mode (live-inference + deterministic replay)'
  });
});

// Current State
app.get('/api/state/current', (req: Request, res: Response) => {
  if (!demoData) {
    return res.status(500).json({ error: 'Data not initialized' });
  }

  const campaignWindows = demoData.state_windows.filter(
    (w: any) => w.campaign_id === currentCampaignId
  );

  const currentWindow =
    campaignWindows[
      Math.min(currentStepIndex, campaignWindows.length - 1)
    ] || campaignWindows[0];

  res.json({
    step_index: currentStepIndex,
    total_steps: campaignWindows.length,
    current_window: currentWindow,
    network_risk_score:
      currentWindow.actual_stage === 'BENIGN'
        ? 14
        : currentWindow.actual_stage === 'RECONNAISSANCE'
        ? 38
        : currentWindow.actual_stage === 'INITIAL_ACCESS'
        ? 68
        : 88,
    timestamp: new Date().toISOString()
  });
});

// Forecast per host
app.get('/api/forecast/:host_id', (req: Request, res: Response) => {
  if (!demoData) {
    return res.status(500).json({ error: 'Data not initialized' });
  }

  const hostId = req.params.host_id;

  const campaignWindows = demoData.state_windows.filter(
    (w: any) => w.campaign_id === currentCampaignId
  );

  const currentWindow =
    campaignWindows[
      Math.min(currentStepIndex, campaignWindows.length - 1)
    ] || campaignWindows[0];

  res.json({
    host_id: hostId,
    current_stage: currentWindow.actual_stage,
    forecast: currentWindow.forecast,
    confidence_score: currentWindow.forecast.confidence_score,
    lead_time_seconds:
      currentWindow.forecast.forecast_lead_time_sec
  });
});

// Explainability
app.get('/api/explain/:prediction_id', (req: Request, res: Response) => {
  if (!demoData) {
    return res.status(500).json({ error: 'Data not initialized' });
  }

  const campaignWindows = demoData.state_windows.filter(
    (w: any) => w.campaign_id === currentCampaignId
  );

  const currentWindow =
    campaignWindows[
      Math.min(currentStepIndex, campaignWindows.length - 1)
    ] || campaignWindows[0];

  res.json({
    prediction_id: req.params.prediction_id,
    target_stage: currentWindow.forecast.t_plus_1min.stage,
    attention_weights:
      currentWindow.explainability.attention_weights,
    shap_factors: currentWindow.explainability.shap_factors,
    top_rationale: currentWindow.explainability.top_rationale
  });
});

// Counterfactual Simulation
app.post('/api/simulate', (req: Request, res: Response) => {
  if (!demoData) {
    return res.status(500).json({ error: 'Data not initialized' });
  }

  const { action_id, action_type, target } = req.body;

  let action = demoData.counterfactual_actions.find(
    (a: any) => a.id === action_id
  );

  if (!action) {
    action = demoData.counterfactual_actions[0];
  }

  res.json({
    action: action,
    timestamp: new Date().toISOString(),
    status: 'SIMULATION_CONVERGED',
    disclaimer:
      'Simulated Defensive Impact based on Empirical Transition Probabilities — Never Guaranteed Prevention'
  });
});

// Digital Twin Topology
app.get('/api/topology', (req: Request, res: Response) => {
  if (!demoData) {
    return res.status(500).json({ error: 'Data not initialized' });
  }

  res.json({
    nodes: demoData.topology_nodes,
    edges: demoData.topology_edges,
    timestamp: new Date().toISOString()
  });
});

// Attack Timeline
app.get('/api/timeline/:host_id', (req: Request, res: Response) => {
  if (!demoData) {
    return res.status(500).json({ error: 'Data not initialized' });
  }

  const campaignWindows = demoData.state_windows.filter(
    (w: any) => w.campaign_id === currentCampaignId
  );

  res.json({
    host_id: req.params.host_id,
    campaign_id: currentCampaignId,
    current_step: currentStepIndex,
    windows: campaignWindows
  });
});

// Baseline Comparison
app.get('/api/baseline-comparison', (req: Request, res: Response) => {
  if (!demoData) {
    return res.status(500).json({ error: 'Data not initialized' });
  }

  res.json(demoData.baseline_comparison);
});

// Available campaigns
app.get('/api/campaigns', (req: Request, res: Response) => {
  if (!demoData) {
    return res.status(500).json({ error: 'Data not initialized' });
  }

  res.json(demoData.campaigns);
});

// Set replay step or campaign
app.post('/api/replay/step', (req: Request, res: Response) => {
  const { step, campaign_id } = req.body;

  if (typeof step === 'number') {
    currentStepIndex = step;
  }

  if (campaign_id) {
    currentCampaignId = campaign_id;
  }

  res.json({
    success: true,
    currentStepIndex,
    currentCampaignId
  });
});

// Start Server and mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');

    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    // In production, serve built assets
    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `CYBERA Cyber Digital Twin running on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();