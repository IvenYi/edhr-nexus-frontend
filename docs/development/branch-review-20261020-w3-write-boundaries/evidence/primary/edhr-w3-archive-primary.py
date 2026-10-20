from pathlib import Path
import hashlib,json,shutil,subprocess,zipfile

repo=Path('/workspace/edhr-nexus-frontend')
out=repo/'docs/development/branch-review-20261020-w3-write-boundaries/evidence'
sha=lambda b:hashlib.sha256(b).hexdigest()
def copy(group,src,name=None):
 p=Path(src);dest=out/group/(name or p.name);dest.parent.mkdir(parents=True,exist_ok=True)
 shutil.copyfile(p,dest)
 assert p.read_bytes()==dest.read_bytes()
 return {'source':str(p),'path':str(dest.relative_to(repo)),'bytes':dest.stat().st_size,'sha256':sha(dest.read_bytes())}
helpers=['edhr-w3-write-entry-source-map.json','edhr-w3-transfer-source-map.json','edhr-w3-audit-hash-source-map.json','edhr-w3-audit-hash-source-receipts.json','edhr-w3-transfer-consumers.json','edhr-w3-transfer-knowledge-index.json']
primary=['edhr-w3-write-baseline-summary.json','edhr-w3-write-baseline-final-summary.json','edhr-w3-write-primary-summary.json','edhr-w3-write-postgres-primary-summary.json','edhr-w3-write-postgres-final-summary.json','edhr-w3-write-postgres-baseline-final-summary.json','edhr-w3-audit-hash-baseline-probe-summary.json','edhr-w3-final-primary-backend-summary.json','edhr-w3-access-cleanup-summary.json','edhr-w3-access-restored-summary.json','edhr-w3-transfer-pg-first-summary.json','edhr-w3-transfer-pg-second-summary.json','edhr-w3-transfer-pg-final-summary.json','edhr-w3-transfer-pg-test-summary.json','edhr-w3-transfer-pg-test-receipts.json','edhr-w3-premium-baseline.json','edhr-w3-premium-candidate.json','edhr-w3-premium-comparison.json','edhr-w3-premium-baseline.log','edhr-w3-premium-candidate.log','edhr-w3-eslint.log','edhr-w3-official-premium-audit.py']
browser=['edhr-w3-transfer-browser-summary.json','edhr-w3-transfer-browser-final.json','edhr-w3-transfer-browser-first.json','edhr-w3-transfer-browser-full-1.json','edhr-w3-transfer-browser-full-2.json','edhr-w3-transfer-browser-final.log']
receipts=[]
for group,names in [('helpers',helpers),('primary',primary),('browser',browser)]:
 for name in names:receipts.append(copy(group,Path('/tmp')/name))
for p in sorted(Path('/tmp/edhr-w3-transfer-browser-screenshots-final').glob('*.png')):receipts.append(copy('browser/screenshots',p))
raw_reports=['edhr-w3-write-entry-source-review.md','edhr-w3-write-existing-test-scopes.md','edhr-w3-transfer-source-review.md','edhr-w3-transfer-consumers.md','edhr-w3-transfer-knowledge-index.md','edhr-w3-audit-hash-source-review.md','edhr-w3-audit-hash-consumers.md','edhr-w3-transfer-seed-source-notes.md']
zpath=out/'helpers/original-reports.zip';members=[]
with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED) as z:
 for n in raw_reports:
  b=(Path('/tmp')/n).read_bytes();z.writestr(n,b);members.append({'member':n,'bytes':len(b),'sha256':sha(b)})
with zipfile.ZipFile(zpath) as z:
 for x in members:assert sha(z.read(x['member']))==x['sha256']
receipts.append({'path':str(zpath.relative_to(repo)),'bytes':zpath.stat().st_size,'sha256':sha(zpath.read_bytes())})
(out/'helpers/original-report-member-receipts.json').write_text(json.dumps({'note':'Exact originals; ZIP preserves any original trailing whitespace without rewriting evidence. No raw Maven/XML/JWT logs.','members':members},indent=2)+'\n')
fixtures={
 'first-pg-fixture.java':Path('/tmp/edhr-w3-write-postgres-first-fixture.java'),
 'baseline-audit-hash-probe.java':Path('/tmp/edhr-w3-baseline-recheck/gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/controller/WorkTemplateWritePostgresTest.java')}
zpath=out/'primary/failed-probe-fixtures.zip';members=[]
with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED) as z:
 for n,p in fixtures.items():
  b=p.read_bytes();z.writestr(n,b);members.append({'member':n,'source':str(p),'bytes':len(b),'sha256':sha(b)})
(out/'primary/failed-probe-member-receipts.json').write_text(json.dumps({'members':members,'note':'Synthetic test source only; first harness failure and deliberately failing old-baseline hash probe remain evidence, not passing suites.'},indent=2)+'\n')
receipts.append({'path':str(zpath.relative_to(repo)),'bytes':zpath.stat().st_size,'sha256':sha(zpath.read_bytes())})
build=Path('/tmp/edhr-w3-final-frontend-build.log').read_bytes()
facts={'sourceCommit':'4ce4fefbf736a31cbd8e4779d6b9fb7e65a91fb2','targetCommit':'a8285be9b91fb76bcb27ccb16a5258bda1fb5077','backendFinal':{'tests':292,'passed':292,'failures':0,'errors':0,'skipped':0,'nativePostgres':39,'nativeBreakdown':{'workWrites':12,'genericDelegation':23,'productionHttp':4},'dhrLifecycle':'5 H2 compatibility tests, not native PostgreSQL'},'browser':{'tests':36,'passed':36,'controlledApi':True,'fullStackEndToEnd':False,'primaryPersonallyViewedFilledScreenshots':4},'frontendBuild':{'command':'npm run build','exit':0,'logSha256':sha(build),'logBytes':len(build)},'scopeLimits':['No full branch certification','No audit-hash re-computation claim','No real historical data or real database touched','No Actions queried or triggered'],'disposablePostgres':{'ownedName':'edhr-audit-w3-20261020','version':'16.15','loopbackPort':55432,'syntheticOnly':True,'keptRunningForIndependentQa':True}}
(out/'primary/validation-summary.json').write_text(json.dumps(facts,indent=2)+'\n')
(out/'receipts.json').write_text(json.dumps({'schema':'edhr-byte-exact-evidence-copy/v1','files':receipts},indent=2)+'\n')
print(json.dumps({'files':len(receipts),'output':str(out)}))
