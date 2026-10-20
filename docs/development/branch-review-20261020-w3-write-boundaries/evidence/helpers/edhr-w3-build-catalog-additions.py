#!/usr/bin/env python3
"""Prepare a W3 catalog from committed evidence; does not execute product checks.

Run from the repository root after the implementation and white-listed evidence
have been committed. The default output is outside the repository. Every source
and evidence hash is read from the selected Git commits, never a dirty fallback.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import subprocess


TARGET = "a8285be9b91fb76bcb27ccb16a5258bda1fb5077"
GUARD_FIX = "84c5b6d6af15f4f9d684c99e8eb8d110ae039954"
PRIOR = "docs/development/branch-review-20261020-trace-freeze-chain"
BATCH = "docs/development/branch-review-20261020-w3-write-boundaries"
MAPS = (
    ("edhr-w3-write-entry-source-map.json", "scopeRecords", "w3-write-entry-source", 40),
    ("edhr-w3-transfer-source-map.json", "sourceScopes", "w3-transfer-source", 17),
    ("edhr-w3-audit-hash-source-map.json", "sourceScopes", "w3-audit-hash-source", 12),
)


def git(*args):
    return subprocess.check_output(["git", *args], stderr=subprocess.PIPE)


def commit(ref):
    return git("rev-parse", "--verify", ref + "^{commit}").decode().strip()


def raw(ref, path):
    return git("show", f"{ref}:{path}")


def digest(value):
    return hashlib.sha256(value).hexdigest()


def document(ref, path):
    return json.loads(raw(ref, path))


def receipt(ref, path, locator):
    return {"path": path, "commit": ref, "sha256": digest(raw(ref, path)), "locator": locator}


def unique_append(sequence, value):
    if value not in sequence:
        sequence.append(value)


def preserve_prior_disposition(finding):
    finding["priorBatchDisposition"] = {
        key: copy.deepcopy(finding[key]) for key in
        ("disposition", "dispositionQualification", "resolution", "limitations") if key in finding
    }


def helper_methods(evidence_ref, helpers):
    result = []
    for filename, collection, prefix, expected in MAPS:
        path = f"{helpers}/{filename}"
        source = document(evidence_ref, path)
        rows = source[collection]
        if len(rows) != expected:
            raise ValueError(f"Unexpected fixed helper scope count: {filename}")
        for index, row in enumerate(rows):
            reviewed = commit(row.get("sourceCommit") or row.get("fixedCommit") or source["fixedCommit"])
            blob = git("rev-parse", f"{reviewed}:{row['path']}").decode().strip()
            sha = digest(raw(reviewed, row["path"]))
            if row["blob"] != blob or row["sha256"] != sha:
                raise ValueError(f"Original source receipt mismatch: {filename} #{index}")
            if row.get("wholeFileReviewComplete") is True or row.get("runtimeExecuted") is True:
                raise ValueError("Source helper unexpectedly claims whole-file/runtime acceptance")
            location = row.get("range", row.get("ranges"))
            result.append({
                "id": f"{prefix}:{index + 1:03d}", "path": row["path"], "scope": row["method"],
                "pathScope": copy.deepcopy(location), "reviewedCommit": reviewed,
                "sourceBlob": blob, "sourceSha256": sha,
                "evidence": receipt(evidence_ref, path, f"/{collection}/{index}"),
                "additionalEvidence": [], "depth": row["readDepth"], "wholeFileReviewComplete": False,
                "recordedOutcome": row["conclusion"],
                "reviewedCommitBasis": "actual original helper fixed Git source and exact source blob/SHA; later policy/repair not backfilled into original conclusion",
                "preparationRecordId": row.get("id", f"/{collection}/{index}"),
                "originalCaveats": copy.deepcopy(row.get("caveats", [])),
                "runtimeExecutedBySourceHelper": False,
            })
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--implementation-ref", required=True, help="Fixed source/catalog baseline, including final knowledge")
    parser.add_argument("--evidence-ref", required=True, help="Commit containing archived original helper/runtime artifacts")
    parser.add_argument("--transfer-fix-ref", help="Actual core transfer/lock repair commit; default implementation-ref")
    parser.add_argument("--helpers", default=BATCH + "/evidence/helpers")
    parser.add_argument("--runtime-summary", default=BATCH + "/evidence/primary/edhr-w3-final-primary-backend-summary.json")
    parser.add_argument("--race-summary", default=BATCH + "/evidence/primary/edhr-w3-transfer-pg-test-summary.json")
    parser.add_argument("--audit-probe", default=BATCH + "/evidence/primary/edhr-w3-audit-hash-baseline-probe-summary.json")
    parser.add_argument("--batch-review", default=BATCH + "/README.md")
    parser.add_argument("--ontology-source", help="Optional committed repository-relative finite semantic JSONL")
    parser.add_argument("--ontology-ref", help="Commit containing semantic JSONL; default evidence-ref")
    parser.add_argument("--out", type=Path, default=Path("/tmp/edhr-w3-source-catalog-draft.json"))
    args = parser.parse_args()
    implementation, evidence_ref = commit(args.implementation_ref), commit(args.evidence_ref)
    transfer_fix = commit(args.transfer_fix_ref or args.implementation_ref)
    catalog = document(TARGET, PRIOR + "/source-catalog.json")
    old = copy.deepcopy(catalog)
    if len(catalog["methods"]) != 216 or len(catalog["findings"]) != 42:
        raise ValueError("Prior catalog differs from the fixed inherited source")
    additions = helper_methods(evidence_ref, args.helpers)
    catalog["methods"].extend(additions)
    catalog["baselineCommit"] = implementation
    catalog["inheritedCatalog"] = {
        **receipt(TARGET, PRIOR + "/source-catalog.json", "/"),
        "preservedMethodRecords": 216, "preservedSemanticReviews": 45,
        "preservedFindingRecords": 42, "preservedImportNotes": len(old.get("importNotes", [])),
        "previousInheritedCatalog": old.get("inheritedCatalog"),
    }
    semantic_count = 0
    if args.ontology_source:
        ontology_ref = commit(args.ontology_ref or args.evidence_ref)
        records = [json.loads(line) for line in raw(ontology_ref, args.ontology_source).decode().splitlines() if line.strip()]
        semantic_count = len(records)
        if not semantic_count:
            raise ValueError("Empty formal semantic source")
        # The main ledger generator verifies sourceCommit + canonical recordSha256
        # for every knowledge ID, and rejects duplicate semantic identities.
        if any(not all(key in row for key in ("id", "sourceCommit", "recordSha256", "conclusion")) for row in records):
            raise ValueError("Incomplete semantic record")
        catalog["semanticSources"].append(receipt(ontology_ref, args.ontology_source,
            f"all {semantic_count} finite JSONL records; actual original knowledge sourceCommit preserved"))

    batch_review = receipt(evidence_ref, args.batch_review, "本批发现、实际验证与限制")
    runtime = receipt(evidence_ref, args.runtime_summary, "/suites")
    race = receipt(evidence_ref, args.race_summary, "/earlierRuns; /actualBoundaries; /suites")
    probe = receipt(evidence_ref, args.audit_probe, "/suite; /cases")
    probe_document = document(evidence_ref, args.audit_probe)
    if probe_document["sourceCommit"] != TARGET or int(probe_document["suite"]["tests"]) != 2 or int(probe_document["suite"]["failures"]) != 2:
        raise ValueError("W5 finding must retain the actual fixed-baseline 2-red probe")
    by_id = {item["id"]: item for item in catalog["findings"]}
    for key in ("AUD-H009", "AUD-H010", "AUD-H012"):
        finding = by_id[key]
        preserve_prior_disposition(finding)
        finding["disposition"] = "fixed-awaiting-independent-acceptance"
        finding["dispositionQualification"] = "Current root source adjudication and primary regression evidence; fresh formal independent QA still required. Historical master ID and raw original conclusions retained."
        unique_append(finding["resolution"].setdefault("fixCommits", []), GUARD_FIX if key != "AUD-H012" else transfer_fix)
        finding["resolution"]["primarySourceCommit"] = implementation
        finding["limitations"] = ["Current fixed slice only; no whole-W3 or whole-branch acceptance.",
            "No historical cleanup, data restoration or reconstruction of lost candidate evidence.",
            "Parent's original helper limitations retained under priorBatchDisposition."]
        finding["evidence"].extend([batch_review, runtime])
        if key == "AUD-H012":
            finding["evidence"].append(race)
            finding["userConfirmedPolicyIncrement"] = "DEC-0081 explicitly allows tenant delegation for generic workflows and ordinary production forms; DHR retained. Origin preservation is separate from current handling rights."
        else:
            finding["scopeQualification"] = "Only the five retired top-level reserved keys/presence; draft completeness unchanged. Adjacent defaultBranch extra-fields asymmetry remains an unadjudicated source lead."

    acceptance_path = PRIOR + "/acceptance.json"
    accepted = document(TARGET, acceptance_path)
    if accepted["qualityResult"] != "passed" or accepted["requiredChecks"] != accepted["requiredPassed"]:
        raise ValueError("Prior independent acceptance cannot support merged disposition")
    for key in ("W2-TRACE-REGION-001", "W2-TRACE-REGION-002"):
        finding = by_id[key]
        preserve_prior_disposition(finding)
        finding["disposition"] = "fixed-and-independently-accepted"
        finding["dispositionQualification"] = "Prior batch's exact independent tested candidate was accepted and PR19 was manually merged; this catalog does not claim a new execution."
        finding["limitations"] = ["Applies only to prior batch's tested scope; historical index backfill remains excluded."]
        finding["resolution"].update(fixCommits=[accepted["implementationCommit"]], testedCommits=[accepted["testedCommit"]],
            pullRequests=[19], mergeCommits=[TARGET], deliveryCommit="3bfe0c6d8af19d5142aaa6edbf37a8e5f18869cc", integrationStatus="merged")
        finding["evidence"].append(receipt(TARGET, acceptance_path, f"/findings; {key}"))
        finding["evidence"].append(receipt(TARGET, PRIOR + "/" + accepted["qualityResultPath"], "/qualityResult"))

    catalog["findings"].extend([
        {"id": "W3-TRANSFER-LOCK-001", "recordKind": "product-defect", "originalStatus": "source-confirmed-and-reproduced",
         "severity": "high", "workPackage": "W3", "aliases": [], "parentIssueId": None,
         "affectedPaths": ["gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/engine/WorkflowEngine.java"],
         "description": "等待实例/任务行锁前已受管的旧实体未刷新，同一原处理人的并发命令可使用过期处理权重复成功；连续转办/旧候选完成竞争须重新读取锁内状态。",
         "disposition": "fixed-awaiting-independent-acceptance",
         "resolution": {"fixCommits": [transfer_fix], "testedCommits": [], "pullRequests": [], "mergeCommits": [], "primarySourceCommit": implementation},
         "limitations": ["Fresh independent acceptance is still pending.", "Local lock-and-refresh correction only; not a full workflow-engine concurrency audit."],
         "evidence": [batch_review, race]},
        {"id": "W5-AUDIT-HASH-001", "recordKind": "product-defect", "originalStatus": "preexisting-reproduced-on-fixed-baseline",
         "severity": "medium", "workPackage": "W5", "aliases": [], "parentIssueId": None,
         "affectedPaths": ["gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/entity/AuditEvent.java"],
         "description": "AuditEvent在PrePersist按原JSON/时间字符串封存hash，PostgreSQL JSONB/时间往返归一化后computeSnapshotHash不能还原原hash；基线a828两条原生PG探针均失败。",
         "disposition": "preexisting-medium-open",
         "resolution": {"fixCommits": [], "testedCommits": [], "pullRequests": [], "mergeCommits": []},
         "limitations": ["Existing application AuditEvent read/export does not rehash; distinct DHR/signature/file hash checks must not be conflated.",
             "Not introduced or repaired by this delegation/write-guard slice; no new hash algorithm or historical audit rewrite authorized.",
             "Future separate W5 review must define stable canonical payload/version and historical compatibility; current stored-hash/atomicity tests do not certify round-trip rehash."],
         "evidence": [probe, receipt(evidence_ref, args.helpers + "/edhr-w3-audit-hash-source-map.json", "/sourceScopes"), batch_review]},
    ])
    catalog["importNotes"].extend([
        {"noteKind": "source-map-qualification", "id": "w3-write-default-branch-extras-unadjudicated",
         "scope": "defaultBranch extra rule/catalog/snapshot fields during draft save versus publish",
         "reason": "Source lead only; not runtime adjudicated or closed by top-level reserved-key guard.",
         "evidence": [receipt(evidence_ref, args.helpers + "/edhr-w3-write-entry-source-map.json", "/adjacentUnadjudicated")]},
        {"noteKind": "scope-progress-boundary", "id": "w3-current-slice-is-not-whole-audit",
         "scope": "W0–W7 whole branch audit",
         "reason": "Retain two user-deferred DHR highs, four old semantic gaps, A12 and remaining W2/W3/W4–W7 work. No automated inventory, maintenance report or passing subset establishes whole-file/whole-branch completion.",
         "evidence": [batch_review]},
    ])
    catalog["policy"].extend([
        "69 new helper records retain a828 source conclusions; overlap and two ID-level audit references prevent treating them as 69 distinct code methods.",
        "User-confirmed DEC-0081 delegation increment is a declared scope expansion; original transfer helper's earlier unresolved question is retained as historical source.",
        "Current fixed-slice dispositions awaiting QA are not final independent acceptance; later outcome belongs to a separate L0 acceptance overlay.",
    ])
    if catalog["methods"][:216] != old["methods"] or catalog["semanticSources"][:2] != old["semanticSources"]:
        raise ValueError("Inherited methods/semantics changed")
    untouched = set(by_id) - {"AUD-H009", "AUD-H010", "AUD-H012", "W2-TRACE-REGION-001", "W2-TRACE-REGION-002"}
    if any(by_id[f["id"]] != f for f in old["findings"] if f["id"] in untouched):
        raise ValueError("Unrelated inherited disposition changed")
    if len({m["id"] for m in catalog["methods"]}) != len(catalog["methods"]) or len({f["id"] for f in catalog["findings"]}) != len(catalog["findings"]):
        raise ValueError("Duplicate catalog ID")
    args.out.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"catalog": str(args.out), "baselineCommit": implementation, "evidenceCommit": evidence_ref,
        "methods": len(catalog["methods"]), "inheritedSemanticReviews": 45, "newFiniteSemanticRecords": semantic_count,
        "findingRecords": len(catalog["findings"]), "sha256": digest(args.out.read_bytes()),
        "wholeAuditComplete": False, "productChecksExecutedByThisScript": []}, ensure_ascii=False))


if __name__ == "__main__":
    main()
