# NetTrack DFA — Network Device Inventory Management System with IPv4 Address Validation

> **Tagline:** Validate. Monitor. Manage.  
> **Academic Syllabuses:** Full Stack Web Development (22ITT51), Formal Languages and Automata Theory (FLAT), Computer Networks (22ITT52).

---

## 1. Problem Statement
Campus network environments manage hundreds of heterogeneous devices across multiple laboratories, classrooms, and administrative buildings. Manual tracking using static spreadsheets leads to IP address collisions, malformed IPv4 entries, lack of reachability verification, and disconnected topology visibility. 

**NetTrack DFA** solves these challenges by combining **MERN Stack Development**, a mathematically rigorous **Deterministic Finite Automaton (DFA)** for IPv4 validation, and **Computer Networking** principles for reachability telemetry and topology graphing.

---

## 2. Real-World Application
Deployed within educational institutions, university data centers, or enterprise campuses, NetTrack DFA enables IT administrators to:
- Prevent duplicate IP assignments within local managed subnets.
- Guarantee that every registered IP conforms strictly to canonical decimal rules without invalid leading zeros.
- Monitor active/inactive host connectivity in real-time.
- Visualize network hierarchy from core gateways down to edge student workstations.
- Export official audit reports for NAAC / NBA academic accreditation reviews.

---

## 3. Technology Stack
- **Frontend:** React.js, React Router v6, Axios, Chart.js, React-Chartjs-2, Lucide Icons, Vite.
- **Backend:** Node.js, Express.js, RESTful Architecture, JWT Authentication, Bcrypt password hashing.
- **Database:** MongoDB & Mongoose ODM.
- **Automata & Validation:** Canonical JavaScript Regular Expressions, Custom Minimized DFA Engine, State Transition Simulator.
- **Deployment Ready:** Render (Backend), Vercel (Frontend), MongoDB Atlas (Cloud Database).

---

## 4. Key Modules & Features
1. **Admin Operations Dashboard:** 10 real-time MongoDB metrics (Total Devices, Active Online, Inactive Offline, Routers, Switches, Computers, Servers, Valid IPv4s, Invalid Attempts, Duplicate Conflicts), Category Doughnut Chart, and Reachability Pie Chart.
2. **Device Inventory Management:** Search, multi-criteria filtering (category, status, department, laboratory), sorting, pagination, manual ping probe, edit, and safe deletion.
3. **IPv4 Validation Engine:** Dual-engine checking using canonical regular expressions and character-by-character DFA trace.
4. **Interactive DFA Simulator:** Visual tape animator stepping through states, showing $\delta(q, a)$, active transitions, with Play, Pause, Next Step, Reset, and speed controls.
5. **DFA State Diagram & Transition Table:** Visual SVG state machine diagram and searchable transition table for all states $q \in Q$ and symbols $a \in \Sigma$.
6. **Duplicate IP Detection:** Subnet-scoped duplicate IP conflict prevention with conflicting host warnings and record links.
7. **Network Connectivity Monitoring:** Non-destructive TCP reachability checks with response latency logging and transparent public cloud vs. local LAN notices.
8. **Network Topology Visualization:** Interactive hierarchical graph (Routers $\to$ Switches $\to$ Workstations, Servers, Printers, APs) with live status indicators and link management.
9. **Subnet Calculator:** CIDR prefix calculator computing Network ID, Broadcast ID, Subnet Mask, Wildcard Mask, Usable Host Range, and 32-bit binary octet decomposition.
10. **Reports & Analytics:** Departmental distribution tables, laboratory availability metrics, printable inspection summaries, and CSV streaming exports.
11. **Role-Based Access Control:** Admin, Faculty / IT Staff, and Viewer roles with secure session management.

---

## 5. Formal Languages & Automata Theory (FLAT) Specification

### 5.1 Formal Language
$$L_{IPv4} = \{ w \in \Sigma^* \mid w = a.b.c.d \land a,b,c,d \in [0, 255] \text{ in canonical decimal} \}$$
Where $\Sigma = \{ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.' \}$.

### 5.2 Canonical Regular Expression
```regex
^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$
```

### 5.3 Formal 5-Tuple Definition
$$M = (Q, \Sigma, \delta, q_0, F)$$
- **$Q$:** Finite set of states spanning 4 octet validation stages plus `TRAP_DEAD`.
- **$\Sigma$:** $\{0..9, .\} \cup \{\text{OTHER}\}$.
- **$\delta$:** Deterministic transition function $\delta : Q \times \Sigma \to Q$.
- **$q_0$:** Start state $S_1$.
- **$F$:** Set of accepting terminal configurations of the 4th octet.
- **$\text{TRAP\_DEAD}$:** Sink state trapping all invalid characters, leading zeros, and octet overflows.

---

## 6. Sample Inputs & Outputs

| Address | Result | Final State | Error Reason / Status |
| :--- | :--- | :--- | :--- |
| `192.168.1.1` | **VALID** | `O4_1` | Accepted (Canonical Class C Gateway) |
| `10.0.0.1` | **VALID** | `O4_1` | Accepted (Canonical Class A Private) |
| `255.255.255.255` | **VALID** | `O4_2_5_05` | Accepted (Boundary Broadcast) |
| `256.168.1.1` | **INVALID** | `TRAP_DEAD` | Octet 1 ('256') exceeds maximum 255 |
| `192.168.001.1` | **INVALID** | `TRAP_DEAD` | Disallowed leading zero in octet 3 |
| `192.168.1` | **INVALID** | `O3_1` | Incomplete string: only 3 octets |
| `192.168.1.abc` | **INVALID** | `TRAP_DEAD` | Non-numeric characters detected |

---

## 7. Installation & Local Execution

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 7.1 Clone and Setup Backend
```bash
cd backend
npm install
node scripts/seed.js   # Pre-seeds demo devices, users, scopes, and test cases
npm test               # Runs automated Jest test suite (29 tests)
npm start              # Starts backend API on http://localhost:5000
```

### 7.2 Setup and Launch Frontend
```bash
cd frontend
npm install
npm run build          # Builds production bundle
npm run dev            # Starts Vite development server on http://localhost:5173
```

### 7.3 Default Credentials
- **Admin User:** `admin@nettrack.edu` / `Password@123`
- **Staff User:** `staff@nettrack.edu` / `Password@123`
- **Viewer User:** `viewer@nettrack.edu` / `Password@123`

---

## 8. Live Cloud Deployment Guide

### Backend on Render:
1. Connect GitHub repository to Render as a **Web Service**.
2. Root directory: `backend` (or use root `render.yaml`).
3. Build command: `npm install`
4. Start command: `node server.js`
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Secure Random 32+ Character Secret>`
   - `CORS_ORIGIN`: `<Your Vercel Frontend URL>`

### Frontend on Vercel:
1. Connect GitHub repository to Vercel.
2. Root directory: `frontend`.
3. Framework Preset: **Vite**.
4. Output Directory: `dist`.
5. Environment Variable:
   - `VITE_API_URL`: `<Your Render Backend URL>/api`

---

## 9. Academic Syllabus Mapping Matrix

| Subject | Units | Demonstration in Project |
| :--- | :--- | :--- |
| **FSWD (22ITT51)** | Units 1 - 5 | HTML5, CSS3, modern React components, React Router v6, Express MVC architecture, Node.js asynchronous events, Mongoose ODM, JWT security. |
| **FLAT** | Units 1 - 2 | Formal language $L_{IPv4}$, canonical regular expressions, NFA/DFA equivalence, Hopcroft minimization, character class transitions, animated DFA simulator. |
| **Networks (22ITT52)** | Units 1, 3, 5 | 32-bit decimal addressing, CIDR subnetting, RFC 1918 classification, network topology graph, TCP socket probing. |
