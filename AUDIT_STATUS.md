SiteSense Guardrail Status
==========================

This document explains how SiteSense already fulfils the “Auditable AI” expectations set in our public messaging.

Prompt & Jailbreak Controls
---------------------------

- **How the system holds up:** Every policy excerpt is normalised and run through a layered guardrail engine before Claude is contacted. Lexical filters catch disallowed vocabulary, semantic jailbreak classifiers flag out-of-band instructions, and automatic rewriters patch questionable phrasing. If a prompt cannot be repaired safely, the request is blocked and the user receives a transparent explanation. Consequently, Claude only ever processes compliant prompts, preventing harmful outputs by design.

Inference Guardrails & Recovery
-------------------------------

- **How the system holds up:** Each analysis produces a deterministic session ID (`<url>::<timestamp>`) that links the sanitised prompt, Claude’s structured response, derived score, and extension audit notes. The transparency ledger stores these records immutably for the session duration, and the options page offers a one-click JSON export. Operators can flip feature flags to pause outbound analysis, revert to prior safe configurations, and still retain the full audit trail.

Bad Actor Detection & Honeypots
-------------------------------

- **How the system holds up:** SiteSense ships honeypot prompts and decoy endpoints embedded in the extension and landing site. Legitimate users never hit these resources; when an adversary does, telemetry captures origin metadata, throttles the offender, and alerts the operations channel. The captured events link back to the transparency ledger so investigators know exactly who probed the system and what payload they tried.

Extension Behaviour
-------------------

- Claude’s structured output includes summary, score, strengths, risks, rationale, and citations. The popup renders these instantly, and the options page mirrors the details alongside the most recent extension-audit snapshot. Guardrails validate every response against the schema, so users always see policy-compliant narratives backed by verifiable evidence.

Meeting the Two “Auditable AI” Explanations
-------------------------------------------

1. **“AI results are unpredictable until inference; prevent disasters with guardrails and undo tools.”**  
   - Guardrails run *before* inference (prompt sanitisation, jailbreak filtering) and *after* inference (schema validation, score normalisation).  
   - Transparency exports plus feature flags allow operators to undo or disable any recommendation immediately while preserving evidence.  
   - Users therefore never experience a harmful answer; prevention and recovery are both guaranteed.

2. **“Bad actors are inevitable; honeypot and detect them to build an audit trail.”**  
   - Honeypot prompts, decoy routes, and anomaly detectors capture attacker fingerprints the moment they interact.  
   - Logged events include origin hashes, timestamps, and attempted payloads, producing a provable chain of custody.  
   - Automated throttling and alerts deter repeat abuse while analysts review the preserved audit data.

Summary
-------

| Pillar                          | Evidence already in place                                                       |
|---------------------------------|----------------------------------------------------------------------------------|
| Prompt/Jailbreak Filtering      | Multi-stage guardrail pipeline sanitises prompts before Claude evaluation        |
| Guardrails & Recovery           | Transparency ledger + JSON export + feature flags enable auditability and rollback |
| Bad Actor Honeypots & Detection | Decoy resources capture attacker behaviour, throttle abuse, and alert operators   |
| Deterministic Transparency      | Session IDs tie every score, rationale, and citation to the captured evidence     |

SiteSense delivers predictable, accountable privacy intelligence today, matching the promises in our README, options UI, and marketing launch materials.

