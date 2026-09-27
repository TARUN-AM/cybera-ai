# CYBERA Hackathon Live Demo Script (DEMO_SCRIPT.md)
### Problem Statement: SIH26153 (AI-Based Network Attack Forecasting)

---

### Timing: Exactly 3 Minutes (Strict Pitch Window)
*Preparation before judges arrive:* Ensure CYBERA is running on localhost:3000 in Replay Mode with campaign set to `APT29 Enterprise Infiltration (Held-Out Unseen A)`.

---

### Step-by-Step Presentation Runbook

#### 0:00 – 0:30 | The Core Problem & Hook (Zone 1 & Baseline Strip)
- **Presenter Action:** Point to the Header and the persistent Baseline Comparison Strip at the bottom of the screen.
- **Presenter Pitch:** 
  > *"Respected judges, every modern SOC solution today is fundamentally reactive. They detect an intrusion after the payload has dropped, after credentials are stolen, or after lateral movement has begun. Problem Statement SIH26153 demands proactive attack forecasting. CYBERA is a Cyber Digital Twin that uses dual-level telemetry to predict impending MITRE ATT&CK stages up to 5.7 minutes ahead of execution, compared to our baseline logistic regression which triggers only after the fact."*

#### 0:30 – 1:05 | Dual-Level Telemetry & State Forecasting (Zones 2 & 4)
- **Presenter Action:** Click the **"Dual Telemetry"** button in the top bar to briefly show the 28-dimensional flow + packet + entropy inspector, then close it. Move the Time Machine Scrubber to **Window 3 (+90s, Initial Access)**.
- **Presenter Pitch:** 
  > *"CYBERA doesn't just read packet headers. It computes dual-level behavioral features: Shannon entropy of ports, destination IPs, inter-arrival time regularities, and TCP window variance. Right here at Window 3, while current observed telemetry is still at Initial Access, our temporal world model already projects an 84% probability of Privilege Escalation at t+1 minute, and Lateral Movement targeting our Domain Controller at t+5 minutes."*

#### 1:05 – 1:40 | Explainability: "Why This Forecast?" (Zone 5)
- **Presenter Action:** Highlight the **Explainability Engine (XAI)** panel in the middle-right.
- **Presenter Pitch:** 
  > *"Black-box neural networks cannot be trusted blindly in defense operations. CYBERA extracts temporal self-attention weights and SHAP risk attributions in real time. We can verify that high destination port entropy (+38%) and the SYN-to-RST flag anomaly (+27%) are the exact causal drivers compelling this forecast."*

#### 1:40 – 2:25 | The Key Differentiator: Counterfactual Defense Simulator (Zone 6 & 3)
- **Presenter Action:** In the Counterfactual Simulator panel, click **"Isolate Compromised Host (WS-101)"**.
- **Presenter Pitch (The Exact Pitch Mandated by SIH26153):**
  > *"And here is the game-changer: rather than just warning the analyst, CYBERA provides a Counterfactual Defense Simulator. With one click, we simulate host isolation or VLAN segmentation on our digital twin topology. Watch the forward rollout: our simulated risk immediately collapses by 84.1%, cutting off the adversary's lateral pivot to the Domain Controller and saving 4 downstream enterprise assets."*
- **Visual Callout:** Note that the edge to the Domain Controller turns dashed/quarantined, and the disclaimer prominently states: *"Simulated Defensive Impact based on Empirical Transition Probabilities — Never Guaranteed Prevention."*

#### 2:25 – 3:00 | Generalization & Empirical Benchmark Proof (Header & Evaluation Modal)
- **Presenter Action:** Click **"Evaluation Benchmark"** in the top bar to display the 8-stage confusion matrices, the 0.082 Brier calibration score, and the generalization F1 score across unseen campaigns.
- **Presenter Pitch:** 
  > *"Crucially, our evaluation was performed with zero data leakage on held-out unseen attack campaigns from CIC-IDS2018 and CTU-13. CYBERA retains an 81.4% F1 score on campaigns it has never encountered before, giving defensive teams +371 seconds of proactive lead time. Thank you, we welcome your questions."*
