from pathlib import Path
import datetime, gzip, hashlib, json, subprocess

root=Path('/workspace/edhr-nexus-frontend')
doc=root/'docs/development/branch-review-20261102-dhr-attachment'
base='ab5adafb9629b94f95eb88825ec0a4ea06f4efb1'
head='a6f799459eb105da5e98ab3d548d6b03d18d9e43'
checks=[]
def sha(b): return hashlib.sha256(b).hexdigest()
def git(*args): return subprocess.check_output(['git',*args],cwd=root)
def check(name,actual,expected):
    equal=actual==expected
    checks.append({'id':name,'actual':actual,'expected':expected,'passed':equal})
    return equal
report={'status':'in-progress','baseCommit':base,'headCommit':head,'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Read-only artifact/provenance and fixed enumeration verification; no product tests or semantic completion claim'}
report['contractBaseline']={'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':head,'uncommittedContractPaths':[]}
report['knowledgeBaselineVersion']='0.3.25'
report['schemaVersion']='1.2.0'
check('actual HEAD',git('rev-parse','HEAD').decode().strip(),head)
check('clean working tree',git('status','--porcelain').decode(),'')
primary=json.loads((doc/'evidence-manifest.json').read_text())
check('primary artifact count',len(primary['artifacts']),40)
check('primary base',primary['baseCommit'],base)
report['evidence']=[]
for item in primary['artifacts']:
    path=doc/item['path'];stored=path.read_bytes()
    raw=gzip.decompress(stored) if item['compression']=='gzip' else stored
    rec={'path':item['path'],'sourcePath':item['sourcePath'],'checks':[]}
    for suffix,actual,expected in [('stored bytes',len(stored),item['storedBytes']),('stored hash',sha(stored),item['storedSha256']),('raw bytes',len(raw),item['rawBytes']),('raw hash',sha(raw),item['rawSha256'])]:
        rec['checks'].append(check(item['path']+':'+suffix,actual,expected))
    src=Path(item['sourcePath'])
    rec['sourceExists']=src.is_file()
    rec['sourceEqualsArchivedRaw']=check(item['path']+': original byte equality',src.read_bytes(),raw) if src.exists() else False
    report['evidence'].append(rec)
report['sourceSnapshot']=[]
check('primary source snapshot count',len(primary['sourceSnapshot']),3)
for item in primary['sourceSnapshot']:
    raw=(root/item['path']).read_bytes()
    report['sourceSnapshot'].append({'path':item['path'],'bytesMatch':check(item['path']+': snapshot bytes',len(raw),item['bytes']),'hashMatch':check(item['path']+': snapshot sha',sha(raw),item['sha256']),'headByteMatch':check(item['path']+': committed snapshot sha',sha(git('show',head+':'+item['path'])),item['sha256'])})
ontology_path=Path('/tmp/edhr-dhr-attachment-ontology-manifest.json')
ontology=json.loads(ontology_path.read_text())
report['ontologyManifestOriginal']={'path':str(ontology_path),'sha256':sha(ontology_path.read_bytes())}
check('ontology manifest sha',report['ontologyManifestOriginal']['sha256'],'107baa11a6d11a266b4739a669c1ed518b933ff6bebbfc501e128f2273beb2be')
check('ontology formal status',ontology['status'],'FINAL')
check('ontology artifacts excluding manifest',len(ontology['artifacts']),12)
report['ontologyArtifacts']=[]
for item in ontology['artifacts']:
    raw=Path(item['path']).read_bytes()
    report['ontologyArtifacts'].append({'path':item['path'],'bytesMatch':check(item['path']+': ontology bytes',len(raw),item['bytes']),'hashMatch':check(item['path']+': ontology hash',sha(raw),item['sha256'])})
fingerprints=json.loads(Path('/tmp/edhr-dhr-attachment-ontology-source-fingerprints.json').read_text())
check('ontology source count',len(fingerprints['files']),25)
report['ontologySourceFingerprints']=[]
for item in fingerprints['files']:
    raw=(root/item['path']).read_bytes()
    report['ontologySourceFingerprints'].append({'path':item['path'],'bytesMatch':check(item['path']+': ontology source bytes',len(raw),item['bytes']),'hashMatch':check(item['path']+': ontology source hash',sha(raw),item['sha256'])})
current_paths=git('ls-files','docs/knowledge').decode().splitlines()
base_paths=git('ls-tree','-r','--name-only',base,'--','docs/knowledge').decode().splitlines()
check('knowledge path count',len(current_paths),330)
check('knowledge exact path set',current_paths,base_paths)
report['knowledge']=[]
for p in current_paths:
    cur=(root/p).read_bytes(); old=git('show',base+':'+p)
    report['knowledge'].append({'path':p,'bytes':len(cur),'sha256':sha(cur),'baseByteMatch':check(p+': knowledge base hash',sha(cur),sha(old))})
contract_paths=['AGENTS.md','codeplzreadme.md','docs/architecture/business-knowledge-model.md']+git('ls-files','docs/agents').decode().splitlines()
report['contracts']=[]
for p in contract_paths:
    cur=(root/p).read_bytes();old=git('show',base+':'+p)
    report['contracts'].append({'path':p,'bytes':len(cur),'sha256':sha(cur),'baseByteMatch':check(p+': contract/model base hash',sha(cur),sha(old))})
report['contractDiff']=git('diff','--name-only',base,head,'--',*contract_paths).decode()
check('contract/model diff empty',report['contractDiff'],'')
command=['python3','scripts/build-branch-review-inventory.py','--ref',base,'--out','/tmp/edhr-dhr-attachment-qa-evidence-inventory']
Path('/tmp/edhr-dhr-attachment-qa-evidence-inventory-command.json').write_text(json.dumps({'cmd':command,'cwd':str(root),'baseCommit':base,'headCommit':head},indent=2)+'\n')
ran=subprocess.run(command,cwd=root,capture_output=True)
Path('/tmp/edhr-dhr-attachment-qa-evidence-inventory-stdout.txt').write_bytes(ran.stdout)
Path('/tmp/edhr-dhr-attachment-qa-evidence-inventory-stderr.txt').write_bytes(ran.stderr)
check('inventory rebuild exit',ran.returncode,0)
report['inventory']=[]
for name in ['coverage.csv','entrypoints.csv','migrations.csv','inventory-summary.json']:
    built=Path('/tmp/edhr-dhr-attachment-qa-evidence-inventory')/name
    raw=built.read_bytes();stored=(doc/'inventory'/name).read_bytes()
    report['inventory'].append({'path':str(built),'bytes':len(raw),'sha256':sha(raw),'fixedStoredHash':sha(stored),'byteMatch':check(name+': inventory fixed bytes',sha(raw),sha(stored))})
summary=json.loads(Path('/tmp/edhr-dhr-attachment-qa-evidence-inventory/inventory-summary.json').read_text())
report['inventorySummary']=summary
for key,value in [('trackedPaths',6503),('migrationFiles',135)]: check('inventory '+key,summary[key],value)
check('HTTP candidates',summary['entrypointCandidates']['http-annotation'],464)
check('route candidates',summary['entrypointCandidates']['frontend-route-candidate'],216)
check('end HEAD unchanged',git('rev-parse','HEAD').decode().strip(),head)
check('end clean working tree',git('status','--porcelain').decode(),'')
report['limitations']=['Inventory and hashes prove enumeration/provenance only, not whole-file or all-ID semantic review, product tests, migrations, browser, runtime queries or performance.','Finite12 existing IDs and current branch snapshot do not establish a historical unique increment.','This role did not modify repository files or execute product tests.']
report['counts']={'primaryArtifacts':40,'sourceSnapshot':3,'ontologyArtifacts':12,'ontologyManifest':1,'ontologySourceFingerprints':25,'knowledgePaths':len(current_paths),'fixedInventoryFiles':4}
report['status']='FINAL';report['booleanChecks']=len(checks);report['failedBooleanChecks']=sum(not x['passed'] for x in checks)
report['result']='passed' if not report['failedBooleanChecks'] else 'failed'
for item in checks:
    for key in ['actual','expected']:
        if isinstance(item[key],bytes): item[key]={'bytes':len(item[key]),'sha256':sha(item[key])}
report['checks']=checks
Path('/tmp/edhr-dhr-attachment-qa-evidence-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'result':report['result'],'booleanChecks':len(checks),'failedBooleanChecks':report['failedBooleanChecks'],'counts':report['counts']}))
