from pathlib import Path
import os,sys,time,subprocess,json,hashlib,xml.etree.ElementTree as E
phase=sys.argv[1]
classes=sys.argv[2] if len(sys.argv)>2 else 'WorkflowInstanceAuthorizationIntegrationTest'
repo=Path('/workspace/edhr-nexus-frontend');start=time.time();env=os.environ.copy()
env['W3_COMMAND_DATABASE_URL']='jdbc:postgresql://localhost:55432/edhr_w3_command_test'
env['W3_TRANSFER_DATABASE_URL']='jdbc:postgresql://localhost:55432/edhr_w3_transfer_test'
log=Path('/tmp/edhr-w3c-'+phase+'.raw.log');command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-C','-f','gmp-platform/backend/pom.xml','-Dtest='+classes,'test']
with log.open('w') as f:r=subprocess.run(command,cwd=repo,env=env,stdout=f,stderr=subprocess.STDOUT)
suites=[]
for p in sorted((repo/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.xml')):
 if p.stat().st_mtime<=start:continue
 t=E.parse(p).getroot();suite={k:t.attrib[k] for k in ['name','tests','failures','errors','skipped']};suite['freshReport']=True;suite['xmlSha256']=hashlib.sha256(p.read_bytes()).hexdigest();suite['cases']=[]
 for c in t.findall('testcase'):
  error=c.find('error');failure=c.find('failure');x={'name':c.attrib['name'],'status':'error' if error is not None else 'failed' if failure is not None else 'skipped' if c.find('skipped') is not None else 'passed'}
  detail=error if error is not None else failure
  if detail is not None:x['message']=detail.attrib.get('message','')[:500]
  suite['cases'].append(x)
 suites.append(suite)
d={'phase':phase,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'command':command,'exit':r.returncode,'suites':suites,'fixtureSha256':hashlib.sha256((repo/'gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/controller/WorkflowInstanceAuthorizationIntegrationTest.java').read_bytes()).hexdigest(),'rawLogExcluded':True}
Path('/tmp/edhr-w3c-'+phase+'-summary.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'phase':phase,'exit':r.returncode,'suites':[{k:v for k,v in x.items() if k!='cases'} for x in suites]},ensure_ascii=False))
for s in suites:
 for c in s['cases']:
  if c['status'] in ['error','failed']:print(json.dumps(c,ensure_ascii=False))
