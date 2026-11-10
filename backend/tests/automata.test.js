const {
  CANONICAL_IPV4_REGEX,
  buildIPv4DFA,
  minimizeDFA,
  traceDFA
} = require('../automata/automataBuilder');

describe('Formal Languages & Automata Theory (FLAT) - IPv4 Automaton Test Suite', () => {
  let canonicalDFA;
  let minimalDFA;

  beforeAll(() => {
    canonicalDFA = buildIPv4DFA();
    minimalDFA = minimizeDFA(canonicalDFA);
  });

  describe('Language Acceptance & Rejection Tests', () => {
    const validAddresses = [
      '192.168.1.1',
      '10.0.0.1',
      '172.16.0.10',
      '255.255.255.255',
      '0.0.0.0',
      '8.8.8.8',
      '1.2.3.4',
      '127.0.0.1'
    ];

    test.each(validAddresses)('should accept valid canonical IPv4: %s', (ip) => {
      const regexResult = CANONICAL_IPV4_REGEX.test(ip);
      const trace = traceDFA(minimalDFA, ip);

      expect(regexResult).toBe(true);
      expect(trace.accepted).toBe(true);
      expect(trace.finalState).not.toBe(minimalDFA.deadState);
      expect(trace.isFinalStateAccepting).toBe(true);
    });

    const invalidAddresses = [
      ['256.168.1.1', 'Octet exceeds 255'],
      ['192.168.1.300', 'Octet 4 exceeds 255'],
      ['192.168.1', 'Fewer than 4 octets'],
      ['192.168.1.1.1', 'More than 4 octets'],
      ['192.168..1', 'Empty octet'],
      ['192.168.1.abc', 'Alphabetic character'],
      ['192.168.001.1', 'Leading zero violation'],
      ['-192.168.1.1', 'Negative value'],
      ['999.999.999.999', 'Multiple octets exceed 255'],
      ['...', 'Empty octets only dots'],
      ['', 'Empty string']
    ];

    test.each(invalidAddresses)(
      'should reject invalid IPv4: %s (%s)',
      (ip, _reason) => {
        const regexResult = CANONICAL_IPV4_REGEX.test(ip);
        const trace = traceDFA(minimalDFA, ip);

        expect(regexResult).toBe(false);
        expect(trace.accepted).toBe(false);
      }
    );
  });

  describe('Formal DFA Minimization & Completeness', () => {
    test('should have deterministic transitions from all states on all alphabet symbols', () => {
      const states = Object.keys(minimalDFA.states);
      expect(states.length).toBeGreaterThan(0);

      states.forEach((sId) => {
        const st = minimalDFA.states[sId];
        minimalDFA.alphabet.forEach((sym) => {
          expect(st.transitions[sym]).toBeDefined();
        });
      });
    });

    test('dead state should be a sink state (self-loop on all symbols)', () => {
      const deadState = minimalDFA.states[minimalDFA.deadState];
      expect(deadState).toBeDefined();
      expect(deadState.isAccepting).toBe(false);

      minimalDFA.alphabet.forEach((sym) => {
        expect(deadState.transitions[sym]).toBe(minimalDFA.deadState);
      });
    });

    test('minimization should preserve language equivalence with canonical regex', () => {
      const testSet = [
        '192.168.1.1',
        '255.255.255.255',
        '0.0.0.0',
        '256.1.1.1',
        '192.168.01.1',
        '10.20.30.40'
      ];
      testSet.forEach((ip) => {
        const regexVal = CANONICAL_IPV4_REGEX.test(ip);
        const canonTrace = traceDFA(canonicalDFA, ip);
        const minTrace = traceDFA(minimalDFA, ip);

        expect(canonTrace.accepted).toBe(regexVal);
        expect(minTrace.accepted).toBe(regexVal);
        expect(canonTrace.accepted).toBe(minTrace.accepted);
      });
    });
  });
});
