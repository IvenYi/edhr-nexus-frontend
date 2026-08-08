# eDHR Persistent Agent Collaboration Design

## 1. Purpose

Establish a project-long agent collaboration model for eDHR development. The model preserves business context across tasks without relying on one indefinitely running conversation and introduces independent verification for a production-grade medical-device ToB system.

The user does not manually maintain agent handoff forms or ontology files. The main agent extracts confirmed business knowledge from normal product discussions, creates structured handoffs, and asks the user only about genuine business ambiguities.

## 2. Decisions

The project uses three roles:

1. **Main development agent**: clarifies requirements, makes implementation decisions within confirmed scope, implements business functionality, and writes the implementation's unit and integration tests.
2. **Business knowledge modeling agent**: maintains the structured ontology, business rules, decisions, evidence, execution contracts, and impact records.
3. **Quality verification agent**: independently reviews code and verifies behavior, data, UI, audit, migration, and regression risks.

The two specialist roles are permanent project roles. Their individual runtime instances are task-scoped. Role continuity comes from versioned repository artifacts, fixed role contracts, and a mandatory bootstrap process rather than conversational memory.

## 3. Alternatives Considered

### 3.1 Repository-backed permanent roles

Store role contracts and knowledge assets in the repository and instantiate the same role for each applicable task.

This is the selected approach because it is reviewable, versioned, portable across workstations, and resilient to context compaction or task replacement.

### 3.2 One indefinitely running task per specialist

This retains conversational context but drifts from the current branch, makes merges harder, and treats transient model memory as the source of truth. It is not selected.

### 3.3 A resident agent service or CI bot

This could automate ontology and quality gates but introduces infrastructure before the business model and rule schemas are stable. It is deferred until repository-backed workflows prove stable.

## 4. Repository Artifacts

Implementation will introduce the following project-owned structure:

```text
AGENTS.md
docs/agents/
  business-knowledge-modeler.md
  quality-verifier.md
docs/knowledge/
  glossary.yaml
  ontology.yaml
  rules/
  decisions/
  evidence/
  open-questions.yaml
docs/architecture/
  business-knowledge-model.md
```

`AGENTS.md` defines project-wide orchestration rules and completion gates. The role documents define mandatory reading, responsibilities, input and output contracts, prohibited actions, and acceptance criteria.

`docs/knowledge/` is the machine-readable long-term knowledge baseline. The existing `docs/architecture/business-knowledge-model.md` remains the human-readable overview and must stay consistent with that baseline.

The repository role contracts are authoritative. A workstation-specific global agent configuration may improve convenience but must not be required to understand or execute the workflow.

## 5. Main Agent Responsibilities

During business discussion, the main agent automatically:

- extracts concepts, relationships, constraints, states, events, and actions;
- distinguishes confirmed decisions, inferences, and unresolved questions;
- records the decision background and rejected alternatives when they affect future interpretation;
- creates a decision package for the business knowledge modeling agent;
- sends only confirmed knowledge for authoritative modeling;
- asks the user about unresolved business ambiguity instead of inventing a rule;
- implements the business feature and its foundational tests;
- attaches implementation evidence after the code is complete.

The user confirms business decisions but does not populate ontology records, evidence indexes, or handoff documents manually.

## 6. Business Knowledge Modeling Agent

### 6.1 Responsibilities

The agent:

- maintains the domain glossary;
- maintains concepts, relationships, rules, statuses, and execution contracts;
- links requirements, UI, database schema, APIs, code, tests, and audit evidence;
- records change impact and knowledge-model version information;
- detects contradictions, missing references, and unresolved semantics;
- keeps internal, customer, and runtime projections separate;
- verifies the final implementation against the confirmed knowledge model.

### 6.2 Prohibited Actions

The agent must not:

- invent or silently resolve an ambiguous business rule;
- mark a rule `verified` without implementation and scenario evidence;
- expose `planned`, `specified`, or `unverified` capabilities to customer Q&A or runtime execution;
- directly alter business runtime behavior outside the main agent's implementation scope;
- erase a superseded decision when a historical replacement relation is required.

### 6.3 Result Contract

The agent returns exactly one primary result:

- `updated`: knowledge artifacts were updated and validated;
- `not-applicable`: no ontology impact, with a concrete reason;
- `blocked-by-question`: a product decision is required;
- `conflict`: confirmed input contradicts the current model and cannot be silently merged.

## 7. Quality Verification Agent

### 7.1 Responsibilities

The agent independently checks:

- conformance to confirmed requirements and ontology rules;
- CRUD, version, lifecycle status, permission, and audit behavior;
- error paths, duplicate submissions, concurrency, and boundary data;
- database migrations and initialization assets;
- consistency with existing RDO table and interaction standards;
- browser workflows, visual layout, and responsive behavior where applicable;
- agreement among UI labels, API behavior, persisted data, audit records, and business meaning;
- regression coverage appropriate to the change's risk.

The main agent still owns implementation-level unit and integration tests. Independent verification supplements those tests and must not become a reason to defer testing until the end.

### 7.2 Independence

The quality verification agent reports reproducible findings and does not directly change business implementation by default. The main agent fixes findings, after which the quality agent performs regression verification. A separately approved, tightly bounded test-only edit may be delegated when it does not compromise review independence.

### 7.3 Result Contract

The agent returns:

- `passed`: required evidence is present and checks pass;
- `failed`: reproducible findings require correction;
- `blocked`: environment, data, or dependency conditions prevent a valid conclusion.

## 8. Workflow

```text
Business discussion and confirmation
  -> Main agent creates a decision package
  -> Knowledge agent loads the current baseline
  -> Knowledge agent updates and validates ontology assets
  -> Main agent implements functionality and foundational tests
  -> Quality agent performs independent review and verification
  -> Main agent fixes findings
  -> Knowledge agent reconciles model and implementation evidence
  -> Quality agent runs final regression verification
```

Each new specialist instance first reads its role contract, the current knowledge-model version, open questions, relevant decisions, and domain artifacts. It must report a baseline version in its result so that stale-context work is detectable.

## 9. Trigger Rules

A business knowledge modeling review is mandatory when a change affects any of the following:

- business concepts or terminology;
- relationships or cardinality;
- lifecycle states or status derivation;
- business rules, validations, or blocking conditions;
- workflow events, outcomes, or execution actions;
- audit meaning, evidence, or traceability;
- customer-visible business explanations;
- runtime execution contracts or snapshots.

If none apply, the main agent records `ontology: not-applicable` with a reason.

Independent quality verification is mandatory for changes to code, database schema, APIs, user interactions, or customer-visible behavior. Verification depth scales with risk, but the gate itself is not omitted.

## 10. Validation and Failure Handling

The knowledge workflow validates at least:

- YAML and schema validity;
- referential integrity for concept, relation, rule, evidence, and decision identifiers;
- legal knowledge status transitions;
- exclusion of unreleased capabilities from customer and runtime projections;
- implementation and scenario evidence for verified rules;
- explicit supersession instead of silent historical deletion;
- consistency between structured assets and the human-readable architecture overview.

If a specialist returns `blocked-by-question`, `conflict`, `failed`, or `blocked`, the main agent must not report the feature as complete. It either resolves the issue, narrows the explicitly accepted scope, or reports the real blocker to the user.

## 11. Completion Gate

A business feature is complete only when all applicable conditions hold:

```text
Business implementation complete
+ main-agent tests pass
+ ontology = updated or not-applicable
+ quality = passed
+ no unresolved question affects the delivered scope
```

The final task summary includes the ontology result, quality result, relevant evidence, and any explicitly deferred scope.

## 12. Proposing Additional Specialist Roles

The main agent must proactively propose a new specialist-agent division when recurring work has all of these properties:

- a stable, long-term responsibility;
- clear file or subsystem ownership;
- an independently reviewable output;
- repeated use across future development;
- meaningful quality or throughput benefit from specialization.

When these conditions do not hold, the main agent uses temporary task decomposition rather than creating another permanent role. New permanent roles require user confirmation before being added to the project contract.

## 13. Initial Implementation Scope

The first implementation establishes:

1. the root orchestration rules;
2. both permanent role contracts;
3. the initial machine-readable knowledge directory and schemas;
4. migration of the currently confirmed product-process knowledge into the baseline;
5. validation commands or tests for structural integrity;
6. a documented decision-package and result format;
7. a dry-run of both specialist roles against the existing product management implementation.

A resident agent service, a customer ontology editor, a full customer Q&A page, and a production rule engine are outside this initial scope. Their future implementation will consume the stable knowledge structures created here.
