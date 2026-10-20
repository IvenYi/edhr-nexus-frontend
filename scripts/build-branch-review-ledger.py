#!/usr/bin/env python3
"""Reconcile historical, scoped audit evidence with a fixed Git tree.

This tool does not review application code, validate business policy, run migrations,
or turn a historical test/maintenance result into a current acceptance result.
"""
import argparse
import collections
import csv
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_jsonl(path, rows):
    path.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True) + "\n" for r in rows), encoding="utf-8")


def write_csv(path, columns, rows):
    with path.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


class Git:
    def __init__(self):
        self.trees = {}
        self.objects = {}

    def command(self, *args):
        return subprocess.check_output(["git", *args], stderr=subprocess.PIPE)

    def commit(self, ref):
        return self.command("rev-parse", "--verify", ref + "^{commit}").decode().strip()

    def tree(self, commit):
        if commit not in self.trees:
            rows = {}
            for item in self.command("ls-tree", "-rz", commit).split(b"\0"):
                if item:
                    meta, path = item.split(b"\t", 1)
                    mode, kind, blob = meta.decode().split()
                    rows[path.decode()] = {"mode": mode, "kind": kind, "blob": blob}
            self.trees[commit] = rows
        return self.trees[commit]

    def read(self, commit, path):
        entry = self.tree(commit).get(path)
        if not entry or entry["kind"] != "blob":
            raise ValueError(f"Missing tracked blob: {commit}:{path}")
        blob = entry["blob"]
        if blob not in self.objects:
            self.objects[blob] = self.command("cat-file", "blob", blob)
        return self.objects[blob]


def evidence(git, value):
    """Evidence receipts are assertions, not hints with a silent fallback."""
    commit = git.commit(value["commit"])
    raw = git.read(commit, value["path"])
    if digest(raw) != value["sha256"]:
        raise ValueError(f"Evidence SHA mismatch: {value['path']}")
    if not value.get("locator"):
        raise ValueError(f"Evidence locator required: {value['path']}")
    return {**value, "commit": commit}


def reconcile_methods(git, baseline, records):
    result, seen = [], set()
    for record in records:
        if record["id"] in seen:
            raise ValueError(f"Duplicate method record ID: {record['id']}")
        seen.add(record["id"])
        if record.get("wholeFileReviewComplete") is not False or not record.get("scope"):
            raise ValueError("Only explicit nonempty method scopes may be imported")
        row = {**record, "evidence": evidence(git, record["evidence"]),
               "additionalEvidence": [evidence(git, e) for e in record.get("additionalEvidence", [])], "baselineCommit": baseline}
        current = git.tree(baseline).get(record["path"])
        row["currentBlob"] = current["blob"] if current else None
        row["currentRuntimeExecuted"] = False
        ref = record.get("reviewedCommit")
        if not ref:
            row.update(sourceRelation="unresolved-source", carryStatus="evidence-gap")
        else:
            commit = git.commit(ref)
            old = git.tree(commit).get(record["path"])
            if not old or old["kind"] != "blob":
                raise ValueError(f"Reviewed source missing: {commit}:{record['path']}")
            raw = git.read(commit, record["path"])
            if record.get("sourceBlob") and record["sourceBlob"] != old["blob"]:
                raise ValueError(f"Reviewed blob mismatch: {record['id']}")
            if record.get("sourceSha256") and record["sourceSha256"] != digest(raw):
                raise ValueError(f"Reviewed SHA mismatch: {record['id']}")
            relation = "removed" if current is None else "unchanged" if old["blob"] == current["blob"] else "file-changed"
            row.update(reviewedCommit=commit, sourceBlob=old["blob"], sourceSha256=digest(raw), sourceRelation=relation,
                       carryStatus="retained-scoped-evidence" if relation == "unchanged" else "needs-delta-review")
        result.append(row)
    return sorted(result, key=lambda r: r["id"])


def knowledge_records(git, commit):
    schema = yaml.safe_load(git.read(commit, "docs/knowledge/schema.yaml"))
    top, nested = schema["collectionTypes"], schema["nestedCollectionTypes"]
    rows = {}

    def add(record, kind, path, locator):
        if not isinstance(record, dict) or not isinstance(record.get("id"), str):
            raise ValueError(f"Invalid declared knowledge record at {path}:{locator}")
        key = record["id"]
        if key in rows:
            raise ValueError(f"Duplicate knowledge ID: {key}")
        rows[key] = {"id": key, "recordType": kind, "sourcePath": path, "sourceLocator": locator,
                     "recordSha256": digest(canonical(record)), "assetStatus": record.get("status"),
                     "visibility": record.get("visibility"), "baselineCommit": commit}

    def visit(value, path, locator):
        if isinstance(value, dict):
            for key, child in value.items():
                pointer = locator + "/" + str(key).replace("~", "~0").replace("/", "~1")
                if key in nested and isinstance(child, list):
                    for index, record in enumerate(child):
                        add(record, nested[key], path, pointer + "/" + str(index))
                visit(child, path, pointer)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                visit(child, path, locator + "/" + str(index))

    for path in sorted(git.tree(commit)):
        if not path.startswith("docs/knowledge/") or not path.endswith((".yaml", ".yml")) or path == "docs/knowledge/schema.yaml":
            continue
        document = yaml.safe_load(git.read(commit, path))
        if isinstance(document, dict):
            for key, kind in top.items():
                for index, record in enumerate(document.get(key, []) or []):
                    add(record, kind, path, "/" + key + "/" + str(index))
                    visit(record, path, "/" + key + "/" + str(index))
    return rows


DEPENDENCY = re.compile(r"(?:gmp-platform|docs|tools|scripts)/[^\s;`\"<>]+?\.(?:java|tsx|ts|mjs|md|yaml|yml|json|py)(?=[:\s;,`\"<>]|$)")


def reconcile_semantics(git, baseline, sources, current):
    results = []
    seen = set()
    historical = {}
    for source in sources:
        receipt = evidence(git, source)
        for index, line in enumerate(git.read(receipt["commit"], receipt["path"]).decode().splitlines(), 1):
            if not line.strip():
                continue
            old = json.loads(line)
            identity = (old["id"], old["sourceCommit"], old["recordSha256"])
            if identity in seen:
                raise ValueError(f"Duplicate semantic review: {identity}")
            seen.add(identity)
            reviewed = git.commit(old["sourceCommit"])
            if reviewed not in historical:
                historical[reviewed] = knowledge_records(git, reviewed)
            original = historical[reviewed].get(old["id"])
            if original is None or original["recordSha256"] != old["recordSha256"]:
                raise ValueError(f"Historical semantic record mismatch: {old['id']}")
            now = current.get(old["id"])
            relation = "removed" if now is None else "unchanged" if now["recordSha256"] == old["recordSha256"] else "record-changed"
            dependencies = []
            # These are the original record's named sources, not an invented full dependency graph.
            named = {key: value for key, value in old.items() if key in {
                "decisionEvidence", "entry", "write", "historicalRead", "testAssertionsRead", "implementationEvidence", "evidence"}}
            for path in sorted(set(DEPENDENCY.findall(json.dumps(named, ensure_ascii=False)))):
                before, after = git.tree(reviewed).get(path), git.tree(baseline).get(path)
                status = "unresolved" if before is None else "removed" if after is None else "unchanged" if before["blob"] == after["blob"] else "file-changed"
                dependencies.append({"path": path, "sourceBlob": before["blob"] if before else None,
                                     "currentBlob": after["blob"] if after else None, "relation": status})
            stable = relation == "unchanged" and bool(dependencies) and all(d["relation"] == "unchanged" for d in dependencies)
            results.append({"id": old["id"], "baselineCommit": baseline, "reviewedCommit": reviewed,
                            "evidence": {**receipt, "recordLine": index}, "recordRelation": relation,
                            "dependencies": dependencies, "carryStatus": "retained-scoped-evidence" if stable else "needs-delta-review",
                            "historicalReview": old, "newSemanticReviewPerformed": False, "currentRuntimeExecuted": False})
    return sorted(results, key=lambda r: (r["id"], r["reviewedCommit"]))


def report_indexes(git, baseline):
    quality, sync, receipts = {}, {}, []
    for path in sorted(git.tree(baseline)):
        if not path.startswith("docs/development/") or not path.endswith((".yaml", ".yml")):
            continue
        if not any(word in path.lower() for word in ("quality", "ontology")):
            continue
        raw = git.read(baseline, path)
        document = yaml.safe_load(raw)
        if not isinstance(document, dict):
            continue
        sha = digest(raw)
        for root, target in (("qualityResult", quality), ("ontologyResult", sync)):
            if isinstance(document.get(root), dict):
                if sha not in target:
                    original = document[root]
                    selected = {key: original[key] for key in (
                        "result", "baseCommit", "headCommit", "contractBaseline", "workingTreeState", "knowledgeBaselineVersion",
                        "baselineBefore", "baselineAfter", "knowledgeSync") if key in original}
                    if root == "qualityResult":
                        selected["checks"] = [{key: check.get(key) for key in ("id", "required", "category", "method", "outcome")}
                                              for check in original.get("checks", [])]
                        selected["findings"] = [{key: finding.get(key) for key in ("id", "severity", "resolutionStatus")}
                                                for finding in original.get("findings", [])]
                    target[sha] = {"sha256": sha, "paths": [], "sourceCommit": baseline, "reported": selected,
                                   "originalRecordLocator": "/" + root, "freeTextLogsAndCommandsNotRepublished": True,
                                   "newlyExecutedInThisBatch": False}
                target[sha]["paths"].append(path)
        receipts.append({"path": path, "sourceCommit": baseline, "sha256": sha})
    return list(quality.values()), list(sync.values()), receipts


def build(git, ref, catalog, out):
    baseline = git.commit(ref)
    if baseline != git.commit(catalog["baselineCommit"]):
        raise ValueError("Catalog and selected Git baseline differ")
    if out.exists() and any(out.iterdir()):
        raise ValueError("Output must be empty; historical artifacts are never overwritten")
    out.mkdir(parents=True, exist_ok=True)
    legacy = Path(__file__).with_name("build-branch-review-inventory.py")
    subprocess.run([sys.executable, str(legacy), "--ref", baseline, "--out", str(out)], check=True, stdout=subprocess.PIPE)
    methods = reconcile_methods(git, baseline, catalog["methods"])
    current = knowledge_records(git, baseline)
    semantics = reconcile_semantics(git, baseline, catalog["semanticSources"], current)
    quality, sync, report_receipts = report_indexes(git, baseline)
    findings = []
    finding_ids = set()
    for record in catalog["findings"]:
        if record["id"] in finding_ids:
            raise ValueError(f"Duplicate full finding ID: {record['id']}")
        finding_ids.add(record["id"])
        if not record.get("evidence"):
            raise ValueError(f"Finding disposition requires source evidence: {record['id']}")
        findings.append({**record, "evidence": [evidence(git, e) for e in record["evidence"]],
                         "newlyAdjudicatedInThisBatch": False, "runtimeReverifiedInThisBatch": False})
    with (out / "coverage.csv").open(newline="", encoding="utf-8") as stream:
        reader = csv.DictReader(stream)
        columns, rows = reader.fieldnames, list(reader)
    columns += ["source_blob", "ownership_basis", "whole_file_review_complete", "scoped_evidence_ids", "delta_scope_ids", "evidence_gap_ids"]
    for row in rows:
        claims = [m for m in methods if m["path"] == row["path"]]
        retained = [m["id"] for m in claims if m["carryStatus"] == "retained-scoped-evidence"]
        delta = [m["id"] for m in claims if m["carryStatus"] == "needs-delta-review"]
        gaps = [m["id"] for m in claims if m["carryStatus"] == "evidence-gap"]
        row.update(source_blob=git.tree(baseline)[row["path"]]["blob"], ownership_basis="inferred-path-classifier-not-semantic-review",
                   whole_file_review_complete="false", scoped_evidence_ids=json.dumps(retained),
                   delta_scope_ids=json.dumps(delta), evidence_gap_ids=json.dumps(gaps))
        row["review_status"] = "partial-reviewed" if retained else "pending"
        row["review_depth"] = "listed-method-scopes-only" if retained else "inventory-only"
        row["source_evidence"] = ";".join(m["evidence"]["path"] + "#" + m["evidence"]["locator"] for m in claims)
        row["notes"] = "Whole file pending. Changed file requires checking listed scopes, not an assertion that every method changed."
    write_csv(out / "coverage.csv", columns, rows)
    write_jsonl(out / "method-reviews.jsonl", methods)
    write_jsonl(out / "semantic-reviews.jsonl", semantics)
    knowledge = []
    for key, row in sorted(current.items()):
        prior = [s for s in semantics if s["id"] == key]
        maintenance = [{"reportSha256": s["sha256"], "paths": s["paths"], "disposition": item.get("disposition"), "scope": item.get("scope")}
                       for s in sync for item in s["reported"].get("knowledgeSync", []) if item.get("id") == key]
        knowledge.append({**row, "historicalReviewCount": len(prior), "historicalConclusions": [s["historicalReview"]["conclusion"] for s in prior],
                          "historicalEvidenceStates": [s["carryStatus"] for s in prior], "maintenanceEvidence": maintenance,
                          "newSemanticReviewPerformed": False, "currentSemanticPassClaimed": False})
    write_jsonl(out / "knowledge-records.jsonl", knowledge)
    write_json(out / "findings.json", sorted(findings, key=lambda r: r["id"]))
    aliases = collections.defaultdict(list)
    for item in findings:
        for alias in item.get("aliases", []):
            aliases[alias].append(item["id"])
    write_json(out / "finding-aliases.json", {key: sorted(set(value)) for key, value in sorted(aliases.items())})
    notes = catalog.get("importNotes", [])
    for note in notes:
        for item in note.get("evidence", []):
            evidence(git, item)
    write_json(out / "import-notes.json", notes)
    write_json(out / "quality-report-index.json", quality)
    write_json(out / "knowledge-sync-index.json", sync)
    source_receipts = {(r["sourceCommit"], r["path"]): r for r in report_receipts}
    all_receipts = ([m["evidence"] for m in methods] + [e for m in methods for e in m["additionalEvidence"]]
                    + [s["evidence"] for s in semantics] + [e for f in findings for e in f["evidence"]]
                    + [e for note in notes for e in note.get("evidence", [])])
    for item in all_receipts:
        source_receipts[(item["commit"], item["path"])] = {"path": item["path"], "sourceCommit": item["commit"], "sha256": item["sha256"]}
    write_json(out / "source-receipts.json", [source_receipts[k] for k in sorted(source_receipts)])
    inventory = json.loads((out / "inventory-summary.json").read_text())
    summary = {"schema": "edhr-scoped-audit-ledger/v1", "baselineCommit": baseline, "tree": git.command("rev-parse", baseline + "^{tree}").decode().strip(),
               "catalogSha256": digest(canonical(catalog)), "generatorSha256": digest(Path(__file__).read_bytes()),
               "inventoryGeneratorSha256": digest(legacy.read_bytes()),
               "inventory": {"trackedPaths": len(rows), "classifiedPaths": len(rows),
                 "classificationBasis": "inferred-path-classifier", "workPackages": inventory["workPackages"],
                 "entrypointCandidates": inventory["entrypointCandidates"], "migrationFiles": inventory["migrationFiles"]},
               "sourceReview": {"recordedScopes": len(methods), "carryStates": dict(collections.Counter(m["carryStatus"] for m in methods)),
                 "sourceRelations": dict(collections.Counter(m["sourceRelation"] for m in methods)), "wholeFilesCompleted": 0,
                 "sourceImportQualifications": sum(n.get("noteKind") == "source-map-qualification" for n in notes),
                 "scopeRecordsAreNotDistinctMethodsOrACompleteDenominator": True},
               "knowledgeReview": {"currentIds": len(current), "historicalScopedReviews": len(semantics),
                 "historicalConclusions": dict(collections.Counter(s["historicalReview"]["conclusion"] for s in semantics)),
                 "recordRelations": dict(collections.Counter(s["recordRelation"] for s in semantics)),
                 "evidenceStates": dict(collections.Counter(s["carryStatus"] for s in semantics)),
                 "maintenanceReports": len(sync), "newSemanticReviews": 0, "maintenanceIsNotSemanticAcceptance": True},
               "remediation": {"findingRecords": len(findings), "dispositions": dict(collections.Counter(f["disposition"] for f in findings)),
                 "recordKinds": dict(collections.Counter(f.get("recordKind", "unspecified") for f in findings)),
                 "recordsAreNotDistinctDefects": True, "newAdjudications": 0},
               "runtime": {"reportedQualityArtifacts": len(quality), "reportedResults": dict(collections.Counter(q["reported"].get("result") for q in quality)),
                 "businessChecksExecutedInThisBatch": [], "oldResultsAreScopedHistoricalEvidence": True},
               "overallAuditComplete": False, "overallPercent": None}
    write_json(out / "summary.json", summary)
    manifest = [{"path": p.name, "bytes": p.stat().st_size, "sha256": digest(p.read_bytes())} for p in sorted(out.iterdir()) if p.is_file()]
    write_json(out / "receipts.json", manifest)
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ref", required=True)
    parser.add_argument("--catalog", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--check", action="store_true", help="Rebuild in a temporary directory and compare every generated byte")
    args = parser.parse_args()
    git = Git()
    catalog = json.loads(args.catalog.read_text(encoding="utf-8"))
    if args.check:
        with tempfile.TemporaryDirectory(prefix="edhr-ledger-check-") as folder:
            expected = Path(folder)
            summary = build(git, args.ref, catalog, expected)
            names = {p.name for p in expected.iterdir()}
            if names != {p.name for p in args.out.iterdir()} or any((args.out / n).read_bytes() != (expected / n).read_bytes() for n in names):
                raise ValueError("Generated ledger differs from the fixed baseline/catalog")
    else:
        if args.out.exists() and any(args.out.iterdir()):
            raise ValueError("Output must be empty; historical artifacts are never overwritten")
        with tempfile.TemporaryDirectory(prefix="edhr-ledger-build-") as folder:
            temporary = Path(folder)
            summary = build(git, args.ref, catalog, temporary)
            args.out.mkdir(parents=True, exist_ok=True)
            for path in temporary.iterdir():
                shutil.copyfile(path, args.out / path.name)
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
