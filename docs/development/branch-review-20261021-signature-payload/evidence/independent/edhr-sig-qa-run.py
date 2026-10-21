from pathlib import Path
import hashlib,json,os,subprocess,sys,time,xml.etree.ElementTree as ET

repo=Path(sys.argv[1]); phase=sys.argv[2]; fixed=sys.argv[3]; pom=sys.argv[4]; classes=sys.argv[5] if len(sys.argv)>5 else ''
status=None
if phase!='baseline-red':
    assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()==fixed
    status=subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True)
    assert not status, 'Formal test candidate must be clean at start'
env=os.environ.copy()
env.update({'SIGNATURE_TEST_DATABASE_URL':'jdbc:postgresql://localhost:55432/edhr_signature_test',
 'EDHR_AUTHORIZATION_NOTICE_FONT':'/workspace/.edhr-cloud-tools/fonts/EdhrTestCJK-Regular.ttf',
 'PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD':'1','PLAYWRIGHT_BROWSERS_PATH':'/tmp/edhr-sig-playwright-cache'})
command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-C','-f',pom]
if classes: command.append('-Dtest='+classes)
command+=['clean','test']
started=time.time_ns(); log=Path('/tmp/edhr-sig-qa-'+phase+'.private.log')
with log.open('wb') as stream: result=subprocess.run(command,cwd=repo,env=env,stdout=stream,stderr=subprocess.STDOUT)
finished=time.time_ns(); suites=[]
report_directory=repo/Path(pom).parent/'target/surefire-reports'
for report in sorted(report_directory.glob('TEST-*.xml')):
    assert report.stat().st_mtime_ns>=started, 'Report predates independent run'
    root=ET.fromstring(report.read_bytes())
    suite={'name':root.attrib['name'],'counts':{key:int(root.attrib.get(key,0)) for key in ['tests','failures','errors','skipped']},'xmlSha256':hashlib.sha256(report.read_bytes()).hexdigest(),'fresh':True,'cases':[]}
    for case in root.findall('testcase'):
        error=case.find('error'); failure=case.find('failure'); problem=error if error is not None else failure
        row={'class':case.attrib.get('classname'),'name':case.attrib['name'],'status':'error' if error is not None else 'failed' if failure is not None else 'skipped' if case.find('skipped') is not None else 'passed'}
        if problem is not None:
            row['problemType']=problem.attrib.get('type')
            if phase=='baseline-red': row['message']=problem.attrib.get('message','')[:600]
        suite['cases'].append(row)
    suites.append(suite)
counts={key:sum(s['counts'][key] for s in suites) for key in ['tests','failures','errors','skipped']}
after=None
if phase!='baseline-red':
    after={'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'status':subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True)}
summary={'author':'/root/signature_payload_independent','phase':phase,'sourceCommit':fixed,'command':command,'commandExit':result.returncode,'startedUnixNs':started,'finishedUnixNs':finished,'counts':counts,'suites':suites,'cleanAtStart':status=='' if phase!='baseline-red' else None,'after':after,'privateLogSha256':hashlib.sha256(log.read_bytes()).hexdigest(),'rawLogAndXmlExcluded':True,'freshReportsOnly':True}
output=Path('/tmp/edhr-sig-qa-'+phase+'-summary.json'); output.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'output':str(output),'exit':result.returncode,'counts':counts,'suites':[{'name':s['name'],'counts':s['counts']} for s in suites]},ensure_ascii=False))
if phase!='baseline-red':
    assert after['commit']==fixed and not after['status'], 'Formal test candidate changed during run'
    assert result.returncode==0 and suites and counts['failures']==counts['errors']==counts['skipped']==0
else:
    assert result.returncode!=0 and counts==dict(tests=7,failures=1,errors=3,skipped=0)
    print(json.dumps([c for s in suites for c in s['cases'] if c['status'] in ['failed','error']],ensure_ascii=False))
