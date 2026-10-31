from pathlib import Path
import subprocess,json,time,os,shutil,xml.etree.ElementTree as ET
root=Path('/workspace/edhr-nexus-frontend'); prefix=Path('/tmp/edhr-upload-q1-')
name='edhr-upload-tx-q1-20261031'
cid=subprocess.check_output(['docker','run','--rm','-d','--name',name,'-e','POSTGRES_USER=edhr','-e','POSTGRES_PASSWORD=synthetic-q1-upload','-e','POSTGRES_DB=edhr_upload_transaction_test','-p','127.0.0.1::5432','postgres:16-alpine'],text=True).strip()
Path(str(prefix)+'owner.json').write_text(json.dumps({'container':cid,'owner':name},indent=2))
for _ in range(100):
 r=subprocess.run(['docker','exec',cid,'pg_isready','-h','127.0.0.1','-U','edhr','-d','edhr_upload_transaction_test'],capture_output=True)
 if r.returncode==0:break
 time.sleep(.2)
else:raise RuntimeError('PG not ready')
port=subprocess.check_output(['docker','port',cid,'5432/tcp'],text=True).strip().rsplit(':',1)[1]
version=subprocess.check_output(['docker','exec',cid,'psql','-U','edhr','-d','edhr_upload_transaction_test','-Atc','select version();select datcollate,datctype from pg_database where datname=current_database()'],text=True)
cfg={'container':cid,'owner':name,'url':'jdbc:postgresql://127.0.0.1:'+port+'/edhr_upload_transaction_test','user':'edhr','password':'synthetic-q1-upload','version':version}
Path(str(prefix)+'db.json').write_text(json.dumps(cfg,indent=2))
env=os.environ.copy();env.update(EDHR_UPLOAD_TX_DATABASE_URL=cfg['url'],EDHR_UPLOAD_TX_DATABASE_USER=cfg['user'],EDHR_UPLOAD_TX_DATABASE_PASSWORD=cfg['password'])
classes=['FileUploadTransactionIntegrationTest','FileUploadTransactionPostgresTest','FileUploadTransactionFailureTest','FileCopyOwnershipTest','FileHttpBoundaryTest','FileUploadResourceTest','FileControllerTest','DhrFormFilesTest','ExecutionAccessTest']
cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+','.join(classes),'test']
Path(str(prefix)+'current-command.json').write_text(json.dumps({'cmd':cmd,'cwd':str(root),'head':'22a96503ce0eb7d40343453c28e3e6c174f5907b'},indent=2))
with open(str(prefix)+'current-test.txt','w') as out:r=subprocess.run(cmd,cwd=root,env=env,stdout=out,stderr=subprocess.STDOUT)
rows=[]
for c in classes:
 p=next((root/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.'+c+'.xml'));x=ET.parse(p).getroot();rows.append({'suite':c,**{k:int(x.attrib[k]) for k in ['tests','failures','errors','skipped']}});shutil.copyfile(p,str(prefix)+'current-'+c+'.xml')
s={'exit':r.returncode,'suites':rows,'totals':{k:sum(x[k] for x in rows) for k in ['tests','failures','errors','skipped']}}
Path(str(prefix)+'current-summary.json').write_text(json.dumps(s,indent=2));print(json.dumps(s))
