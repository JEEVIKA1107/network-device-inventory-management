# NetTrack DFA — User & Administrator Guide

## 1. Getting Started & Demo Login
Access the web application at `http://localhost:5173`.
Three demonstration roles are pre-seeded in the database:

1. **System Administrator:**
   - **Email:** `admin@nettrack.edu`
   - **Password:** `Password@123`
   - **Permissions:** Full control, user management, device deletion, batch host pings.
2. **Faculty / IT Staff:**
   - **Email:** `staff@nettrack.edu`
   - **Password:** `Password@123`
   - **Permissions:** Device registration, editing, validation, topology link additions.
3. **Guest / Viewer:**
   - **Email:** `viewer@nettrack.edu`
   - **Password:** `Password@123`
   - **Permissions:** Read-only access to dashboard, topology, and reports.

---

## 2. Navigating the Application

### 2.1 Overview Dashboard (`/dashboard`)
Displays the 10 real-time MongoDB metrics:
- Total Devices, Active Online, Inactive Offline
- Breakdown by Routers, Switches, Computers, Servers
- Valid IPv4 count vs. Invalid validation attempts
- Duplicate IP conflicts
- Dynamic charts (Device categories doughnut and reachability telemetry pie)
- Recent audit activities and host probe log feeds

### 2.2 Device Inventory (`/devices`)
- **Search:** Search across Device ID, Name, IPv4, MAC address, and physical location.
- **Filter:** Filter by device category (Router, Switch, etc.) or reachability status (Online/Offline).
- **Actions:** Click the probe icon to ping a host on demand; click view details to inspect specifications.

### 2.3 Registering a Device (`/devices/add`)
- Enter device name, category, and IPv4 address.
- Notice the **real-time DFA feedback badge**: as you type, the engine evaluates canonical rules.
- If an existing device is already registered with that IP in the chosen network scope, a **Duplicate IP warning** appears immediately, disabling registration until resolved.

### 2.4 FLAT DFA Simulator (`/dfa-simulator`)
- Enter an IPv4 candidate or click one of the preset buttons (`192.168.1.1`, `256.168.1.1`, `192.168.001.1`).
- Click **Run DFA**.
- Use the **Play**, **Pause**, **Next Step**, and **Run All** controls to animate transitions one symbol at a time.
- Observe the active state $q \in Q$, the character tape head, and the $\delta(q, a)$ explanation.

### 2.5 Network Topology Map (`/topology`)
- Inspect the hierarchical campus tree: Core Routers $\to$ Distribution Switches $\to$ Workstations, Servers, Printers, and Wi-Fi Access Points.
- Click any node to open the side inspector.
- Administrators can click **Add Connection Link** to establish a new link.

### 2.6 Subnet Calculator (`/subnet-calculator`)
- Enter an IP address and choose a CIDR prefix length (e.g. `/24`).
- Computes Network Address, Directed Broadcast, Wildcard Mask, First & Last Usable Host IPs, and displays the 32-bit binary decomposition.

### 2.7 Exporting Reports (`/export-reports`)
- Download the full database inventory as a `.csv` spreadsheet.
- Click **Print / Save as PDF** to generate an inspection-ready physical report.
