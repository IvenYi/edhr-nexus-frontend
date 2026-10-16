import csv, hashlib, json, pathlib, re, subprocess, xml.etree.ElementTree as ET
import yaml

ROOT = pathlib.Path('/workspace/edhr-nexus-frontend')
DOC = ROOT/'docs/development/branch-review-20261016-w1-review-export'
FIRST = pathlib.Path('/tmp/edhr-w1-review-export-independent-20261016')
OUT = pathlib.Path('/tmp/edhr-w1-review-export-final-documentation-20261016')
OUT.mkdir(exist_ok=True)
BASE = '76b214426a271929bba2708cdda9e4d84d1f0679'

def git(*args):
    return subprocess.check_output(['git',*args],cwd=ROOT)
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def js(path):
    return json.loads(path.read_text())
def write(name,value):
    (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def tree(commit):
    result={}
    for entry in git('ls-tree','-r','-z',commit).split(b'\0'):
        if not entry: continue
        meta,path=entry.split(b'\t',1)
        mode,kind,blob=meta.decode().split()
        assert kind=='blob'
        result[path.decode('utf-8')]=blob
    return result

assert git('rev-parse','HEAD').decode().strip()==BASE
remote=git('ls-remote','origin','refs/heads/edhr-dev').decode().strip().split()[0]
assert remote==BASE
expected=tree(BASE)
rows=list(csv.DictReader((DOC/'coverage.csv').open(encoding='utf-8',newline='')))
assert len(rows)==len(expected)==1524
assert len(set(r['path'] for r in rows))==1524
assert set(r['path'] for r in rows)==set(expected)
assert all(r['baseline_commit']==BASE and r['source_blob']==expected[r['path']] for r in rows)
assert all(r['review_status']=='pending' and r['review_depth']=='inventory-only' for r in rows)
original=pathlib.Path('/tmp/edhr-w1-coverage-utf8-before-20261016.csv')
redrows=list(csv.DictReader(original.open(encoding='utf-8',newline='')))
redpaths=set(r['path'] for r in redrows)
correction=js(DOC/'evidence/coverage-utf8-correction.json')
assert sha(original)==correction['originalCsvSha256']==sha(FIRST/'coverage-first-observed.csv')
assert sha(DOC/'coverage.csv')==correction['correctedCsvSha256']
assert sorted(set(expected)-redpaths)==sorted(correction['missingPaths'])
assert sorted(redpaths-set(expected))==sorted(correction['unexpectedPaths'])
assert len(correction['missingPaths'])==len(correction['unexpectedPaths'])==6
write('inventory-check.json',{'sourceCommit':BASE,'actualCommand':'git ls-tree -r -z '+BASE,'expectedPaths':1524,'actualUniquePaths':len(rows),'missing':[],'unexpected':[],'blobMismatches':[],'allPendingInventoryOnly':True,'excludedPaths':[],'originalSha256':sha(original),'correctedSha256':sha(DOC/'coverage.csv'),'sixCorrectedPaths':correction['missingPaths']})

legacy=[]
for item in js(DOC/'evidence/legacy-inventory-path-recheck.json'):
    path=ROOT/item['path']; oldtree=tree(item['baseCommit'])
    oldrows=list(csv.DictReader(path.open(encoding='utf-8',newline='')))
    assert len(oldrows)==len(oldtree)==item['rows']
    assert len(set(r['path'] for r in oldrows))==len(oldrows)
    assert set(r['path'] for r in oldrows)==set(oldtree)
    key='source_blob' if 'source_blob' in oldrows[0] else 'source_evidence'
    assert all(r[key]==oldtree[r['path']] for r in oldrows)
    assert git('hash-object',str(path)).decode().strip()==expected[item['path']]
    legacy.append({'path':item['path'],'baseCommit':item['baseCommit'],'paths':len(oldtree),'exactPathSet':True,'preservedAtCurrentBase':True,'sha256':sha(path),'blobCheck':key in oldrows[0]})
write('legacy-inventory-check.json',legacy)

# Every tracked source byte is identical to the original tested source, not only product paths.
protected={p:sha(ROOT/p) for p in expected}
assert protected==js(FIRST/'protected-before.json')==js(FIRST/'protected-after.json')
for p,blob in expected.items():
    assert git('hash-object',str(ROOT/p)).decode().strip()==blob,p
status=git('status','--porcelain','-z','--untracked-files=all').split(b'\0')
status=[s.decode('utf-8') for s in status if s]
assert all(s.startswith('?? docs/development/branch-review-20261016-w1-review-export/') for s in status)
contracts=['AGENTS.md','codeplzreadme.md','docs/agents/agent-handoff-contract.md','docs/agents/quality-verifier.md','docs/agents/business-knowledge-modeler.md']
baseline=js(DOC/'baseline.json')
assert all(expected[p]==baseline['contractBlobs'][p] for p in contracts)
write('protected-current.json',protected)
write('baseline.json',{'baseCommit':BASE,'headCommit':BASE,'targetBranch':'edhr-dev','targetCommit':remote,'contractReadCommit':BASE,'contractBlobs':{p:expected[p] for p in contracts},'trackedPaths':len(protected),'allTrackedBytesMatchFirstIndependentRun':True,'workingTreeStatus':status,'productTestKnowledgeContractChangedPaths':[],'mavenRunByThisInstance':False})

# Parse originals without printing potentially sensitive log/XML properties or test output.
def read_run(run):
    totals={'tests':0,'failures':0,'errors':0,'skipped':0}; cases=[]; checked=[]
    for suite in run['suites']:
        path=pathlib.Path(suite['originalXmlPath'])
        assert sha(path)==suite['originalXmlSha256']
        xml=ET.parse(path).getroot()
        assert xml.attrib['name']==suite['class']
        for k in totals:
            assert int(xml.attrib[k])==suite[k]
            totals[k]+=suite[k]
        for case in xml.findall('testcase'):
            assert case.find('failure') is None and case.find('error') is None and case.find('skipped') is None
            cases.append((case.attrib['classname'],case.attrib['name']))
        checked.append({'class':suite['class'],'path':str(path),'sha256':sha(path),'tests':suite['tests']})
    assert len(cases)==len(set(cases))==totals['tests']
    assert totals=={k:run[k] for k in totals}
    log=pathlib.Path(run['logPath']); assert sha(log)==run['logSha256']
    content=log.read_text(errors='strict')
    assert 'BUILD SUCCESS' in content
    assert 'build:dhr-print' in content
    assert '-Dexec.skip' not in run['command']
    assert run['exitCode']==0
    return totals,cases,checked,{'path':str(log),'sha256':sha(log),'buildSuccess':True,'actualPrintBuildMarker':True}

ind=js(FIRST/'test-result.json'); primary=js(DOC/'evidence/main-result.json')
itot,icases,ixml,ilog=read_run(ind)
mcases=[]; mxml=[]; mlogs=[]
for run in primary['runs']:
    _,cases,xml,log=read_run(run); mcases+=cases; mxml+=xml; mlogs.append(log)
assert len(icases)==len(mcases)==len(set(mcases))==74
assert set(icases)==set(mcases)
for casepath,cases in [(FIRST/'case-index.json',icases),(DOC/'evidence/main-case-index.json',mcases)]:
    indexed=js(casepath)
    assert all(c['status']=='passed' for c in indexed)
    assert len(indexed)==74 and set((c['class'],c['test']) for c in indexed)==set(cases)
assert itot=={'tests':74,'failures':0,'errors':0,'skipped':0}
assert primary['testedCommit']==ind['headCommit']==BASE
assert primary['runner']=='primary-agent' and primary['independentQuality'] is False
assert ind['runner']=='fresh-independent-quality'
assert len([x for x in ixml if x['class'].endswith('DhrAttachmentAndArchiveTest') and x['tests']==13])==1
assert (FIRST/'maven-exit.txt').read_text().strip()=='0'
artifacts=js(FIRST/'artifact-manifest.json')
for artifact in artifacts:
    p=pathlib.Path(artifact['path']); assert sha(p)==artifact['sha256'] and p.stat().st_size==artifact['bytes']
write('runtime-evidence-check.json',{'thisInstanceExecutedMaven':False,'firstIndependentActuallyExecuted':itot,'primaryActuallyExecuted':{k:primary[k] for k in itot},'same74UniqueCaseSet':True,'selectedSuites':ixml,'independentLog':ilog,'primaryLogs':mlogs,'primaryOriginalXml':mxml,'firstArtifactManifestEntriesVerified':len(artifacts),'independentResultSha256':sha(FIRST/'qualityResult.yaml'),'sourceCommitOfActualRuntime':BASE,'currentTrackedSourceExactlySame':True,'archiveRealRendererCases':13,'excludedClaims':['full UI E2E','full HTTP original-file lifecycle','PostgreSQL transaction matrix','A12 effective-source integration','full branch or release acceptance']})

progress=[json.loads(x) for x in (DOC/'review-progress.jsonl').read_text().splitlines()]
assert len(progress)==12 and len({p['path'] for p in progress})==12
for p in progress:
    assert p['baselineCommit']==BASE
    assert sha(ROOT/p['path'])==p['sourceSha256']
    assert p['wholeFileReviewComplete'] is False and p['reviewStatus']=='reviewed-in-listed-method-scope'
    source=(ROOT/p['path']).read_text()
    for symbol in p['symbols']: assert re.search(r'\b'+re.escape(symbol)+r'\s*\(',source)
policy=js(DOC/'ontology/policy-index.json')
assert len(policy['records'])==36
for record in policy['records']:
    path=ROOT/record['sourcePath']; data=yaml.safe_load(path.read_text())
    def find(value):
        if isinstance(value,dict):
            if value.get('id')==record['id']: return value
            for sub in value.values():
                found=find(sub)
                if found: return found
        if isinstance(value,list):
            for sub in value:
                found=find(sub)
                if found: return found
    actual=find(data); assert actual and actual['statement']==record['statement']
    assert actual['status']==record['status'] and actual['visibility']==record['visibility']
    lines=path.read_text().splitlines()
    assert record['id'] in lines[record['sourceLocator']['recordLine']-1]
    assert 'statement:' in lines[record['sourceLocator']['statementLine']-1]
    for evidence in record['originalSources']:
        lines=(ROOT/evidence['path']).read_text().splitlines(); assert 0<evidence['line']<=len(lines)
    assert record['implementationVerdict']=='not-assessed-by-this-policy-index'

allids=[]
schema=yaml.safe_load((ROOT/'docs/knowledge/schema.yaml').read_text())
def ids(value):
    for collection in schema['collectionTypes']:
        for record in value.get(collection,[]):
            allids.append(record['id'])
            for nested in schema['nestedCollectionTypes']:
                for child in record.get(nested,[]): allids.append(child['id'])
files=[p for p in expected if p.startswith('docs/knowledge/')]
for p in files:
    if p.endswith(('.yaml','.yml')) and p!='docs/knowledge/schema.yaml': ids(yaml.safe_load((ROOT/p).read_text()))
assert len(files)==252 and len(allids)==len(set(allids))==2487
ontology=yaml.safe_load((DOC/'ontology/ontology-result.yaml').read_text())['ontologyResult']
assert ontology['result']=='not-applicable' and ontology['baselineBefore']==ontology['baselineAfter']=='0.3.25'
assert ontology['changedArtifacts']==ontology['knowledgeSync']==ontology['conflicts']==ontology['questions']==[]
assert ontology['roadmapProgress']['status']=='in-progress'
findings=yaml.safe_load((DOC/'findings.yaml').read_text())
assert len(findings['inheritedOpenItems'])==2
for f in findings['inheritedOpenItems']:
    assert f['severity']=='high' and f['status']=='open' and f['remainsOpen'] is True and f['blocksWholeDhrLifecycleCompletion'] is True
assert all(not value for key,value in findings['acceptanceBoundary'].items() if key!='currentBatch')
write('documentation-policy-check.json',{'methodRecords':12,'sourcePathSymbolHashChecksPassed':True,'wholeFileCompletionInferred':False,'policyStatementsMatchedToOriginalYaml':36,'policyScope':'navigation only, not 36 runtime passes','knowledgeFiles':len(files),'knowledgeUniqueIds':len(allids),'knowledgeVersion':'0.3.25','ontologyResult':'not-applicable: no definition write only','inheritedOpenHighIds':[f['id'] for f in findings['inheritedOpenItems']],'wholeW1Complete':False,'wholeBranchComplete':False,'productionReleaseApproved':False})

parsed=[]
for p in sorted(DOC.rglob('*')):
    if not p.is_file(): continue
    if p.suffix=='.json': js(p)
    elif p.suffix in ('.yaml','.yml'): yaml.safe_load(p.read_text())
    elif p.suffix=='.jsonl': [json.loads(line) for line in p.read_text().splitlines() if line.strip()]
    parsed.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size})
write('reviewed-document-manifest.json',parsed)
copies=DOC/'evidence/independent-first-failed'
copychecks=[]
for p in sorted(copies.rglob('*')):
    if p.is_file() and (FIRST/p.name).is_file():
        assert sha(p)==sha(FIRST/p.name),str(p)
        copychecks.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p)})
assert sha(FIRST/'qualityResult.yaml')=='af3113fe40ddd73c012a5e8e7ed4fd10df55f278b7e37a56928b514805179eb2'
write('first-round-safe-copy-check.json',copychecks)
write('execution-summary.json',{'result':'passed','executedByThisInstance':['git exact path/blob inventory and UTF8 red/green check','historical inventory baseline checks','all tracked source SHA256 and Git blobs versus actual runtime originals','raw XML/log SHA checks and exact unique case sets','source method locator/hash existence','36 declaration policy index/source locator checks','JSON/YAML/JSONL parsing and report artifact SHA checks'],'didNotExecute':['Maven tests','database lifecycle or PostgreSQL transaction tests','browser E2E or visual page checks','repair or repository mutations'],'reusedEvidence':'First independent instance actually ran74; primary separately ran74; both source76 unchanged'} )
print(json.dumps({'result':'passed','trackedPaths':1524,'legacyPaths':[1423,1474],'utf8Corrections':6,'firstIndependentCases':74,'mainCases':74,'MavenExecutedByThisInstance':False,'knowledgeIds':2487,'output':str(OUT)},ensure_ascii=False))
