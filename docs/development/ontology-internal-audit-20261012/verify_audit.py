#!/usr/bin/env python3
"""Verify inventory identity and audit/candidate evidence; never infer semantic passes.

Run from a checkout containing the pinned baseline. Requires Python 3, PyYAML, Git.
The official ontology gate remains tools/knowledge-model/pom.xml.
"""
import collections
import hashlib
import json
import pathlib
import subprocess

import yaml

BASE = "7bf87c00a4a1158d6fbb4085eb9fb632918bcb50"
REPORT_PATH = "docs/development/ontology-internal-audit-20261012"
DOMAINS = ("foundation", "forms", "master", "production")


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                     separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def git(root, *args):
    return subprocess.check_output(["git", *args], cwd=root)


def inventory(root, revision=None):
    """Only schema-driven enumeration and content identity, with no judgments."""
    if revision:
        files = {}
        for entry in git(root, "ls-tree", "-rz", revision, "--", "docs/knowledge").split(b"\0"):
            if entry:
                meta, name = entry.split(b"\t", 1)
                path = name.decode()
                data = git(root, "show", f"{revision}:{path}")
                files[path] = {"path": path, "gitBlob": meta.split()[2].decode(),
                               "sha256": sha256(data), "data": data}
    else:
        paths = git(root, "ls-files", "-z", "--cached", "--others", "--exclude-standard",
                    "--", "docs/knowledge").split(b"\0")
        files = {}
        for raw in paths:
            if raw:
                path = raw.decode()
                data = (root / path).read_bytes()
                files[path] = {"path": path, "sha256": sha256(data), "data": data}
    schema = yaml.safe_load(files["docs/knowledge/schema.yaml"]["data"])
    records = {}

    def collect(record, typ, path, pointer, parent=None):
        ident = record["id"]
        assert ident not in records, ("duplicate ID", ident)
        records[ident] = {"id": ident, "recordType": typ, "sourcePath": path,
                          "sourceLocator": pointer, "parentId": parent,
                          "assetStatus": record.get("status"),
                          "sourceReviewStatus": record.get("reviewStatus"),
                          "recordSha256": digest(record), "record": record}
        fields = schema["recordTypes"][typ]["fieldTypes"]
        for key, nested_type in schema["nestedCollectionTypes"].items():
            if key in record:
                assert fields.get(key) == f"array<{nested_type}>"
                for i, child in enumerate(record[key]):
                    collect(child, nested_type, path, f"{pointer}/{key}/{i}", ident)

    for path, file in files.items():
        if not path.endswith(".yaml") or path.endswith("/schema.yaml"):
            continue
        doc = yaml.safe_load(file["data"])
        assert doc["knowledgeModelVersion"] == schema["knowledgeModelVersion"], path
        for key, rows in doc.items():
            if key == "knowledgeModelVersion":
                continue
            typ = schema["collectionTypes"][key]
            for i, row in enumerate(rows):
                collect(row, typ, path, f"/{key}/{i}")
    return records, files


def read_jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line]


def main():
    root = pathlib.Path(__file__).resolve().parents[3]
    report = root / REPORT_PATH
    baseline = json.loads((report / "baseline.json").read_text())
    original, files = inventory(root, BASE)
    assert baseline["auditedCommit"] == BASE
    assert len(original) == 2292 and len(files) == 239
    assert sha256((root / baseline["previousInventory"]["path"]).read_bytes()) == baseline["previousInventory"]["sha256"]
    for item in baseline["files"]:
        actual = files[item["path"]]
        assert all(item[k] == actual[k] for k in ("gitBlob", "sha256")), item["path"]
    assert {f["path"] for f in baseline["files"]} == set(files)

    evidence = read_jsonl(report / "evidence-index.jsonl")
    by_evidence = {e["id"]: e["reference"] for e in evidence}
    assert len(evidence) == len(by_evidence)
    for item in evidence:
        assert item["id"] == "ev-" + digest(item["reference"])[:16]
        path = item["reference"].get("path")
        if path and not path.startswith(("/", "http:", "https:", "C:", "D:")):
            assert git(root, "cat-file", "-t", f"{BASE}:{path}").strip() in (b"blob", b"tree"), path

    rows = []
    domain_counts = {}
    for domain in DOMAINS:
        records = read_jsonl(report / f"records-{domain}.jsonl")
        domain_counts[domain] = dict(collections.Counter(r["conclusion"] for r in records))
        rows.extend(records)
    by_id = {r["id"]: r for r in rows}
    assert len(rows) == len(by_id) == 2292 and set(by_id) == set(original)
    for ident, row in by_id.items():
        expected = original[ident]
        for key in ("recordType", "sourcePath", "sourceLocator", "parentId", "assetStatus",
                    "sourceReviewStatus", "recordSha256"):
            assert row[key] == expected[key], (ident, key)
        assert row["reviewStatus"] == "reviewed" and row["scope"]
        assert row["conclusion"] in ("consistent", "needs-fix", "superseded", "needs-decision", "evidence-gap")
        assert row["evidenceReferenceIds"]
        assert all(e in by_evidence for e in row["evidenceReferenceIds"]), ident

    file_rows = read_jsonl(report / "files-without-ids.jsonl")
    expected_idless = set(files) - {r["sourcePath"] for r in original.values()}
    assert len(file_rows) == 52 and {r["sourcePath"] for r in file_rows} == expected_idless
    for row in file_rows:
        assert row["originalGitBlob"] == files[row["sourcePath"]]["gitBlob"]
        assert row["reviewStatus"] == "reviewed" and row["scope"]
        assert all(e in by_evidence for e in row["evidenceReferenceIds"])

    findings = json.loads((report / "findings.json").read_text())["findings"]
    finding_ids = {f["id"] for f in findings}
    assert len(findings) == len(finding_ids) == 69
    assert all(set(f.get("affectedIds", [])) <= set(original) for f in findings)
    assert all(set(r["findingIds"]) <= finding_ids for r in rows + file_rows)
    remediation = json.loads((report / "remediation.json").read_text())["findings"]
    assert {f["findingId"] for f in remediation} == finding_ids

    candidate, candidate_files = inventory(root)
    expected_delta = json.loads((report / "candidate-changes.json").read_text())
    added = set(candidate) - set(original)
    removed = set(original) - set(candidate)
    modified = {k for k in set(candidate) & set(original)
                if candidate[k]["recordSha256"] != original[k]["recordSha256"]}
    for kind, actual in (("added", added), ("removed", removed), ("modified", modified)):
        assert actual == {r["id"] for r in expected_delta[kind]}, kind
        assert len(actual) == expected_delta["counts"][kind]
    for row in expected_delta["added"] + expected_delta["modified"]:
        assert candidate[row["id"]]["recordSha256"] == row["afterSha256"], row["id"]
        if row["id"] in original:
            assert original[row["id"]]["recordSha256"] == row["beforeSha256"]
            assert candidate[row["id"]]["assetStatus"] == original[row["id"]]["assetStatus"], ("unreviewed maturity change", row["id"])
    assert len(candidate) == 2313 and len(added) == 21 and not removed
    assert sum(candidate[k]["recordType"] == "implementationDiscrepancy" for k in added) == 12
    for entry in expected_delta["changedFiles"]:
        assert sha256((root / entry["path"]).read_bytes()) == entry["sha256"], entry["path"]

    result = {
        "outcome": "passed", "auditedCommit": BASE, "reviewedIds": len(rows),
        "knowledgeFiles": len(files), "reviewedFilesWithoutIds": len(file_rows),
        "pending": 0, "baselineConclusions": dict(collections.Counter(r["conclusion"] for r in rows)),
        "domainConclusions": domain_counts,
        "fileConclusions": dict(collections.Counter(r["conclusion"] for r in file_rows)),
        "findingGroups": len(findings), "evidenceReferences": len(evidence),
        "candidateCounts": expected_delta["counts"],
        "scope": "Inventory, source identity, reference integrity, and candidate content only; semantic review is recorded separately. No business runtime tests."
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
