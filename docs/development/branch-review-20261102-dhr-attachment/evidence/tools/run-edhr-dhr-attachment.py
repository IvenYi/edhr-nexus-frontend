from pathlib import Path
import datetime, hashlib, json, os, subprocess, sys, time, xml.etree.ElementTree as ET

root=Path('/workspace/edhr-nexus-frontend')
prefix=Path('/tmp/edhr-dhr-attachment-'+sys.argv[1])
classes=sys.argv[2]
database=json.loads(Path('/tmp/edhr-dhr-attachment-main-database.json').read_text())
env=os.environ.copy()
env.update(EDHR_DHR_ATTACHMENT_TX_DATABASE_URL=database['dhrUrl'],EDHR_DHR_ATTACHMENT_TX_DATABASE_USER='postgres',EDHR_DHR_ATTACHMENT_TX_DATABASE_PASSWORD='',EDHR_UPLOAD_TX_DATABASE_URL=database['uploadUrl'],EDHR_UPLOAD_TX_DATABASE_USER='postgres',EDHR_UPLOAD_TX_DATABASE_PASSWORD='')
cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+classes,'test']
started=time.time()
sources=[]
for p in [root/'gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrAttachmentService.java',root/'gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrAttachmentTransactionPostgresTest.java']:
 b=p.read_bytes();sources.append({'path':str(p.relative_to(root)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
Path(str(prefix)+'-command.json').write_text(json.dumps({'cmd':cmd,'startedEpoch':started,'cwd':str(root),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceSnapshot':sources,'dhrUrl':database['dhrUrl'],'uploadUrl':database['uploadUrl']},indent=2)+'\n')
with Path(str(prefix)+'-test.txt').open('wb') as log: result=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
suites=[];missing=[]
for cls in classes.split(','):
 paths=list((root/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.'+cls+'.xml'))
 if len(paths)!=1 or paths[0].stat().st_mtime<started:
  missing.append(cls); continue
 raw=paths[0].read_bytes();Path(str(prefix)+'-'+cls+'.xml').write_bytes(raw)
 suite=ET.fromstring(raw);suites.append({'suite':cls,**{k:int(suite.get(k,'0')) for k in ['tests','failures','errors','skipped']}})
summary={'exit':result.returncode,'missingFreshSuites':missing,'suites':suites,'totals':{k:sum(s[k] for s in suites) for k in ['tests','failures','errors','skipped']}}
Path(str(prefix)+'-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary),flush=True)
