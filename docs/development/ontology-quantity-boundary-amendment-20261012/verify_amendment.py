#!/usr/bin/env python3
"""Verify this fixed knowledge amendment, not future product regression behavior."""
import collections
import hashlib
import importlib.util
import json
import pathlib

import yaml

INITIAL = "0d46558234a933a020430ccf6c6a064ecfa05687"
BASE = "7bf87c00a4a1158d6fbb4085eb9fb632918bcb50"
AUDIT = "docs/development/ontology-internal-audit-20261012"
AMENDMENT = "docs/development/ontology-quantity-boundary-amendment-20261012"
RULES = {
    "rule.production.production-batch-input-quantity-required",
    "rule.production.mass-batch-quantity-distribution",
}
QUESTION = "question.production-batch-quantity-lower-bound"
EVIDENCE = "evidence.production-batch-quantity-policy-boundary"
KNOWLEDGE_PATHS = {
    "docs/knowledge/rules/production.yaml",
    "docs/knowledge/glossary.yaml",
    "docs/knowledge/open-questions.yaml",
    "docs/knowledge/README.md",
    "docs/knowledge/evidence/ontology-foundation-fact-types.md",
    "docs/knowledge/evidence/production-batch-quantity-policy-boundary.yaml",
}


def main():
    root = pathlib.Path(__file__).resolve().parents[3]
    spec = importlib.util.spec_from_file_location("historical_inventory", root / AUDIT / "verify_audit.py")
    inventory_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(inventory_module)
    before, before_files = inventory_module.inventory(root, INITIAL)
    current, current_files = inventory_module.inventory(root)
    added = set(current) - set(before)
    removed = set(before) - set(current)
    modified = {key for key in set(current) & set(before)
                if current[key]["recordSha256"] != before[key]["recordSha256"]}
    assert added == {QUESTION, EVIDENCE}, ("unexpected added records", added)
    assert not removed, ("removed records", removed)
    assert modified == RULES | {"term.batch"}, ("unexpected modified records", modified)
    assert len(before) == 2313 and len(current) == 2315

    for key in RULES:
        old, new = before[key]["record"], current[key]["record"]
        assert old["status"] == "implemented"
        assert new["status"] == "deprecated" and new["visibility"] == "internal"
        assert new["condition"] == old["condition"], (key, "historical AST changed")
        assert new["result"] == old["result"], (key, "historical result changed")
        changed_fields = {field for field in old.keys() | new.keys() if old.get(field) != new.get(field)}
        assert changed_fields <= {"status", "name", "explanation", "evidenceIds"}, (key, changed_fields)
        assert QUESTION in new["explanation"] and EVIDENCE in new["evidenceIds"]
        assert set(old["evidenceIds"]) <= set(new["evidenceIds"])

    assert QUESTION in current["term.batch"]["record"]["definition"]
    assert current[QUESTION]["record"]["visibility"] == "internal"
    assert len(current[QUESTION]["record"]["options"]) == 2
    schema_path = "docs/knowledge/schema.yaml"
    assert before_files[schema_path]["data"] == current_files[schema_path]["data"]
    schema = yaml.safe_load(current_files[schema_path]["data"])
    for projection in ("customer", "runtime"):
        assert "deprecated" not in schema["projectionRules"][projection]["allowedStatuses"]

    actual_knowledge_paths = {
        path for path in set(before_files) | set(current_files)
        if before_files.get(path, {}).get("sha256") != current_files.get(path, {}).get("sha256")
    }
    assert actual_knowledge_paths == KNOWLEDGE_PATHS, actual_knowledge_paths

    historical_paths = inventory_module.git(root, "ls-tree", "-r", "--name-only", INITIAL, "--", AUDIT).decode().splitlines()
    preserved = 0
    for path in historical_paths:
        old = inventory_module.git(root, "show", f"{INITIAL}:{path}")
        new = (root / path).read_bytes()
        if path == f"{AUDIT}/README.md":
            assert new.endswith(old.split(b"\n\n", 1)[1]), "historical report body changed"
            assert AMENDMENT.split("/")[-1].encode() in new, "missing current amendment navigation"
        else:
            assert old == new, ("historical audit record changed", path)
            preserved += 1

    tracked = inventory_module.git(root, "diff", "--name-only", INITIAL, "--").decode().splitlines()
    untracked = inventory_module.git(root, "ls-files", "--others", "--exclude-standard").decode().splitlines()
    allowed = KNOWLEDGE_PATHS | {f"{AUDIT}/README.md"}
    assert all(path in allowed or path.startswith(AMENDMENT + "/") for path in tracked + untracked), "out-of-scope modification"

    manifest = json.loads((root / AMENDMENT / "amendment.json").read_text())
    assert manifest["initialAuditCommit"] == INITIAL and manifest["auditedCommit"] == BASE
    assert {row["id"] for row in manifest["recordDelta"]["modified"]} == modified
    assert {row["id"] for row in manifest["recordDelta"]["added"]} == added
    assert manifest["recordDelta"]["removed"] == []
    for row in manifest["recordDelta"]["modified"]:
        assert before[row["id"]]["recordSha256"] == row["beforeSha256"]
        assert current[row["id"]]["recordSha256"] == row["afterSha256"]
    for row in manifest["recordDelta"]["added"]:
        assert current[row["id"]]["recordSha256"] == row["afterSha256"]
    assert {row["path"] for row in manifest["knowledgeFileDelta"]} == KNOWLEDGE_PATHS
    for row in manifest["knowledgeFileDelta"]:
        assert hashlib.sha256((root / row["path"]).read_bytes()).hexdigest() == row["sha256"]

    original, _ = inventory_module.inventory(root, BASE)
    original_modified = {key for key in set(original) & set(current)
                         if original[key]["recordSha256"] != current[key]["recordSha256"]}
    baseline_counts = collections.Counter()
    baseline_records = {}
    for path in (root / AUDIT).glob("records-*.jsonl"):
        for line in path.read_text().splitlines():
            record = json.loads(line)
            baseline_records[record["id"]] = record
            baseline_counts[record["conclusion"]] += 1
    corrected_counts = baseline_counts.copy()
    assert {row["id"] for row in manifest["baselineConclusionCorrections"]} == RULES
    for row in manifest["baselineConclusionCorrections"]:
        assert baseline_records[row["id"]]["conclusion"] == row["previousConclusion"]
        assert row["correctedConclusion"] == "needs-decision"
        corrected_counts[row["previousConclusion"]] -= 1
        corrected_counts[row["correctedConclusion"]] += 1
    assert dict(corrected_counts) == manifest["correctedBaselineConclusions"]
    assert sum(corrected_counts.values()) == 2292
    print(json.dumps({
        "outcome": "passed",
        "initialAuditCommit": INITIAL,
        "auditedCommit": BASE,
        "scope": "Fixed amendment identity, withdrawn rule eligibility, preserved sources and audit history; no business runtime validation.",
        "amendmentCounts": {"modified": len(modified), "added": len(added), "removed": len(removed)},
        "completePrKnowledgeCounts": {"original": len(original), "candidate": len(current), "modified": len(original_modified), "added": len(set(current) - set(original)), "removed": len(set(original) - set(current))},
        "unchangedHistoricalAuditFiles": preserved,
        "historicalReportBodyPreserved": True,
        "correctedBaselineConclusions": dict(corrected_counts),
        "quantityPolicyResolved": False,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
