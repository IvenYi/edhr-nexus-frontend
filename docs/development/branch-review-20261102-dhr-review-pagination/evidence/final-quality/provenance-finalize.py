from pathlib import Path
import json,hashlib,collections,datetime,zoneinfo
root=Path('/workspace/edhr-nexus-frontend');onto=root/'docs/development/branch-review-20261102-dhr-review-pagination/evidence/ontology'
r1={x['path']:x for x in json.loads((onto/'edhr-page-ontology/source-fingerprints.json').read_text())['files']}
r2={x['path']:x for x in json.loads((onto/'edhr-page-ontology-r2/source-fingerprints.json').read_text())['files']}
changed=sorted(k for k in r1.keys()&r2.keys() if r1[k]['sha256']!=r2[k]['sha256'])
added=sorted(r2.keys()-r1.keys());removed=sorted(r1.keys()-r2.keys())
assert changed==['docs/development/branch-review-20261102-dhr-review-pagination/decision-package.yaml']
assert added==['gmp-platform/backend/src/test/java/com/zencas/edhr/common/config/CurrentDatabaseBaselinePostgresTest.java'] and not removed
records=json.loads((onto/'edhr-page-ontology/semantic-review.json').read_text())['records']
dist=dict(collections.Counter(r['conclusion'] for r in records))
assert dist=={'consistent':12,'evidence-gap':2},dist
extra={'r1ToR2Changed':changed,'r1ToR2Added':added,'r1ToR2Removed':removed,'semanticDistribution':dist}
Path('/tmp/edhr-page-q1-provenance-revision-check.json').write_text(json.dumps(extra,ensure_ascii=False,indent=2)+'\n')
result_path=Path('/tmp/edhr-page-q1-provenance.json');result=json.loads(result_path.read_text());result['ontologyRevisionCheck']=extra;result_path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
artifacts=[]
for p in sorted([*Path('/tmp').glob('edhr-page-q1-provenance*'),*Path('/tmp/edhr-page-q1-inventory').glob('*')]):
    if p.is_file() and p.name!='edhr-page-q1-provenance-manifest.json':
        raw=p.read_bytes();artifacts.append({'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
manifest={'roleState':'FINAL','result':'passed','scope':'auxiliary read-only provenance, not runtime or whole-audit certification','baseCommit':result['baseCommit'],'headCommit':result['headCommit'],'capturedAt':datetime.datetime.now(zoneinfo.ZoneInfo('Asia/Shanghai')).isoformat(),'artifacts':artifacts}
Path('/tmp/edhr-page-q1-provenance-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'roleState':'FINAL','result':'passed','artifacts':len(artifacts),'semanticDistribution':dist}))
