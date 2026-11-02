from pathlib import Path
import subprocess,json,os,shutil,hashlib,xml.etree.ElementTree as ET
root=Path('/workspace/edhr-nexus-frontend');worktree=Path('/tmp/edhr-upload-q1-old-worktree');base='a98e60792554f7753d22406d02b274fd50ea2e6c'
subprocess.run(['git','worktree','add','--detach',str(worktree),base],cwd=root,check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
classes=['FileUploadTransactionIntegrationTest','FileUploadTransactionPostgresTest'];copied=[];digests={}
try:
 for cls in classes:
  rel=Path('gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller')/(cls+'.java');target=worktree/rel
  assert not target.exists();shutil.copyfile(root/rel,target);copied.append(target)
  digests[cls]=hashlib.sha256(target.read_bytes()).hexdigest();assert target.read_bytes()==(root/rel).read_bytes()
 link=worktree/'gmp-platform/frontend/node_modules';assert not link.exists();link.symlink_to(root/'gmp-platform/frontend/node_modules',target_is_directory=True)
 cfg=json.loads(Path('/tmp/edhr-upload-q1-db.json').read_text());env=os.environ.copy();env.update(EDHR_UPLOAD_TX_DATABASE_URL=cfg['url'],EDHR_UPLOAD_TX_DATABASE_USER=cfg['user'],EDHR_UPLOAD_TX_DATABASE_PASSWORD=cfg['password'])
 cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+','.join(classes),'test']
 Path('/tmp/edhr-upload-q1-old-command.json').write_text(json.dumps({'cmd':cmd,'cwd':str(worktree),'commit':base,'testSha256':digests},indent=2))
 with open('/tmp/edhr-upload-q1-old-test.txt','w') as out:r=subprocess.run(cmd,cwd=worktree,env=env,stdout=out,stderr=subprocess.STDOUT)
 rows=[];failures=[]
 for cls in classes:
  f=next((worktree/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.'+cls+'.xml'));x=ET.parse(f).getroot();rows.append({'suite':cls,**{k:int(x.attrib[k]) for k in ['tests','failures','errors','skipped']}});shutil.copyfile(f,'/tmp/edhr-upload-q1-old-'+cls+'.xml')
  for case in x.findall('testcase'):
   for kind in ['failure','error']:
    for error in case.findall(kind):failures.append({'case':case.attrib['name'],'kind':kind,'message':error.attrib.get('message','')})
 summary={'commit':base,'exit':r.returncode,'suites':rows,'totals':{k:sum(x[k] for x in rows) for k in ['tests','failures','errors','skipped']},'failures':failures,'testSha256':digests}
 Path('/tmp/edhr-upload-q1-old-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2));print(json.dumps(summary,ensure_ascii=False))
finally:
 for p in copied:
  if p.exists():p.unlink()
 link=worktree/'gmp-platform/frontend/node_modules'
 if link.is_symlink():link.unlink()
 status=subprocess.check_output(['git','status','--porcelain'],cwd=worktree,text=True);assert not status.strip(),status
 subprocess.run(['git','worktree','remove',str(worktree)],cwd=root,check=True)
 Path('/tmp/edhr-upload-q1-old-cleanup.json').write_text(json.dumps({'worktree':str(worktree),'removed':not worktree.exists(),'onlyOwnCopiedTestsAndLinkRemoved':True},indent=2))
