# NetTrack DFA — Project Overview

## 1. Project Identity
- **Application Name:** NetTrack DFA
- **Tagline:** *Validate. Monitor. Manage.*
- **System Classification:** Network Device Inventory Management System with IPv4 Address Validation
- **Academic Domain Intersections:**
  1. **Full Stack Web Development (MERN Stack) — 22ITT51:** React.js, Node.js, Express.js, MongoDB, RESTful API architecture, JWT authentication, bcrypt, Chart.js.
  2. **Formal Languages and Automata Theory (FLAT):** Canonical IPv4 regular language specification, Thompson's NFA construction, Powerset subset construction, Hopcroft DFA minimization, and state transition simulator.
  3. **Computer Networks — 22ITT52:** 32-bit IPv4 octet addressing, RFC 1918 private scopes, CIDR subnetting, network topology visualization, and socket-level TCP host reachability probes.

---

## 2. Problem Statement
College and enterprise campus IT departments manage hundreds of heterogeneous network devices, including core routers, edge distribution switches, laboratory workstations, evaluation servers, network printers, and wireless access points.

Maintaining device inventories manually or across ad-hoc spreadsheets introduces critical vulnerabilities:
- **Duplicate IP Conflicts:** Multiple devices inadvertently configured with identical IP addresses within the same subnet, causing ARP poisoning and intermittent connectivity loss.
- **Malformed Address Configurations:** Entry errors such as octet overflow (`>255`), disallowed leading zeros (`001`), missing octets, and invalid delimiter counts.
- **Stale Reachability Records:** Lack of real-time socket telemetry regarding whether a host is physically connected and responding.
- **Disconnected Topology:** Inability to visualize trunk and access port links between network switches and terminal nodes.

---

## 3. Core Objectives
1. **Centralized Device Inventory:** Register and maintain network devices with unique Device IDs (`DEV-XXX-001`), categorizing by Router, Switch, Computer, Server, Printer, and Access Point.
2. **Deterministic IPv4 Validation:** Implement dual-engine validation executing both canonical Regular Expressions and a mathematical Minimal Deterministic Finite Automaton (DFA) that consumes input character-by-character.
3. **Automata Visualization & Simulation:** Provide an interactive pedagogical DFA simulator animating states, active transitions ($\delta(q, a)$), tape consumption, accepting terminal states ($F$), and dead/sink states (`TRAP_DEAD`).
4. **Duplicate IP Detection:** Proactively prevent duplicate IP assignments within the same network scope while supporting multi-tenant private scopes.
5. **Real-time Host Probing:** Perform non-destructive TCP reachability checks with timeout safeguards and honest disclosure of public cloud routing limits.
6. **Topology Mapping:** Graph physical and logical connections between infrastructure nodes.
7. **Compliance & Export:** Generate printable reports and streaming CSV exports for audit inspections.
