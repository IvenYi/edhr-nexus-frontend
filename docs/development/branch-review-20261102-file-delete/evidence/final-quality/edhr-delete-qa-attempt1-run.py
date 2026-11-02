from pathlib import Path
import subprocess, os, json, time, shutil, hashlib, xml.etree.ElementTree as ET

root=Path('/workspace/edhr-nexus-frontend')
prefix=Path('/tmp/edhr-delete-qa')
old=Path('/tmp/edhr-delete-qa-old-20261102')
base='6ec9812f1bb1f7980654510f53c5fa568cfd83fb'
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
classes='FileControllerTest,FileCopyOwnershipTest,FileHttpBoundaryTest,FileUploadResourceTest,FileUploadTransactionIntegrationTest,FileUploadTransactionPostgresTest,FileUploadTransactionFailureTest,FileDeleteTransactionIntegrationTest,FileDeleteTransactionPostgresTest,FileDeleteTransactionFailureTest,DhrFormFilesTest,ExecutionAccessTest'
new='FileDeleteTransactionIntegrationTest,FileDeleteTransactionPostgresTest,FileDeleteTransactionFailureTest'
def write(label,data): Path(str(prefix)+'-'+label+'.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def run(args,cwd=root,**kwargs): return subprocess.check_output(args,cwd=cwd,text=True,**kwargs).strip()
def sha(data): return hashlib.sha256(data).hexdigest()
container=None
tree_added=False
try:
    assert not run(['git','status','--porcelain'])
    container=run(['docker','run','-d','--rm','--name','edhr-file-delete-final-qa-20261102','-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_DB=edhr_upload_transaction_test','-p','127.0.0.1::5432','postgres:16-alpine'])
    for _ in range(60):
        ready=subprocess.run(['docker','exec',container,'pg_isready','-U','postgres','-d','edhr_upload_transaction_test'],capture_output=True,text=True)
        if ready.returncode==0: break
        time.sleep(.5)
    assert ready.returncode==0, ready.stdout+ready.stderr
    mapping=run(['docker','port',container,'5432/tcp'])
    assert mapping.startswith('127.0.0.1:')
    url='jdbc:postgresql://'+mapping+'/edhr_upload_transaction_test'
    env=os.environ.copy()
    env.update(EDHR_UPLOAD_TX_DATABASE_URL=url,EDHR_UPLOAD_TX_DATABASE_USER='postgres',EDHR_UPLOAD_TX_DATABASE_PASSWORD='')
    write('database',{'container':container,'owner':'edhr-file-delete-final-qa-20261102','mapping':mapping,'url':url,'readiness':ready.stdout,'metadata':run(['docker','exec',container,'psql','-U','postgres','-d','edhr_upload_transaction_test','-Atc',"SELECT version(); SHOW lc_collate;"]),'image':json.loads(run(['docker','inspect',container]))[0]['Image']})
    print('own postgres ready '+url,flush=True)
    def tests(label,cwd,selected):
        cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+selected,'test']
        started=time.time()
        write(label+'-command',{'cmd':cmd,'cwd':str(cwd),'base':base,'head':head,'startedEpoch':started,'databaseUrl':url})
        with Path(str(prefix)+'-'+label+'-test.txt').open('wb') as log:
            completed=subprocess.run(cmd,cwd=cwd,env=env,stdout=log,stderr=subprocess.STDOUT)
        suites=[]
        for cls in selected.split(','):
            files=list((cwd/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.'+cls+'.xml'))
            assert len(files)==1, (cls,files)
            path=files[0]
            assert path.stat().st_mtime>=started,('stale XML',path)
            raw=path.read_bytes()
            Path(str(prefix)+'-'+label+'-'+cls+'.xml').write_bytes(raw)
            tree=ET.fromstring(raw)
            suites.append({'suite':cls,**{k:int(tree.get(k,'0')) for k in ['tests','failures','errors','skipped']}})
        summary={'exit':completed.returncode,'suites':suites,'totals':{k:sum(s[k] for s in suites) for k in ['tests','failures','errors','skipped']}}
        write(label+'-summary',summary)
        print(label+' '+json.dumps(summary['totals'])+' exit='+str(completed.returncode),flush=True)
        return summary
    current=tests('current',root,classes)
    assert current['exit']==0 and current['totals']=={'tests':84,'failures':0,'errors':0,'skipped':0}
    run(['git','worktree','add','--detach',str(old),base])
    tree_added=True
    (old/'node_modules').symlink_to(root/'node_modules',target_is_directory=True)
    copies=[]
    for cls in new.split(','):
        rel=Path('gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller')/(cls+'.java')
        raw=(root/rel).read_bytes()
        assert raw==subprocess.check_output(['git','show',head+':'+str(rel)],cwd=root)
        (old/rel).write_bytes(raw)
        copies.append({'path':str(rel),'sourceCommit':head,'sha256':sha(raw),'copiedSha256':sha((old/rel).read_bytes())})
    write('old-source',{'sourceCommit':base,'transplantedFrom':head,'files':copies,'productSourceUnchanged':not run(['git','diff','--name-only','--','gmp-platform/backend/src/main'],cwd=old)})
    control=tests('old',old,new)
    assert control['exit']!=0 and control['totals']=={'tests':21,'failures':13,'errors':0,'skipped':0}
    write('run-complete',{'currentPassed':True,'oldCounterfactualPassed':True,'head':head,'base':base})
finally:
    cleanup={}
    if tree_added:
        for cls in new.split(','):
            p=old/'gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller'/(cls+'.java')
            if p.exists(): p.unlink()
        if (old/'node_modules').is_symlink(): (old/'node_modules').unlink()
        cleanup['oldTreeCleanBeforeRemove']=not run(['git','status','--porcelain'],cwd=old)
        subprocess.run(['git','worktree','remove',str(old)],cwd=root,check=True)
        cleanup['oldTreeRemoved']=not old.exists()
    if container:
        inspected=json.loads(run(['docker','inspect',container]))[0]
        assert inspected['Name']=='/edhr-file-delete-final-qa-20261102'
        run(['docker','stop',container])
        cleanup['containerRemoved']=subprocess.run(['docker','inspect',container],capture_output=True).returncode!=0
    cleanup['mainStatus']=run(['git','status','--porcelain'])
    cleanup['mainHead']=run(['git','rev-parse','HEAD'])
    write('cleanup',cleanup)
    print('cleanup '+json.dumps(cleanup),flush=True)
