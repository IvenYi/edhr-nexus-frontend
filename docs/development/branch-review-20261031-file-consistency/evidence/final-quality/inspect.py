from pathlib import Path
import hashlib,json,subprocess,yaml
ROOT=Path('/workspace/edhr-nexus-frontend')
BATCH=ROOT/'docs/development/branch-review-20261031-file-consistency'
E=BATCH/'evidence'
BASE='0bd0848bbded6d6954d62a4f924e0b2eec6623ad'
HEAD='2bdea59bc591fcec6ba9a4c8cbc4374cc65da1ab'
INITIAL='ec4857bef2c9ebb5a1b1d1b7f3c767d2cb63666a'
OLD='032b83e9d5b8a25bee6d5b59c45d86892f672d00'
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,text=True).strip()
def sha(raw):return hashlib.sha256(raw).hexdigest()
def verify(rows,key):
    for item in rows:
        raw=(ROOT/item[key]).read_bytes()
        assert sha(raw)==item['sha256'] and len(raw)==item['bytes'],item[key]
    return len(rows)
def blob(commit,path):return subprocess.check_output(['git','show',commit+':'+path],cwd=ROOT)
assert git('rev-parse','HEAD')==HEAD and git('rev-parse','origin/edhr-dev')==BASE
assert not git('status','--porcelain')
assert subprocess.run(['git','merge-base','--is-ancestor',BASE,HEAD],cwd=ROOT).returncode==0
contracts=['AGENTS.md','codeplzreadme.md','docs/agents']
assert not git('diff','--name-only',OLD,BASE,'--',*contracts)
assert not git('diff','--name-only',BASE,HEAD,'--','docs/knowledge','docs/architecture',*contracts)
p=json.loads((E/'primary-verification.json').read_text())
primary=verify(p['files'],'path')
for item in p['sourceSnapshot']:
    raw=blob(INITIAL,item['path']);assert sha(raw)==item['sha256'] and len(raw)==item['bytes']
assert (E/'initial-decision-package.yaml').read_bytes()==blob(INITIAL,str((BATCH/'decision-package.yaml').relative_to(ROOT)))
first=json.loads((E/'first-quality/archive-map.json').read_text());assert first['result']=='failed'
failed=verify(first['files'],'archive')
result=yaml.safe_load((E/'first-quality/quality-result.yaml').read_text())['qualityResult'];assert result['result']=='failed'
integration=json.loads((E/'integration-verification.json').read_text())
additional=verify(integration['files'],'path');verify(integration['currentSourceSnapshot'],'path')
oreview=json.loads((E/'integration-validation/integration-ontology-review.json').read_text())
omanifest=json.loads((E/'integration-validation/integration-ontology-manifest.json').read_text())
assert omanifest['roleState']=='FINAL' and omanifest['ontologyResult']=='not-applicable'
assert omanifest['packageSha256']==sha((BATCH/'decision-package.yaml').read_bytes())
verify(oreview['knowledgeFiles'],'path');verify(oreview['sourceSnapshot'],'path')
knowledge=git('ls-tree','-r','--name-only',BASE,'docs/knowledge').splitlines()
assert len(knowledge)==len(oreview['knowledgeFiles'])==330
for item in oreview['knowledgeFiles']:
    assert sha(blob(BASE,item['path']))==item['sha256']
newknowledge=git('diff','--name-status',OLD,BASE,'--','docs/knowledge').splitlines();assert len(newknowledge)==44
delta=json.loads((BATCH/'integration-increment.json').read_text())
changed=set(git('diff','--name-only',OLD,BASE).splitlines())
assert len(changed)==delta['targetChangedPaths']==len(delta['records'])==666
assert {r['path'] for r in delta['records']}==changed
assert all(r['reviewStatus']=='pending' and r['conclusion']=='pending' for r in delta['records'])
source=json.loads((BATCH/'source-review.json').read_text())
assert len(source['records'])==6 and source['wholeFileCompletion']==0 and source['historicalUniqueIncrement'] is None
a=source['a23'];assert len(a['records'])==6 and a['historicalLanguageQueue']==856 and a['previousFeatureAddedPending']==1 and a['separateSqlQueue']==130 and a['sqlChecked']==0
assert len(a['currentChangedPending'])==2 and len(a['currentAddedPending'])==1
for name in ['coverage.csv','entrypoints.csv','migrations.csv','inventory-summary.json']:
    relative=str((BATCH/'inventory'/name).relative_to(ROOT))
    assert (ROOT/relative).read_bytes()==blob(INITIAL,relative)
command=['python3','scripts/build-branch-review-inventory.py','--ref',BASE,'--out','/tmp/edhr-copy-q2-inventory']
run=subprocess.run(command,cwd=ROOT,text=True,capture_output=True)
Path('/tmp/edhr-copy-q2-inventory-build.txt').write_text(run.stdout+run.stderr);assert run.returncode==0
for name in ['coverage.csv','entrypoints.csv','migrations.csv','inventory-summary.json']:
    assert (BATCH/'inventory-current'/name).read_bytes()==(Path('/tmp/edhr-copy-q2-inventory')/name).read_bytes(),name
inv=json.loads((BATCH/'inventory-current/inventory-summary.json').read_text())
assert inv['trackedPaths']==5758 and inv['migrationFiles']==134
assert inv['entrypointCandidates']['http-annotation']==464 and inv['entrypointCandidates']['frontend-route-candidate']==216
product=git('diff','--name-only',BASE,HEAD,'--','gmp-platform').splitlines()
assert set(product)=={x['path'] for x in integration['currentSourceSnapshot']}
manual=[p for p in git('diff','--name-only',BASE,HEAD).splitlines() if '/evidence/' not in p and '/inventory' not in p]
ws=subprocess.run(['git','diff','--check',BASE,HEAD,'--',*manual],cwd=ROOT,text=True,capture_output=True)
Path('/tmp/edhr-copy-q2-whitespace-handwritten.txt').write_text(ws.stdout+ws.stderr);assert ws.returncode==0
out={'baseCommit':BASE,'headCommit':HEAD,'contractReadCommit':HEAD,'clean':True,'primaryOriginals':primary,'initialSourceSnapshotsAtGit':INITIAL,'firstFailedOriginals':failed,'integrationOriginals':additional,'currentSources':len(integration['currentSourceSnapshot']),'ontologySourceSnapshots':len(oreview['sourceSnapshot']),'knowledgeFiles':len(knowledge),'knowledgeChangedFiles':44,'targetIncrementPaths':666,'targetIncrementReview':'all pending','currentInventory':{'paths':5758,'migrations':134,'httpAnnotations':464,'frontendRoutes':216},'initialInventory':'4files same as Git initial candidate','limitedSourceGroups':6,'replayedSemanticIds':10,'wholeFileCompletion':0,'newUniqueIncrement':None,'a23MethodRecords':6,'a23OldLanguage':856,'a23OldFeaturePending':1,'a23OldSql':130,'a23NewMigrationDelta':4,'productAndTestChangedPaths':product,'authoredWhitespacePaths':len(manual),'authoredWhitespaceExit':ws.returncode}
Path('/tmp/edhr-copy-q2-inspection.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(out,ensure_ascii=False))
