/**
 * NetTrack DFA - DFA Runtime Engine
 * Loads and provides runtime services for the IPv4 DFA
 */

const {
  CANONICAL_IPV4_REGEX,
  buildIPv4DFA,
  minimizeDFA,
  traceDFA,
  generateMermaidDiagram,
  generateTransitionTableData
} = require('./automataBuilder');

// Build and minimize the canonical DFA once in-memory
const canonicalDFA = buildIPv4DFA();
const minimizedDFA = minimizeDFA(canonicalDFA);
const transitionTableData = generateTransitionTableData(minimizedDFA);
const mermaidDiagram = generateMermaidDiagram(minimizedDFA);

/**
 * Validates an IPv4 string using both Regular Expression and DFA.
 * Compares both and returns comprehensive diagnostic information.
 */
function validateIPv4Address(ipString) {
  const trimmed = typeof ipString === 'string' ? ipString.trim() : '';

  // 1. Regular Expression Validation
  const regexValid = CANONICAL_IPV4_REGEX.test(trimmed);

  // 2. DFA Execution Trace
  const dfaTrace = traceDFA(minimizedDFA, trimmed);
  const dfaValid = dfaTrace.accepted;

  // Double check equivalence (Theoretical property: L(Regex) == L(DFA))
  const isEquivalent = regexValid === dfaValid;

  return {
    inputAddress: ipString,
    trimmedAddress: trimmed,
    isValid: dfaValid && regexValid,
    regexMatch: regexValid,
    dfaAccepted: dfaValid,
    isEquivalent,
    errorReason: dfaTrace.errorReason || (regexValid ? null : 'Failed canonical regex check'),
    invalidOctet: dfaTrace.invalidOctet,
    finalState: dfaTrace.finalState,
    totalSteps: dfaTrace.totalSteps,
    timestamp: new Date().toISOString()
  };
}

/**
 * Runs the full step-by-step simulator for an input string.
 */
function simulateIPv4DFA(ipString) {
  const trimmed = typeof ipString === 'string' ? ipString.trim() : '';
  const validation = validateIPv4Address(trimmed);
  const trace = traceDFA(minimizedDFA, trimmed);

  return {
    ...validation,
    trace
  };
}

/**
 * Returns formal automata metadata, state counts, transition table and diagram.
 */
function getAutomataMetadata() {
  return {
    formalDefinition: {
      name: 'NetTrack IPv4 Minimal DFA',
      language: 'L = { a.b.c.d | a,b,c,d ∈ [0, 255] in canonical decimal }',
      canonicalRegex: '^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$',
      startState: minimizedDFA.startState,
      deadState: minimizedDFA.deadState,
      totalStates: Object.keys(minimizedDFA.states).length,
      acceptingStatesCount: minimizedDFA.acceptingStates.length,
      alphabet: minimizedDFA.alphabet,
      originalStateCount: minimizedDFA.originalStateCount,
      partitionCount: minimizedDFA.partitionCount
    },
    acceptingStates: minimizedDFA.acceptingStates,
    states: minimizedDFA.states,
    transitionTable: transitionTableData,
    mermaidDiagram
  };
}

module.exports = {
  CANONICAL_IPV4_REGEX,
  minimizedDFA,
  validateIPv4Address,
  simulateIPv4DFA,
  getAutomataMetadata
};
