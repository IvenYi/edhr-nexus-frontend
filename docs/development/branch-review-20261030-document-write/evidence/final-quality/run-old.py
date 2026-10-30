from pathlib import Path
import hashlib,json,os,shutil,subprocess,uuid
root=Path('/workspace/edhr-nexus-frontend')
base='2e24711aad1124bb28674161ef8f3dbaf00b569a'
old=Path('/tmp/edhr-document-write-q1-old-'+uuid.uuid4().hex[:10])
subprocess.run(['git','worktree','add','--detach',str(old),base],cwd=root,check=True,capture_output=True)
copied=[]
for name in ['DocumentWriteBoundaryIntegrationTest.java','DocumentOrmSchemaIntegrationTest.java']:
 rel=Path('gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller')/name
 source=root/rel; target=old/rel
 assert not target.exists()
 shutil.copyfile(source,target)
 assert target.read_bytes()==source.read_bytes()
 copied.append({'path':str(rel),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'bytes':source.stat().st_size})
shared=root/'gmp-platform/frontend/node_modules'
link=old/'gmp-platform/frontend/node_modules'
assert shared.is_dir() and not link.exists()
link.symlink_to(shared,target_is_directory=True)
status=subprocess.check_output(['git','status','--short'],cwd=old,text=True)
info={'path':str(old),'base':base,'copied':copied,'sharedNodeModules':str(shared),'symlink':str(link),'status':status,'candidateHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()}
Path('/tmp/edhr-document-write-q1-old-install.json').write_text(json.dumps(info,indent=2)+'\n')
cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest=DocumentWriteBoundaryIntegrationTest,DocumentOrmSchemaIntegrationTest','-Dedhr.audit.documentWriteOutput=/tmp/edhr-document-write-q1-old-http.jsonl','test']
with Path('/tmp/edhr-document-write-q1-old-test.txt').open('w') as log:
 result=subprocess.run(cmd,cwd=old,stdout=log,stderr=subprocess.STDOUT)
Path('/tmp/edhr-document-write-q1-old-exit.json').write_text(json.dumps({'exit':result.returncode,'command':cmd,'worktree':str(old)},indent=2)+'\n')
print(json.dumps({'expectedRedExit':result.returncode,'worktree':str(old)}))
raise SystemExit(0 if result.returncode==1 else 1)
