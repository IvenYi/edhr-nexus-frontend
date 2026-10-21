from pathlib import Path
import hashlib,json,os,re,subprocess,sys,time
from xml.etree import ElementTree as ET
mode=sys.argv[1]
repo=Path('/workspace/edhr-nexus-frontend')
cwd=Path('/tmp/edhr-page-qa-baseline-source') if mode=='baseline-red' else repo
if mode=='candidate-knowledge':
    module='tools/knowledge-model'
    names=['BusinessKnowledgeModelTest']
else:
    module='gmp-platform/backend'
    names=['WorkflowTaskPaginationPostgresTest'] if mode=='baseline-red' else ['WorkflowTaskPaginationPostgresTest','WorkflowTaskControllerTest','WorkflowInstanceAuthorizationIntegrationTest']
env=os.environ.copy();env['W3_COMMAND_DATABASE_URL']='jdbc:postgresql://localhost:55432/edhr_w3_command_test'
command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-C','-f',module+'/pom.xml','-Dtest='+','.join(names),'clean','test']
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip()
dirty=subprocess.check_output(['git','status','--porcelain'],cwd=repo).decode().splitlines()
started=time.time()
log=Path('/tmp/edhr-page-qa-'+mode+'.private.log')
with log.open('wb') as stream: result=subprocess.run(command,cwd=cwd,env=env,stdout=stream,stderr=subprocess.STDOUT)
out={'mode':mode,'cwd':str(cwd),'command':command,'exit':result.returncode,'observerHead':head,'observerWorkingTree':dirty,'elapsedSeconds':round(time.time()-started,3),'nativeDatabase':'owned PostgreSQL16 loopback55432/edhr_w3_command_test','suites':[]}
for name in names:
    matches=list((cwd/module/'target/surefire-reports').glob('TEST-*.'+name+'.xml'))
    assert len(matches)<=1
    if not matches:continue
    path=matches[0];raw=path.read_bytes();root=ET.fromstring(raw)
    row={key:int(root.attrib.get(key,'0')) for key in ['tests','failures','errors','skipped']}
    row.update(name=root.attrib['name'],fresh=path.stat().st_mtime>=started,xmlSha256=hashlib.sha256(raw).hexdigest(),cases=[])
    for case in root.findall('testcase'):
        item={'name':case.attrib['name'],'status':'passed'}
        for tag in ['failure','error','skipped']:
            failure=case.find(tag)
            if failure is not None:
                message=re.sub(r'Bearer\s+\S+','Bearer [redacted]',failure.attrib.get('message',''))
                item.update(status=tag,message=message[:500],type=failure.attrib.get('type'))
        row['cases'].append(item)
    out['suites'].append(row)
out['totals']={key:sum(row[key] for row in out['suites']) for key in ['tests','failures','errors','skipped']}
out['observerHeadAfter']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip()
out['observerWorkingTreeAfter']=subprocess.check_output(['git','status','--porcelain'],cwd=repo).decode().splitlines()
dest=Path('/tmp/edhr-page-qa-'+mode+'-summary.json');dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'summary':str(dest),'exit':result.returncode,'totals':out['totals'],'freshReports':all(row['fresh'] for row in out['suites'])},ensure_ascii=False))
