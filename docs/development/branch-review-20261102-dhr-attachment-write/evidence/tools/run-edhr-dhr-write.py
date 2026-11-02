from pathlib import Path
import hashlib,json,os,subprocess,sys,time,xml.etree.ElementTree as E

root=Path('/workspace/edhr-nexus-frontend');label=sys.argv[1];classes=sys.argv[2]
d=json.loads(Path('/tmp/edhr-dhr-write-main-database.json').read_text());env=os.environ.copy()
env.update(EDHR_DHR_ATTACHMENT_TX_DATABASE_URL=d['dhrUrl'],EDHR_DHR_ATTACHMENT_TX_DATABASE_USER='postgres',EDHR_DHR_ATTACHMENT_TX_DATABASE_PASSWORD='',EDHR_UPLOAD_TX_DATABASE_URL=d['uploadUrl'],EDHR_UPLOAD_TX_DATABASE_USER='postgres',EDHR_UPLOAD_TX_DATABASE_PASSWORD='')
cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+classes]
if len(sys.argv)>3:
 env['EDHR_ATTACHMENT_CAPACITY_OUTPUT']=sys.argv[3];cmd+=['-DargLine=-Xmx2g']
cmd+=['test'];prefix=Path('/tmp/edhr-dhr-write-'+label);started=time.time()
source_paths=['gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrAttachmentService.java','gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrAttachmentWriteFailureTest.java','gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrAttachmentDownloadCapacityPostgresTest.java','gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrAttachmentTransactionPostgresTest.java']
snapshots=[{'path':p,'bytes':len((root/p).read_bytes()),'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in source_paths]
Path(str(prefix)+'-command.json').write_text(json.dumps({'cmd':cmd,'startedEpoch':started,'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceSnapshot':snapshots,'database':d,'capacityOutput':env.get('EDHR_ATTACHMENT_CAPACITY_OUTPUT')},indent=2)+'\n')
with Path(str(prefix)+'-test.txt').open('wb') as log:r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
suites=[];missing=[]
for name in classes.split(','):
 paths=list((root/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.'+name+'.xml'))
 if len(paths)!=1 or paths[0].stat().st_mtime<started:missing.append(name);continue
 raw=paths[0].read_bytes();Path(str(prefix)+'-'+name+'.xml').write_bytes(raw);tree=E.fromstring(raw)
 suites.append({'suite':name,**{k:int(tree.get(k,'0')) for k in ['tests','failures','errors','skipped']}})
summary={'exit':r.returncode,'missingFreshSuites':missing,'suites':suites,'totals':{k:sum(s[k] for s in suites) for k in ['tests','failures','errors','skipped']}}
Path(str(prefix)+'-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary),flush=True)
