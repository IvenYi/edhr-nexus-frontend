"""L0 fixed-evidence importer; runs no source, semantic or performance acceptance."""
import argparse,copy,hashlib,json,subprocess
from pathlib import Path
import yaml
ROOT=Path('/workspace/edhr-nexus-frontend');B='docs/development/branch-review-20261026-capacity-audit';OLD='docs/development/branch-review-20261021-workflow-read-boundaries';TARGET='5259791fcbc5d1fddf04cd62a02d6593d00fe2e6'
def git(*a):return subprocess.check_output(['git',*a],cwd=ROOT)
def raw(ref,path):return git('show',ref+':'+path)
def sha(value):return hashlib.sha256(value).hexdigest()
def receipt(ref,path,locator='/'):return {'path':path,'commit':ref,'sha256':sha(raw(ref,path)),'locator':locator}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--ref',required=True);parser.add_argument('--out',type=Path,required=True);a=parser.parse_args();ref=git('rev-parse',a.ref+'^{commit}').decode().strip()
 assert not a.out.exists();git('merge-base','--is-ancestor',TARGET,ref)
 old=json.loads(raw(TARGET,OLD+'/source-catalog.json'));c=copy.deepcopy(old);c['baselineCommit']=ref
 assert (len(c['methods']),len(c['semanticSources']),len(c['findings']))==(574,6,52)
 acceptance=json.loads(raw(TARGET,OLD+'/acceptance.json'));qpath=OLD+'/'+acceptance['qualityResult']['path'];quality=yaml.safe_load(raw(TARGET,qpath))['qualityResult']
 assert quality['result']=='passed' and quality['headCommit']==acceptance['testedCommit'] and sha(raw(TARGET,qpath))==acceptance['qualityResult']['sha256']
 assert sum(ch['required'] and ch['outcome']=='passed' for ch in quality['checks'])==10
 assert git('rev-parse','c671b23fd9847a7e1cb2d1bad3c3bb138fc5620f^{tree}')==git('rev-parse','423b17a6361d89661cd4774adb23b2d1f6497efd^{tree}')
 accepted={x['id'] for x in acceptance['findings']}
 for row in c['findings']:
  if row['id'] not in accepted:continue
  original=copy.deepcopy(row);row['priorCatalogDisposition']={'catalog':receipt(TARGET,OLD+'/source-catalog.json'),'originalRecord':original}
  row['disposition']='fixed-and-independently-accepted';row['resolution'].update(testedCommits=[acceptance['testedCommit']],pullRequests=['https://github.com/IvenYi/edhr-nexus-frontend/pull/24'],mergeCommits=['c671b23fd9847a7e1cb2d1bad3c3bb138fc5620f'])
  row['evidence'] += [receipt(TARGET,OLD+'/acceptance.json'),receipt(TARGET,qpath)]
  row['carryQualification']='Historical PR24 scoped acceptance only. Later source/dependency changes still require delta review; no new runtime, whole-file or branch acceptance by import.'
 assert [x for x in c['findings'] if x['id'] not in accepted]==[x for x in old['findings'] if x['id'] not in accepted]
 c['findings'].append({'id':'QF-READ-DOC-001','recordKind':'audit-documentation-defect','severity':'low','workPackage':'W0','originalStatus':'resolved-before-pr24-candidate','originalReviewedCommit':'870b178f9bad07548485ff3b167b238d6e037ad7','aliases':[],'description':'Preserve PR24 independent low documentation wording correction, absent from frozen52 catalog but explicitly accepted in its overlay.','affectedPaths':[OLD+'/findings.md'],'disposition':'corrected-and-independently-accepted-l0','resolution':{'fixCommits':['870b178f9bad07548485ff3b167b238d6e037ad7'],'testedCommits':[acceptance['testedCommit']],'pullRequests':['https://github.com/IvenYi/edhr-nexus-frontend/pull/24'],'mergeCommits':['c671b23fd9847a7e1cb2d1bad3c3bb138fc5620f']},'limitations':['No product or new semantic claim; frozen52 record count preserved in old catalog.'],'evidence':[receipt(TARGET,OLD+'/acceptance.json','/additionalIndependentFindingNotInFrozenCatalog'),receipt(TARGET,qpath,'/qualityResult/findings')]})
 seen={r['id'] for r in c['methods']};imports=[]
 for group in ['workflow','dhr','primary','ontology']:
  path=B+'/evidence/'+group+'/edhr-capacity-'+group+'-source-map.json';document=json.loads(raw(ref,path));rows=document['sourceScopes'];imports.append({'path':path,'scopes':len(rows)})
  for index,row in enumerate(rows):
   reviewed=row.get('sourceCommit') or document['fixedCommit'];git('merge-base','--is-ancestor',reviewed,ref);value=raw(reviewed,row['path']);blob=git('rev-parse',reviewed+':'+row['path']).decode().strip();start,end=row['range']
   assert row['id'] not in seen and row['wholeFileReviewComplete'] is False and type(row['runtimeExecuted']) is bool
   assert row['sha256']==sha(value) and row['blob']==blob and 1<=start<=end<=len(value.splitlines())
   c['methods'].append({'id':row['id'],'path':row['path'],'scope':row['method'],'pathScope':[start,end],'reviewedCommit':reviewed,'sourceBlob':blob,'sourceSha256':sha(value),'depth':row['readDepth'],'wholeFileReviewComplete':False,'recordedOutcome':row['conclusion'],'evidence':receipt(ref,path,'/sourceScopes/'+str(index)),'additionalEvidence':[],'runtimeExecutionAsReportedBySourceMap':row['runtimeExecuted'],'reviewedCommitBasis':'Original named finite range only; runtime marker reflects original source, not importer execution or final independent acceptance.'});seen.add(row['id'])
 c['semanticSources'].append(receipt(ref,B+'/evidence/ontology/edhr-capacity-ontology-semantic-review.jsonl','six actual current DEC0082 limited declaration reviews; no whole knowledge acceptance'))
 risks=[('PERF-WORKFLOW-QUEUE-001','Runtime-observed full task entity materialization despite small page; one SQL per request, not N+1.','workflow','edhr-capacity-workflow-review.json'),('PERF-DHR-EVIDENCE-NPLUS1-001','Static valid frozen-version comparison reads current records per evidence row; changes model F+4 application JDBC reads. Runtime/latency pending.','dhr','edhr-capacity-dhr-review.md'),('PERF-DHR-REVIEW-REPEAT-001','Static authorized review detail repeats the full changes comparison; comparison-only model 2*(F+4), with possible repeated attachment IO/hash. Runtime pending.','dhr','edhr-capacity-dhr-review.md'),('PERF-EXECUTION-REFERENCE-VIEW-001','Static execution reference lookup constructs full execution/formal-output/operation controls before bounded candidate query. Scale measurement pending.','primary','edhr-capacity-primary-review.md')]
 for fid,description,group,file in risks:
  c['findings'].append({'id':fid,'recordKind':'performance-risk','severity':'medium','workPackage':'W5','originalStatus':'runtime-observed' if group=='workflow' else 'static-path-confirmed-runtime-pending','originalReviewedCommit':TARGET,'aliases':[],'description':description,'affectedPaths':[],'disposition':'pending-performance-discussion','resolution':{'fixCommits':[],'testedCommits':[],'pullRequests':[],'mergeCommits':[]},'limitations':['User requested evidence/options before performance modification. No product changes, production capacity, SLA or OOM certification.','Overlapping DHR risks are not distinct business failures or additive independent cost. Preserve complete evidence, authorization, snapshots and lock-time freshness.'],'evidence':[receipt(ref,B+'/findings.md',fid),receipt(ref,B+'/evidence/'+group+'/'+file)]})
 c['importNotes'].append({'id':'capacity-scope-and-pr24-carry','noteKind':'scoped-audit-import','scope':[r[0] for r in risks],'reason':'PR24 historical three accepted read fixes and one resolved low overlay are preserved; add82 finite source scopes, six formal limited semantic rows and four OPEN performance discussion risks. Import is not product remediation or fresh runtime acceptance.','evidence':[receipt(TARGET,OLD+'/acceptance.json'),receipt(ref,B+'/findings.md'),receipt(ref,B+'/audit-charter.md')]})
 c['policy'].append('Capacity batch remains a finite part of W0-W7. Charter completeness, inventory, current source inspection, semantic review, performance observations and product remediation are independent. New risks remain pending discussion; no business or performance fix by this import.')
 assert c['methods'][:574]==old['methods'] and c['semanticSources'][:6]==old['semanticSources']
 assert len(c['methods'])==656 and len(c['semanticSources'])==7 and len(c['findings'])==57
 a.out.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'baseline':ref,'scopes':656,'newFiniteScopes':82,'semanticSources':7,'newFormalSemanticRows':6,'findingRecords':57,'openPerformanceRisks':4,'imports':imports,'productOrRuntimeAcceptanceByImporter':False}))
if __name__=='__main__':main()
