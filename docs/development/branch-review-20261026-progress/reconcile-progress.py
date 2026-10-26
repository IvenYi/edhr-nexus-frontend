"""Read-only reconciliation of old scoped evidence, not new code/semantic/performance review."""
import collections,datetime,hashlib,importlib.util,json,subprocess,sys
from pathlib import Path
sys.dont_write_bytecode=True
repo=Path('/workspace/edhr-nexus-frontend')
baseline='5259791fcbc5d1fddf04cd62a02d6593d00fe2e6'
catalog_path='docs/development/branch-review-20261021-workflow-read-boundaries/source-catalog.json'
spec=importlib.util.spec_from_file_location('audit_progress_ledger',repo/'scripts/build-branch-review-ledger.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
git=module.Git()
assert git.commit('HEAD')==git.commit('origin/edhr-dev')==baseline
catalog=json.loads(git.read(baseline,catalog_path))
methods=module.reconcile_methods(git,baseline,catalog['methods'])
knowledge=module.knowledge_records(git,baseline)
semantics=module.reconcile_semantics(git,baseline,catalog['semanticSources'],knowledge)
merge='c671b23fd9847a7e1cb2d1bad3c3bb138fc5620f'
delivery='423b17a6361d89661cd4774adb23b2d1f6497efd'
same_tree=git.command('rev-parse',merge+'^{tree}')==git.command('rev-parse',delivery+'^{tree}')
assert same_tree
governance=git.command('diff','--name-only',delivery,baseline,'--','AGENTS.md','codeplzreadme.md','docs/agents').decode().splitlines()
assert not governance
old_summary=json.loads(git.read(baseline,'docs/development/branch-review-20261021-workflow-read-boundaries/ledger/summary.json'))
snapshot={
  'schema':'edhr-audit-progress-readonly-reconciliation/v1',
  'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
  'author':'/root',
  'targetBranch':'edhr-dev','targetCommit':baseline,
  'lastIndependentTestedCommit':'749c9f9b28d2525261976df070e56736323117be',
  'pr24':{'url':'https://github.com/IvenYi/edhr-nexus-frontend/pull/24','state':'MERGED','mergeCommit':merge,'sourceDeliveryCommit':delivery,'mergeDeliveryTreesEqual':same_tree},
  'currentTrackedPaths':len(git.tree(baseline)),
  'currentKnowledgeIds':len(knowledge),
  'inheritedCatalog':{'path':catalog_path,'sha256':hashlib.sha256(git.read(baseline,catalog_path)).hexdigest(),'inventoryBaseline':old_summary['baselineCommit'],'trackedPaths':old_summary['inventory']['trackedPaths'],'knowledgeIds':old_summary['knowledgeReview']['currentIds']},
  'source':{'historicalOverlappingScopes':len(methods),'carryStates':dict(collections.Counter(m['carryStatus'] for m in methods)),'wholeFilesCompletedByThisReconciliation':0,'freshSourceReviewExecuted':False},
  'semantic':{'historicalRows':len(semantics),'historicalUniqueIds':len({s['id'] for s in semantics}),'sourceArtifacts':len(catalog['semanticSources']),'carryStates':dict(collections.Counter(s['carryStatus'] for s in semantics)),'newSemanticReviews':0,'freshSemanticConsistencyAccepted':False,'dependencyGraphQualification':'Only original named paths; conservative file/blob relation, not complete dependency analysis or present semantic adjudication.'},
  'governanceChangedPaths':governance,
  'newBusinessTestsRun':0,'newBrowserTestsRun':0,'newPerformanceTestsRun':0,
  'latestContributorsWorkAutomaticallyAcceptedByThisReconciliation':False,
  'overallAuditComplete':False,'overallPercent':None,
  'userDeferredTaskDetailRetained':True,'userDeferredRecordControlDhrA12Retained':True
}
output=Path('/tmp/edhr-audit-progress-20261026.json');output.write_text(json.dumps(snapshot,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(snapshot,ensure_ascii=False))
