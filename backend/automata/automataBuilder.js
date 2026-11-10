/**
 * NetTrack DFA - Formal Automata Engine
 * Academic Syllabus Mapping:
 * - FLAT Unit 1: DFA, NFA, NFA to DFA conversion, DFA minimization, Complete state transition table
 * - FLAT Unit 2: Regular Languages, Regular Expressions, Equivalence of FA and Regular Expressions
 *
 * Canonical IPv4 Language:
 * L = { a.b.c.d | a,b,c,d ∈ [0, 255] in canonical decimal without leading zeros except single 0 }
 * Canonical Regular Expression:
 * ^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$
 */

const CANONICAL_IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;

// Complete formal input alphabet
const ALPHABET = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];

/**
 * Builds the canonical Deterministic Finite Automaton (DFA) for IPv4 validation.
 * Formal 5-tuple: M = (Q, Sigma, delta, q0, F)
 */
function buildIPv4DFA() {
  const states = {};
  const acceptingStates = new Set();
  const deadStateId = 'TRAP_DEAD';

  // Helper to initialize a state with all alphabet symbols defaulting to TRAP_DEAD
  function createState(id, label, description, isAccepting = false) {
    states[id] = {
      id,
      label,
      description,
      isAccepting,
      transitions: {}
    };
    ALPHABET.forEach((sym) => {
      states[id].transitions[sym] = deadStateId;
    });
    // Any character outside ALPHABET also transitions to deadStateId
    states[id].transitions['OTHER'] = deadStateId;

    if (isAccepting) {
      acceptingStates.add(id);
    }
  }

  // 1. Initialize Dead/Trap State
  createState(
    deadStateId,
    'Trap/Dead State',
    'Reject state: input violated IPv4 format (e.g. invalid digit, >255, leading zero, wrong dot count)',
    false
  );
  // Loop on all symbols in Dead State
  ALPHABET.forEach((sym) => {
    states[deadStateId].transitions[sym] = deadStateId;
  });
  states[deadStateId].transitions['OTHER'] = deadStateId;

  // 2. Build states for each of the 4 octets (k = 1, 2, 3, 4)
  for (let k = 1; k <= 4; k++) {
    const isFourth = k === 4;
    const nextOctetStart = isFourth ? deadStateId : `S_${k + 1}`;

    const sStart = `S_${k}`;
    const sZero = `O${k}_ZERO`;
    const s1 = `O${k}_1`;
    const s1X = `O${k}_1X`;
    const s1XX = `O${k}_1XX`;
    const s2 = `O${k}_2`;
    const s2_04 = `O${k}_2_04`;
    const s2_04X = `O${k}_2_04X`;
    const s2_5 = `O${k}_2_5`;
    const s2_5_05 = `O${k}_2_5_05`;
    const s2_69 = `O${k}_2_69`;
    const s39 = `O${k}_39`;
    const s39X = `O${k}_39X`;

    // Start of Octet k
    createState(
      sStart,
      `Start of Octet ${k}`,
      `Expecting first character of octet ${k}`,
      false
    );

    // Single zero state (e.g. "0")
    createState(
      sZero,
      `Octet ${k}: Single '0'`,
      `Octet ${k} has value 0. Only a dot is permitted next (no leading zero like 01)`,
      isFourth
    );

    // Digit '1'
    createState(
      s1,
      `Octet ${k}: Digit '1'`,
      `Octet ${k} prefix '1' (value 1)`,
      isFourth
    );

    // Two digits starting with 1 (10-19)
    createState(
      s1X,
      `Octet ${k}: '1' + [0-9]`,
      `Octet ${k} prefix '1x' (value 10-19)`,
      isFourth
    );

    // Three digits starting with 1 (100-199)
    createState(
      s1XX,
      `Octet ${k}: '1' + [0-9]{2}`,
      `Octet ${k} value 100-199`,
      isFourth
    );

    // Digit '2'
    createState(
      s2,
      `Octet ${k}: Digit '2'`,
      `Octet ${k} prefix '2' (value 2)`,
      isFourth
    );

    // Two digits: '2' + [0-4] (20-24)
    createState(
      s2_04,
      `Octet ${k}: '2' + [0-4]`,
      `Octet ${k} prefix '20-24'`,
      isFourth
    );

    // Three digits: '2' + [0-4] + [0-9] (200-249)
    createState(
      s2_04X,
      `Octet ${k}: '2' + [0-4] + [0-9]`,
      `Octet ${k} value 200-249`,
      isFourth
    );

    // Two digits: '25'
    createState(
      s2_5,
      `Octet ${k}: '25'`,
      `Octet ${k} prefix '25'`,
      isFourth
    );

    // Three digits: '25' + [0-5] (250-255)
    createState(
      s2_5_05,
      `Octet ${k}: '25' + [0-5]`,
      `Octet ${k} value 250-255`,
      isFourth
    );

    // Two digits: '2' + [6-9] (26-29)
    createState(
      s2_69,
      `Octet ${k}: '2' + [6-9]`,
      `Octet ${k} value 26-29`,
      isFourth
    );

    // Single digit '3'-'9' (3-9)
    createState(
      s39,
      `Octet ${k}: [3-9]`,
      `Octet ${k} single digit 3-9`,
      isFourth
    );

    // Two digits: [3-9] + [0-9] (30-99)
    createState(
      s39X,
      `Octet ${k}: [3-9] + [0-9]`,
      `Octet ${k} value 30-99`,
      isFourth
    );

    // --- Transitions from sStart ---
    states[sStart].transitions['0'] = sZero;
    states[sStart].transitions['1'] = s1;
    states[sStart].transitions['2'] = s2;
    ['3', '4', '5', '6', '7', '8', '9'].forEach((d) => {
      states[sStart].transitions[d] = s39;
    });

    // --- Transitions from sZero (Octet value 0) ---
    // If not 4th octet, '.' moves to next octet start; in 4th octet, '.' goes to TRAP_DEAD
    states[sZero].transitions['.'] = nextOctetStart;
    // Any digit after '0' is leading zero violation -> default TRAP_DEAD

    // --- Transitions from s1 (Octet prefix 1) ---
    states[s1].transitions['.'] = nextOctetStart;
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((d) => {
      states[s1].transitions[d] = s1X;
    });

    // --- Transitions from s1X (Octet value 10-19) ---
    states[s1X].transitions['.'] = nextOctetStart;
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((d) => {
      states[s1X].transitions[d] = s1XX;
    });

    // --- Transitions from s1XX (Octet value 100-199) ---
    states[s1XX].transitions['.'] = nextOctetStart;
    // Any 4th digit is >255 / >3 digits -> default TRAP_DEAD

    // --- Transitions from s2 (Octet prefix 2) ---
    states[s2].transitions['.'] = nextOctetStart;
    ['0', '1', '2', '3', '4'].forEach((d) => {
      states[s2].transitions[d] = s2_04;
    });
    states[s2].transitions['5'] = s2_5;
    ['6', '7', '8', '9'].forEach((d) => {
      states[s2].transitions[d] = s2_69;
    });

    // --- Transitions from s2_04 (Octet prefix 20-24) ---
    states[s2_04].transitions['.'] = nextOctetStart;
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((d) => {
      states[s2_04].transitions[d] = s2_04X;
    });

    // --- Transitions from s2_04X (Octet value 200-249) ---
    states[s2_04X].transitions['.'] = nextOctetStart;
    // Any further digit -> TRAP_DEAD

    // --- Transitions from s2_5 (Octet prefix 25) ---
    states[s2_5].transitions['.'] = nextOctetStart;
    ['0', '1', '2', '3', '4', '5'].forEach((d) => {
      states[s2_5].transitions[d] = s2_5_05;
    });
    // '6'-'9' would mean 256-259 (>255) -> default TRAP_DEAD

    // --- Transitions from s2_5_05 (Octet value 250-255) ---
    states[s2_5_05].transitions['.'] = nextOctetStart;
    // Any further digit -> TRAP_DEAD

    // --- Transitions from s2_69 (Octet value 26-29) ---
    states[s2_69].transitions['.'] = nextOctetStart;
    // Any further digit would be 260+ -> TRAP_DEAD

    // --- Transitions from s39 (Octet value 3-9) ---
    states[s39].transitions['.'] = nextOctetStart;
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((d) => {
      states[s39].transitions[d] = s39X;
    });

    // --- Transitions from s39X (Octet value 30-99) ---
    states[s39X].transitions['.'] = nextOctetStart;
    // Any further digit would be 300+ -> TRAP_DEAD
  }

  return {
    alphabet: ALPHABET,
    startState: 'S_1',
    states,
    acceptingStates: Array.from(acceptingStates),
    deadState: deadStateId
  };
}

/**
 * Minimizes a given DFA using Hopcroft-style partition refinement.
 * Divides states into Accepting (F) and Non-Accepting (Q \ F), then refines
 * partitions until fixed point is reached.
 */
function minimizeDFA(dfa) {
  const allStateIds = Object.keys(dfa.states);
  const acceptingSet = new Set(dfa.acceptingStates);
  const nonAccepting = allStateIds.filter((s) => !acceptingSet.has(s));
  const accepting = allStateIds.filter((s) => acceptingSet.has(s));

  let partitions = [];
  if (nonAccepting.length > 0) partitions.push(nonAccepting);
  if (accepting.length > 0) partitions.push(accepting);

  let partitionChanged = true;
  while (partitionChanged) {
    partitionChanged = false;
    const newPartitions = [];

    for (const group of partitions) {
      if (group.length <= 1) {
        newPartitions.push(group);
        continue;
      }

      // Group states by signature: for each input symbol, which partition index does it transition to?
      const signatureMap = new Map();

      for (const stateId of group) {
        const sig = ALPHABET.map((sym) => {
          const target = dfa.states[stateId].transitions[sym];
          const partIdx = partitions.findIndex((p) => p.includes(target));
          return partIdx;
        }).join(',');

        if (!signatureMap.has(sig)) {
          signatureMap.set(sig, []);
        }
        signatureMap.get(sig).push(stateId);
      }

      if (signatureMap.size > 1) {
        partitionChanged = true;
        for (const subGroup of signatureMap.values()) {
          newPartitions.push(subGroup);
        }
      } else {
        newPartitions.push(group);
      }
    }

    partitions = newPartitions;
  }

  // Construct minimal DFA from partitions
  const partitionMap = new Map();
  partitions.forEach((group, idx) => {
    const leader = group[0];
    group.forEach((stateId) => partitionMap.set(stateId, leader));
  });

  const minimalStates = {};
  const minimalAccepting = new Set();
  const minimalStart = partitionMap.get(dfa.startState);

  partitions.forEach((group) => {
    const leader = group[0];
    const original = dfa.states[leader];
    const isAcc = dfa.acceptingStates.includes(leader);

    minimalStates[leader] = {
      id: leader,
      label: original.label,
      description: original.description,
      isAccepting: isAcc,
      mergedStates: group,
      transitions: {}
    };

    if (isAcc) {
      minimalAccepting.add(leader);
    }

    ALPHABET.forEach((sym) => {
      const originalTarget = original.transitions[sym];
      minimalStates[leader].transitions[sym] = partitionMap.get(originalTarget);
    });
    minimalStates[leader].transitions['OTHER'] = partitionMap.get(original.transitions['OTHER'] || dfa.deadState);
  });

  return {
    alphabet: ALPHABET,
    startState: minimalStart,
    states: minimalStates,
    acceptingStates: Array.from(minimalAccepting),
    deadState: partitionMap.get(dfa.deadState),
    partitionCount: partitions.length,
    originalStateCount: allStateIds.length
  };
}

/**
 * Executes a step-by-step trace of the DFA on an input string.
 * Returns rich pedagogical trace information for the interactive simulator.
 */
function traceDFA(dfa, inputString) {
  if (typeof inputString !== 'string') {
    return {
      accepted: false,
      startState: dfa.startState,
      finalState: dfa.deadState,
      steps: [],
      errorReason: 'Input must be a string'
    };
  }

  const steps = [];
  let currentStateId = dfa.startState;
  let encounteredTrap = false;
  let trapChar = null;
  let trapIndex = -1;

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    const fromState = dfa.states[currentStateId] || dfa.states[dfa.deadState];
    const symbolKey = ALPHABET.includes(char) ? char : 'OTHER';
    const nextStateId = fromState.transitions[symbolKey] || dfa.deadState;
    const toState = dfa.states[nextStateId] || dfa.states[dfa.deadState];

    if (nextStateId === dfa.deadState && !encounteredTrap) {
      encounteredTrap = true;
      trapChar = char;
      trapIndex = i;
    }

    // Explain rule
    let explanation = `Consuming '${char}': transition from ${currentStateId} to ${nextStateId}`;
    if (char === '.') {
      explanation = `Dot separator consumed: finished octet validation, advancing to next octet.`;
    } else if (nextStateId === dfa.deadState) {
      explanation = `Invalid transition on symbol '${char}' at index ${i}: transitions to Dead/Trap state.`;
    }

    steps.push({
      stepIndex: i + 1,
      char,
      charIndex: i,
      fromState: currentStateId,
      fromStateLabel: fromState.label,
      toState: nextStateId,
      toStateLabel: toState.label,
      symbol: symbolKey,
      isAccepting: toState.isAccepting,
      explanation
    });

    currentStateId = nextStateId;
  }

  const finalState = dfa.states[currentStateId] || dfa.states[dfa.deadState];
  const accepted = finalState.isAccepting && !encounteredTrap;

  // Compute precise academic error reason if rejected
  let errorReason = null;
  let invalidOctet = null;

  if (!accepted) {
    // Check dot count
    const dots = (inputString.match(/\./g) || []).length;
    if (dots !== 3) {
      errorReason = `Expected exactly 3 dot separators for 4 octets, found ${dots}.`;
    } else {
      const octets = inputString.split('.');
      if (octets.length !== 4) {
        errorReason = `Expected 4 octets separated by dots, found ${octets.length}.`;
      } else {
        for (let idx = 0; idx < 4; idx++) {
          const oct = octets[idx];
          if (oct.length === 0) {
            errorReason = `Octet ${idx + 1} is empty.`;
            invalidOctet = idx + 1;
            break;
          }
          if (!/^\d+$/.test(oct)) {
            errorReason = `Octet ${idx + 1} ('${oct}') contains non-numeric characters.`;
            invalidOctet = idx + 1;
            break;
          }
          if (oct.length > 1 && oct.startsWith('0')) {
            errorReason = `Octet ${idx + 1} ('${oct}') has invalid leading zero. Canonical decimal requires single '0'.`;
            invalidOctet = idx + 1;
            break;
          }
          const num = parseInt(oct, 10);
          if (num > 255) {
            errorReason = `Octet ${idx + 1} ('${oct}' = ${num}) exceeds maximum 255.`;
            invalidOctet = idx + 1;
            break;
          }
        }
      }
    }

    if (!errorReason) {
      if (encounteredTrap) {
        errorReason = `Rejected at character '${trapChar}' (index ${trapIndex}): Invalid transition to Dead State.`;
      } else {
        errorReason = `Incomplete input: Machine terminated in non-accepting state '${currentStateId}'.`;
      }
    }
  }

  return {
    accepted,
    inputString,
    startState: dfa.startState,
    finalState: currentStateId,
    finalStateLabel: finalState.label,
    isFinalStateAccepting: finalState.isAccepting,
    totalSteps: steps.length,
    steps,
    errorReason,
    invalidOctet
  };
}

/**
 * Generates Mermaid State Diagram definition from DFA data.
 */
function generateMermaidDiagram(dfa) {
  let mermaid = 'stateDiagram-v2\n';
  mermaid += `    [*] --> ${dfa.startState}\n`;

  // Define accepting states
  dfa.acceptingStates.forEach((acc) => {
    mermaid += `    ${acc} : ${dfa.states[acc]?.label || acc} (ACCEPTING)\n`;
  });

  // Define dead state
  mermaid += `    ${dfa.deadState} : Trap / Dead State (REJECT)\n`;

  // Sample grouping of transitions to keep diagram readable
  const stateKeys = Object.keys(dfa.states);
  for (const sId of stateKeys) {
    if (sId === dfa.deadState) continue; // omit TRAP self-loops for cleaner visualization
    const st = dfa.states[sId];

    // Group transitions by destination
    const targetMap = {};
    for (const sym of ALPHABET) {
      const tgt = st.transitions[sym];
      if (!tgt) continue;
      if (!targetMap[tgt]) targetMap[tgt] = [];
      targetMap[tgt].push(sym);
    }

    for (const [tgt, syms] of Object.entries(targetMap)) {
      if (tgt === dfa.deadState) {
        // Only show dead arrow if not overwhelmingly cluttered
        continue;
      }
      let symLabel = syms.join(', ');
      if (syms.length > 5) {
        symLabel = `${syms[0]}-${syms[syms.length - 1]}`;
      }
      mermaid += `    ${sId} --> ${tgt} : ${symLabel}\n`;
    }
  }

  // Show accepting states transition to end
  dfa.acceptingStates.forEach((acc) => {
    mermaid += `    ${acc} --> [*] : End of Input\n`;
  });

  return mermaid;
}

/**
 * Generates tabular transition records for State Transition Table.
 */
function generateTransitionTableData(dfa) {
  const tableRows = [];
  const stateKeys = Object.keys(dfa.states);

  for (const sId of stateKeys) {
    const st = dfa.states[sId];
    // Group identical transitions for readability
    const destMap = {};
    for (const sym of ALPHABET) {
      const next = st.transitions[sym];
      if (!destMap[next]) destMap[next] = [];
      destMap[next].push(sym);
    }
    const otherDest = st.transitions['OTHER'] || dfa.deadState;
    if (!destMap[otherDest]) destMap[otherDest] = [];
    destMap[otherDest].push('[Other/Invalid]');

    for (const [nextState, symbols] of Object.entries(destMap)) {
      tableRows.push({
        currentState: sId,
        currentStateLabel: st.label,
        isAccepting: st.isAccepting,
        isDead: sId === dfa.deadState,
        inputSymbols: symbols.join(', '),
        nextState: nextState,
        nextStateLabel: dfa.states[nextState]?.label || nextState,
        isNextAccepting: dfa.states[nextState]?.isAccepting || false
      });
    }
  }

  return tableRows;
}

module.exports = {
  CANONICAL_IPV4_REGEX,
  ALPHABET,
  buildIPv4DFA,
  minimizeDFA,
  traceDFA,
  generateMermaidDiagram,
  generateTransitionTableData
};
