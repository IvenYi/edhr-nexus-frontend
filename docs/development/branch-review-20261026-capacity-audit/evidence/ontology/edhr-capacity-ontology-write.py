import datetime,hashlib,importlib.util,json,subprocess,sys
from pathlib import Path
import yaml
sys.dont_write_bytecode=True
REPO=Path('/workspace/edhr-nexus-frontend')
BASE='5259791fcbc5d1fddf04cd62a02d6593d00fe2e6'
READ='f1a20247e2d49077eac457912d4ac396ee221182'
def git(*args):return subprocess.check_output(['git',*args],cwd=REPO,stderr=subprocess.PIPE)
def raw(path):return git('show',BASE+':'+path)
def sha(value):return hashlib.sha256(value).hexdigest()
def dump(path,value):Path(path).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def receipt(path,locator):return {'path':path,'commit':BASE,'blob':git('rev-parse',BASE+':'+path).decode().strip(),'sha256':sha(raw(path)),'locator':locator,'reviewedScope':locator}
spec=importlib.util.spec_from_file_location('capacity_ontology_fixed_ledger',REPO/'scripts/build-branch-review-ledger.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
fixed=module.Git();inventory=module.knowledge_records(fixed,BASE)
assert len(inventory)==2618
protected=['AGENTS.md','codeplzreadme.md','docs/agents','docs/architecture','docs/knowledge','gmp-platform','scripts','tools']
assert not git('diff','--name-only',BASE,READ,'--',*protected)
assert not git('diff','--name-only',BASE,'HEAD','--',*protected)
DEC='docs/knowledge/decisions/DEC-0082-defect-reason-detail-and-reference-ownership.yaml'
statements=yaml.safe_load(raw(DEC))['decisions'][0]['decisionStatements']
selected=['DEC-0082-'+part for part in ['03','04','07','14','15','16']]
CB={'sourceCommit':READ,'targetBranch':'edhr-dev','targetCommit':BASE,'contractReadCommit':READ,'uncommittedContractPaths':[]}
L='gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/FormReferenceLookup.java'
C='gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/FormReferenceConfig.java'
E='gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionEngine.java'
A='gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionAccess.java'
TC='gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java'
RC='gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/FormReferenceController.java'
I='gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/ReferenceContextInitializationTest.java'
TL='gmp-platform/backend/src/test/java/com/zencas/edhr/template/service/FormReferenceLookupTest.java'
TCONF='gmp-platform/backend/src/test/java/com/zencas/edhr/template/service/FormReferenceConfigTest.java'
TCONT='gmp-platform/backend/src/test/java/com/zencas/edhr/template/controller/TemplateModelingControllerTest.java'
FC='gmp-platform/frontend/src/components/form-renderer/referenceConfig.ts'
FV='gmp-platform/frontend/src/components/form-renderer/referenceValidation.ts'
FP='gmp-platform/frontend/src/components/form-renderer/referencePresentation.ts'
INS='gmp-platform/frontend/src/pages/master-data/template-designer-react/components/DesignerInspector.tsx'
SCOPE='gmp-platform/frontend/src/pages/master-data/template-designer-react/components/ReferenceScopeConfig.tsx'
SHELL='gmp-platform/frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx'
scopes=[]
def scope(path,name,start=None,end=None,token=None,conclusion='Finite semantic source inspection only; no runtime or whole-file acceptance'):
 lines=raw(path).decode().splitlines()
 if start is None:
  found=[i for i,line in enumerate(lines) if token in line];assert len(found)==1,(path,token,found)
  start=found[0]+1
  terminator='    }' if path.endswith('.java') else '}'
  end=next(i+1 for i in range(start,len(lines)) if lines[i]==terminator)
 assert 1<=start<=end<=len(lines),(path,start,end,len(lines))
 scopes.append({'id':'capacity-ontology:'+str(len(scopes)+1).zfill(3),'path':path,'method':name,'sourceCommit':BASE,'blob':git('rev-parse',BASE+':'+path).decode().strip(),'sha256':sha(raw(path)),'range':[start,end],'readDepth':'ontology-finite-source-inspection','conclusion':conclusion,'wholeFileReviewComplete':False,'runtimeExecuted':False})
 return receipt(path,f'{name}:{start}-{end}; source inspection only, runtime not executed')
refs={}
refs['frozen']=scope(C,'fields/resolveFields frozen self-config',start=12,end=46,conclusion='Deep copy frozen form fields; resolve canvas overrides from same form, reject conflicting placements; never fetch current template.')
refs['conditions']=scope(C,'validateDesignConditions/validateConditions',start=49,end=92,conclusion='Validate combined candidate before persistence; invalid property/dependency/operator or multi-value rejected, empty condition ignored, disabled source skipped; no condition deletion.')
refs['lookup']=scope(L,'source maps/query',start=18,end=111,conclusion='Canonical source IDs and whitelisted SQL attributes; active dictionary/item scope and parameterized exact dictionary ID; all conditions AND and absent dependency no candidates. No full auth acceptance.')
refs['scope']=scope(L,'appendScope',token='private void appendScope(',conclusion='material all/product/types and productionObject all/batch/sn scopes shared by search/find/validate; material type IDs checked, no source identity merge.')
refs['search']=scope(L,'search paged SQL',token='public List<Map<String, String>> search(JsonNode config, String keyword, JsonNode values, Integer page, Integer size)',conclusion='Search SQL is bounded by LIMIT100 or pageSize<=100 plus1; a counterexample to claiming unbounded candidate materialization. No timing or production capacity acceptance.')
refs['find']=scope(L,'find context candidate',token='public Map<String, String> find(',conclusion='Uses same query/config/values and exact ID, not first search candidate; result depends on config and dependency values, not ID alone.')
refs['validate']=scope(L,'validate current reference',token='public void validate(JsonNode config, JsonNode value, JsonNode values, JsonNode previous)',conclusion='Shared scope and source identity/metadata checks; retained-reason exception is separate existing rule; no general validation/caching waiver.')
refs['access']=scope(A,'references/contextReference adapter',start=38,end=53,conclusion='Forward frozen field typeConfig and values to shared lookup; no second candidate or automatic ownership system.')
refs['initialize']=scope(E,'initializeForm first reference context',token='private void initializeForm(JsonNode',conclusion='referenceContextInitialized guard, explicit per-field flag and later empty-value-only assignment; original signature/audit/snapshot mechanisms not modified.')
refs['rows']=scope(E,'initializeReferenceContext recursion',start=741,end=755,conclusion='Parent values and each actual row scoped separately; empty-row defaults not copied from another entered row.')
refs['resolve']=scope(E,'resolveReferenceContext',token='private void resolveReferenceContext(',conclusion='Actual object/workOrder/product/explicit owner operation whitelist; shared-batch operation excluded; missing contexts warn/no guessing; nonempty values not overwritten; bounded dependency rounds stop when no progress.')
refs['designsave']=scope(TC,'saveFormTemplateVersionDesign validation before writes',start=228,end=257,conclusion='Combined new/existing model/canvas validated before entity setters, repository save and audit. No broader controller or transaction runtime acceptance.')
refs['preview']=scope(RC,'preview reference options scope and class authority',start=10,end=33,conclusion='Existing design authority; new dictionary option explicitly rejects missing concrete dictionary; original lookup scope maintained. No full permission runtime proof.')
refs['configsync']=scope(FC,'resolveReferenceField/syncReferenceConfig',start=12,end=44,conclusion='Reference settings remain field/placement configuration keyed by actual field and subtable; no projection-use creation; query conditions retained across patch merging.')
refs['fevalidate']=scope(FV,'referenceConditionIssue/referenceConfigurationIssues',start=16,end=55,conclusion='Returns specific invalid-property/dependency/operator issues using effective field/widget config; no silent omission at save validation.')
refs['supports']=scope(FP,'supportsReferenceContext and legacy editor aliases',start=29,end=45,conclusion='Whitelist excludes equipment/general material/personnel; legacy product/BATCH/SN grouped for editor without rewriting stored config.')
refs['handlers']=scope(INS,'source switch and condition errors',start=1688,end=1755,conclusion='Source switch resets display/search/autofill keys but leaves queryConditions; invalid condition options remain visible with error labels. No browser or visual conformance claim.')
refs['scopepatch']=scope(SCOPE,'scope patch commands',start=5,end=25,conclusion='Scope patches preserve query conditions; nonproduct material disables autofill. Source-only semantic event inspection, not UI verification.')
refs['saveguard']=scope(SHELL,'persistCurrentDocument reference guard',start=104,end=122,conclusion='Reference configuration issues block serialization/persist before markSaved. Source-only, not browser completion.')
tests={
 'initial':scope(I,'createsReferencesFromActualContextAndKeepsDefaultsForNewRowsAndCopies',token='@Test void createsReferencesFromActualContextAndKeepsDefaultsForNewRowsAndCopies('),
 'shared':scope(I,'sharedBatchFormsNeverAcquireViewedOperationAndMissingCandidatesStayEmpty',token='@Test void sharedBatchFormsNeverAcquireViewedOperationAndMissingCandidatesStayEmpty('),
 'manual':scope(I,'initializationLeavesManualValuesAndDoesNotRefreshExistingCopy',token='@Test void initializationLeavesManualValuesAndDoesNotRefreshExistingCopy('),
 'dep':scope(I,'dependentContextReferencesResolveInEitherFieldOrderWithoutRefreshingExistingCopies',token='@Test void dependentContextReferencesResolveInEitherFieldOrderWithoutRefreshingExistingCopies('),
 'cycle':scope(I,'cyclicContextDependenciesRemainEmptyWithoutGuessingOrUnboundedRetries',token='@Test void cyclicContextDependenciesRemainEmptyWithoutGuessingOrUnboundedRetries('),
 'row':scope(I,'rowDefaultsResolveTheirOwnDependenciesWhileActualRowsKeepTheirOwnValuesAndConditions',token='@Test void rowDefaultsResolveTheirOwnDependenciesWhileActualRowsKeepTheirOwnValuesAndConditions('),
 'unified':scope(I,'unifiedReferencesUseActualObjectScopeAndOnlyExplicitProductScopeCanAutofill',token='@Test void unifiedReferencesUseActualObjectScopeAndOnlyExplicitProductScopeCanAutofill('),
 'mat':scope(TL,'unifiedMaterialsShareIdentityAndApplyEveryConfiguredScopeToSearchFindAndValidation',token='@Test void unifiedMaterialsShareIdentityAndApplyEveryConfiguredScopeToSearchFindAndValidation('),
 'obj':scope(TL,'unifiedProductionObjectsRetainActualTypeWithoutWideningScopeOrAcceptingForgedMetadata',token='@Test void unifiedProductionObjectsRetainActualTypeWithoutWideningScopeOrAcceptingForgedMetadata('),
 'dict':scope(TL,'explicitDictionaryScopeIsSharedBySearchFindAndValidation',token='@Test void explicitDictionaryScopeIsSharedBySearchFindAndValidation('),
 'config':scope(TCONF,'conditionSaveValidationUsesRealEnabledSingleValueFieldsAndCurrentSourceWhitelist',token='@Test void conditionSaveValidationUsesRealEnabledSingleValueFieldsAndCurrentSourceWhitelist('),
 'controller':scope(TCONT,'invalidReferenceConditionsRejectDesignBeforeMutatingVersionSavingOrAuditing',token='void invalidReferenceConditionsRejectDesignBeforeMutatingVersionSavingOrAuditing(')
}
ORIGINAL='docs/knowledge/evidence/defect-reason-detail-reference-2026-10-18.md'
DICT='docs/knowledge/evidence/reference-dictionary-correction-2026-10-19.md'
UNIFY='docs/knowledge/evidence/reference-source-unification-2026-10-19.md'
INTEGRATION='docs/knowledge/evidence/release-integration-2026-10-21.md'
review={
 'DEC-0082-03':('Reference source/search/condition/display configuration remains field/placement configuration; backend preview/production share lookup and source identities. Inspection does not accept every UI wording, source authorization or projected business use.',[refs[k] for k in ['frozen','configsync','lookup','access','preview']],[tests['config']],[receipt(ORIGINAL,'原始确认3、4、8、9；引用字段配置与显式用途分开，普通搜索不机械改称追溯')]),
 'DEC-0082-04':('Production initialization uses actual snapshot object/work-order/product and owned operation. Equipment/general material/personnel unsupported; shared-batch form never takes viewed operation. Does not certify all context creation or whole production permission flow.',[refs[k] for k in ['initialize','rows','resolve','supports','find']],[tests[k] for k in ['initial','shared','unified']],[receipt(ORIGINAL,'原始确认5、9、10及当前边界；明确归属工序及白名单范围')]),
 'DEC-0082-07':('Explicit autofill flag defaults false; referenceContextInitialized limits initialization; current nonempty values preserved, absent or unsuitable context yields warning/no first candidate. Field dependency ordering/cycles and row default scope checked in source only; mock simulation/UI editing, all copy/resume paths and transaction runtime are not certified.',[refs[k] for k in ['initialize','rows','resolve','frozen','find']],[tests[k] for k in ['manual','dep','cycle','row','unified']],[receipt(ORIGINAL,'原始确认9/10；新表单首次空值、不覆盖、缺上下文提示、使用时冻结与权限保持')]),
 'DEC-0082-14':('New preview dictionary config requires concrete dictionary; query applies dictionary and item ACTIVE plus exact dictionary ID shared by search/find/validate. Key-absent frozen legacy interpretation remains, not auto-migrated. Scope identity is not a name match; no full lifecycle/auth runtime claim.',[refs[k] for k in ['lookup','search','find','validate','frozen','preview']],[tests['dict']],[receipt(DICT,'user-confirmed具体字典；原始源码核对和inference兼容边界；不是新建多租户/历史迁移政策')]),
 'DEC-0082-15':('Unified material/productionObject editor aliases retain canonical material/production object IDs and actual BATCH/SN scopes. SQL scope is shared across selection and validation; only material product subset can autofill product. Legacy aliases kept; backend and pure config inspection do not certify every business-purpose compatibility or all UI scenes.',[refs[k] for k in ['lookup','scope','find','validate','supports','scopepatch','resolve']],[tests[k] for k in ['mat','obj','unified']],[receipt(UNIFY,'user-confirmed两组合并入口但不合身份/业务语义；原分开入口仅局部替代，04/07保留')]),
 'DEC-0082-16':('Source/scope patch handlers preserve query conditions. Invalid property/dependency/operator remains marked and combined design is rejected before setters/save/audit. Empty rows ignored and four operators/AND/raw-attribute behavior remain; no whole designer/visual/runtime acceptance.',[refs[k] for k in ['handlers','scopepatch','fevalidate','saveguard','conditions','designsave','lookup']],[tests[k] for k in ['config','controller']],[receipt(UNIFY,'user-confirmed保留并标错，修正或移除后保存；不扩其他草稿门禁或重写旧冻结值')])
}
rows=[]
for rid in selected:
 item=inventory[rid];index=next(i for i,x in enumerate(statements) if x['id']==rid);record=statements[index]
 assert item['sourcePath']==DEC and item['sourceLocator']==f'/decisions/0/decisionStatements/{index}'
 assert sha(module.canonical(record))==item['recordSha256']
 description,implementation,assertions,decision=review[rid]
 rows.append({'id':rid,'recordType':item['recordType'],'sourcePath':DEC,'sourceLocator':item['sourceLocator'],'sourceCommit':BASE,'baselineCommit':BASE,
  'sourceBlob':git('rev-parse',BASE+':'+DEC).decode().strip(),'sourceSha256':sha(raw(DEC)),'recordSha256':item['recordSha256'],
  'originalMaturity':record['status'],'assetStatus':record['status'],'visibility':record['visibility'],'auditScopeClassification':'current-effective-scoped-review',
  'reviewStatus':'reviewed','conclusion':'consistent','reviewedScope':description,
  'decisionEvidence':[receipt(DEC,rid+' exact current normative declaration'),*decision,receipt(INTEGRATION,'原原因DEC0081->DEC0082编号一一映射，业务语义与当前委托DEC0081均保留')],
  'implementationEvidence':implementation,'testAssertionsRead':assertions,'historicalRead':[refs['frozen']],
  'knowledgeBaselineVersion':'0.3.25','schemaVersion':'1.2.0','contractBaseline':CB,
  'businessRuntimeExecutedByOntologyInstance':False,'performanceRuntimeExecutedByOntologyInstance':False,
  'validationExecutedByOntologyInstance':'Fixed Git/YAML record extraction, uniqueness/receipt/range/contract-equivalence checks only; no Maven/JUnit/business/browser/performance execution.',
  'newUserPolicy':False,'wholeFileReviewComplete':False,'wholeRecordSemanticPassClaimed':False,
  'limitations':['Only explicitly named finite clause scope; no whole DEC0082, UI, module, all permissions, business-purpose compatibility or whole2618-ID semantic acceptance.','Test source assertions read only; H2/Mockito declared fixtures are not this instance native PostgreSQL/runtime proof.','Performance changes require retaining scope/identity, row-dependent values, current validity, initial-only/frozen semantics. No latency, capacity or caching policy approved.','Existing4 knowledge gaps, user-deferred record-control/twoDHRhigh/A12/TaskDetail, DEC0083/84 incremental review and all unreviewed assets remain pending; no maturity/stage/version upgrade.']})
semantic_path=Path('/tmp/edhr-capacity-ontology-semantic-review.jsonl')
semantic_path.write_text(''.join(json.dumps(r,ensure_ascii=False,sort_keys=True)+'\n' for r in rows))
map_path=Path('/tmp/edhr-capacity-ontology-source-map.json')
dump(map_path,{'author':'/root/capacity_ontology_delta','fixedCommit':BASE,'contractReadCommit':READ,'sourceScopes':scopes,'scopeRecordsAreOverlapping':True,'wholeFileReviewComplete':False,'runtimeExecuted':False})
required=['AGENTS.md','docs/agents/business-knowledge-modeler.md','docs/agents/agent-handoff-contract.md','docs/architecture/business-knowledge-model.md','docs/knowledge/README.md','docs/knowledge/open-questions.yaml']
validation={'author':'/root/capacity_ontology_delta','status':'FINAL','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'targetCommit':BASE,'contractBaseline':CB,
 'requiredAssetsRead':[receipt(p,'full document read for current role/context; not whole business semantic acceptance') for p in required],
 'currentKnowledgeIds':len(inventory),'currentKnowledgeMarkdownFiles':sum(p.startswith('docs/knowledge/') and p.endswith('.md') for p in fixed.tree(BASE)),
 'finiteSemanticRows':6,'finiteSourceScopes':len(scopes),'allSelectedDeclaredIdsUniqueAndCanonicalHashesMatched':True,'allSourceGitBlobsAndRangesValidated':True,
 'protectedProductKnowledgeContractsSameAs525AtReadAndFinish':True,'businessTestsExecuted':0,'knowledgeJUnitExecuted':0,'browserTestsExecuted':0,'performanceTestsExecuted':0,
 'actualKnowledgeChanges':[],'actualRepositoryWritesByThisRole':[],'newQuestions':[],'newConflicts':[],
 'ontologyResult':'not-applicable','ontologyNotApplicableMeaning':'No knowledge-definition/business-rule change in this read-only slice; six actual scoped semantic reviews were performed; full audit still applies.',
 'performanceConstraints':['Do not drop dictionary/source/type/current-validity filters or row-dependent conditions to reduce queries.','Cache or batch keys require frozen field config, target identity, parent/current-row values and correct validity/transaction scope; ID alone is insufficient.','Reference search currently has SQL LIMIT100 or bounded pageSize+1; not an unbounded-result example. Repeated dependency lookups/initialization rounds require separate scale measurement.','Do not skip lock-bound validity or source permission checks, change first-empty-only initialization or overwrite existing/historical state.'],
 'overallAuditComplete':False,'remainingGlobalSemanticAssetsNotAcceptedByThisSlice':True}
validation_path=Path('/tmp/edhr-capacity-ontology-validation.json');dump(validation_path,validation)
result={'ontologyResult':{'result':'not-applicable','baselineBefore':'0.3.25','baselineAfter':'0.3.25','contractBaseline':CB,
 'reason':'Read-only finite audit of DEC0082-03/04/07/14/15/16 and named source/assertion ranges found no contradiction in the declared scopes and requires no knowledge/business definition change. Six semantic rows are real source/decision reviews; this result does not exempt or complete whole2618-ID audit, runtime or performance acceptance.',
 'changedArtifacts':[],'knowledgeSync':[{'id':rid,'disposition':'retained','scope':review[rid][0],'sourceReferences':[DEC,*[p['path'] for p in review[rid][3]]]} for rid in selected],
 'conflicts':[],'questions':[],
 'validationEvidence':[{'id':'validation.capacity-ontology-fixed-records','checkType':'reference','command':'python /tmp/edhr-capacity-ontology-write.py: fixed Git/schema-driven declared-ID extraction and canonical SHA matching','outcome':'passed','evidence':[str(validation_path),'2618 declared IDs inventoried mechanically; only6 selected finite clauses manually reviewed.']},
 {'id':'validation.capacity-ontology-source-receipts','checkType':'evidence-path','command':'Fixed Git show/rev-parse plus explicit range/hash checks and selected source/test-assertion inspection','outcome':'passed','evidence':[str(map_path),str(semantic_path),'No Maven/JUnit/business/browser/performance run by this ontology instance.']},
 {'id':'validation.capacity-ontology-unchanged-protected-baseline','checkType':'evidence-path','command':'git diff --name-only 5259791f..f1a20247 and 5259791f..HEAD on product/knowledge/role/architecture paths','outcome':'passed','evidence':[str(validation_path),'Only parent audit-development documents are in flight; this role wrote no repository files.']}],
 'roadmapProgress':{'stage':'P0','status':'in-progress','exitCriteriaEvidence':[],'deferredStages':['P1','P2','P3']}}}
result_path=Path('/tmp/edhr-capacity-ontology-result.yaml');result_path.write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False,width=140))
files=[result_path,semantic_path,map_path,validation_path,Path(__file__)]
manifest={'author':'/root/capacity_ontology_delta','status':'FINAL','baseCommit':BASE,'sourceReadCommit':READ,'noChildInstances':True,'files':[{'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in files],
 'excluded':['No raw logs/XML/JWT generated or archived','No full knowledge/source export','No runtime tests or schema/migration/database operations'],'actualRepoWrites':[]}
dump('/tmp/edhr-capacity-ontology-manifest.json',manifest)
print(json.dumps({'ontologyResult':'not-applicable','semanticRows':6,'sourceScopes':len(scopes),'knowledgeIdsMechanicallyEnumerated':len(inventory),'runtimeTests':0,'resultSha256':sha(result_path.read_bytes()),'manifest':'/tmp/edhr-capacity-ontology-manifest.json'}))
