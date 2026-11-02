from pathlib import Path
import subprocess,json,hashlib,time,xml.etree.ElementTree as E

root=Path('/workspace/edhr-nexus-frontend');old=Path('/tmp/edhr-dhr-write-old-exact-20261102');prefix=Path('/tmp/edhr-dhr-write-old-exact')
base='e3e49784eda6bc01e7e5c686d6f79dc5a600d5ae';rel=Path('gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrAttachmentWriteFailureTest.java')
subprocess.run(['git','worktree','add','--quiet','--detach',str(old),base],cwd=root,check=True)
try:
 raw=(root/rel).read_bytes();(old/rel).write_bytes(raw)
 (old/'gmp-platform/frontend/node_modules').symlink_to(root/'gmp-platform/frontend/node_modules',target_is_directory=True)
 cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest=DhrAttachmentWriteFailureTest','test'];started=time.time()
 Path(str(prefix)+'-command.json').write_text(json.dumps({'sourceCommit':base,'cwd':str(old),'cmd':cmd,'startedEpoch':started,'testSha256':hashlib.sha256(raw).hexdigest(),'copySha256':hashlib.sha256((old/rel).read_bytes()).hexdigest(),'exactFinalTestBytes':True},indent=2)+'\n')
 with Path(str(prefix)+'-test.txt').open('wb') as log:r=subprocess.run(cmd,cwd=old,stdout=log,stderr=subprocess.STDOUT)
 p=next((old/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.DhrAttachmentWriteFailureTest.xml'));assert p.stat().st_mtime>=started
 raw=p.read_bytes();Path(str(prefix)+'-test.xml').write_bytes(raw);x=E.fromstring(raw);totals={k:int(x.get(k,'0')) for k in ['tests','failures','errors','skipped']}
 Path(str(prefix)+'-summary.json').write_text(json.dumps({'exit':r.returncode,'totals':totals},indent=2)+'\n');print(json.dumps(totals),flush=True)
 assert totals=={'tests':5,'failures':3,'errors':0,'skipped':0}
finally:
 if (old/rel).exists(): (old/rel).unlink()
 dependency=old/'gmp-platform/frontend/node_modules'
 if dependency.is_symlink(): dependency.unlink()
 assert not subprocess.check_output(['git','status','--porcelain'],cwd=old,text=True).strip()
 subprocess.run(['git','worktree','remove',str(old)],cwd=root,check=True)
 Path(str(prefix)+'-cleanup.json').write_text(json.dumps({'worktreeRemoved':not old.exists(),'onlyOwnResources':True})+'\n')
