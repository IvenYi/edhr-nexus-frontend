from pathlib import Path
import hashlib,json,zipfile
repo=Path('/workspace/edhr-nexus-frontend')
batch=repo/'docs/development/branch-review-20261020-w3-task-commands'
out=batch/'evidence/helpers';out.mkdir(parents=True,exist_ok=True)
names=['command-source-map.json','command-front-consumers.json','command-front-consumers-receipts.json','signature-policy-history.json','resumed-command-verification.json','baseline-support.json','baseline-receipts.json','prepare-baseline-catalog.py']
rows=[];sha=lambda b:hashlib.sha256(b).hexdigest()
for name in names:
    src=Path('/tmp/edhr-w3c-'+name);raw=src.read_bytes();dest=out/src.name;dest.write_bytes(raw)
    rows.append({'path':str(dest.relative_to(batch)),'source':str(src),'sha256':sha(raw),'bytes':len(raw)})
members=[]
with zipfile.ZipFile(out/'original-helper-notes.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in ['command-source-review.md','command-front-consumers.md','signature-policy-history.md','resumed-command-verification.md']:
        src=Path('/tmp/edhr-w3c-'+name);raw=src.read_bytes();info=zipfile.ZipInfo(src.name,(2026,10,20,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,raw)
        members.append({'member':src.name,'sha256':sha(raw),'bytes':len(raw)})
(out/'receipts.json').write_text(json.dumps({'files':rows,'zipMembers':members,'qualification':'Original read-only source assistance and mechanical carry-forward, not formal ontology or QA. Original command/front artifacts and interrupted signature-policy artifacts are retained as historical scoped claims. Resumed verification distinguishes mechanical checks from actual rereads. RuntimeExecuted=false; wholeFileOrBranchAcceptance=false. Original in-progress instances were lost on interruption; no absent FINAL or gate result is invented. New formal ontology/QA results are required separately.'},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'copied':len(rows),'zipMembers':len(members)}))
