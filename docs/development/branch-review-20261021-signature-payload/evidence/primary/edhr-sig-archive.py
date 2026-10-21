from pathlib import Path
import hashlib,json,subprocess,zipfile
repo=Path('/workspace/edhr-nexus-frontend');batch=repo/'docs/development/branch-review-20261021-signature-payload'
sha=lambda data:hashlib.sha256(data).hexdigest()
receipts=[]
def copy(source,group):
 p=Path(source);data=p.read_bytes();dest=batch/'evidence'/group/p.name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
 receipts.append({'path':str(dest.relative_to(batch)),'source':str(p),'bytes':len(data),'sha256':sha(data)})
for suffix in ['baseline-summary.json','fixed-roundtrip-summary.json','migration-and-roundtrip-summary.json','migration-checked-summary.json','full-native-regression-summary.json','focused-final-summary.json','native-final-summary.json','font-identity-final-summary.json','run.py','font-environment.json','font-identity-environment.json','print-env-summary.json','print-env-probe.py','archive.py']:
 copy('/tmp/edhr-sig-'+suffix,'primary')
copy('/tmp/EdhrPlaywrightProbe.java','primary')
for suffix in ['command-source-map.json','command-source-review.md','front-action-consumers.json','front-action-consumers.md','signature-source-map.json','signature-review.md','signature-build.py','signature-policy-tests.json','signature-policy-tests.md']:
 copy('/tmp/edhr-w3d-'+suffix,'helpers')
for suffix in ['build.py','draft-catalog.json','support.json','receipts.json']:
 copy('/tmp/edhr-sig-baseline-'+suffix,'helpers')
manifest=json.loads(Path('/tmp/edhr-sig-ontology-manifest.json').read_text())
assert manifest['status']=='FINAL' and manifest['allChildInstancesFinal']
for row in manifest['files']:
 assert sha(Path(row['path']).read_bytes())==row['sha256'];copy(row['path'],'ontology')
copy('/tmp/edhr-sig-ontology-manifest.json','ontology')
members=[]
with zipfile.ZipFile(batch/'evidence/primary/retained-fixtures.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['baseline-seven-fixture.java','migration-before-commit-fixture.java','migration-before-master-fixture.java']:
  p=Path('/tmp/edhr-sig-'+name);raw=p.read_bytes();info=zipfile.ZipInfo(p.name,(2026,10,21,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,raw)
  members.append({'member':p.name,'sha256':sha(raw),'bytes':len(raw)})
(batch/'evidence/primary/fixture-receipts.json').write_text(json.dumps({'members':members,'qualification':'Baseline seven-case fixture kept unchanged until later two payload-corruption cases were appended. Migration pre-correction snapshots are retained at correction time; before-commit copy includes the fresh-master case added after the first four-case run, so it is not relabeled as an exact launch-time full-file snapshot. The failing rollback method itself is unchanged there. Environment and fixture failures are not extra product defects.'},ensure_ascii=False,indent=2)+'\n')
focused=json.loads(Path('/tmp/edhr-sig-focused-final-summary.json').read_text());font=json.loads(Path('/tmp/edhr-sig-font-identity-final-summary.json').read_text())
selected=[s for s in focused['suites'] if not s['name'].endswith('.AuthControllerTest')]+font['suites']
assert len(selected)==8 and sum(s['tests'] for s in selected)==104
assert all(s['freshReport'] and s['failures']==s['errors']==s['skipped']==0 for s in selected)
core='2ead6de2ed149f9c10a7786a555b0235c86b3186'
paths=['gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/entity/Signature.java','gmp-platform/backend/src/main/resources/db/changelog/0118-signature-payload-text.sql','gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml','gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/SignatureSnapshotPostgresTest.java','gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/SignatureSnapshotMigrationPostgresTest.java']
code=[]
for path in paths:
 raw=subprocess.check_output(['git','show',core+':'+path],cwd=repo);assert (repo/path).read_bytes()==raw
 code.append({'path':path,'commit':core,'sha256':sha(raw)})
data={'level':'L2','coreCommit':core,'knowledgeCommit':'c4af50a7d34bafb523992f00b169ee5efb7a8a1e','targetCommit':'c3343f45bb79f72368937f0d197ae01f989f0390','mainUniqueBusinessTests':104,'nativePostgresSubset':18,'h2DhrLifecycleSubset':5,'selectedSuites':[{k:v for k,v in s.items() if k!='cases'} for s in selected],'selectionQualification':'focused-final104 had103 pass and one font identity assertion failure; corrected test font produced AuthControllerTest24 pass, replacing that suite only. Union is104 unique tests, never128. No product or assertion changed for environment fixes.','baseline':{'tests':7,'failures':1,'businessErrors':3,'passedControls':3,'skipped':0,'productGapConfirmed':True},'intermediateFailures':['Migration rollback fixture inserted uncommitted seed; actual Liquibase rollback discarded it. Corrected commit timing only; original retained.','Full-master first attempted custom schema; old0077 explicitly uses public. Complete chain retested in owned temporary separate DB, no old migration changed.','First full regression: missing authorization TrueType font and Playwright attempted read-only home cache; original failures retained.','Next regression: one Noto cmap radical alias broke expected extracted Han characters. Local test font identity corrected; assertion unchanged.'],'fixedSourceReceipts':code,'runHeadQualification':'Primary runner reports HEAD c334 at run time with implementation then uncommitted; no runner HEAD is relabeled. Same product/test/migration bytes were committed as core. Final independent QA must test a clean fixed candidate.','historicalBoundary':'Legacy readable strings/hashes/metadata preserved; lost original bytes are not reconstructed; old unverifiable signatures remain rejected. Same JSONB input parse checks retained without normalized storage.','automaticRollback':'Not supplied because text-to-JSONB destroys new signed original bytes; actual rollback rejection and row preservation tested.','environment':'Owned synthetic PG16 only; system Chromium154 via controlled default cache and prepared test TrueType font. Not bundled Chromium145 or browser UI E2E.','database':{'containerId':'5dd0ccd19fbbd6b367e59c380257cada10e2ed408fe43dab77b97f437ce65858','loopback':'127.0.0.1:55432','database':'edhr_signature_test','cleanup':'pending independent QA FINAL'},'notClaimed':['production migration/deploy','old signature recovery','all Signature/API/authentication/ZIP flows accepted','whole W3/W0-W7 completion','GitHub Actions inspected or triggered']}
(batch/'evidence/primary/validation-summary.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(batch/'evidence/archive-receipts.json').write_text(json.dumps({'files':receipts,'rawLogsXmlCredentialsFontsBrowserBinariesExcluded':True},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'files':len(receipts),'mainUniqueTests':104,'nativePg':18,'formalOntology':'updated/FINAL'}))
