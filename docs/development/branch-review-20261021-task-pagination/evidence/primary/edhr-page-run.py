import hashlib,json,os,re,subprocess,sys,time
from pathlib import Path
from xml.etree import ElementTree as ET
repo=Path('/workspace/edhr-nexus-frontend')
phase=sys.argv[1]
classes=sys.argv[2]
env=os.environ.copy();env['W3_COMMAND_DATABASE_URL']='jdbc:postgresql://localhost:55432/edhr_w3_command_test'
started=time.time()
log=Path('/tmp/edhr-page-'+phase+'.private.log')
command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-C','-f','gmp-platform/backend/pom.xml','-Dtest='+classes,'clean','test']
with log.open('wb') as output:
    run=subprocess.run(command,cwd=repo,env=env,stdout=output,stderr=subprocess.STDOUT)
summary={'phase':phase,'command':command,'exit':run.returncode,'sourceCommitAtRun':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip(),'workingTreeState':subprocess.check_output(['git','status','--porcelain'],cwd=repo).decode().splitlines(),'database':'owned PG16/edhr_w3_command_test loopback55432','elapsedSeconds':round(time.time()-started,2),'suites':[]}
for name in classes.split(','):
    reports=list((repo/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.'+name+'.xml'))
    assert len(reports)<=1
    if not reports:continue
    path=reports[0];raw=path.read_bytes();root=ET.fromstring(raw)
    suite={key:int(root.attrib.get(key,'0')) for key in ['tests','failures','errors','skipped']}
    suite.update(name=root.attrib['name'],freshReport=path.stat().st_mtime>=started,xmlSha256=hashlib.sha256(raw).hexdigest(),cases=[])
    for case in root.findall('testcase'):
        entry={'name':case.attrib['name'],'status':'passed'}
        for tag in ['failure','error','skipped']:
            failure=case.find(tag)
            if failure is not None:
                message=failure.attrib.get('message','')
                message=re.sub(r'Bearer\s+\S+','Bearer [redacted]',message)
                entry.update(status=tag,message=message[:600],type=failure.attrib.get('type'))
        suite['cases'].append(entry)
    summary['suites'].append(suite)
summary['totals']={key:sum(s[key] for s in summary['suites']) for key in ['tests','failures','errors','skipped']}
out=Path('/tmp/edhr-page-'+phase+'-summary.json');out.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'summary':str(out),'exit':run.returncode,'totals':summary['totals'],'fresh':all(s['freshReport'] for s in summary['suites'])},ensure_ascii=False))
