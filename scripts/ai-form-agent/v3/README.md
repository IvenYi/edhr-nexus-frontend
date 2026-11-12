# Controlled Agent feasibility experiment

Extends v2 with source-backed applicable knowledge, revision-checked local patches,
bounded semantic checks and native visual feedback. It uses existing template APIs
and the existing designer; no application page or production service is changed.
Reference configurations are also queried against the real lookup API before saving
and when checking: a successful template save alone does not prove a usable selector.
The reused designer bundle is written to a process-specific local artifact to avoid
cross-process startup races. The final model runs retain their pre-fix frozen snapshots;
the later path-only fix is checked with parallel compilation and identical bundle hashes.
Future snapshots also include the reused v1 helper/evaluator source hashes.

Prerequisites: ignored `.env.ai.local`, the three sanitized v1 sample JSON files,
the v2 clean fixture for boundary tests, local frontend dependencies and the existing
Playwright CLI skill. Never put keys or raw customer data in commits.

Run the unchanged backend against a **separate experiment database** on localhost
18093; run the unchanged frontend on localhost 15175 with `VITE_API_PROXY_TARGET`
pointing to that backend. Set these environment variables for all commands:

```sh
export AI_FORM_AGENT_BATCH=ai-form-agent-v3-20261112
export AI_FORM_AGENT_PORT=18093
node --test scripts/ai-form-agent/agent.test.mjs scripts/ai-form-agent/v3/agent.test.mjs
node scripts/ai-form-agent/v3/verify.mjs
node scripts/ai-form-agent/v3/run.mjs debug openai clean 1
node scripts/ai-form-agent/v3/run.mjs debug openai label 1
node scripts/ai-form-agent/v3/run.mjs debug openai scrap 1
```

`verify.mjs` exercises real API persistence and conflict detection, with a deliberately
stubbed preview for negative completion tests. It leaves an isolated test template.
Model runs exercise the actual browser. Debug mode rejects DeepSeek to preserve its
budget. API proxy configuration is environment-specific; no proxy or key is embedded.

Once debugging passes, freeze acceptance and run each provider on all three forms:

```sh
node scripts/ai-form-agent/v3/assess.mjs --freeze
node scripts/ai-form-agent/v3/run.mjs final openai clean 1
node scripts/ai-form-agent/v3/run.mjs final openai label 1
node scripts/ai-form-agent/v3/run.mjs final openai scrap 1
node scripts/ai-form-agent/v3/run.mjs final deepseek clean 1
node scripts/ai-form-agent/v3/run.mjs final deepseek label 1
node scripts/ai-form-agent/v3/run.mjs final deepseek scrap 1
node scripts/ai-form-agent/v3/assess.mjs
```

The first final run freezes a common protocol/source snapshot. Any subsequent source,
knowledge, tool or sample mismatch is rejected. Keep every failed attempt; use a new
attempt number for another run and a new batch for a changed final protocol. The
evaluator is held out of model input. Debug outputs cannot count as final results.
The first 20261112 batch exposed invalid personnel reference fields that persistence
accepted. It remains intact. The corrected comparison uses batch
`ai-form-agent-v3-20261112-r2` and attempt `2`; do not combine the two protocols' scores.

Each run has a 26-round limit and a conservative estimated USD 5 stop threshold;
estimates are not invoices or provider spending caps. Raw responses retain usage.
Screenshots are delivered to each provider's own image input. No second model supplies
visual answers. A host acknowledgment prevents finishing before images were sent.
Pending questions come from the saved draft. `finish_task` cannot replace that list;
changing or resolving questions requires an explicit patch and another check/preview.
The post-comparison QA fix for this gate was verified deterministically without new
paid runs; the original model responses and their reported question counts are retained.

Tools query internal research knowledge with provenance and explicit graph links;
retrieval relevance is not semantic proof or runtime publication. Unknown customer
policies are held outside the model's writable context. The formal-source constraint
is an experiment action restriction, not a new mandatory product draft-save rule or
a requirement for a unique statistical source. Trace and statistical uses remain
optional; only genuinely dependent configurations should be deferred.

Local patches preserve unrelated draft members, and writes read back the existing
version first. This detects already-occurring external edits, **not atomic concurrent
editing**. Real tenant authorization, transaction recovery, audit/replay guarantees,
dynamic subtables, OCR, production submission/signing and print fidelity remain outside
this experiment. Date/lot/signature checks and static text clipping detection are
bounded heuristics; final semantic and visual review is still required.
