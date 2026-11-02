from pathlib import Path
import hashlib,json,os,subprocess,time,xml.etree.ElementTree as ET

root=Path('/workspace/edhr-nexus-frontend')
prefix='/tmp/edhr-dhr-attachment-qa-'
base='ab5adafb9629b94f95eb88825ec0a4ea06f4efb1'
head='a6f799459eb105da5e98ab3d548d6b03d18d9e43'
old=Path('/tmp/edhr-dhr-attachment-qa-old-20261102')
name='edhr-dhr-attachment-final-qa-20261102'
classes='DhrAttachmentTransactionPostgresTest,DhrAttachmentAndArchiveTest,DhrSummaryServiceTest,DhrReviewLifecycleIntegrationTest,FileControllerTest,FileCopyOwnershipTest,FileHttpBoundaryTest,FileUploadResourceTest,FileUploadTransactionIntegrationTest,FileUploadTransactionPostgresTest,FileUploadTransactionFailureTest,FileDeleteTransactionIntegrationTest,FileDeleteTransactionPostgresTest,FileDeleteTransactionFailureTest,DhrFormFilesTest,ExecutionAccessTest'
def run(args,cwd=root): return subprocess.check_output(args,cwd=cwd,text=True).strip()
def write(label,data): Path(prefix+label+'.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def sha(b): return hashlib.sha256(b).hexdigest()
container=None; tree_added=False
stage='start'
try:
 assert run(['git','rev-parse','HEAD'])==head
 assert not run(['git','status','--porcelain'])
 stage='database'
 container=run(['docker','run','-d','--rm','--name',name,'-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_DB=edhr_dhr_attachment_transaction_test','-p','127.0.0.1::5432','postgres:16-alpine'])
 for _ in range(60):
  ready=subprocess.run(['docker','exec',container,'pg_isready','-h','127.0.0.1','-U','postgres','-d','edhr_dhr_attachment_transaction_test'],capture_output=True,text=True)
  if ready.returncode==0: break
  time.sleep(.5)
 assert ready.returncode==0,ready.stdout+ready.stderr
 run(['docker','exec',container,'createdb','-h','127.0.0.1','-U','postgres','edhr_upload_transaction_test'])
 mapping=run(['docker','port',container,'5432/tcp']); assert mapping.startswith('127.0.0.1:')
 dhr_url='jdbc:postgresql://'+mapping+'/edhr_dhr_attachment_transaction_test'
 upload_url='jdbc:postgresql://'+mapping+'/edhr_upload_transaction_test'
 metadata=run(['docker','exec',container,'psql','-U','postgres','-d','edhr_dhr_attachment_transaction_test','-Atc',"SELECT version(); SELECT datcollate FROM pg_database WHERE datname=current_database();"])
 write('database',{'container':container,'owner':name,'mapping':mapping,'dhrUrl':dhr_url,'uploadUrl':upload_url,'readiness':ready.stdout,'metadata':metadata,'image':json.loads(run(['docker','inspect',container]))[0]['Image']})
 env=os.environ.copy()
 env.update(EDHR_DHR_ATTACHMENT_TX_DATABASE_URL=dhr_url,EDHR_DHR_ATTACHMENT_TX_DATABASE_USER='postgres',EDHR_DHR_ATTACHMENT_TX_DATABASE_PASSWORD='',EDHR_UPLOAD_TX_DATABASE_URL=upload_url,EDHR_UPLOAD_TX_DATABASE_USER='postgres',EDHR_UPLOAD_TX_DATABASE_PASSWORD='')
 print('own postgres ready '+dhr_url,flush=True)
 def tests(label,cwd,selected):
  cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+selected,'test']
  started=time.time()
  write(label+'-command',{'cmd':cmd,'cwd':str(cwd),'baseCommit':base,'headCommit':head,'startedEpoch':started,'dhrUrl':dhr_url,'uploadUrl':upload_url})
  with Path(prefix+label+'-test.txt').open('wb') as log: completed=subprocess.run(cmd,cwd=cwd,env=env,stdout=log,stderr=subprocess.STDOUT)
  suites=[]; missing=[]
  for cls in selected.split(','):
   paths=list((cwd/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.'+cls+'.xml'))
   if len(paths)!=1 or paths[0].stat().st_mtime<started:
    missing.append(cls);continue
   raw=paths[0].read_bytes();Path(prefix+label+'-'+cls+'.xml').write_bytes(raw)
   parsed=ET.fromstring(raw);suites.append({'suite':cls,**{k:int(parsed.get(k,'0')) for k in ['tests','failures','errors','skipped']}})
  summary={'exit':completed.returncode,'missingFreshSuites':missing,'suites':suites,'totals':{k:sum(s[k] for s in suites) for k in ['tests','failures','errors','skipped']}}
  write(label+'-summary',summary); print(label+' '+json.dumps(summary),flush=True)
  return summary
 stage='current122'
 current=tests('current',root,classes)
 assert not current['missingFreshSuites'] and current['exit']==0 and current['totals']=={'tests':122,'failures':0,'errors':0,'skipped':0}
 stage='old-worktree'
 run(['git','worktree','add','--detach',str(old),base]);tree_added=True
 dep=old/'gmp-platform/frontend/node_modules'
 dep.symlink_to(root/'gmp-platform/frontend/node_modules',target_is_directory=True)
 assert (dep/'.bin/vite').exists()
 rel=Path('gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrAttachmentTransactionPostgresTest.java')
 raw=(root/rel).read_bytes()
 assert raw==subprocess.check_output(['git','show',head+':'+str(rel)],cwd=root)
 (old/rel).write_bytes(raw)
 product=Path('gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrAttachmentService.java')
 assert (old/product).read_bytes()==subprocess.check_output(['git','show',base+':'+str(product)],cwd=root)
 write('old-source',{'sourceCommit':base,'transplantedFrom':head,'files':[{'path':str(rel),'sha256':sha(raw),'copiedSha256':sha((old/rel).read_bytes())}],'oldProductSha256':sha((old/product).read_bytes()),'productSourceUnchanged':not run(['git','diff','--name-only','--','gmp-platform/backend/src/main'],cwd=old),'toolDependencyLink':str(dep)})
 stage='old11'
 control=tests('old',old,'DhrAttachmentTransactionPostgresTest')
 assert not control['missingFreshSuites'] and control['exit']!=0 and control['totals']=={'tests':11,'failures':2,'errors':0,'skipped':0}
 write('run-complete',{'current122Passed':True,'old11CounterfactualPassed':True,'baseCommit':base,'headCommit':head})
except BaseException as exc:
 write('run-failure',{'stage':stage,'type':type(exc).__name__,'message':str(exc)})
 raise
finally:
 cleanup={}
 if tree_added:
  copied=old/'gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrAttachmentTransactionPostgresTest.java'
  if copied.exists():copied.unlink()
  dep=old/'gmp-platform/frontend/node_modules'
  if dep.is_symlink():dep.unlink()
  cleanup['oldTreeCleanBeforeRemove']=not run(['git','status','--porcelain'],cwd=old)
  run(['git','worktree','remove',str(old)])
  cleanup['oldTreeRemoved']=not old.exists()
 if container:
  assert json.loads(run(['docker','inspect',container]))[0]['Name']=='/'+name
  run(['docker','stop',container])
  for _ in range(50):
   absent=subprocess.run(['docker','inspect',container],capture_output=True).returncode!=0
   if absent:break
   time.sleep(.2)
  cleanup['containerRemoved']=absent
 cleanup['mainStatus']=run(['git','status','--porcelain'])
 cleanup['mainHead']=run(['git','rev-parse','HEAD'])
 write('cleanup',cleanup);print('cleanup '+json.dumps(cleanup),flush=True)
