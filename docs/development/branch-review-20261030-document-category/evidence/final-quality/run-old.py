from pathlib import Path
import hashlib,json,os,subprocess,time,uuid,xml.etree.ElementTree as E,shutil
R=Path('/workspace/edhr-nexus-frontend');P='/tmp/edhr-document-category-q2-'
shutil.copyfile(P+'old-base-test.txt',P+'initial-old-base-build-failure.txt')
shutil.copyfile(P+'cleanup.json',P+'initial-cleanup.json')
old=json.loads(Path(P+'db.json').read_text())
initialAbsent=subprocess.run(['docker','inspect',old['container']],capture_output=True).returncode!=0
assert initialAbsent
name='edhr-document-category-q2-red-'+uuid.uuid4().hex[:10]
cid=subprocess.check_output(['docker','run','--rm','-d','--name',name,'--label','edhr.audit.owner=document-category-final-q2-red-20261030','-e','POSTGRES_DB=edhr_document_category_test','-e','POSTGRES_USER=category_test','-e','POSTGRES_PASSWORD=synthetic_category_test','-p','127.0.0.1::5432','postgres:16-alpine'],text=True).strip()
port=subprocess.check_output(['docker','port',cid,'5432/tcp'],text=True).strip().rsplit(':',1)[1]
Path(P+'old-db.json').write_text(json.dumps({'container':cid,'name':name,'owner':'document-category-final-q2-red-20261030','port':int(port),'initialCurrentContainerAbsent':initialAbsent},indent=2)+'\n')
worktrees=[];removed=[];results=[]
try:
 for _ in range(150):
  q=subprocess.run(['docker','exec',cid,'pg_isready','-h','127.0.0.1','-U','category_test','-d','edhr_document_category_test'],capture_output=True)
  if q.returncode==0:break
  time.sleep(.2)
 assert q.returncode==0
 schema=R/'gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql'
 with Path(P+'old-schema-setup.txt').open('w') as f:
  q=subprocess.run(['docker','exec','-i',cid,'psql','-U','category_test','-d','edhr_document_category_test','-v','ON_ERROR_STOP=1'],input=schema.read_bytes(),stdout=f,stderr=subprocess.STDOUT)
 assert q.returncode==0
 env=dict(os.environ,EDHR_DOCUMENT_CATEGORY_DATABASE_URL=f'jdbc:postgresql://127.0.0.1:{port}/edhr_document_category_test',EDHR_DOCUMENT_CATEGORY_DATABASE_USER='category_test',EDHR_DOCUMENT_CATEGORY_DATABASE_PASSWORD='synthetic_category_test')
 testPath='gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/DocumentCategoryAuditPostgresTest.java';test=(R/testPath).read_bytes()
 for label,ref in [('old-base','d10590bd3fe8f3da4e68bcc087b2102d2c211934'),('old-first','ac3a421e42529bdb304e2c72145ceb580ec70618')]:
  wt=Path(P+'worktree-'+label);subprocess.run(['git','worktree','add','--detach',str(wt),ref],cwd=R,capture_output=True,check=True);worktrees.append(wt)
  (wt/testPath).write_bytes(test)
  dep=wt/'gmp-platform/frontend/node_modules';dep.symlink_to(R/'gmp-platform/frontend/node_modules',target_is_directory=True)
  cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest=DocumentCategoryAuditPostgresTest','-Dedhr.audit.categoryOutput='+P+label+'-http.jsonl','test']
  Path(P+label+'-command.json').write_text(json.dumps({'command':cmd,'commit':ref,'copiedUnchangedTestSha256':hashlib.sha256(test).hexdigest(),'dependencySymlinkOnly':str(dep)},indent=2)+'\n')
  with Path(P+label+'-test.txt').open('w') as f:q=subprocess.run(cmd,cwd=wt,env=env,stdout=f,stderr=subprocess.STDOUT)
  source=wt/'gmp-platform/backend/target/surefire-reports/TEST-com.zencas.edhr.masterdata.controller.DocumentCategoryAuditPostgresTest.xml'
  t=E.parse(source).getroot();summary={'exit':q.returncode,'commit':ref,'testSha256':hashlib.sha256(test).hexdigest(),'totals':{k:int(t.attrib[k]) for k in ['tests','failures','errors','skipped']},'failures':[{'name':x.attrib['name'],'message':x.find('failure').attrib.get('message','')} for x in t.findall('testcase') if x.find('failure') is not None]}
  shutil.copyfile(source,P+label+'-DocumentCategoryAuditPostgresTest.xml');Path(P+label+'-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n');results.append(summary);print(summary,flush=True)
finally:
 for wt in worktrees:
  (wt/'gmp-platform/frontend/node_modules').unlink()
  path='gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/DocumentCategoryAuditPostgresTest.java'
  tracked=subprocess.run(['git','ls-files','--error-unmatch',path],cwd=wt,capture_output=True).returncode==0
  if tracked:subprocess.run(['git','restore','--',path],cwd=wt,check=True)
  else:(wt/path).unlink()
  assert not subprocess.check_output(['git','status','--porcelain=v1'],cwd=wt,text=True)
  subprocess.run(['git','worktree','remove',str(wt)],cwd=R,check=True);removed.append(str(wt))
 owner=subprocess.check_output(['docker','inspect','-f','{{ index .Config.Labels "edhr.audit.owner" }}',cid],text=True).strip();assert owner=='document-category-final-q2-red-20261030'
 subprocess.run(['docker','stop',cid],capture_output=True,check=True)
 for _ in range(100):
  absent=subprocess.run(['docker','inspect',cid],capture_output=True).returncode!=0
  if absent:break
  time.sleep(.1)
 Path(P+'cleanup.json').write_text(json.dumps({'currentContainer':old['container'],'currentAbsent':initialAbsent,'redContainer':cid,'redAbsent':absent,'worktreesRemoved':removed,'sourceStatus':subprocess.check_output(['git','status','--porcelain=v1'],cwd=R,text=True)},indent=2)+'\n')
