from pathlib import Path
import hashlib
import json
import subprocess
import yaml

BASE = "84c5b6d6af15f4f9d684c99e8eb8d110ae039954"
ROOT = Path("/workspace/edhr-nexus-frontend")


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


schema = yaml.safe_load((ROOT / "docs/knowledge/schema.yaml").read_text())


def inventory(files):
    rows = {}
    for path, raw in files:
        doc = yaml.safe_load(raw)
        if not isinstance(doc, dict):
            continue

        def add(record, kind, locator):
            key = record["id"]
            assert key not in rows, key
            rows[key] = {"id": key, "recordType": kind, "sourcePath": path,
                         "sourceLocator": locator, "record": record,
                         "recordSha256": sha(json.dumps(record, ensure_ascii=False,
                                                        sort_keys=True, separators=(",", ":")).encode())}

        def nested(value, locator):
            if isinstance(value, dict):
                for name, child in value.items():
                    pointer = locator + "/" + str(name).replace("~", "~0").replace("/", "~1")
                    if name in schema["nestedCollectionTypes"] and isinstance(child, list):
                        for index, record in enumerate(child):
                            add(record, schema["nestedCollectionTypes"][name], pointer + "/" + str(index))
                    nested(child, pointer)
            elif isinstance(value, list):
                for index, child in enumerate(value):
                    nested(child, locator + "/" + str(index))

        for name, kind in schema["collectionTypes"].items():
            for index, record in enumerate(doc.get(name, []) or []):
                locator = "/" + name + "/" + str(index)
                add(record, kind, locator)
                nested(record, locator)
    return rows


paths = [p for p in git("ls-tree", "-r", "--name-only", BASE, "--", "docs/knowledge").decode().splitlines()
         if p.endswith((".yaml", ".yml")) and not p.endswith("/schema.yaml")]
before = inventory((p, git("show", BASE + ":" + p)) for p in paths)
current_paths = sorted(p for p in (ROOT / "docs/knowledge").rglob("*")
                       if p.suffix in (".yaml", ".yml") and p.name != "schema.yaml")
after = inventory((str(p.relative_to(ROOT)), p.read_bytes()) for p in current_paths)
removed = sorted(before.keys() - after.keys())
added = sorted(after.keys() - before.keys())
changed = sorted(key for key in before.keys() & after.keys()
                 if before[key]["recordSha256"] != after[key]["recordSha256"])
status_changes = [{"id": key, "before": before[key]["record"].get("status"),
                   "after": after[key]["record"].get("status")}
                  for key in before.keys() & after.keys()
                  if before[key]["recordType"] != "implementationDiscrepancy"
                  and before[key]["record"].get("status") != after[key]["record"].get("status")]
visibility_changes = [key for key in before.keys() & after.keys()
                      if before[key]["record"].get("visibility") != after[key]["record"].get("visibility")]
originals = []
for path in ["docs/knowledge/evidence/workflow-task-multi-candidate-user-confirmed.md",
             "docs/knowledge/evidence/form-approval-transfer-user-confirmed.md"]:
    original = git("show", BASE + ":" + path)
    current = (ROOT / path).read_bytes()
    assert original == current, path
    originals.append({"path": path, "bytes": len(current), "sha256": sha(current),
                      "gitBlob": git("rev-parse", BASE + ":" + path).decode().strip()})

assert not removed and not status_changes and not visibility_changes
assert all(key.startswith(("DEC-0081", "scenario.tenant-transfer-", "evidence.tenant-task-delegation-",
                           "evidence.work-template-write-shape-")) for key in added), added
out = {"schema": "edhr-knowledge-transition-check/v1", "baselineCommit": BASE,
       "currentSource": "working-tree; not a fabricated Git commit",
       "headCommit": git("rev-parse", "HEAD").decode().strip(),
       "uncommittedKnowledgePaths": sorted(set(git("diff", "--name-only", "HEAD", "--", "docs/knowledge", "docs/architecture").decode().splitlines()
                                             + git("ls-files", "--others", "--exclude-standard", "--", "docs/knowledge", "docs/architecture").decode().splitlines())),
       "definitionCountBefore": len(before), "definitionCountAfter": len(after),
       "addedIds": added, "removedIds": removed, "changedRecordIds": changed,
       "existingMaturityChanges": status_changes, "existingVisibilityChanges": visibility_changes,
       "originalConfirmationFilesUnchanged": originals,
       "wholeAssetSemanticAcceptance": False,
       "note": "Mechanical schema-record/transition proof only. Actual finite semantic review is a separate role artifact."}
dest = Path("/tmp/edhr-w3-tenant-knowledge-transition-summary.json")
dest.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({key: value for key, value in out.items()
                  if key not in ("changedRecordIds", "originalConfirmationFilesUnchanged")}, ensure_ascii=False))
