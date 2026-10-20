#!/usr/bin/env python3
"""Provenance/delta safeguards exercised against real isolated Git histories."""
import csv
import hashlib
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import yaml

SCRIPT = Path(__file__).with_name("build-branch-review-ledger.py")
SPEC = importlib.util.spec_from_file_location("review_ledger", SCRIPT)
ledger = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ledger)
CODE = "gmp-platform/backend/src/main/java/Example.java"
EVIDENCE = "docs/development/review.md"
SEMANTIC = "docs/development/semantic.jsonl"
RULES = "docs/knowledge/rules/example.yaml"


class LedgerHistoryTests(unittest.TestCase):
    def setUp(self):
        self.previous = Path.cwd()
        self.folder = tempfile.TemporaryDirectory(prefix="edhr-ledger-fixture-")
        self.addCleanup(self.folder.cleanup)
        self.addCleanup(os.chdir, self.previous)
        self.repo = Path(self.folder.name)
        os.chdir(self.repo)
        self.git("init", "-q")
        self.write(CODE, '@GetMapping("/example")\nclass Example { void act() {} }\n')
        self.write("资源/字段.txt", "UTF-8 名称\n")
        self.write("binary.bin", b"\x00\xff\x00")
        self.write(EVIDENCE, "Only act was read. Never a whole-file or runtime acceptance.\n")
        schema = {"collectionTypes": {"rules": "rule"}, "nestedCollectionTypes": {"acceptanceScenarios": "acceptanceScenario"}}
        self.write("docs/knowledge/schema.yaml", yaml.safe_dump(schema))
        self.rule = {"id": "rule.example", "status": "specified", "reference": {"id": "reference-is-not-a-definition"},
                     "acceptanceScenarios": [{"id": "scenario.example", "then": "retained"}]}
        self.write(RULES, yaml.safe_dump({"rules": [self.rule]}))
        self.first = self.commit()
        record_hash = hashlib.sha256(json.dumps(self.rule, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        self.review = {"id": "rule.example", "sourceCommit": self.first, "sourcePath": RULES, "sourceLocator": "/rules/0",
                       "recordSha256": record_hash, "reviewStatus": "reviewed", "conclusion": "evidence-gap",
                       "reviewedScope": "act only", "entry": CODE + ":2", "decisionEvidence": EVIDENCE + ":1"}
        self.write(SEMANTIC, json.dumps(self.review) + "\n")
        self.baseline = self.commit()

    def git(self, *args):
        return subprocess.check_output(["git", *args], stderr=subprocess.PIPE).decode().strip()

    def write(self, name, value):
        path = self.repo / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(value if isinstance(value, bytes) else value.encode())

    def commit(self):
        self.git("add", ".")
        self.git("-c", "user.name=Audit Fixture", "-c", "user.email=audit@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "fixture")
        return self.git("rev-parse", "HEAD")

    def receipt(self, path, commit=None):
        commit = commit or self.baseline
        raw = subprocess.check_output(["git", "show", commit + ":" + path])
        return {"path": path, "commit": commit, "sha256": hashlib.sha256(raw).hexdigest(), "locator": "line:1"}

    def catalog(self, baseline=None):
        return {"baselineCommit": baseline or self.baseline,
                "methods": [{"id": "method.example.act", "path": CODE, "scope": "act", "reviewedCommit": self.first,
                             "evidence": self.receipt(EVIDENCE), "wholeFileReviewComplete": False, "depth": "method-only"}],
                "semanticSources": [self.receipt(SEMANTIC)], "findings": []}

    def build(self, catalog=None, name="out"):
        catalog = catalog or self.catalog()
        out = self.repo / name
        summary = ledger.build(ledger.Git(), catalog["baselineCommit"], catalog, out)
        return out, summary

    def test_fixed_tree_includes_unicode_binary_and_only_schema_declared_ids(self):
        out, summary = self.build()
        with (out / "coverage.csv").open(newline="", encoding="utf-8") as stream:
            rows = {r["path"]: r for r in csv.DictReader(stream)}
        expected = set(subprocess.check_output(["git", "ls-tree", "-rz", "--name-only", self.baseline]).decode().strip("\0").split("\0"))
        self.assertEqual(set(rows), expected)
        self.assertEqual(rows["binary.bin"]["asset_type"], "binary-asset")
        self.assertEqual(rows[CODE]["review_status"], "partial-reviewed")
        self.assertEqual(rows[CODE]["whole_file_review_complete"], "false")
        self.assertIn("资源/字段.txt", rows)
        self.assertTrue(all(r["domain"] and r["work_package"] for r in rows.values()))
        inventory = json.loads((out / "inventory-summary.json").read_text())
        self.assertEqual(inventory["coverageSha256"], hashlib.sha256((out / "coverage.csv").read_bytes()).hexdigest())
        self.assertEqual(summary["knowledgeReview"]["currentIds"], 2)
        knowledge = [json.loads(s) for s in (out / "knowledge-records.jsonl").read_text().splitlines()]
        self.assertEqual({r["id"] for r in knowledge}, {"rule.example", "scenario.example"})
        self.assertTrue(all(not r["currentSemanticPassClaimed"] for r in knowledge))
        self.assertEqual(summary["knowledgeReview"]["historicalConclusions"], {"evidence-gap": 1})
        self.assertEqual(summary["runtime"]["businessChecksExecutedInThisBatch"], [])
        self.assertIsNone(summary["overallPercent"])

    def test_unchanged_rule_and_method_in_changed_file_require_delta_review(self):
        self.write(CODE, '@GetMapping("/example")\nclass Example { void act() {} void other() {} }\n')
        current = self.commit()
        out, _ = self.build(self.catalog(current))
        method = json.loads((out / "method-reviews.jsonl").read_text())
        semantic = json.loads((out / "semantic-reviews.jsonl").read_text())
        self.assertEqual(method["sourceRelation"], "file-changed")
        self.assertEqual(method["carryStatus"], "needs-delta-review")
        self.assertEqual(semantic["recordRelation"], "unchanged")
        self.assertEqual(semantic["carryStatus"], "needs-delta-review")
        self.assertFalse(method["currentRuntimeExecuted"])

    def test_removed_source_remains_in_history_but_not_current_path_denominator(self):
        (self.repo / CODE).unlink()
        current = self.commit()
        out, _ = self.build(self.catalog(current))
        method = json.loads((out / "method-reviews.jsonl").read_text())
        self.assertEqual(method["sourceRelation"], "removed")
        with (out / "coverage.csv").open(newline="") as stream:
            self.assertNotIn(CODE, [r["path"] for r in csv.DictReader(stream)])

    def test_sql_only_change_invalidates_semantic_evidence_and_other_extensions_are_kept(self):
        migration = "gmp-platform/backend/src/main/resources/db/changelog/example.sql"
        config = "gmp-platform/backend/pom.xml"
        script = "scripts/example.mjs"
        for path in (migration, config, script):
            self.write(path, "original\n")
        reviewed = self.commit()
        self.review.update(sourceCommit=reviewed, implementationEvidence=[path + ":1" for path in (migration, config, script)])
        self.write(SEMANTIC, json.dumps(self.review) + "\n")
        self.baseline = self.commit()
        self.write(migration, "changed SQL only\n")
        current = self.commit()
        out, _ = self.build(self.catalog(current))
        semantic = json.loads((out / "semantic-reviews.jsonl").read_text())
        dependencies = {d["path"]: d["relation"] for d in semantic["dependencies"]}
        self.assertEqual(dependencies[migration], "file-changed")
        self.assertEqual(dependencies[config], "unchanged")
        self.assertEqual(dependencies[script], "unchanged")
        self.assertEqual(semantic["recordRelation"], "unchanged")
        self.assertEqual(semantic["carryStatus"], "needs-delta-review")

    def test_forged_receipt_or_source_hash_cannot_receive_review_credit(self):
        for field in ("evidence", "sourceSha256", "sourceBlob"):
            catalog = self.catalog()
            if field == "evidence":
                catalog["methods"][0][field]["sha256"] = "0" * 64
            else:
                catalog["methods"][0][field] = "0" * (40 if field == "sourceBlob" else 64)
            with self.assertRaisesRegex(ValueError, "mismatch"):
                ledger.reconcile_methods(ledger.Git(), self.baseline, catalog["methods"])

    def test_unknown_commit_and_whole_file_claim_do_not_silently_fall_back(self):
        catalog = self.catalog()
        catalog["methods"][0]["reviewedCommit"] = "not-a-commit"
        with self.assertRaises(subprocess.CalledProcessError):
            ledger.reconcile_methods(ledger.Git(), self.baseline, catalog["methods"])
        catalog = self.catalog()
        catalog["methods"][0]["wholeFileReviewComplete"] = True
        with self.assertRaises(ValueError):
            ledger.reconcile_methods(ledger.Git(), self.baseline, catalog["methods"])

    def test_unresolved_review_commit_preserves_gap_without_current_credit(self):
        catalog = self.catalog()
        catalog["methods"][0]["reviewedCommit"] = None
        row = ledger.reconcile_methods(ledger.Git(), self.baseline, catalog["methods"])[0]
        self.assertEqual(row["carryStatus"], "evidence-gap")
        self.assertEqual(row["sourceRelation"], "unresolved-source")

    def test_full_finding_ids_are_distinct_but_exact_duplicates_rejected(self):
        catalog = self.catalog()
        catalog["findings"] = [{"id": key, "disposition": "historical-resolved", "evidence": [self.receipt(EVIDENCE)]}
                               for key in ("W2-F002-FORM-AVAILABILITY", "W2-F002-COLUMN-INSERT-NODE-ALIGNMENT")]
        _, summary = self.build(catalog)
        self.assertEqual(summary["remediation"]["findingRecords"], 2)
        catalog["findings"].append(catalog["findings"][0])
        with self.assertRaisesRegex(ValueError, "Duplicate full finding"):
            self.build(catalog, "duplicate")

    def test_duplicate_knowledge_definition_is_rejected_while_references_are_not_ids(self):
        self.write(RULES, yaml.safe_dump({"rules": [self.rule, self.rule]}))
        current = self.commit()
        with self.assertRaisesRegex(ValueError, "Duplicate knowledge ID"):
            ledger.knowledge_records(ledger.Git(), current)

    def test_report_index_preserves_reported_state_without_republishing_commands(self):
        report = {"qualityResult": {"result": "failed", "headCommit": self.first,
                  "workingTreeState": "dirty: documented test-only scope",
                  "checks": [{"id": "old-check", "required": True, "category": "unit", "method": "command",
                              "command": "PRIVATE_COMMAND_MARKER", "outcome": "failed", "evidence": ["PRIVATE_LOG_MARKER"]}],
                  "findings": [{"id": "old-low", "severity": "low", "resolutionStatus": "open", "description": "PRIVATE_DESCRIPTION"}]}}
        raw = yaml.safe_dump(report)
        self.write("docs/development/original-quality.yaml", raw)
        self.write("docs/development/copied-quality.yaml", raw)
        current = self.commit()
        quality, _, receipts = ledger.report_indexes(ledger.Git(), current)
        self.assertEqual(len(quality), 1)
        self.assertEqual(len(receipts), 2)
        self.assertEqual(len(quality[0]["paths"]), 2)
        self.assertEqual(quality[0]["reported"]["workingTreeState"], report["qualityResult"]["workingTreeState"])
        self.assertEqual(quality[0]["reported"]["checks"][0]["outcome"], "failed")
        self.assertEqual(quality[0]["reported"]["findings"][0]["resolutionStatus"], "open")
        self.assertFalse(quality[0]["newlyExecutedInThisBatch"])
        self.assertNotIn("PRIVATE_", json.dumps(quality))

    def test_reproduction_and_check_detect_tampering_and_do_not_overwrite_evidence(self):
        out, _ = self.build()
        other, _ = self.build(name="other")
        self.assertEqual({p.name: p.read_bytes() for p in out.iterdir()}, {p.name: p.read_bytes() for p in other.iterdir()})
        before = (out / "coverage.csv").read_bytes()
        with self.assertRaisesRegex(ValueError, "empty"):
            self.build()
        self.assertEqual((out / "coverage.csv").read_bytes(), before)
        config = self.repo / "catalog.json"
        config.write_text(json.dumps(self.catalog()))
        command = [sys.executable, str(SCRIPT), "--ref", self.baseline, "--catalog", str(config), "--out", str(out), "--check"]
        self.assertEqual(subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE).returncode, 0)
        (out / "coverage.csv").write_bytes(before + b"tampered\n")
        self.assertNotEqual(subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE).returncode, 0)
        self.assertTrue((out / "coverage.csv").read_bytes().endswith(b"tampered\n"))


if __name__ == "__main__":
    unittest.main()
