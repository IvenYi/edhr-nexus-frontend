from pathlib import Path
import subprocess,shutil,hashlib,json,xml.etree.ElementTree as ET
root=Path('/workspace/edhr-nexus-frontend'); old=Path('/tmp/edhr-file-q1-old-worktree')
base='ccedd56453c02c5d3acd60aa4351809a3928e83e'
classes=['FileUploadResourceTest','FileHttpBoundaryTest']
testdir=Path('gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller')
copied=[];added=False
try:
 subprocess.run(['git','worktree','add','--detach',str(old),base],cwd=root,check=True);added=True
 for name in classes:
  rel=testdir/(name+'.java');shutil.copyfile(root/rel,old/rel);copied.append(rel)
 dependency=old/'gmp-platform/frontend/node_modules'
 assert not dependency.exists()
 dependency.symlink_to(root/'gmp-platform/frontend/node_modules',target_is_directory=True)
 command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+','.join(classes),'test']
 metadata={'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=old,text=True).strip(),'command':command,'testHashes':{str(p):hashlib.sha256((old/p).read_bytes()).hexdigest() for p in copied},'dependencySymlink':str(dependency)}
 Path('/tmp/edhr-file-q1-old-command.json').write_text(json.dumps(metadata,indent=2)+'\n')
 with open('/tmp/edhr-file-q1-old-test.txt','w') as log:r=subprocess.run(command,cwd=old,stdout=log,stderr=subprocess.STDOUT)
 rows=[]
 for name in classes:
  p=old/'gmp-platform/backend/target/surefire-reports'/('TEST-com.zencas.edhr.compliance.controller.'+name+'.xml')
  x=ET.parse(p).getroot();shutil.copyfile(p,'/tmp/edhr-file-q1-old-'+name+'.xml')
  rows.append({'suite':name,**{k:int(x.attrib[k]) for k in ['tests','failures','errors','skipped']},'failureCases':[{'name':t.attrib['name'],'message':t.find('failure').attrib.get('message')} for t in x.findall('testcase') if t.find('failure') is not None]})
 summary={'exit':r.returncode,'commit':base,'suites':rows,'totals':{k:sum(x[k] for x in rows) for k in ['tests','failures','errors','skipped']}}
 Path('/tmp/edhr-file-q1-old-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(summary,ensure_ascii=False))
finally:
 if added:
  status=subprocess.check_output(['git','status','--porcelain'],cwd=old,text=True)
  for p in copied:(old/p).unlink()
  dependency=old/'gmp-platform/frontend/node_modules'
  if dependency.is_symlink():dependency.unlink()
  subprocess.run(['git','worktree','remove',str(old)],cwd=root,check=True)
  Path('/tmp/edhr-file-q1-cleanup.json').write_text(json.dumps({'oldWorktree':str(old),'removed':not old.exists(),'beforeCleanupStatus':status,'noOtherResourceCleanup':True},indent=2)+'\n')
