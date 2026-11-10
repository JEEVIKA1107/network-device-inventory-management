/**
 * NetTrack DFA - Export Automata Artifacts
 * Generates:
 * 1. backend/automata/generatedDFA.json
 * 2. FLAT/Regular_Expression.txt
 * 3. FLAT/Transition_Table.html
 * 4. FLAT/DFA_Diagram.svg
 * 5. FLAT/DFA_Explanation.md
 * 6. sample-inputs-outputs/sample_ips.json
 */

const fs = require('fs');
const path = require('path');
const {
  CANONICAL_IPV4_REGEX,
  minimizedDFA,
  getAutomataMetadata,
  validateIPv4Address,
  simulateIPv4DFA
} = require('./dfaEngine');

const projectRoot = path.resolve(__dirname, '../../');
const flatDir = path.join(projectRoot, 'FLAT');
const sampleDir = path.join(projectRoot, 'sample-inputs-outputs');
const automataDir = path.resolve(__dirname);

console.log('Generating Automata Artifacts for NetTrack DFA...');

// 1. Export JSON representation of minimal DFA
const meta = getAutomataMetadata();
fs.writeFileSync(
  path.join(automataDir, 'generatedDFA.json'),
  JSON.stringify(meta, null, 2),
  'utf8'
);
console.log('✓ Created backend/automata/generatedDFA.json');

// 2. Export Regular_Expression.txt
const regexContent = `================================================================================
NETTRACK DFA - CANONICAL IPv4 REGULAR EXPRESSION & LANGUAGE SPECIFICATION
================================================================================
Academic Mapping: FLAT Unit 2 (Regular Languages & Expressions) / CN Unit 3 (IPv4)

CANONICAL REGULAR EXPRESSION:
^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$

FORMAL LANGUAGE DEFINITION:
L = { a.b.c.d | a, b, c, d ∈ ℕ, 0 <= a,b,c,d <= 255 }
In canonical decimal format:
- Exactly 4 octets separated by 3 dots.
- No leading zeros permitted, except the standalone single digit '0'.
- Octet range [0, 255] is partitioned into five sub-ranges:
  1) 0             : Single '0'
  2) 1 - 9         : [1-9]
  3) 10 - 99       : [1-9][0-9]
  4) 100 - 199     : 1[0-9]{2}
  5) 200 - 249     : 2[0-4][0-9]
  6) 250 - 255     : 25[0-5]

INPUT ALPHABET:
Sigma = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.' }

TOTAL NUMBER OF DFA STATES:
- Start State: ${meta.formalDefinition.startState}
- Trap/Dead State: ${meta.formalDefinition.deadState}
- Total States in Minimized DFA: ${meta.formalDefinition.totalStates}
- Number of Accepting States: ${meta.formalDefinition.acceptingStatesCount}
================================================================================
`;

fs.writeFileSync(path.join(flatDir, 'Regular_Expression.txt'), regexContent, 'utf8');
console.log('✓ Created FLAT/Regular_Expression.txt');

// 3. Export Transition_Table.html
let tableHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NetTrack DFA - State Transition Table</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #F5F7FB; color: #142D4E; margin: 40px; }
    h1 { color: #142D4E; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-start { background: #DBEAFE; color: #1E40AF; }
    .badge-accept { background: #DCFCE7; color: #166534; }
    .badge-dead { background: #FEE2E2; color: #991B1B; }
    .badge-regular { background: #E2E8F0; color: #475569; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden; }
    th { background: #142D4E; color: white; text-align: left; padding: 12px 16px; font-weight: 600; font-size: 13px; }
    td { padding: 10px 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; }
    tr:hover { background: #F8FAFC; }
    .code { font-family: monospace; font-weight: bold; color: #2563EB; }
  </style>
</head>
<body>
  <h1>NetTrack DFA — IPv4 State Transition Table</h1>
  <p><strong>Formal Model:</strong> Deterministic Finite Automaton (M = (Q, &Sigma;, &delta;, q<sub>0</sub>, F)) for Canonical IPv4 Address Validation.</p>
  <p><strong>Language:</strong> L = { a.b.c.d | a,b,c,d &in; [0, 255] }</p>
  <table>
    <thead>
      <tr>
        <th>Current State</th>
        <th>State Type</th>
        <th>Input Symbol(s)</th>
        <th>Next State</th>
        <th>Next State Status</th>
      </tr>
    </thead>
    <tbody>
`;

meta.transitionTable.forEach((row) => {
  let badgeClass = 'badge-regular';
  let badgeText = 'Normal';
  if (row.currentState === meta.formalDefinition.startState) {
    badgeClass = 'badge-start';
    badgeText = 'Start State';
  } else if (row.isAccepting) {
    badgeClass = 'badge-accept';
    badgeText = 'Accepting';
  } else if (row.isDead) {
    badgeClass = 'badge-dead';
    badgeText = 'Dead / Reject';
  }

  let nextBadge = row.isNextAccepting
    ? '<span class="badge badge-accept">Accepting</span>'
    : row.nextState === meta.formalDefinition.deadState
    ? '<span class="badge badge-dead">Dead</span>'
    : '<span class="badge badge-regular">Normal</span>';

  tableHtml += `      <tr>
        <td><span class="code">${row.currentState}</span><br><small style="color:#64748B">${row.currentStateLabel}</small></td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td><strong style="color:#0F172A">${row.inputSymbols}</strong></td>
        <td><span class="code">${row.nextState}</span><br><small style="color:#64748B">${row.nextStateLabel}</small></td>
        <td>${nextBadge}</td>
      </tr>\n`;
});

tableHtml += `    </tbody>
  </table>
</body>
</html>`;

fs.writeFileSync(path.join(flatDir, 'Transition_Table.html'), tableHtml, 'utf8');
console.log('✓ Created FLAT/Transition_Table.html');

// 4. Export DFA_Explanation.md
const dfaExplContent = `# NetTrack DFA: Theory of Computation Specification & IPv4 Formal Automata

## 1. Academic Overview & Syllabus Alignment
- **Subject:** Formal Languages and Automata Theory (FLAT)
- **Units Covered:**
  - **Unit 1:** Deterministic Finite Automata (DFA), Non-deterministic Finite Automata (NFA), NFA-to-DFA conversion via subset construction, DFA state minimization.
  - **Unit 2:** Regular languages, regular expressions, and formal equivalence proofs ($L(Regex) = L(DFA)$).
- **Computer Networks (22ITT52):** Unit 3 - IPv4 32-bit decimal addressing, octet boundary validation, canonical zero rules.

---

## 2. Formal Language Definition
Let $\\Sigma = \\{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, .\\}$ be the input alphabet.
The language of valid canonical IPv4 addresses is defined as:

$$L_{IPv4} = \\{ w \\in \\Sigma^* \\mid w = a.b.c.d \\land a,b,c,d \\in \\text{Octet} \\}$$

Where each decimal octet is constrained by:
$$\\text{Octet} = \\{ n \\in \\mathbb{N} \\mid 0 \\le n \\le 255 \\land \\text{canonical}(n) \\}$$

### Canonical Decimal Representation Rules:
1. **No leading zeros:** Values such as \`001\`, \`01\`, \`000\` are strictly rejected.
2. **Single zero allowed:** \`0\` is accepted as a single digit octet.
3. **Upper boundary:** No octet may exceed 255.
4. **Delimiters:** Exactly three dot (\`.\`) characters must separate four non-empty octets.
5. **Strict alphabet:** Any alphabetic, space, negative symbol, or special character leads directly to the dead state.

---

## 3. Regular Expression to Automata Construction

### 3.1 Canonical Regular Expression:
\`\`\`regex
^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$
\`\`\`

### 3.2 Octet Range Decomposition:
The expression breaks each valid octet into five mutually exclusive sub-patterns:
- \`25[0-5]\`: Decimal range $250 - 255$
- \`2[0-4][0-9]\`: Decimal range $200 - 249$
- \`1[0-9]{2}\`: Decimal range $100 - 199$
- \`[1-9][0-9]\`: Decimal range $10 - 99$
- \`[0-9]\`: Decimal range $0 - 9$ (with single 0 allowed)

---

## 4. Formal DFA 5-Tuple Definition

The Deterministic Finite Automaton is formally specified as:
$$M = (Q, \\Sigma, \\delta, q_0, F)$$

- **$Q$:** Finite set of states (${meta.formalDefinition.totalStates} total states after minimization).
- **$\\Sigma$:** Finite input alphabet $\\{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, .\\} \\cup \\{\\text{OTHER}\\}$.
- **$\\delta : Q \\times \\Sigma \\to Q$:** Deterministic state transition function.
- **$q_0 = \\text{S\\_1}$:** Unique initial start state.
- **$F$:** Set of ${meta.formalDefinition.acceptingStatesCount} accepting states (valid terminal configurations of the 4th octet).
- **$\\text{TRAP\\_DEAD}$:** The sink/dead state. For all $c \\in \\Sigma$, $\\delta(\\text{TRAP\\_DEAD}, c) = \\text{TRAP\\_DEAD}$.

---

## 5. DFA Minimization via Hopcroft Partition Refinement
The state minimization algorithm partitions $Q$ initially into two subsets:
$$P_0 = \\{ F, Q \\setminus F \\}$$
For each partition block $B$ and each input symbol $a \\in \\Sigma$:
If transitions on $a$ split $B$ into states targeting different blocks, $B$ is split into finer equivalence classes.
This process continues until no partition can be further refined:
- **Original Canonical States:** ${meta.formalDefinition.originalStateCount}
- **Minimized Equivalent States:** ${meta.formalDefinition.partitionCount}
- **Language Invariance:** $L(M_{min}) = L(M_{original})$

---

## 6. Execution Trace Examples

### Example 1: Valid Address (\`192.168.1.1\`)
1. $S_1 \\xrightarrow{'1'} O1\\_1$
2. $O1\\_1 \\xrightarrow{'9'} O1\\_1X$
3. $O1\\_1X \\xrightarrow{'2'} O1\\_1XX$
4. $O1\\_1XX \\xrightarrow{'.'} S_2$
5. $S_2 \\xrightarrow{'1'} O2\\_1$
6. $O2\\_1 \\xrightarrow{'6'} O2\\_1X$
7. $O2\\_1X \\xrightarrow{'8'} O2\\_1XX$
8. $O2\\_1XX \\xrightarrow{'.'} S_3$
9. $S_3 \\xrightarrow{'1'} O3\\_1$
10. $O3\\_1 \\xrightarrow{'.'} S_4$
11. $S_4 \\xrightarrow{'1'} O4\\_1$
- **Result:** $O4\\_1 \\in F$ (ACCEPT - Valid IPv4).

### Example 2: Invalid Octet Overflow (\`256.168.1.1\`)
1. $S_1 \\xrightarrow{'2'} O1\\_2$
2. $O1\\_2 \\xrightarrow{'5'} O1\\_2\\_5$
3. $O1\\_2\\_5 \\xrightarrow{'6'} \\text{TRAP\\_DEAD}$ (256 > 255)
- **Result:** Machine enters $\\text{TRAP\\_DEAD}$ and remains trapped for all remaining input. (REJECT).

### Example 3: Leading Zero Violation (\`192.168.001.1\`)
1. In Octet 3: $S_3 \\xrightarrow{'0'} O3\\_ZERO$
2. Next char is '0': $\\delta(O3\\_ZERO, '0') = \\text{TRAP\\_DEAD}$ (Disallowed leading zero)
- **Result:** Machine rejects malformed decimal representation.

---
`;

fs.writeFileSync(path.join(flatDir, 'DFA_Explanation.md'), dfaExplContent, 'utf8');
console.log('✓ Created FLAT/DFA_Explanation.md');

// 5. Generate high quality SVG of DFA
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38BDF8"/>
    </marker>
    <marker id="arrowDead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444"/>
    </marker>
  </defs>

  <rect width="1200" height="800" fill="url(#bgGrad)"/>
  
  <text x="600" y="45" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#F8FAFC" text-anchor="middle">
    NetTrack DFA — IPv4 Address State Machine
  </text>
  <text x="600" y="75" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">
    L = { a.b.c.d | a,b,c,d ∈ [0, 255] } • Canonical 4-Octet Decimal Finite State Automaton
  </text>

  <!-- Start Arrow -->
  <line x1="40" y1="200" x2="85" y2="200" stroke="#38BDF8" stroke-width="3" marker-end="url(#arrow)"/>
  <text x="45" y="190" font-family="system-ui, sans-serif" font-size="12" fill="#38BDF8" font-weight="bold">Start</text>

  <!-- Octet 1 Stage -->
  <g transform="translate(90, 160)">
    <circle cx="40" cy="40" r="32" fill="#1E3A8A" stroke="#60A5FA" stroke-width="3"/>
    <text x="40" y="45" font-family="monospace" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">S₁</text>
    <text x="40" y="85" font-family="system-ui, sans-serif" font-size="11" fill="#93C5FD" text-anchor="middle">Octet 1 Start</text>
  </g>

  <!-- Octet 1 Paths -->
  <path d="M 165 185 Q 230 110 300 110" fill="none" stroke="#38BDF8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="230" y="125" font-family="system-ui, sans-serif" font-size="11" fill="#BAE6FD">'0'</text>
  <circle cx="330" cy="110" r="24" fill="#0C4A6E" stroke="#38BDF8" stroke-width="2"/>
  <text x="330" y="115" font-family="monospace" font-size="11" fill="#FFFFFF" text-anchor="middle">O1_0</text>

  <path d="M 165 200 L 290 200" fill="none" stroke="#38BDF8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="230" y="193" font-family="system-ui, sans-serif" font-size="11" fill="#BAE6FD">'1'-'9'</text>
  <circle cx="320" cy="200" r="24" fill="#0C4A6E" stroke="#38BDF8" stroke-width="2"/>
  <text x="320" y="205" font-family="monospace" font-size="11" fill="#FFFFFF" text-anchor="middle">O1_1-9</text>

  <path d="M 345 200 L 415 200" fill="none" stroke="#38BDF8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="380" y="193" font-family="system-ui, sans-serif" font-size="11" fill="#BAE6FD">0-9</text>
  <circle cx="440" cy="200" r="24" fill="#0C4A6E" stroke="#38BDF8" stroke-width="2"/>
  <text x="440" y="205" font-family="monospace" font-size="10" fill="#FFFFFF" text-anchor="middle">10-99</text>

  <path d="M 465 200 L 535 200" fill="none" stroke="#38BDF8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="500" y="193" font-family="system-ui, sans-serif" font-size="11" fill="#BAE6FD">0-9</text>
  <circle cx="560" cy="200" r="24" fill="#0C4A6E" stroke="#38BDF8" stroke-width="2"/>
  <text x="560" y="205" font-family="monospace" font-size="10" fill="#FFFFFF" text-anchor="middle">100-255</text>

  <!-- Dot 1 transition to S2 -->
  <path d="M 355 110 Q 560 90 645 180" fill="none" stroke="#4ADE80" stroke-width="2.5" marker-end="url(#arrow)"/>
  <path d="M 585 200 L 640 200" fill="none" stroke="#4ADE80" stroke-width="2.5" marker-end="url(#arrow)"/>
  <text x="615" y="192" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#4ADE80">'.'</text>

  <!-- Octet 2 Stage -->
  <g transform="translate(650, 160)">
    <circle cx="40" cy="40" r="32" fill="#1E3A8A" stroke="#60A5FA" stroke-width="3"/>
    <text x="40" y="45" font-family="monospace" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">S₂</text>
    <text x="40" y="85" font-family="system-ui, sans-serif" font-size="11" fill="#93C5FD" text-anchor="middle">Octet 2 Start</text>
  </g>

  <!-- Transition to S3 -->
  <path d="M 725 200 L 800 200" fill="none" stroke="#38BDF8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="760" y="193" font-family="system-ui, sans-serif" font-size="11" fill="#BAE6FD">0-255</text>
  <text x="825" y="190" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#4ADE80">'.'</text>
  <path d="M 810 200 L 850 200" fill="none" stroke="#4ADE80" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Octet 3 Stage -->
  <g transform="translate(860, 160)">
    <circle cx="40" cy="40" r="32" fill="#1E3A8A" stroke="#60A5FA" stroke-width="3"/>
    <text x="40" y="45" font-family="monospace" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">S₃</text>
    <text x="40" y="85" font-family="system-ui, sans-serif" font-size="11" fill="#93C5FD" text-anchor="middle">Octet 3 Start</text>
  </g>

  <!-- Dot 3 to S4 -->
  <path d="M 900 235 L 900 370" fill="none" stroke="#4ADE80" stroke-width="2.5" marker-end="url(#arrow)"/>
  <text x="915" y="300" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#4ADE80">'.' (3rd dot)</text>

  <!-- Octet 4 Stage (Accepting) -->
  <g transform="translate(860, 380)">
    <circle cx="40" cy="40" r="32" fill="#1E3A8A" stroke="#60A5FA" stroke-width="3"/>
    <text x="40" y="45" font-family="monospace" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">S₄</text>
    <text x="40" y="85" font-family="system-ui, sans-serif" font-size="11" fill="#93C5FD" text-anchor="middle">Octet 4 Start</text>
  </g>

  <!-- Accepting State Node (Double Circle) -->
  <g transform="translate(580, 480)">
    <!-- Outer accepting ring -->
    <circle cx="60" cy="60" r="48" fill="none" stroke="#22C55E" stroke-width="4"/>
    <!-- Inner circle -->
    <circle cx="60" cy="60" r="40" fill="#064E3B" stroke="#4ADE80" stroke-width="2"/>
    <text x="60" y="55" font-family="monospace" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ACCEPT</text>
    <text x="60" y="75" font-family="system-ui, sans-serif" font-size="11" fill="#86EFAC" text-anchor="middle">Valid IPv4</text>
  </g>
  <path d="M 860 420 Q 750 490 690 520" fill="none" stroke="#22C55E" stroke-width="3" marker-end="url(#arrow)"/>
  <text x="760" y="460" font-family="system-ui, sans-serif" font-size="12" fill="#86EFAC">0-255 (Valid Final Octet)</text>

  <!-- TRAP / DEAD STATE -->
  <g transform="translate(250, 600)">
    <rect x="0" y="0" width="160" height="70" rx="12" fill="#450A0A" stroke="#EF4444" stroke-width="3"/>
    <text x="80" y="32" font-family="monospace" font-size="14" font-weight="bold" fill="#FCA5A5" text-anchor="middle">TRAP_DEAD</text>
    <text x="80" y="52" font-family="system-ui, sans-serif" font-size="11" fill="#F87171" text-anchor="middle">Reject / Sink State</text>
  </g>
  <path d="M 330 675 C 330 720, 310 720, 270 675" fill="none" stroke="#EF4444" stroke-width="2" marker-end="url(#arrowDead)"/>
  <text x="300" y="735" font-family="system-ui, sans-serif" font-size="11" fill="#FCA5A5" text-anchor="middle">All Symbols (Loop)</text>

  <!-- Dead Transitions -->
  <path d="M 130 235 L 250 610" fill="none" stroke="#EF4444" stroke-dasharray="4" stroke-width="1.5" marker-end="url(#arrowDead)"/>
  <text x="140" y="420" font-family="system-ui, sans-serif" font-size="10" fill="#EF4444">Non-digits / >255 / leading zero / dot error</text>

  <!-- Legend -->
  <g transform="translate(50, 680)">
    <rect width="400" height="90" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1"/>
    <text x="20" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#F8FAFC">Legend &amp; Automaton Properties:</text>
    <circle cx="30" cy="45" r="7" fill="#1E3A8A" stroke="#60A5FA" stroke-width="2"/>
    <text x="45" y="49" font-family="system-ui, sans-serif" font-size="11" fill="#CBD5E1">Start &amp; Intermediate States</text>
    <circle cx="30" cy="68" r="7" fill="#064E3B" stroke="#22C55E" stroke-width="2"/>
    <text x="45" y="72" font-family="system-ui, sans-serif" font-size="11" fill="#CBD5E1">Double Ring = Accepting States (F)</text>
    <rect x="230" y="38" width="14" height="14" rx="3" fill="#450A0A" stroke="#EF4444" stroke-width="2"/>
    <text x="255" y="50" font-family="system-ui, sans-serif" font-size="11" fill="#CBD5E1">Sink / Dead State (Trap)</text>
    <line x1="230" y1="68" x2="250" y2="68" stroke="#4ADE80" stroke-width="2.5"/>
    <text x="255" y="72" font-family="system-ui, sans-serif" font-size="11" fill="#CBD5E1">Dot ('.') Separator</text>
  </g>
</svg>
`;

fs.writeFileSync(path.join(flatDir, 'DFA_Diagram.svg'), svgContent, 'utf8');
console.log('✓ Created FLAT/DFA_Diagram.svg');

// 6. Generate sample-inputs-outputs/sample_ips.json
const sampleTestCases = [
  '192.168.1.1',
  '10.0.0.1',
  '172.16.0.10',
  '255.255.255.255',
  '0.0.0.0',
  '8.8.8.8',
  '256.168.1.1',
  '192.168.1.300',
  '192.168.1',
  '192.168.1.1.1',
  '192.168..1',
  '192.168.1.abc',
  '192.168.001.1',
  '-192.168.1.1',
  '999.999.999.999'
];

const testResults = sampleTestCases.map((ip) => {
  const sim = simulateIPv4DFA(ip);
  return {
    inputAddress: ip,
    isValid: sim.isValid,
    regexMatch: sim.regexMatch,
    dfaAccepted: sim.dfaAccepted,
    isEquivalent: sim.isEquivalent,
    errorReason: sim.errorReason,
    invalidOctet: sim.invalidOctet,
    finalState: sim.finalState,
    totalSteps: sim.totalSteps
  };
});

fs.writeFileSync(
  path.join(sampleDir, 'sample_ips.json'),
  JSON.stringify(testResults, null, 2),
  'utf8'
);
console.log('✓ Created sample-inputs-outputs/sample_ips.json');

console.log('Automata Artifacts generation completed successfully.');
