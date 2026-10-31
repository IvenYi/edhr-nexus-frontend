from pathlib import Path
import subprocess,json,hashlib,xml.etree.ElementTree as ET,collections

root=Path('/workspace/edhr-nexus-frontend')
batch=root/'docs/development/branch-review-20261031-dhr-impact-review'
base='1ad6300918bd0059049eab3c415ca31162dd5115'
head='977287f6da3ba1cb78c4eb2842f3ace69bb1f43b'
def run(*args): return subprocess.check_output(args,cwd=root,text=True).strip()
def sha(raw): return hashlib.sha256(raw).hexdigest()
def fingerprint(path):
    raw=path.read_bytes()
    return len(raw),sha(raw)
def verify(item,path):
    actual=fingerprint(path)
    assert actual==(item['bytes'],item['sha256']),(str(path),actual,item)
    return {'path':str(path),'bytes':actual[0],'sha256':actual[1]}
assert run('git','rev-parse','HEAD')==head
assert run('git','rev-parse','origin/edhr-dev')==base
assert run('git','status','--porcelain')==''
subprocess.run(['git','merge-base','--is-ancestor',base,head],cwd=root,check=True)
changed=run('git','diff','--name-only',base,head).splitlines()
product=[p for p in changed if '/src/main/' in p]
test=[p for p in changed if '/src/test/' in p]
assert product==[] and len(test)==1
assert not run('git','diff','--name-only',base,head,'--','AGENTS.md','codeplzreadme.md','docs/agents','docs/knowledge','docs/architecture')
primary=json.loads((batch/'evidence/primary-verification.json').read_text())
assert primary['baseCommit']==base and primary['singleRunTotal']==52 and primary['newTestExecutions']==9
sources=[verify(i,root/i['path']) for i in primary['sourceSnapshot']]
primary_checks=[]
for item in primary['files']:
    verify(item,root/item['path'])
    verify(item,Path(item['source']))
    primary_checks.append({'archived':item['path'],'source':item['source'],'matched':True})
assert len(primary_checks)==17
ontology_checks=[]
for item in primary['ontologyOriginals']:
    verify(item,root/item['path']);verify(item,Path(item['source']))
    ontology_checks.append({'archived':item['path'],'source':item['source'],'matched':True})
assert len(ontology_checks)==10
manifest=json.loads((batch/'evidence/ontology/manifest.json').read_text())
assert len(manifest['artifacts'])==9
for item in manifest['artifacts']:
    verify(item,Path(item['path']))
    name=Path(item['path']).name.removeprefix('edhr-dhr-impact-ontology-')
    verify(item,batch/'evidence/ontology'/name)
source_fingerprints=json.loads((batch/'evidence/ontology/source-fingerprints.json').read_text())
for item in source_fingerprints['files']:verify(item,root/item['path'])
knowledge=json.loads((batch/'evidence/ontology/knowledge-inventory.json').read_text())
assert knowledge['count']==330 and len(knowledge['assets'])==330 and knowledge['knowledgeBaselineVersion']=='0.3.25'
for item in knowledge['assets']:
    verify(item,root/item['path'])
    old=subprocess.check_output(['git','show',base+':'+item['path']],cwd=root)
    assert len(old)==item['bytes'] and sha(old)==item['sha256']
sem=json.loads((batch/'evidence/ontology/semantic-review.json').read_text())
records=sem['semanticReview']['records']
assert len(records)==24 and sem['semanticReview']['limitedRecordCount']==24
for i in records: assert i['id'] in (root/i['sourcePath']).read_text(),i['id']
review=json.loads((batch/'source-review.json').read_text())
assert len(review['records'])==9 and review['wholeFileCompletion']==0 and review['historicalUniqueIncrement'] is None
for i in review['records']:verify(i,root/i['path'])
a23=review['a23']
assert len(a23['records'])==5
assert a23['historicalLanguageQueue']==856 and a23['previousFeatureAddedPending']==1 and a23['historicalSqlQueue']==130 and a23['newMigrationQueue']==4
assert a23['sqlChecked']==0 and a23['wholeFileCompletion']==0 and a23['currentChangedPending']==['RecordControlPostgresIntegrationTest.java'] and a23['currentAddedPending']==[]
all_text='\n'.join((batch/p).read_text() for p in ['README.md','review-notes.md','source-review.json'])
assert '666' in all_text and '44' in all_text and '183' in all_text
assert 'open' in all_text and 'W6' in all_text and 'W7' in all_text
diff=run('git','diff','--unified=0',base,head,'--',test[0])
assert diff.count('+    @ParameterizedTest @ValueSource(strings = {"anonymous", "no-menu", "act-only", "menu-only", "candidate", "unrelated", "submitter"})')==1
assert diff.count('+    @Test void ')==2
main_summary=json.loads((batch/'evidence/primary/summary.json').read_text());assert main_summary['exit']==0
assert main_summary['totals']=={'tests':52,'failures':0,'errors':0,'skipped':0}
fixture_summary=json.loads((batch/'evidence/fixture-attempt1/summary.json').read_text());assert fixture_summary['exit']==1
assert fixture_summary['totals']=={'tests':52,'failures':0,'errors':8,'skipped':0}
fixture_xml=ET.parse(batch/'evidence/fixture-attempt1/RecordControlPostgresIntegrationTest.xml').getroot()
fixture_errors=[]
for c in fixture_xml.findall('testcase'):
    e=c.find('error')
    if e is not None:
        text=(e.get('message') or '')+(e.text or '')
        assert 'production_execution' in text or "values_json->>'value'" in text
        fixture_errors.append({'test':c.get('name'),'type':e.get('type'),'message':e.get('message')})
assert len(fixture_errors)==8
inventory=Path('/tmp/edhr-dhr-q1-inventory')
cmd=['python3','scripts/build-branch-review-inventory.py','--ref',base,'--out',str(inventory)]
p=subprocess.run(cmd,cwd=root,text=True,capture_output=True)
Path('/tmp/edhr-dhr-q1-inventory-build.txt').write_text(p.stdout+p.stderr)
assert p.returncode==0
inventory_checks=[]
for f in sorted((batch/'inventory').iterdir()):
    assert f.read_bytes()==(inventory/f.name).read_bytes(),f.name
    inventory_checks.append({'file':f.name,'bytes':f.stat().st_size,'sha256':sha(f.read_bytes()),'identical':True})
inv=json.loads((inventory/'inventory-summary.json').read_text())
assert inv['trackedPaths']==6017 and inv['migrationFiles']==134 and inv['entrypointCandidates']['http-annotation']==464 and inv['entrypointCandidates']['frontend-route-candidate']==216
authored=[p for p in changed if '/evidence/' not in p and '/inventory/' not in p]
ws=subprocess.run(['git','diff','--check',base,head,'--',*authored],cwd=root,text=True,capture_output=True)
Path('/tmp/edhr-dhr-q1-whitespace.txt').write_text(ws.stdout+ws.stderr)
assert ws.returncode==0
assert run('git','rev-parse','HEAD')==head and run('git','status','--porcelain')==''
out={'roleState':'FINAL','result':'passed','scope':'read-only provenance and fixed inventory checks; auxiliary to independent quality role, not a separate whole-audit or runtime certification',
     'baseCommit':base,'headCommit':head,'contractReadCommit':head,'workingTreeClean':True,
     'productChangedPaths':product,'testChangedPaths':test,'primaryOriginals':primary_checks,'sourceSnapshots':sources,'ontologyOriginals':ontology_checks,
     'ontologySourceFingerprints':len(source_fingerprints['files']),'knowledgeFingerprints':330,'knowledgeAllMatchBase':True,
     'semanticRecords':24,'semanticConclusions':dict(collections.Counter(i['conclusion'] for i in records)),
     'limitedSourceGroups':9,'wholeFileCompletion':0,'historicalUniqueIncrement':None,
     'a23Records':5,'a23OldLanguage':856,'a23OldFeature':1,'a23OldSql':130,'a23NewMigrations':4,'newTestExecutions':9,
     'primarySingleRun':main_summary,'fixtureFailureHistory':fixture_errors,'inventory':inv,'inventoryFiles':inventory_checks,
     'authoredWhitespacePaths':authored,'authoredWhitespaceExit':ws.returncode,'findings':[]}
Path('/tmp/edhr-dhr-q1-provenance.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:out[k] for k in ['result','primaryOriginals','ontologySourceFingerprints','knowledgeFingerprints','semanticRecords','newTestExecutions','authoredWhitespaceExit']},ensure_ascii=False))
