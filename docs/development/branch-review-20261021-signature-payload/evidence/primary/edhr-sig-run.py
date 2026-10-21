from pathlib import Path
import hashlib,json,os,subprocess,sys,time,xml.etree.ElementTree as E
repo=Path('/workspace/edhr-nexus-frontend');phase=sys.argv[1];classes=sys.argv[2] if len(sys.argv)>2 else 'SignatureSnapshotPostgresTest'
env=os.environ.copy();env['SIGNATURE_TEST_DATABASE_URL']='jdbc:postgresql://localhost:55432/edhr_signature_test'
command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-C','-f','gmp-platform/backend/pom.xml','-Dtest='+classes,'test'];start=time.time()
with Path('/tmp/edhr-sig-'+phase+'.raw.log').open('w') as f:r=subprocess.run(command,cwd=repo,env=env,stdout=f,stderr=subprocess.STDOUT)
suites=[]
for p in sorted((repo/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.xml')):
 if p.stat().st_mtime<=start:continue
 t=E.parse(p).getroot();s={k:int(t.attrib[k]) if k!='name' else t.attrib[k] for k in ['name','tests','failures','errors','skipped']};s['freshReport']=True;s['xmlSha256']=hashlib.sha256(p.read_bytes()).hexdigest();s['cases']=[]
 for c in t.findall('testcase'):
  err=c.find('error');fail=c.find('failure');row={'name':c.attrib['name'],'status':'error' if err is not None else 'failed' if fail is not None else 'skipped' if c.find('skipped') is not None else 'passed'}
  detail=err if err is not None else fail
  if detail is not None:row['message']=detail.attrib.get('message','')[:450]
  s['cases'].append(row)
 suites.append(s)
d={'phase':phase,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'command':command,'exit':r.returncode,'suites':suites,'rawLogAndXmlExcluded':True}
Path('/tmp/edhr-sig-'+phase+'-summary.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'exit':r.returncode,'suites':[{k:v for k,v in s.items() if k!='cases'} for s in suites]}))
for s in suites:
 for c in s['cases']:
  if c['status'] in ['error','failed']:print(json.dumps(c,ensure_ascii=False))
