"""Run reproducible isolated retained-heap checkpoints; raw stdout stays private."""
import argparse, hashlib, json, os, subprocess
from pathlib import Path

p=argparse.ArgumentParser()
p.add_argument('--classpath',required=True)
p.add_argument('--java-home',default='/workspace/.edhr-cloud-tools/jdk-21')
p.add_argument('--out',required=True)
p.add_argument('--scratch',required=True)
a=p.parse_args()
root=Path(__file__).resolve().parents[3]
scratch=Path(a.scratch);scratch.mkdir(parents=True,exist_ok=False)
output=Path(a.out)
if output.exists(): raise SystemExit('Preserve originals: output already exists')
legacyRef='a192a1d83be3644524ef6e2516619bdf81866678'
sourcePath='gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrEvidenceImpactService.java'
legacy=subprocess.check_output(['git','show',legacyRef+':'+sourcePath],cwd=root)
legacySource=scratch/'DhrEvidenceImpactServiceLegacyProbe.java'
legacySource.write_bytes(legacy.replace(b'class DhrEvidenceImpactService {',b'class DhrEvidenceImpactServiceLegacyProbe {'))
cp=Path(a.classpath).read_text().strip()
probe=Path(__file__).with_name('DhrWideRecordProbe.java')
with (scratch/'compile.private.log').open('wb') as log:
    subprocess.run([a.java_home+'/bin/javac','-cp',cp,'-d',str(scratch),str(legacySource),str(probe)],stdout=log,stderr=subprocess.STDOUT,check=True)
runs=[]
for repeat in [1,2]:
    for count,width in [(100,1024),(1000,1024),(100,32768),(1000,32768)]:
        for mode in ['legacy','current']:
            cmd=[a.java_home+'/bin/java','-Xms64m','-Xmx512m','-XX:+UseSerialGC','-cp',str(scratch)+':'+cp,
                 'com.zencas.edhr.production.service.DhrWideRecordProbe',mode,str(count),str(width),str(output)]
            log=scratch/f'{repeat}-{count}-{width}-{mode}.private.log'
            with log.open('wb') as f: run=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
            runs.append({'repeat':repeat,'records':count,'payloadChars':width,'mode':mode,'exit':run.returncode,'privateLogSha256':hashlib.sha256(log.read_bytes()).hexdigest()})
            if run.returncode: break
        if runs[-1]['exit']: break
    if runs[-1]['exit']: break
summary={'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),
         'legacySourceRef':legacyRef,'sourcePath':sourcePath,'legacySourceSha256':hashlib.sha256(legacy).hexdigest(),
         'currentSourceSha256':hashlib.sha256((root/sourcePath).read_bytes()).hexdigest(),
         'probeSha256':hashlib.sha256(probe.read_bytes()).hexdigest(),'jvm':['-Xms64m','-Xmx512m','-XX:+UseSerialGC'],
         'runs':runs,'observations':str(output),'complete':len(runs)==16 and all(r['exit']==0 for r in runs)}
output.with_suffix('.summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'complete':summary['complete'],'runs':len(runs),'summary':str(output.with_suffix('.summary.json'))}))
raise SystemExit(0 if summary['complete'] else 1)
