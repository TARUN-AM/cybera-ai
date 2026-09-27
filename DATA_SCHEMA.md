# NEXUS Dual-Level Telemetry Schema (DATA_SCHEMA.md)

### 1. Ingestion Sources & Real-World Dataset Grounding

NEXUS ingests and harmonizes two gold-standard cybersecurity datasets:
1. **CSE-CIC-IDS2018 (Canadian Institute for Cybersecurity & Communications Security Establishment)**
   - *Underlying Infrastructure*: 420 machines, 50 network devices across 5 subnets (DMZ, Servers, Workstations, Web, Management).
   - *Included Ingestion Files*:
     - `Wednesday-14-02-2018_TrafficForML_CICFlowMeter.csv` (FTP-BruteForce, SSH-BruteForce)
     - `Thursday-15-02-2018_TrafficForML_CICFlowMeter.csv` (DoS-GoldenEye, DoS-Slowloris)
     - `Friday-16-02-2018_TrafficForML_CICFlowMeter.csv` (DoS-SlowHTTPTest, DoS-Hulk)
     - `Thursday-01-03-2018_TrafficForML_CICFlowMeter.csv` (Infiltration: Dropbox exploit, Nmap recon, Privilege Escalation)
     - `Friday-02-03-2018_TrafficForML_CICFlowMeter.csv` (Botnet Ares, C2 communication, port scanning)
2. **CTU-13 (Stratosphere Research Laboratory, Czech Technical University)**
   - *Underlying Infrastructure*: Real mixed campus traffic with verified botnet infections and raw PCAPs.
   - *Included Ingestion Scenarios*:
     - `Scenario 1 (Neris Botnet - IRC C2 & SPAM)`
     - `Scenario 4 (RBot - Port scanning, SYN floods, DDoS)`
     - `Scenario 9 (Neris - Click fraud & C2 beaconing)`
     - `Scenario 10 (RBot - UDP flood and lateral discovery)`

---

### 2. Dual-Level Unified Feature Specification

The unified feature schema bridges coarse flow summaries and micro-level packet behaviors into a unified 28-dimensional feature vector per window:

| Feature Name | Level | Type | Source Derivation | Description & Physical Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `src_ip` | Flow | String | CIC-IDS2018 / CTU-13 | Source IP address of flow |
| `dst_ip` | Flow | String | CIC-IDS2018 / CTU-13 | Destination IP address of flow |
| `dst_port` | Flow | Int | Flow header | Destination port (service targeting) |
| `protocol` | Flow | Int | IP Protocol header | 6 = TCP, 17 = UDP, 1 = ICMP |
| `flow_duration_ms`| Flow | Float | Flow duration | Duration of aggregated flow in milliseconds |
| `fwd_pkts_per_sec`| Flow | Float | Flow / window | Forward packet rate |
| `bwd_pkts_per_sec`| Flow | Float | Flow / window | Backward packet rate (response speed) |
| `flow_bytes_per_sec`| Flow | Float| Total bytes / duration | Network bandwidth consumption |
| `pkt_len_mean` | Flow | Float | Flow packet stats | Average packet length in bytes |
| `pkt_len_std` | Flow | Float | Flow packet stats | Variance in packet lengths |
| `fwd_iat_mean` | Flow | Float | Inter-arrival times | Forward inter-arrival time (beaconing periodicity) |
| `bwd_iat_mean` | Flow | Float | Inter-arrival times | Backward inter-arrival time (server response latency) |
| `syn_flag_count` | Flow | Int | TCP flags | Count of SYN packets (scan / handshake attempts) |
| `rst_flag_count` | Flow | Int | TCP flags | Count of RST packets (connection teardowns / rejection) |
| `ack_flag_count` | Flow | Int | TCP flags | Count of ACK packets (established data flow) |
| `fin_flag_count` | Flow | Int | TCP flags | Count of FIN packets (graceful closures) |
| `psh_flag_count` | Flow | Int | TCP flags | Count of PSH packets (interactive shell / prompt data) |
| `down_up_ratio` | Flow | Float | Bwd bytes / Fwd bytes | Asymmetry ratio (e.g. low during scans, high in exfiltration) |
| `avg_init_win_bytes`| Packet | Float | TCP SYN header | Initial TCP receive window advertisement |
| `tcp_win_variance` | Packet | Float | Window tracking | Variance of advertised TCP windows |
| `ttl_mean` | Packet | Float | IP header | Mean TTL (OS distance and proxy detection) |
| `ttl_variance` | Packet | Float | IP header | Multi-source routing or decoy spoofing signature |
| `payload_entropy` | Packet | Float | Payload byte distribution | Shannon entropy of raw application payload (0-8 bits/byte) |
| `port_entropy` | Entropy | Float | Window calculation | Shannon entropy of unique destination ports contacted |
| `dst_entropy` | Entropy | Float | Window calculation | Shannon entropy of contacted destination IPs |
| `proto_entropy` | Entropy | Float | Window calculation | Diversity of protocols utilized within window |
| `conn_rate_entropy`| Entropy| Float | Window calculation | Temporal regularity of packet dispatch (beaconing detector) |
| `subnetwork_fanout`| Entropy| Float | IP prefix clustering | Fan-out factor across enterprise subnets (/24 spread) |

*Field Derivation Documentation*:
- In CIC-IDS2018, packet-level fields (`init_win_bytes`, `pkt_len_std`, flag metrics) are directly extracted from CICFlowMeter.
- In CTU-13, flow metrics are harmonized from NetFlow/Argus flows, while packet-level payload entropy and TTL statistics are derived from corresponding PCAP analysis sessions.
- In the embedded offline runtime, pre-computed dual-level telemetry tensors guarantee sub-millisecond execution without requiring live multi-gigabyte PCAP decoders in production SOC triage.

---

### 3. Behavioral Entropy Formulations

For any time window $W_t$ containing $M$ network flows:
$$\mathcal{H}_{\text{port}} = -\sum_{p \in \mathcal{P}} P(p) \log_2 P(p), \quad P(p) = \frac{\text{flows to port } p}{M}$$
$$\mathcal{H}_{\text{dst}} = -\sum_{d \in \mathcal{D}} P(d) \log_2 P(d), \quad P(d) = \frac{\text{flows to destination IP } d}{M}$$
$$\mathcal{H}_{\text{payload}} = -\sum_{b=0}^{255} P(b) \log_2 P(b), \quad P(b) = \frac{\text{byte occurrences}}{N_{\text{bytes}}}$$

High $\mathcal{H}_{\text{port}}$ coupled with low $\mathcal{H}_{\text{dst}}$ provides mathematical proof of **port scanning (Reconnaissance)**. Conversely, low $\mathcal{H}_{\text{conn\_rate}}$ combined with elevated $\mathcal{H}_{\text{payload}}$ is the mathematical fingerprint of **encrypted C2 beaconing**.
