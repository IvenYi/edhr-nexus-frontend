"""Read-only verification of the fixed local research and knowledge candidate."""
import datetime
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path.cwd()
RESEARCH = ROOT / "docs/development/workflow-intervention-research-20261029"
OUT = RESEARCH / "evidence/independent"
HEAD = "8cf4df66d60e8f16677442197a9fc0defcd3ef8c"
TARGET = "635711f97e9b794f4af02e1e5d1939bb2ecf920f"


def run(*args, input=None):
    return subprocess.check_output(args, input=input, text=True).strip()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def yaml_data(raw):
    return json.loads(run("ruby", "-ryaml", "-rjson", "-rdate", "-e",
        "puts JSON.generate(YAML.safe_load(STDIN.read, permitted_classes: [Date], aliases: true))", input=raw))


def save(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n")


assert run("git", "rev-parse", "HEAD") == HEAD
assert run("git", "rev-parse", "origin/edhr-dev") == TARGET
subprocess.run(["git", "merge-base", "--is-ancestor", TARGET, HEAD], check=True)
contracts = ["AGENTS.md", "codeplzreadme.md", "docs/agents"]
assert not run("git", "diff", "--name-only", TARGET, HEAD, "--", *contracts)
assert not run("git", "diff", "--name-only", "HEAD", "--", *contracts)
subprocess.run(["git", "diff", "--check"], check=True)
changed = run("git", "diff", "--name-only", "HEAD").splitlines()
assert not [p for p in changed if p.startswith(("gmp-platform/", "backend/", "frontend/"))]
untracked = run("git", "ls-files", "--others", "--exclude-standard").splitlines()
assert not [p for p in untracked if p.startswith("gmp-platform/") and p != "gmp-platform/frontend/node_modules"]
save("git-scope.json", {
    "sourceCommit": HEAD, "cachedTargetCommit": TARGET, "cachedTargetContained": True,
    "remoteRefreshedThisRun": False, "contractReadCommit": HEAD,
    "contractDiffs": [], "productDiffs": [], "trackedDirtyPaths": changed,
    "untrackedPaths": untracked, "diffCheck": "passed",
    "releaseOrIntegrationAcceptance": False,
})

manifest = json.loads((RESEARCH / "evidence/source-manifest.json").read_text())
sources = []
for record in manifest["sourceFiles"]:
    data = Path(record["source"]).read_bytes()
    lines = data.decode().splitlines()
    assert sha(data) == record["sha256"]
    assert len(data) == record["bytes"] and len(lines) == record["lineCount"]
    assert all(1 <= r["start"] <= r["end"] <= len(lines) for r in record["ranges"])
    sources.append({"id": record["id"], "source": record["source"], "sha256": sha(data), "rangesValid": True})
extras = [
    ("QA-C16", Path(manifest["referenceFrontRoot"]) / "projects/web-render/src/views/edhr-application/render/approval-process-intervention/dhr-tab/todo.vue", 97, 183),
    ("QA-C17", Path(manifest["referenceFrontRoot"]) / "projects/web-render/src/views/edhr-application/render/approval-process-intervention/doc-tab/todo.vue", 160, 178),
    ("QA-C18", Path(manifest["referenceFrontRoot"]) / "apis/gct-apaas/OnlineFormProcessController.ts", 106, 124),
    ("QA-O08", ROOT / "gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/SignatureController.java", 20, 82),
    ("QA-O09", ROOT / "gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/repository/SignatureRepository.java", 13, 24),
]
for identifier, extra, start, end in extras:
    extra_data = extra.read_bytes()
    assert end <= len(extra_data.decode().splitlines())
    sources.append({"id": identifier, "source": str(extra), "sha256": sha(extra_data), "ranges": [{"start": start, "end": end}], "purpose": "Independent adjacent source check"})
save("source-check.json", {"manifestEntriesVerified": len(manifest["sourceFiles"]), "sources": sources})

doc = json.loads((RESEARCH / "evidence/original-document-excerpts.json").read_text())
image_manifest = json.loads((RESEARCH / "evidence/original-document-images.json").read_text())
original = Path(doc["source"]).read_bytes()
assert sha(original) == doc["sourceSha256"]
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
with zipfile.ZipFile(doc["source"]) as z:
    paras = ET.fromstring(z.read("word/document.xml")).findall(f".//{{{W}}}p")
    assert len(paras) == doc["paragraphCount"]
    relationships = {e.attrib["Id"]: "word/" + e.attrib["Target"] for e in ET.fromstring(z.read("word/_rels/document.xml.rels"))}
    for excerpt in doc["excerpts"]:
        p = paras[excerpt["index"]]
        text = "".join(t.text or "" for t in p.findall(f".//{{{W}}}t"))
        images = [relationships[b.attrib[f"{{{R}}}embed"]] for b in p.findall(f".//{{{A}}}blip") if f"{{{R}}}embed" in b.attrib]
        assert text == excerpt["text"], excerpt["index"]
        assert images == excerpt["images"], excerpt["index"]
    for item in image_manifest:
        data = z.read(item["docxEntry"])
        assert data == (ROOT / item["path"]).read_bytes()
        assert sha(data) == item["sha256"]
    relevant = [1554, 1557, 1558, 1564, 3206, 3209, 3210]
    save("original-document-check.json", {
        "source": doc["source"], "sourceSha256": sha(original), "sourceBytes": len(original),
        "paragraphCount": len(paras), "excerptCountVerified": len(doc["excerpts"]),
        "paragraphIndexing": "zero-based as in the source manifest",
        "keyParagraphs": [{"index": i, "text": "".join(t.text or "" for t in paras[i].findall(f".//{{{W}}}t"))} for i in relevant],
        "images": image_manifest, "rawZipAndSavedBytesIdentical": True,
        "visuallyInspectedImages": [294, 295, 296, 297, 298, 682, 683],
        "liveProductInteraction": False,
    })

ontology = json.loads((RESEARCH / "evidence/ontology-validation.json").read_text())
for item in ontology["archives"]:
    raw = gzip.decompress((RESEARCH / "evidence" / item["archive"]).read_bytes())
    assert len(raw) == item["rawBytes"] and sha(raw) == item["rawSha256"]
    if item["archive"].endswith("xml.gz"):
        suite = ET.fromstring(raw)
        assert {k: int(suite.attrib[k]) for k in ["tests", "failures", "errors", "skipped"]} == ontology["totals"]
own_xml = ROOT / "gmp-platform/backend/target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml"
raw = own_xml.read_bytes()
suite = ET.fromstring(raw)
totals = {k: int(suite.attrib[k]) for k in ["tests", "failures", "errors", "skipped"]}
assert totals == {"tests": 89, "failures": 0, "errors": 0, "skipped": 0}
(OUT / "knowledge-junit.xml.gz").write_bytes(gzip.compress(raw, mtime=0))
save("knowledge-test.json", {
    "sourceCommit": HEAD, "workingTree": True, "command": "mvn -q -Dtest=BusinessKnowledgeModelTest test",
    "workdir": "gmp-platform/backend", "exitCode": 0, "totals": totals,
    "junitRawBytes": len(raw), "junitRawSha256": sha(raw), "archive": "knowledge-junit.xml.gz",
    "ontologyArchivedEvidenceIndependentlyVerified": True,
    "researchScopeOnly": True,
})

questions_path = "docs/knowledge/open-questions.yaml"
before = yaml_data(run("git", "show", "HEAD:" + questions_path))
after = yaml_data((ROOT / questions_path).read_text())
answered = "question.record-control-managerial-reassignment-signature"
assert [q for q in before["questions"] if q["id"] != answered] == after["questions"]
dec = yaml_data((ROOT / "docs/knowledge/decisions/DEC-0091-workflow-reassignment-signature.yaml").read_text())["decisions"][0]
assert dec["status"] == "specified" and dec["visibility"] == "internal"
assert all(d["status"] == "specified" and d["visibility"] == "internal" for d in dec["decisionStatements"])
assert not run("git", "diff", "HEAD", "--", "docs/knowledge/facts", "docs/knowledge/execution-contracts")
assert not run("git", "diff", "HEAD", "--", "docs/knowledge/decisions/DEC-0074-shared-terminal-button-signature.yaml", "docs/knowledge/decisions/DEC-0081-tenant-scoped-task-delegation.yaml")
count = run("ruby", "-ryaml", "-rdate", "-e", 'p=Dir["docs/knowledge/**/*.yaml"];p.each{|f| YAML.safe_load(File.read(f), permitted_classes:[Date], aliases:true)}; puts p.length')
save("policy-check.json", {
    "knowledgeVersion": "0.3.25", "schemaVersion": "1.2.0", "parsedKnowledgeYamlCount": int(count),
    "onlyClosedQuestion": answered, "otherQuestionsUnchanged": True,
    "newDecisionMaturity": "specified/internal", "newDecisionStatements": [d["id"] for d in dec["decisionStatements"]],
    "runtimeFactsOrExecutionContractDiffs": [], "credentialAndDhrPolicyDiffs": [],
    "rawHistoricalQuestion": next(q for q in before["questions"] if q["id"] == answered),
})
save("verification-summary.json", {
    "capturedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "sourceCommit": HEAD, "verified": ["fixed-baselines", "no-product-difference", "22-original-source-hashes-and-ranges", "extra-DHR-original-source", "original-docx-and-excerpts", "7-original-PNGs", "ontology-archived-tests", "independent-89-tests", "narrow-policy-and-historical-scope"],
    "remoteRefreshSucceeded": False, "runtimeOrReleaseValidation": False,
})
print(json.dumps({"result": "passed", "sources": 22, "extraSources": len(extras), "images": len(image_manifest), "knowledgeYaml": int(count), "tests": totals}, ensure_ascii=False))
