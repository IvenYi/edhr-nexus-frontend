import subprocess,pathlib,json,sys,os,time,hashlib,xml.etree.ElementTree as E,datetime
repo=pathlib.Path('/workspace/edhr-nexus-frontend')
phase=sys.argv[1]; cmd=sys.argv[2:]
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
status=subprocess.check_output(['git','status','--porcelain=v1'],cwd=repo,text=True).splitlines()
start=datetime.datetime.now(datetime.timezone.utc).isoformat(); t=time.monotonic()
log=pathlib.Path('/tmp/edhr-read-qa-'+phase+'.private.log')
with log.open('wb') as f:r=subprocess.run(cmd,cwd=repo,env=os.environ,stdout=f,stderr=subprocess.STDOUT)
report=repo/('tools/knowledge-model/target/surefire-reports' if phase=='knowledge' else 'gmp-platform/backend/target/surefire-reports')
suites=[]
for p in sorted(report.glob('TEST-*.xml')):
 root=E.parse(p).getroot(); cases=[]
 for c in root.findall('testcase'):
  fail=c.find('failure');err=c.find('error');skip=c.find('skipped')
  cases.append({'name':c.attrib['name'],'status':'failed' if fail is not None else 'error' if err is not None else 'skipped' if skip is not None else 'passed'})
 suites.append({'name':root.attrib['name'],**{k:int(root.attrib[k]) for k in ['tests','failures','errors','skipped']},'xmlSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'cases':cases})
summary={'phase':phase,'command':cmd,'exit':r.returncode,'sourceCommitAtRun':head,'workingTreeStateAtRun':status,'startedAt':start,'elapsedSeconds':round(time.monotonic()-t,2),'privateLogSha256':hashlib.sha256(log.read_bytes()).hexdigest(),'suites':suites,'totals':{k:sum(x[k] for x in suites) for k in ['tests','failures','errors','skipped']}}
p=pathlib.Path('/tmp/edhr-read-qa-'+phase+'-summary.json');p.write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'phase':phase,'exit':r.returncode,'head':head,'cleanAtStart':not status,'totals':summary['totals'],'summary':str(p)}))
sys.exit(r.returncode)
