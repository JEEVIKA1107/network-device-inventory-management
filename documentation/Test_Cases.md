# NetTrack DFA — Test Cases & Validation Matrix

## 1. Automated Test Execution Summary
Automated unit and integration tests are located in `backend/tests/`:
- `automata.test.js`: Validates DFA construction, character class transitions, language equivalence $L(\text{Regex}) \equiv L(\text{DFA})$, and minimization properties.
- `api.test.js`: Validates REST endpoints, authentication, duplicate IP conflict rejections, and MongoDB aggregations.
- **Test Command:** `npm test` inside `backend/`
- **Result:** `29 passed, 29 total` across 2 test suites.

---

## 2. IPv4 Format Validation Test Matrix

| Test Case | Input Address | Expected Outcome | DFA Terminal State | Theoretical Reason |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | `192.168.1.1` | **VALID (Accept)** | `O4_1` (Accepting) | Canonical Class C Gateway format |
| **TC-02** | `10.0.0.1` | **VALID (Accept)** | `O4_1` (Accepting) | Canonical Class A Private format |
| **TC-03** | `172.16.0.10` | **VALID (Accept)** | `O4_1X` (Accepting) | Canonical Class B Private format |
| **TC-04** | `255.255.255.255` | **VALID (Accept)** | `O4_2_5_05` (Accepting) | Maximum allowable octet boundary (255) |
| **TC-05** | `0.0.0.0` | **VALID (Accept)** | `O4_ZERO` (Accepting) | Valid default route with single '0's |
| **TC-06** | `8.8.8.8` | **VALID (Accept)** | `O4_39` (Accepting) | Public DNS Single-digit octets |
| **TC-07** | `256.168.1.1` | **INVALID (Reject)** | `TRAP_DEAD` | Octet 1 value (256) exceeds maximum 255 |
| **TC-08** | `192.168.1.300` | **INVALID (Reject)** | `TRAP_DEAD` | Octet 4 value (300) exceeds maximum 255 |
| **TC-09** | `192.168.1` | **INVALID (Reject)** | `O3_1` (Non-accepting) | Incomplete string: only 3 octets and 2 dots |
| **TC-10** | `192.168.1.1.1` | **INVALID (Reject)** | `TRAP_DEAD` | Excess octet: 4th dot transitions to Dead |
| **TC-11** | `192.168..1` | **INVALID (Reject)** | `TRAP_DEAD` | Empty octet 3: consecutive dots |
| **TC-12** | `192.168.1.abc` | **INVALID (Reject)** | `TRAP_DEAD` | Alphabetic characters in alphabet $\Sigma$ |
| **TC-13** | `192.168.001.1` | **INVALID (Reject)** | `TRAP_DEAD` | Disallowed leading zero (requires single '0') |
| **TC-14** | `-192.168.1.1` | **INVALID (Reject)** | `TRAP_DEAD` | Negative symbol '-' is not in $\Sigma$ |
| **TC-15** | `999.999.999.999` | **INVALID (Reject)** | `TRAP_DEAD` | All octets exceed 255 |

---

## 3. Duplicate IP Assignment Rejection Tests

| Test ID | Action | Input IP | Network Scope | Existing Device | Expected Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DUP-01** | Create Device | `192.168.1.1` | Campus Backbone | Router 01 (`192.168.1.1`) | **409 Conflict** (Rejected) |
| **DUP-02** | Create Device | `192.168.1.2` | Campus Backbone | Switch 01 (`192.168.1.2`) | **409 Conflict** (Rejected) |
| **DUP-03** | Create Device | `192.168.1.1` | CS Lab 2 VLAN | Router 01 in Campus Scope | **201 Created** (Allowed across distinct scopes) |

---

## 4. Socket Reachability & Host Probe Tests

| Test ID | Target IP | Test Port | Local Response | Cloud Response |
| :--- | :--- | :--- | :--- | :--- |
| **NET-01** | `127.0.0.1` | 5000 / 80 | **Online** (0 - 5ms) | Host Alive / Loopback |
| **NET-02** | `8.8.8.8` | 53 (DNS) | **Online** (15 - 45ms) | **Online** (Public DNS reachable from cloud) |
| **NET-03** | `192.168.1.250` | 80 | **Offline** (Timeout 2000ms) | Transparent Cloud LAN Notice |
