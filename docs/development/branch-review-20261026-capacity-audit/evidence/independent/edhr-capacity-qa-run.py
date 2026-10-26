import datetime,hashlib,json,os,subprocess,sys,time,xml.etree.ElementTree as ET
from pathlib import Path
phase=sys.argv[1];command=sys.argv[2:];export=Path('/tmp/edhr-capacity-qa-source')
head='1081c4d8b15eb9e3ac7e64b04397bd10c0abffda';started=datetime.datetime.now(datetime.timezone.utc).isoformat();epoch=time.time();clock=time.monotonic()
log=Path('/tmp/edhr-capacity-qa-'+phase+'.private.log')
env=os.environ.copy();env['W3_COMMAND_DATABASE_URL']='jdbc:postgresql://localhost:55432/edhr_w3_command_test'
with log.open('wb') as stream:run=subprocess.run(command,cwd=export,env=env,stdout=stream,stderr=subprocess.STDOUT)
reports=export/('gmp-platform/backend/target/surefire-reports' if phase=='capacity' else 'tools/knowledge-model/target/surefire-reports')
suites=[]
for path in sorted(reports.glob('TEST-*.xml')):
 root=ET.parse(path).getroot();cases=[]
 for case in root.findall('testcase'):
  state=next((tag for tag in ['failure','error','skipped'] if case.find(tag) is not None),'passed')
  cases.append({'name':case.attrib['name'],'status':state})
 suites.append({'name':root.attrib['name'],**{k:int(root.attrib.get(k,'0')) for k in ['tests','failures','errors','skipped']},'fresh':path.stat().st_mtime>=epoch,'xmlSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'cases':cases})
summary={'author':'/root/capacity_independent_final','phase':phase,'headCommit':head,'export':str(export),'command':command,'startedAt':started,'elapsedSeconds':round(time.monotonic()-clock,2),'exit':run.returncode,'privateLogSha256':hashlib.sha256(log.read_bytes()).hexdigest(),'rawLogsXmlNotArchived':True,'suites':suites,'totals':{k:sum(s[k] for s in suites) for k in ['tests','failures','errors','skipped']}}
output=Path('/tmp/edhr-capacity-qa-'+phase+'-summary.json');output.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'phase':phase,'exit':run.returncode,'totals':summary['totals'],'fresh':all(s['fresh'] for s in suites),'output':str(output)}))
sys.exit(run.returncode)
