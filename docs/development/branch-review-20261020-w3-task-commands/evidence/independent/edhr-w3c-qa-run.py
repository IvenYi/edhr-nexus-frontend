from pathlib import Path
import os,subprocess,json,time,hashlib,xml.etree.ElementTree as ET,tarfile,io

repo=Path('/workspace/edhr-nexus-frontend');base='e8ecc103c8e6825c61c61b39b9cbd12b1474700e';head='42cb2820946287d409a2a02394cc85e4067e20bb'
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
assert git('rev-parse','HEAD').decode().strip()==head
assert not git('status','--porcelain')
env=os.environ.copy();env['W3_COMMAND_DATABASE_URL']='jdbc:postgresql://localhost:55432/edhr_w3_command_test';env['W3_TRANSFER_DATABASE_URL']='jdbc:postgresql://localhost:55432/edhr_w3_transfer_test'
fixture='gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/controller/WorkflowInstanceAuthorizationIntegrationTest.java'
commands=[]
def run(phase,cwd,pom,classes=None):
    command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-C','-f',pom]
    if classes:command+=['-Dtest='+classes,'test']
    else:command+=['clean','test']
    start=time.time();log=Path('/tmp/edhr-w3c-qa-'+phase+'.raw.log')
    with log.open('wb') as sink:r=subprocess.run(command,cwd=cwd,env=env,stdout=sink,stderr=subprocess.STDOUT)
    suites=[]
    for p in sorted((cwd/Path(pom).parent/'target/surefire-reports').glob('TEST-*.xml')):
        if p.stat().st_mtime<start:continue
        raw=p.read_bytes();t=ET.fromstring(raw);cases=[]
        for c in t.findall('testcase'):
            f=c.find('failure');e=c.find('error');status='failed' if f is not None else 'error' if e is not None else 'skipped' if c.find('skipped') is not None else 'passed'
            row={'name':c.get('name'),'status':status}
            if f is not None:row['message']=f.get('message','')[:300]
            if e is not None:row['message']=e.get('message','')[:300]
            cases.append(row)
        suites.append({'name':t.get('name'),**{k:int(t.get(k,'0')) for k in ['tests','failures','errors','skipped']},'xmlSha256':sha(raw),'freshReport':True,'cases':cases})
    report={'phase':phase,'sourceCommit':base if phase.startswith('baseline') else head,'fixtureSha256':sha((repo/fixture).read_bytes()),'command':command,'cwd':str(cwd),'exit':r.returncode,'suites':suites,'rawLogsAndXmlExcluded':True,'independentAuthor':'/root/w3c_independent_final','totals':{k:sum(s[k] for s in suites) for k in ['tests','failures','errors','skipped']}}
    Path('/tmp/edhr-w3c-qa-'+phase+'-summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');commands.append(report)
    print(json.dumps({'phase':phase,'exit':r.returncode,'totals':report['totals'],'suites':len(suites)}),flush=True)

snapshot=Path('/tmp/edhr-w3c-qa-baseline-tree');snapshot.mkdir(exist_ok=False)
archive=git('archive',base,'gmp-platform/backend')
with tarfile.open(fileobj=io.BytesIO(archive)) as t:t.extractall(snapshot,filter='data')
(snapshot/fixture).write_bytes((repo/fixture).read_bytes())
run('baseline',snapshot,'gmp-platform/backend/pom.xml','WorkflowInstanceAuthorizationIntegrationTest')
classes='WorkflowInstanceAuthorizationIntegrationTest,WorkflowEngineTest,WorkflowTaskControllerTest,WorkflowTransferPostgresTest,SecurityConfigTest,SecurityJwtExpirationTest,DhrReviewLifecycleIntegrationTest,DhrReviewServiceTest,SignatureTest'
run('candidate',repo,'gmp-platform/backend/pom.xml',classes)
run('knowledge',repo,'tools/knowledge-model/pom.xml')
assert git('rev-parse','HEAD').decode().strip()==head
assert not git('status','--porcelain')
print(json.dumps({'allRunsComplete':True,'headRemainsFixed':True,'workingTreeClean':True}),flush=True)
