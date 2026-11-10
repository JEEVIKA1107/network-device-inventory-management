# NetTrack DFA: Theory of Computation Specification & IPv4 Formal Automata

## 1. Academic Overview & Syllabus Alignment
- **Subject:** Formal Languages and Automata Theory (FLAT)
- **Units Covered:**
  - **Unit 1:** Deterministic Finite Automata (DFA), Non-deterministic Finite Automata (NFA), NFA-to-DFA conversion via subset construction, DFA state minimization.
  - **Unit 2:** Regular languages, regular expressions, and formal equivalence proofs ($L(Regex) = L(DFA)$).
- **Computer Networks (22ITT52):** Unit 3 - IPv4 32-bit decimal addressing, octet boundary validation, canonical zero rules.

---

## 2. Formal Language Definition
Let $\Sigma = \{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, .\}$ be the input alphabet.
The language of valid canonical IPv4 addresses is defined as:

$$L_{IPv4} = \{ w \in \Sigma^* \mid w = a.b.c.d \land a,b,c,d \in \text{Octet} \}$$

Where each decimal octet is constrained by:
$$\text{Octet} = \{ n \in \mathbb{N} \mid 0 \le n \le 255 \land \text{canonical}(n) \}$$

### Canonical Decimal Representation Rules:
1. **No leading zeros:** Values such as `001`, `01`, `000` are strictly rejected.
2. **Single zero allowed:** `0` is accepted as a single digit octet.
3. **Upper boundary:** No octet may exceed 255.
4. **Delimiters:** Exactly three dot (`.`) characters must separate four non-empty octets.
5. **Strict alphabet:** Any alphabetic, space, negative symbol, or special character leads directly to the dead state.

---

## 3. Regular Expression to Automata Construction

### 3.1 Canonical Regular Expression:
```regex
^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$
```

### 3.2 Octet Range Decomposition:
The expression breaks each valid octet into five mutually exclusive sub-patterns:
- `25[0-5]`: Decimal range $250 - 255$
- `2[0-4][0-9]`: Decimal range $200 - 249$
- `1[0-9]{2}`: Decimal range $100 - 199$
- `[1-9][0-9]`: Decimal range $10 - 99$
- `[0-9]`: Decimal range $0 - 9$ (with single 0 allowed)

---

## 4. Formal DFA 5-Tuple Definition

The Deterministic Finite Automaton is formally specified as:
$$M = (Q, \Sigma, \delta, q_0, F)$$

- **$Q$:** Finite set of states (25 total states after minimization).
- **$\Sigma$:** Finite input alphabet $\{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, .\} \cup \{\text{OTHER}\}$.
- **$\delta : Q \times \Sigma \to Q$:** Deterministic state transition function.
- **$q_0 = \text{S\_1}$:** Unique initial start state.
- **$F$:** Set of 5 accepting states (valid terminal configurations of the 4th octet).
- **$\text{TRAP\_DEAD}$:** The sink/dead state. For all $c \in \Sigma$, $\delta(\text{TRAP\_DEAD}, c) = \text{TRAP\_DEAD}$.

---

## 5. DFA Minimization via Hopcroft Partition Refinement
The state minimization algorithm partitions $Q$ initially into two subsets:
$$P_0 = \{ F, Q \setminus F \}$$
For each partition block $B$ and each input symbol $a \in \Sigma$:
If transitions on $a$ split $B$ into states targeting different blocks, $B$ is split into finer equivalence classes.
This process continues until no partition can be further refined:
- **Original Canonical States:** 53
- **Minimized Equivalent States:** 25
- **Language Invariance:** $L(M_{min}) = L(M_{original})$

---

## 6. Execution Trace Examples

### Example 1: Valid Address (`192.168.1.1`)
1. $S_1 \xrightarrow{'1'} O1\_1$
2. $O1\_1 \xrightarrow{'9'} O1\_1X$
3. $O1\_1X \xrightarrow{'2'} O1\_1XX$
4. $O1\_1XX \xrightarrow{'.'} S_2$
5. $S_2 \xrightarrow{'1'} O2\_1$
6. $O2\_1 \xrightarrow{'6'} O2\_1X$
7. $O2\_1X \xrightarrow{'8'} O2\_1XX$
8. $O2\_1XX \xrightarrow{'.'} S_3$
9. $S_3 \xrightarrow{'1'} O3\_1$
10. $O3\_1 \xrightarrow{'.'} S_4$
11. $S_4 \xrightarrow{'1'} O4\_1$
- **Result:** $O4\_1 \in F$ (ACCEPT - Valid IPv4).

### Example 2: Invalid Octet Overflow (`256.168.1.1`)
1. $S_1 \xrightarrow{'2'} O1\_2$
2. $O1\_2 \xrightarrow{'5'} O1\_2\_5$
3. $O1\_2\_5 \xrightarrow{'6'} \text{TRAP\_DEAD}$ (256 > 255)
- **Result:** Machine enters $\text{TRAP\_DEAD}$ and remains trapped for all remaining input. (REJECT).

### Example 3: Leading Zero Violation (`192.168.001.1`)
1. In Octet 3: $S_3 \xrightarrow{'0'} O3\_ZERO$
2. Next char is '0': $\delta(O3\_ZERO, '0') = \text{TRAP\_DEAD}$ (Disallowed leading zero)
- **Result:** Machine rejects malformed decimal representation.

---
