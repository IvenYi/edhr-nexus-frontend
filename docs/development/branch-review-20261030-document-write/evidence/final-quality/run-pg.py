from pathlib import Path
import json,os,subprocess,time,uuid
root=Path('/workspace/edhr-nexus-frontend')
name='edhr-document-write-q1-'+uuid.uuid4().hex[:10]
owner='document-write-q1-20261030'
cid=subprocess.check_output(['docker','run','--rm','-d','--name',name,'--label','edhr.audit.owner='+owner,'-e','POSTGRES_DB=edhr_document_read_test','-e','POSTGRES_USER=q1_test','-e','POSTGRES_PASSWORD=synthetic_q1_test','-p','127.0.0.1::5432','postgres:16-alpine'],text=True).strip()
port=subprocess.check_output(['docker','port',cid,'5432/tcp'],text=True).strip().rsplit(':',1)[1]
info={'container':cid,'name':name,'owner':owner,'port':int(port),'database':'edhr_document_read_test'}
Path('/tmp/edhr-document-write-q1-db.json').write_text(json.dumps(info,indent=2)+'\n')
for _ in range(100):
    ready=subprocess.run(['docker','exec',cid,'pg_isready','-h','127.0.0.1','-U','q1_test','-d','edhr_document_read_test'],capture_output=True,text=True)
    if ready.returncode==0: break
    time.sleep(.2)
assert ready.returncode==0,ready.stdout+ready.stderr
Path('/tmp/edhr-document-write-q1-pg-ready.txt').write_text(ready.stdout)
version=subprocess.check_output(['docker','exec',cid,'psql','-U','q1_test','-d','edhr_document_read_test','-Atc','SELECT version(),datcollate,datctype FROM pg_database WHERE datname=current_database()'],text=True)
Path('/tmp/edhr-document-write-q1-pg-version.txt').write_text(version)
env=dict(os.environ,EDHR_DOCUMENT_DATABASE_URL=f'jdbc:postgresql://127.0.0.1:{port}/edhr_document_read_test',EDHR_DOCUMENT_DATABASE_USER='q1_test',EDHR_DOCUMENT_DATABASE_PASSWORD='synthetic_q1_test')
cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest=DocumentWriteBoundaryPostgresTest,DocumentReadPerformancePostgresTest','-Dedhr.audit.documentReads=true','-Dedhr.audit.documentOutput=/tmp/edhr-document-write-q1-pg-read-http.jsonl','-Dedhr.audit.documentWriteOutput=/tmp/edhr-document-write-q1-pg-http.jsonl','test']
with Path('/tmp/edhr-document-write-q1-pg-test.txt').open('w') as log:
    run=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
Path('/tmp/edhr-document-write-q1-pg-exit.json').write_text(json.dumps({'command':cmd,'exit':run.returncode,'database':info},indent=2)+'\n')
print(json.dumps({'exit':run.returncode,'container':cid,'port':port}))
raise SystemExit(run.returncode)
