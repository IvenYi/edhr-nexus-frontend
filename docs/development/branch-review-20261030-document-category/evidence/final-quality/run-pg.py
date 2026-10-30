from pathlib import Path
import hashlib,json,os,subprocess,time,uuid,xml.etree.ElementTree as E,shutil
R=Path('/workspace/edhr-nexus-frontend');P='/tmp/edhr-document-category-q2-'
name='edhr-document-category-q2-'+uuid.uuid4().hex[:10]
cid=subprocess.check_output(['docker','run','--rm','-d','--name',name,'--label','edhr.audit.owner=document-category-final-q2-20261030','-e','POSTGRES_DB=edhr_document_category_test','-e','POSTGRES_USER=category_test','-e','POSTGRES_PASSWORD=synthetic_category_test','-p','127.0.0.1::5432','postgres:16-alpine'],text=True).strip()
port=subprocess.check_output(['docker','port',cid,'5432/tcp'],text=True).strip().rsplit(':',1)[1]
info={'container':cid,'name':name,'owner':'document-category-final-q2-20261030','port':int(port),'categoryDatabase':'edhr_document_category_test','regressionDatabase':'edhr_document_read_test'}
Path(P+'db.json').write_text(json.dumps(info,indent=2)+'\n')
worktrees=[]
def run(cmd,cwd,env,log):
 with Path(P+log).open('w') as f:return subprocess.run(cmd,cwd=cwd,env=env,stdout=f,stderr=subprocess.STDOUT).returncode
def save_xml(root,suites,label,code):
 rows=[]
 for cls in suites:
  f=root/('gmp-platform/backend/target/surefire-reports/TEST-com.zencas.edhr.masterdata.controller.'+cls+'.xml')
  t=E.parse(f).getroot();rows.append({'suite':cls,**{k:int(t.attrib[k]) for k in ['tests','failures','errors','skipped']}})
  shutil.copyfile(f,P+label+'-'+cls+'.xml')
 summary={'exit':code,'suites':rows,'totals':{k:sum(r[k] for r in rows) for k in ['tests','failures','errors','skipped']}}
 Path(P+label+'-summary.json').write_text(json.dumps(summary,indent=2)+'\n');return summary
try:
 for _ in range(150):
  ready=subprocess.run(['docker','exec',cid,'pg_isready','-h','127.0.0.1','-U','category_test','-d','edhr_document_category_test'],capture_output=True)
  if ready.returncode==0:break
  time.sleep(.2)
 assert ready.returncode==0
 schema=R/'gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql'
 with Path(P+'schema-setup.txt').open('w') as f:
  c=subprocess.run(['docker','exec','-i',cid,'psql','-U','category_test','-d','edhr_document_category_test','-v','ON_ERROR_STOP=1'],input=schema.read_bytes(),stdout=f,stderr=subprocess.STDOUT)
 assert c.returncode==0
 subprocess.run(['docker','exec',cid,'psql','-U','category_test','-d','postgres','-v','ON_ERROR_STOP=1','-c','CREATE DATABASE edhr_document_read_test'],capture_output=True,check=True)
 version=subprocess.check_output(['docker','exec',cid,'psql','-U','category_test','-d','edhr_document_category_test','-c',"select version(); select datname,datcollate,datctype from pg_database where datname in ('edhr_document_category_test','edhr_document_read_test');"],text=True)
 Path(P+'pg-version.txt').write_text(version)
 env=dict(os.environ,EDHR_DOCUMENT_CATEGORY_DATABASE_URL=f'jdbc:postgresql://127.0.0.1:{port}/edhr_document_category_test',EDHR_DOCUMENT_CATEGORY_DATABASE_USER='category_test',EDHR_DOCUMENT_CATEGORY_DATABASE_PASSWORD='synthetic_category_test',EDHR_DOCUMENT_DATABASE_URL=f'jdbc:postgresql://127.0.0.1:{port}/edhr_document_read_test',EDHR_DOCUMENT_DATABASE_USER='category_test',EDHR_DOCUMENT_DATABASE_PASSWORD='synthetic_category_test')
 suites=['DocumentCategoryAuditPostgresTest','DocumentReadPerformancePostgresTest','DocumentWriteBoundaryPostgresTest']
 cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+','.join(suites),'-Dedhr.audit.documentReads=true','-Dedhr.audit.documentOutput='+P+'pg-read-http.jsonl','-Dedhr.audit.documentWriteOutput='+P+'pg-write-http.jsonl','-Dedhr.audit.categoryOutput='+P+'pg-category-http.jsonl','test']
 Path(P+'pg-command.json').write_text(json.dumps(cmd,indent=2)+'\n')
 code=run(cmd,R,env,'pg-test.txt');print('current',save_xml(R,suites,'pg',code),flush=True)
 assert code==0
 test_path='gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/DocumentCategoryAuditPostgresTest.java'
 test=(R/test_path).read_bytes()
 for label,ref in [('old-base','d10590bd3fe8f3da4e68bcc087b2102d2c211934'),('old-first','ac3a421e42529bdb304e2c72145ceb580ec70618')]:
  wt=Path(P+'worktree-'+label);subprocess.run(['git','worktree','add','--detach',str(wt),ref],cwd=R,capture_output=True,check=True);worktrees.append(wt)
  (wt/test_path).write_bytes(test)
  assert hashlib.sha256((wt/test_path).read_bytes()).hexdigest()==hashlib.sha256(test).hexdigest()
  cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest=DocumentCategoryAuditPostgresTest','-Dedhr.audit.categoryOutput='+P+label+'-http.jsonl','test']
  Path(P+label+'-command.json').write_text(json.dumps({'command':cmd,'commit':ref,'copiedUnchangedTestSha256':hashlib.sha256(test).hexdigest()},indent=2)+'\n')
  code=run(cmd,wt,env,label+'-test.txt');print(label,save_xml(wt,['DocumentCategoryAuditPostgresTest'],label,code),flush=True)
finally:
 cleanup=[]
 for wt in worktrees:
  # Restore only the exact copied test, then remove our detached worktree normally.
  test_path='gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/DocumentCategoryAuditPostgresTest.java'
  tracked=subprocess.run(['git','ls-files','--error-unmatch',test_path],cwd=wt,capture_output=True).returncode==0
  if tracked:subprocess.run(['git','restore','--',test_path],cwd=wt,check=True)
  else:(wt/test_path).unlink()
  status=subprocess.check_output(['git','status','--porcelain=v1'],cwd=wt,text=True);assert not status,status
  subprocess.run(['git','worktree','remove',str(wt)],cwd=R,check=True);cleanup.append(str(wt))
 owner=subprocess.check_output(['docker','inspect','-f','{{ index .Config.Labels "edhr.audit.owner" }}',cid],text=True).strip();assert owner==info['owner']
 subprocess.run(['docker','stop',cid],capture_output=True,check=True)
 absent=subprocess.run(['docker','inspect',cid],capture_output=True).returncode!=0
 Path(P+'cleanup.json').write_text(json.dumps({'container':cid,'owner':owner,'absent':absent,'worktreesRemoved':cleanup,'sourceStatus':subprocess.check_output(['git','status','--porcelain=v1'],cwd=R,text=True)},indent=2)+'\n')
