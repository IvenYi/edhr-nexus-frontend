from pathlib import Path
import json,os,subprocess,time,uuid,xml.etree.ElementTree as E,shutil,hashlib

root=Path('/workspace/edhr-nexus-frontend');name='edhr-category-final-qa-'+uuid.uuid4().hex[:10]
cid=subprocess.check_output(['docker','run','--rm','-d','--name',name,'--label','edhr.audit.owner=document-category-final-qa-20261030','-e','POSTGRES_DB=edhr_document_category_test','-e','POSTGRES_USER=category_q1','-e','POSTGRES_PASSWORD=synthetic_category_q1','-p','127.0.0.1::5432','postgres:16-alpine'],text=True).strip()
port=subprocess.check_output(['docker','port',cid,'5432/tcp'],text=True).strip().rsplit(':',1)[1]
info={'container':cid,'name':name,'owner':'document-category-final-qa-20261030','port':int(port),'username':'category_q1','categoryDatabase':'edhr_document_category_test','readDatabase':'edhr_document_read_test'}
Path('/tmp/edhr-document-category-q1-db.json').write_text(json.dumps(info,indent=2)+'\n')
for _ in range(150):
 check=subprocess.run(['docker','exec',cid,'pg_isready','-h','127.0.0.1','-U','category_q1','-d','edhr_document_category_test'],capture_output=True,text=True)
 if check.returncode==0:break
 time.sleep(.2)
assert check.returncode==0,check.stdout+check.stderr
Path('/tmp/edhr-document-category-q1-pg-ready.txt').write_text(check.stdout+check.stderr)
schema=root/'gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql'
with Path('/tmp/edhr-document-category-q1-schema-setup.txt').open('w') as log:
 setup=subprocess.run(['docker','exec','-i',cid,'psql','-U','category_q1','-d','edhr_document_category_test','-v','ON_ERROR_STOP=1'],input=schema.read_bytes(),stdout=log,stderr=subprocess.STDOUT)
assert setup.returncode==0
subprocess.run(['docker','exec',cid,'psql','-U','category_q1','-d','postgres','-v','ON_ERROR_STOP=1','-c','CREATE DATABASE edhr_document_read_test'],check=True,capture_output=True)
version=subprocess.check_output(['docker','exec',cid,'psql','-U','category_q1','-d','edhr_document_category_test','-Atc','SELECT version(),datcollate,datctype FROM pg_database WHERE datname=current_database(); SELECT count(*) FROM information_schema.tables WHERE table_schema=\'public\'; SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname=\'fk_delete_guard_035\';'],text=True)
Path('/tmp/edhr-document-category-q1-pg-version.txt').write_text(version)
env=dict(os.environ,EDHR_DOCUMENT_CATEGORY_DATABASE_URL=f'jdbc:postgresql://127.0.0.1:{port}/edhr_document_category_test',EDHR_DOCUMENT_CATEGORY_DATABASE_USER='category_q1',EDHR_DOCUMENT_CATEGORY_DATABASE_PASSWORD='synthetic_category_q1',EDHR_DOCUMENT_DATABASE_URL=f'jdbc:postgresql://127.0.0.1:{port}/edhr_document_read_test',EDHR_DOCUMENT_DATABASE_USER='category_q1',EDHR_DOCUMENT_DATABASE_PASSWORD='synthetic_category_q1')
classes=['DocumentCategoryAuditPostgresTest','DocumentReadPerformancePostgresTest','DocumentWriteBoundaryPostgresTest']
cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+','.join(classes),'-Dedhr.audit.documentReads=true','-Dedhr.audit.documentOutput=/tmp/edhr-document-category-q1-pg-read-http.jsonl','-Dedhr.audit.documentWriteOutput=/tmp/edhr-document-category-q1-pg-write-http.jsonl','-Dedhr.audit.categoryOutput=/tmp/edhr-document-category-q1-pg-category-http.jsonl','test']
with Path('/tmp/edhr-document-category-q1-pg-test.txt').open('w') as log:run=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
rows=[]
for cls in classes:
 p=root/('gmp-platform/backend/target/surefire-reports/TEST-com.zencas.edhr.masterdata.controller.'+cls+'.xml')
 r=E.parse(p).getroot();rows.append({'suite':cls,**{k:int(r.attrib[k]) for k in ['tests','failures','errors','skipped']}});shutil.copyfile(p,'/tmp/edhr-document-category-q1-pg-'+cls+'.xml')
out={'command':cmd,'exit':run.returncode,'suites':rows,'totals':{k:sum(x[k] for x in rows) for k in ['tests','failures','errors','skipped']},'canonicalSchemaSha256':hashlib.sha256(schema.read_bytes()).hexdigest(),'database':info}
Path('/tmp/edhr-document-category-q1-pg-summary.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(out['totals']);raise SystemExit(run.returncode)
