from pathlib import Path
import hashlib,json,shutil,subprocess,xml.etree.ElementTree as ET,sys
root=Path('/workspace/edhr-nexus-frontend')
prefix=sys.argv[2] if len(sys.argv)>2 else '/tmp/edhr-copy-q1-'
base=sys.argv[1] if len(sys.argv)>1 else '032b83e9d5b8a25bee6d5b59c45d86892f672d00'
old=Path(prefix+'old-worktree')
tests=['FileCopyOwnershipTest','FileHttpBoundaryTest']
rel=Path('gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller')
def run(args,**kwargs):return subprocess.run(args,text=True,capture_output=True,**kwargs)
setup=run(['git','worktree','add','--detach',str(old),base],cwd=root)
Path(prefix+'old-setup.txt').write_text(setup.stdout+setup.stderr)
assert setup.returncode==0
copied=[]
try:
 for c in tests:
  source=root/rel/(c+'.java');dest=old/rel/(c+'.java');shutil.copyfile(source,dest)
  copied.append({'path':str(rel/(c+'.java')),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'bytes':source.stat().st_size})
 (old/'gmp-platform/frontend/node_modules').symlink_to(root/'gmp-platform/frontend/node_modules',target_is_directory=True)
 command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+','.join(tests),'test']
 Path(prefix+'old-command.json').write_text(json.dumps({'cwd':str(old),'baseCommit':base,'command':command,'copiedTests':copied},indent=2))
 with open(prefix+'old-test.txt','w') as output:
  result=subprocess.run(command,cwd=old,text=True,stdout=output,stderr=subprocess.STDOUT)
 rows=[];failures=[]
 for c in tests:
  xml=next((old/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.'+c+'.xml'))
  tree=ET.parse(xml).getroot();row={'suite':c,**{k:int(tree.attrib[k]) for k in ['tests','failures','errors','skipped']}};rows.append(row)
  shutil.copyfile(xml,prefix+'old-'+c+'.xml')
  for case in tree.findall('testcase'):
   failure=case.find('failure')
   if failure is not None:failures.append({'name':case.attrib['name'],'message':failure.attrib.get('message','')})
 summary={'commit':base,'exit':result.returncode,'copiedTests':copied,'suites':rows,'totals':{k:sum(r[k] for r in rows) for k in ['tests','failures','errors','skipped']},'failures':failures}
 Path(prefix+'old-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(summary,ensure_ascii=False))
finally:
 (old/rel/'FileCopyOwnershipTest.java').unlink(missing_ok=True)
 restore=run(['git','restore','--',str(rel/'FileHttpBoundaryTest.java')],cwd=old)
 link=old/'gmp-platform/frontend/node_modules'
 if link.is_symlink():link.unlink()
 status=run(['git','status','--porcelain'],cwd=old)
 removed=run(['git','worktree','remove',str(old)],cwd=root)
 cleanup={'ownedWorktree':str(old),'restoredOnlyCopiedExistingTest':restore.returncode==0,'statusBeforeRemove':status.stdout,'removed':removed.returncode==0,'removeOutput':removed.stdout+removed.stderr,'absent':not old.exists(),'sharedSourceStatus':run(['git','status','--porcelain'],cwd=root).stdout}
 Path(prefix+'cleanup.json').write_text(json.dumps(cleanup,indent=2)+'\n')
