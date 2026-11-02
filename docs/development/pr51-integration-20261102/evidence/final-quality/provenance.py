from pathlib import Path
import subprocess,json,gzip,hashlib,tempfile,re,collections

root=Path('/workspace/edhr-nexus-frontend')
head='775d8bb664211b77a7172db0436a9b31715a5439'
target='54c9a7ccfbb2a2a420f6f0e2f41636f4805cf67f'
ours='63f2244adcce90d944785c9e83617fff872e19c2'
merge='b0c329c60e5bd9340a973e5d56009d91f3be10db'
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
def text(*args):return git(*args).decode().strip()
def blob(ref,p):return git('show',ref+':'+p)
def sha(raw):return hashlib.sha256(raw).hexdigest()
assert text('rev-parse','HEAD')==head
assert text('rev-parse','origin/edhr-dev')==target
assert text('status','--porcelain')==''
base=text('merge-base',ours,target)
assert base=='1ad6300918bd0059049eab3c415ca31162dd5115'
assert text('show','-s','--format=%P',merge).split()==[ours,target]
assert text('show','-s','--format=%P',head)==merge
for ref in [ours,target]:subprocess.run(['git','merge-base','--is-ancestor',ref,head],cwd=root,check=True)
test='gmp-platform/backend/src/test/java/com/zencas/edhr/recordcontrol/service/RecordControlPostgresIntegrationTest.java'
with tempfile.TemporaryDirectory(prefix='pr51-q1-readonly-merge-') as tmp:
    parts=[]
    for name,ref in [('ours',ours),('base',base),('theirs',target)]:
        p=Path(tmp)/name;p.write_bytes(blob(ref,test));parts.append(str(p))
    result=subprocess.run(['git','merge-file','-p',*parts],capture_output=True)
    assert result.returncode==0
    assert result.stdout==(root/test).read_bytes()
    test_sha=sha(result.stdout)
body=(root/test).read_text()
methods=['personalDhrListsFollowActualReturnResubmitAndApproval','ordinaryHttpReviewMatrixUsesMenuActionAndTaskIdentitySeparately',
         'ordinaryHttpInboxIsPersonalAndDoesNotGrantDhrPageAccess','ordinaryHandledReviewerReadsFrozenValuesAfterEffectiveChangeWithoutReapproving']
for method in methods:assert len(re.findall(r'void\s+'+method+r'\s*\(',body))==1,method
next_path='docs/development/branch-review-20261015/NEXT.md'
next_text=(root/next_path).read_text()
assert not re.search(r'^(<<<<<<< |=======$|>>>>>>> )',next_text,re.M)
assert not re.search(r'^(<<<<<<< |=======$|>>>>>>> )',body,re.M)
boundary='## PR48已合入：上传登记事务补偿'
retained=[]
for ref in [ours,target]:
    original=blob(ref,next_path).decode()
    block=original.split('# 持续推进台账\n\n',1)[1].split(boundary,1)[0].rstrip('\n')
    assert block in next_text,ref
    retained.append({'ref':ref,'originalTopBlockSha256':sha(block.encode()),'retainedVerbatim':True})
unchanged_scopes=['gmp-platform/backend/src/main','AGENTS.md','codeplzreadme.md','docs/agents','docs/knowledge','docs/architecture/business-knowledge-model.md']
assert not text('diff','--name-only',ours,head,'--',*unchanged_scopes)
assert not text('diff','--name-only',base,target,'--','AGENTS.md','codeplzreadme.md','docs/agents','docs/knowledge','docs/architecture/business-knowledge-model.md','gmp-platform/backend/src/main')
added=text('diff','--name-only','--diff-filter=A',base,target).splitlines()
assert len(added)==72
for p in added:assert blob(target,p)==(root/p).read_bytes(),p
primary=root/'docs/development/pr51-integration-20261102/evidence/primary-verification.json'
manifest=json.loads(primary.read_text());originals=[]
assert len(manifest['files'])==15
for item in manifest['files']:
    p=root/item['path'];stored=p.read_bytes();raw=gzip.decompress(stored) if item['encoding']=='gzip' else stored
    assert len(raw)==item['bytes'] and sha(raw)==item['sha256'],str(p)
    assert len(stored)==item['storedBytes'] and sha(stored)==item['storedSha256'],str(p)
    original=Path(item['source']);assert original.exists() and original.read_bytes()==raw
    originals.append({'path':item['path'],'source':str(original),'rawMatched':True,'storedMatched':True,'sourceMatched':True,'encoding':item['encoding']})
rows=[json.loads(s) for s in (root/'docs/development/pr51-integration-20261102/evidence/primary/main-http.jsonl').read_text().splitlines()]
assert len(rows)==39 and all(r['actualStatus']==r['expectedStatus'] for r in rows)
sum_file=json.loads((root/'docs/development/pr51-integration-20261102/evidence/primary/main-summary.json').read_text())
assert sum_file['exit']==0 and sum_file['totals']=={'tests':155,'failures':0,'errors':0,'skipped':0}
authored=[next_path,test,'docs/development/pr51-integration-20261102/README.md','docs/development/pr51-integration-20261102/decision-package.yaml','docs/development/branch-review-20261102-dhr-review-pagination/README.md']
w=subprocess.run(['git','diff','--check',ours,head,'--',*authored],cwd=root,capture_output=True)
Path('/tmp/edhr-pr51-q1-provenance-whitespace.txt').write_bytes(w.stdout+w.stderr);assert w.returncode==0
inventory=[]
for prefix in ['branch-review-20261031-dhr-impact-review','branch-review-20261102-dhr-review-pagination']:
    p=root/'docs/development'/prefix/'inventory/inventory-summary.json';i=json.loads(p.read_text())
    assert i['sourceCommit']==base
    inventory.append({'path':str(p.relative_to(root)),'historicalSourceCommit':i['sourceCommit'],'trackedPaths':i['trackedPaths'],'scope':'retained historical inventory, not new target54c coverage'})
assert text('status','--porcelain')=='' and text('rev-parse','HEAD')==head
result={'roleState':'FINAL','result':'passed','role':'read-only quality auxiliary provenance; not independent runtime certification',
 'baseCommit':target,'headCommit':head,'contractReadCommit':head,'knowledgeBaselineVersion':'0.3.25',
 'clean':True,'mergeCommit':merge,'mergeParents':[ours,target],'targetAndPriorAreAncestors':True,
 'automaticTestMerge':{'returnCode':0,'matchesWorkingFile':True,'mergedSha256':test_sha,'retainedMethodDefinitions':methods},
 'ledgerTopBlocks':retained,'conflictMarkersAbsentInResolvedFiles':True,
 'srcMainKnowledgeContractsDeltaVsPrior':[],'targetCodeKnowledgeContractDeltaVsCommonBase':[],
 'targetAddedFilesPreserved':len(added),'primaryOriginals':originals,'primaryTotals':sum_file['totals'],
 'primaryHttpResponses':39,'primaryHttpStatuses':dict(collections.Counter(str(r['actualStatus']) for r in rows)),
 'authoredWhitespacePaths':authored,'authoredWhitespaceExit':w.returncode,'historicalInventory':inventory,
 'reuseBoundary':'Original large index plans and old-source red-control remain limited prior evidence; product/src-main and migration bytes unchanged permit affected-scope reuse. This role does not rerun or newly certify them.',
 'notPerformed':['Maven','database','CI/Actions','new global coverage inventory','browser','repository mutation','merge/push/deploy']}
Path('/tmp/edhr-pr51-q1-provenance.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
artifacts=[]
for name in ['edhr-pr51-q1-provenance.py','edhr-pr51-q1-provenance.json','edhr-pr51-q1-provenance-whitespace.txt']:
    p=Path('/tmp')/name;raw=p.read_bytes();artifacts.append({'path':str(p),'bytes':len(raw),'sha256':sha(raw)})
Path('/tmp/edhr-pr51-q1-provenance-manifest.json').write_text(json.dumps({'roleState':'FINAL','result':'passed','headCommit':head,'artifacts':artifacts},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'passed','head':head,'originals':15,'addedPreserved':72,'httpResponses':39,'whitespacePaths':len(authored)}))
