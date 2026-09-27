# NEXUS: Predictive Cyber Attack Digital Twin
## Problem Restatement & Architectural Charter (SIH26153)

### 1. Executive Summary & Core Challenge
Contemporary Security Operations Centers (SOCs) operate almost exclusively in a **reactive posture**. Intrusion Detection and Prevention Systems (IDS/IPS), Security Information and Event Management (SIEM), and Extended Detection and Response (XDR) solutions alert analysts **after** an adversary executes a malicious payload, completes an exploit, or triggers an anomaly threshold. In modern high-velocity attacks (e.g., automated ransomware, lateral living-off-the-land techniques, zero-day propagation), reactive detection occurs too late—the perimeter is breached, credentials are dumped, or exfiltration has commenced.

**Problem Statement SIH26153** mandates an architectural paradigm shift: **Network Attack Forecasting**. Rather than detecting what already happened ($t \le 0$), the system must predict adversary intent, trajectory, and upcoming attack stages ($t+1, t+2, t+5 \text{ min}$) before critical targets are compromised.

---

### 2. Detection vs. Forecasting: The Paradigm Shift

| Dimension | Reactive Cyber Detection (Status Quo) | Predictive Cyber Attack Forecasting (NEXUS) |
| :--- | :--- | :--- |
| **Temporal Focus** | Past and immediate present ($t \le 0$) | Future attack trajectories ($t + \Delta t$, e.g., $+1\text{m}, +2\text{m}, +5\text{m}$) |
| **Operational Trigger** | Signature match, threshold breach, or single-packet anomaly | Pre-attack behavioral precursors, exploratory micro-probes, state-transition probabilities |
| **Analyst Reaction** | Post-incident triage, damage containment, incident forensics | Proactive countermeasure preemption, blast-radius mitigation, adversary denial |
| **Model Formulation** | Classification: $y = f(x_t) \in \{0, 1\}$ | Cyber World Model: $P(S_{t+k} \mid S_{\le t}, A_{<t})$ |
| **Lead Time** | **Negative lead time** (-3 to -45 minutes post-compromise) | **Positive lead time** (+4.2 to +14.8 minutes advance warning) |

---

### 3. Dual-Level Telemetry Architecture: Flow + Packet Synergy
Adversaries intentionally obfuscate their actions to evade coarse flow counters or fine-grained deep packet inspection (DPI) in isolation. NEXUS resolves this via **dual-level unified telemetry**:

1. **Flow-Level Telemetry (Macro-Dynamics):**
   - Source/Destination IP, Ports, Transport Protocol (TCP, UDP, ICMP).
   - Bidirectional metrics: Flow duration, bytes/packets sent and received, forward/backward inter-arrival times (IAT), flow rate (bytes/s, packets/s).
   - TCP flag distributions (SYN, ACK, RST, FIN, PSH, URG).
   - Behavioral window entropy: Shannon entropy of destination ports, protocols, IP subnets, and connection timing.

2. **Packet-Level Telemetry (Micro-Signatures):**
   - IP Time-To-Live (TTL) variance (detecting proxying, OS fingerprinting, decoy scans).
   - TCP Window Size distributions and MSS negotiation patterns.
   - Packet length distribution skewness and payload entropy (identifying encrypted C2 beacons vs. benign HTTPS).
   - Micro-retransmissions and out-of-order packets (signaling port-knocking or fragmented evasion attempts).

---

### 4. Mathematical Formulation: The Cyber World Model
We formulate network security dynamics as a partially observable discrete-time transition system:

$$P(S_{t+1} \mid S_{\le t}) = \text{Softmax}\left( W_h \cdot \text{TemporalModel}\left( \Phi(x_t), \Phi(x_{t-1}), \dots, \Phi(x_{t-W}) \right) \right)$$

Where:
- $S_t \in \mathcal{S}$ represents the discrete network state at window $t$, explicitly mapped to the **MITRE ATT&CK Enterprise Matrix**:
  - `Benign (Nominal Operation)`
  - `Reconnaissance (T1595 - Active Scanning, T1046 - Network Service Discovery)`
  - `Initial Access (T1190 - Exploit Public-Facing App, T1078 - Valid Accounts)`
  - `Discovery & Enumeration (T1087 - Account Discovery, T1082 - System Info)`
  - `Privilege Escalation (T1068 - Exploitation for Privilege Escalation)`
  - `Lateral Movement (T1021 - Remote Services / SMB / SSH, T1570 - Lateral Tool Transfer)`
  - `Command & Control (C2) (T1071 - Application Layer Protocol, Beaconing)`
  - `Exfiltration & Impact (T1041 - Exfiltration Over C2, T1486 - Data Encrypted for Impact)`
- $\Phi(x_t)$ is the fused flow + packet + entropy representation for host $h$ at time window $t$.
- $W$ is the historical sliding window context (default: 8 to 16 timesteps, 5-second windows).

Multi-step ahead forecasting over horizon $K \in \{1, 2, 5, 10\}$:
$$P(S_{t+k} = s \mid S_{\le t}) = \sum_{s'} P(S_{t+k} = s \mid S_{t+k-1} = s') P(S_{t+k-1} = s' \mid S_{\le t})$$

---

### 5. Explicit Deliverables & Key Objectives
1. **Multi-Step Forecast Engine:** Ranked probabilistic predictions for next attack phases ($t+1\text{m}, t+2\text{m}, t+5\text{m}$) with calibrated uncertainty bounds.
2. **MITRE ATT&CK Stage Mapping:** Grounded tactical taxonomy enabling direct operational SOC workflows.
3. **Rigorous Baseline Comparison:** Direct evaluation against a Logistic Regression classifier (current-state classification vs. temporal multi-step forecasting lead time).
4. **Generalization Across Unseen Campaigns:** Campaign-level train/test splits (trained on specific attack vectors, tested on entirely held-out attack campaigns from CIC-IDS2018 and CTU-13).
5. **Explainable AI (XAI):** Temporal attention weights and SHAP-derived feature attributions translating black-box tensors into actionable analyst rationale ("SYN flood ratio +38%, Dest Port Entropy +24%").
6. **Air-Gapped & Offline Capable:** Fully self-contained runtime with embedded models, deterministic replay mode, and zero external dependency requirements during operational triage.

---

### 6. The Core Differentiator: Cyber Digital Twin & Counterfactual Defense Simulator
Typical security prototypes stop at passive anomaly scoring or static charts. **NEXUS pioneers an active Cyber Digital Twin with a Counterfactual Defense Simulator**:

- **Real-Time Digital Twin Topology:** An interactive graph model representing enterprise hosts (Workstations, Domain Controllers, DMZ Web Servers, Database Clusters, IoT Gateways), active communication edges, protocol weights, and dynamic risk states.
- **Counterfactual "What-If" Simulation:** When NEXUS forecasts an impending Lateral Movement or C2 stage, analysts can inject hypothetical defensive actions:
  - `Block Remote IP / Subnet`
  - `Isolate Infected Host`
  - `Enforce Port Closure (e.g. 445 SMB / 3389 RDP)`
  - `Segment Network Zone (VLAN Isolation)`
- **Dynamic Re-Simulation:** The Cyber World Model re-evaluates the network graph under the perturbed topology ($G' = G \setminus \{e, v\}$), calculating the **simulated risk reduction percentage** and **projected blast radius containment** in real time.
- **Epistemic Honesty:** All counterfactual outputs are rigorously labeled as *"Simulated Defensive Impact based on Empirical Transition Probabilities — Never Guaranteed Prevention"*.
