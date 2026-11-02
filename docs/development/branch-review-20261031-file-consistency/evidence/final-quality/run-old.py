from pathlib import Path
import subprocess,json,hashlib,shutil,xml.etree.ElementTree as ET
ROOT=Path('/workspace/edhr-nexus-frontend')
PREFIX='/tmp/edhr-copy-q2-'
CLASSES=['FileCopyOwnershipTest','FileHttpBoundaryTest']
DIRECTORY='gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller/'
commits=[('latest-old','0bd0848bbded6d6954d62a4f924e0b2eec6623ad'),('pre-copy-fix','e9548d5f9d555f78afbe1c1c8ea68f64d45e6c55')]
cleanup=[]
for label,commit in commits:
    worktree=Path(PREFIX+'worktree-'+label)
    assert not worktree.exists()
    add=subprocess.run(['git','worktree','add','--detach',str(worktree),commit],cwd=ROOT,text=True,capture_output=True)
    Path(PREFIX+label+'-worktree-add.txt').write_text(add.stdout+add.stderr)
    assert add.returncode==0
    originals={}
    link=worktree/'gmp-platform/frontend/node_modules'
    try:
        for name in CLASSES:
            relative=DIRECTORY+name+'.java'; target=worktree/relative
            originals[relative]=target.read_bytes() if target.exists() else None
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(ROOT/relative,target)
        assert not link.exists() and not link.is_symlink()
        link.symlink_to(ROOT/'gmp-platform/frontend/node_modules',target_is_directory=True)
        command=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest='+','.join(CLASSES),'test']
        hashes={name:hashlib.sha256((worktree/(DIRECTORY+name+'.java')).read_bytes()).hexdigest() for name in CLASSES}
        Path(PREFIX+label+'-command.json').write_text(json.dumps({'command':command,'cwd':str(worktree),'commit':commit,'testSha256':hashes},indent=2)+'\n')
        with Path(PREFIX+label+'-test.txt').open('w') as output:
            run=subprocess.run(command,cwd=worktree,stdout=output,stderr=subprocess.STDOUT)
        rows=[]; failures=[]
        for name in CLASSES:
            source=next((worktree/'gmp-platform/backend/target/surefire-reports').glob('TEST-*.'+name+'.xml'))
            shutil.copyfile(source,Path(PREFIX+label+'-'+name+'.xml'))
            suite=ET.parse(source).getroot()
            rows.append({'suite':name,**{k:int(suite.attrib[k]) for k in ['tests','failures','errors','skipped']}})
            for case in suite.findall('testcase'):
                for failure in [*case.findall('failure'),*case.findall('error')]:
                    failures.append({'case':case.attrib['name'],'kind':failure.tag,'message':failure.attrib.get('message','')})
        result={'commit':commit,'exit':run.returncode,'suites':rows,'totals':{k:sum(x[k] for x in rows) for k in ['tests','failures','errors','skipped']},'failures':failures,'testSha256':hashes}
        Path(PREFIX+label+'-summary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps({'label':label,**result['totals']},ensure_ascii=False),flush=True)
    finally:
        for relative,original in originals.items():
            target=worktree/relative
            if original is None:target.unlink(missing_ok=True)
            else:target.write_bytes(original)
        if link.is_symlink():link.unlink()
        status=subprocess.check_output(['git','status','--porcelain'],cwd=worktree,text=True)
        remove=subprocess.run(['git','worktree','remove',str(worktree)],cwd=ROOT,text=True,capture_output=True)
        cleanup.append({'worktree':str(worktree),'statusBeforeRemoval':status,'exit':remove.returncode,'output':remove.stdout+remove.stderr,'absent':not worktree.exists()})
        Path(PREFIX+'cleanup.json').write_text(json.dumps({'owner':'file-consistency-final-qa2-20261031','worktrees':cleanup},indent=2)+'\n')
        assert remove.returncode==0 and not worktree.exists()
