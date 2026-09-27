# Campaign-Level Split Strategy (SPLIT_STRATEGY.md)

### 1. The Danger of Row-Level Random Splitting
Standard academic benchmarks frequently make a catastrophic methodological error: **random row-level splitting**. 
In network intrusion datasets, packets and flows from the same ongoing attack session share identical TCP sequence spaces, ephemeral ports, and timing profiles. Random row splitting leaks future packets of the exact same attack instance into the training set, producing deceptively high F1 scores (>99%) that immediately fail in real-world SOC deployments.

### 2. Campaign-Aware Partitioning (Zero Temporal / Family Leakage)
To rigorously test **generalization to unseen attack campaigns**, NEXUS partitions data strictly by **Attack Family and Isolated Attack Campaign**:

| Partition | Dataset Source | Specific Campaign / Attack Vector | MITRE ATT&CK Stages Covered | Role in Pipeline |
| :--- | :--- | :--- | :--- | :--- |
| **Train Set** | CIC-IDS2018 | SSH / FTP BruteForce (Wed-14) | Recon, Initial Access, Discovery | Base state transition dynamics |
| **Train Set** | CIC-IDS2018 | DoS-GoldenEye & Slowloris (Thu-15) | Initial Access, Impact | Resource exhaustion trajectories |
| **Train Set** | CTU-13 | Scenario 1 (Neris IRC Botnet) | Initial Access, C2, Lateral Movement | Cyclic beaconing & IRC control |
| **Validation Set** | CIC-IDS2018 | DoS-Hulk & SlowHTTPTest (Fri-16) | Recon, Initial Access, Impact | Hyperparameter tuning & calibration |
| **Held-Out Test (Unseen A)** | CIC-IDS2018 | Infiltration Campaign (Thu-01-03) | Recon -> Initial Access -> PrivEsc -> Lateral | Multi-stage stealth enterprise breach |
| **Held-Out Test (Unseen B)** | CTU-13 | Scenario 4 (RBot Fast SYN Flood & C2) | Recon -> Discovery -> C2 -> DoS | Unseen polymorphic botnet campaign |
| **Held-Out Test (Unseen C)** | CTU-13 | Scenario 10 (RBot UDP Flood & Lateral) | Lateral Movement -> Discovery -> Impact | Peer-to-peer lateral propagation |

### 3. Verification Protocol
Any model evaluated under NEXUS must score its lead time and multi-step accuracy **exclusively** on the Held-Out Test partitions (`Unseen A`, `Unseen B`, `Unseen C`). The model has never seen the IP ranges, payload signatures, or specific tooling used in these campaigns during its training phase.
