from pathlib import Path
import hashlib,json,subprocess,sys,time,xml.etree.ElementTree as ET

repo=Path('/workspace/edhr-nexus-frontend')
fixed=sys.argv[1]
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip()==fixed
command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-C','-f','tools/knowledge-model/pom.xml','clean','test']
log=Path('/tmp/edhr-sig-ontology-knowledge.raw.log')
started=time.time_ns()
with log.open('wb') as stream:
    result=subprocess.run(command,cwd=repo,stdout=stream,stderr=subprocess.STDOUT)
finished=time.time_ns()
reports=sorted((repo/'tools/knowledge-model/target/surefire-reports').glob('TEST-*.xml'))
assert reports, 'No fresh knowledge Surefire reports'
counts=dict(tests=0,failures=0,errors=0,skipped=0)
receipts=[]
for report in reports:
    assert report.stat().st_mtime_ns>=started, 'Stale report: '+report.name
    root=ET.fromstring(report.read_bytes())
    for key in counts:
        counts[key]+=int(root.attrib.get(key,0))
    receipts.append({'path':str(report),'sha256':hashlib.sha256(report.read_bytes()).hexdigest(),'suite':root.attrib.get('name'),'counts':{key:int(root.attrib.get(key,0)) for key in counts}})
summary={'author':'/root/signature_payload_ontology','sourceCommit':fixed,'command':' '.join(command),'commandExit':result.returncode,'startedUnixNs':started,'finishedUnixNs':finished,'counts':counts,'freshReportsOnly':True,'xmlReports':receipts,'rawLog':{'path':str(log),'sha256':hashlib.sha256(log.read_bytes()).hexdigest(),'excludedFromDeliveryManifest':True},'businessTestsExecuted':[]}
Path('/tmp/edhr-sig-ontology-formal-test-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'commandExit':result.returncode,'counts':counts,'reportCount':len(reports),'sourceCommit':fixed}))
assert result.returncode==0
assert counts==dict(tests=89,failures=0,errors=0,skipped=0), counts
