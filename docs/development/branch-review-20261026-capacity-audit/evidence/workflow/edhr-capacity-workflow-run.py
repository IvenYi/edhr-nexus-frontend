import datetime,hashlib,json,os,subprocess,time
from pathlib import Path
from xml.etree import ElementTree as ET
source=Path('/tmp/edhr-capacity-workflow-source')
out=Path('/tmp/edhr-capacity-workflow-observations.jsonl')
assert not out.exists(), 'Use a fresh observation path; preserve old originals'
cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-C','-f',str(source/'gmp-platform/backend/pom.xml'),'-Dtest=WorkflowQueueCapacityObservationTest','-Dcapacity.observation.out='+str(out),'clean','test']
env=os.environ.copy();env['W3_COMMAND_DATABASE_URL']='jdbc:postgresql://localhost:55432/edhr_w3_command_test'
started=time.time();stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
log=Path('/tmp/edhr-capacity-workflow.private.log')
with log.open('wb') as f:run=subprocess.run(cmd,cwd=source,env=env,stdout=f,stderr=subprocess.STDOUT)
reports=list((source/'gmp-platform/backend/target/surefire-reports').glob('TEST-*WorkflowQueueCapacityObservationTest.xml'))
suites=[]
for p in reports:
 root=ET.fromstring(p.read_bytes())
 suites.append({'name':root.attrib['name'],**{k:int(root.attrib[k]) for k in ['tests','failures','errors','skipped']},'xmlSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'fresh':p.stat().st_mtime>=started,'cases':[{'name':c.attrib['name'],'status':'failed' if c.find('failure') is not None else 'error' if c.find('error') is not None else 'skipped' if c.find('skipped') is not None else 'passed'} for c in root.findall('testcase')]})
d={'sourceCommit':'5259791fcbc5d1fddf04cd62a02d6593d00fe2e6','exportPath':str(source),'command':cmd,'startedAt':stamp,'elapsedSeconds':round(time.time()-started,3),'exit':run.returncode,'nativePostgres':'owned PG16 loopback55432/edhr_w3_command_test','runtimeQualification':'Actual synthetic signed JWT/filter/MockMvc/native PG/JPA through unchanged product; no password-login/browser E2E or client SLA benchmark.','privateLogSha256':hashlib.sha256(log.read_bytes()).hexdigest(),'rawLogsXmlNotForArchive':True,'suites':suites,'totals':{k:sum(s[k] for s in suites) for k in ['tests','failures','errors','skipped']},'observations':str(out) if out.exists() else None}
dest=Path('/tmp/edhr-capacity-workflow-summary.json');dest.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'exit':run.returncode,'totals':d['totals'],'elapsedSeconds':d['elapsedSeconds'],'summary':str(dest)}))
