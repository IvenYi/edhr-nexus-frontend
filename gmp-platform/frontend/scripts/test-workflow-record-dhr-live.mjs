import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { base, database, sql, users, loginPassword, signPassword, mainIntegrity } from './workflow-record-dhr-live-fixture.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const output=process.env.WORKFLOW_LIVE_ARTIFACTS;
if(!output) throw new Error('An explicit artifact directory is required');
await mkdir(output,{recursive:true});
const manifest=JSON.parse(await readFile(process.env.WORKFLOW_LIVE_MANIFEST,'utf8'));
assert.equal(manifest.database,database);
const cases=Object.fromEntries(manifest.cases.map(c=>[c.code,c]));
const checks=[], network=[], sessions={}, errors=[];
const selectedSteps=process.env.WORKFLOW_LIVE_ONLY;
const before=mainIntegrity();
let browser, currentPage;
const save=async()=>writeFile(path.join(output,'result.json'),JSON.stringify({qualification:'Maintained application on dedicated Vite, real backend and disposable PostgreSQL; no business API mocking.',database,base,selectedSteps:selectedSteps||'all',checks,network,errors,mainBefore:before,mainAfter:mainIntegrity()},null,2)+'\n');
async function step(name, run) {
  if(selectedSteps&&!name.includes(selectedSteps)&&!['actual-login-four-roles','authenticated-candidates-without-create-authorities-and-anonymous-rejection'].includes(name))return;
  const start=Date.now();
  try {await run(); checks.push({name,passed:true,milliseconds:Date.now()-start});console.log('PASS '+name);}
  catch(error){checks.push({name,passed:false,error:error.stack});if(currentPage)await currentPage.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw error;}
  finally{await save();}
}
async function login(role) {
  const context=await browser.newContext({viewport:{width:1600,height:1000}});
  const page=await context.newPage(); page.setDefaultTimeout(15000); currentPage=page;
  page.on('pageerror',e=>errors.push({role,message:e.message}));
  page.on('response',async response=>{const request=response.request();if(request.method()!=='GET'&&response.url().includes('/api/v1/')&&!response.url().includes('/auth/')) network.push({role,method:request.method(),path:new URL(response.url()).pathname,status:response.status()});});
  await page.goto(base+'/login');await page.waitForLoadState('networkidle');
  await page.getByLabel(/^用户名/).fill('uat_'+role);await page.getByLabel(/^密码/).fill(loginPassword);
  await page.getByRole('button',{name:/登\s*录/}).click();await page.waitForURL(url=>url.pathname!='/login');
  const token=await page.evaluate(()=>localStorage.getItem('token'));
  sessions[role]={context,page,token}; return page;
}
async function api(role,method,endpoint,data,expectSuccess=true) {
  const response=await sessions[role].context.request.fetch(base+'/api/v1'+endpoint,{method,headers:{Authorization:'Bearer '+sessions[role].token},data});
  const value=await response.json();
  if(expectSuccess) assert.equal(value.code,200,endpoint+': '+JSON.stringify(value));
  return expectSuccess?value.data:value;
}
async function go(role,route){const p=sessions[role].page;currentPage=p;await p.goto(base+route);await p.waitForLoadState('networkidle');return p;}
const screenshot=async name=>currentPage.screenshot({path:path.join(output,name+'.png'),fullPage:true,animations:'disabled'});
async function credentials(dialog,role) {await dialog.getByLabel('签署人用户名',{exact:true}).fill('uat_'+role);await dialog.getByLabel('电子签名密码',{exact:true}).fill(signPassword);}
async function submitRequest(c,type='CHANGE',quantity=120) {
  const p=await go('applicant','/records/change');
  await p.getByLabel('表单实例编号',{exact:true}).fill(c.instanceNo);await p.getByRole('button',{name:'查询',exact:true}).click();
  await p.getByRole('button',{name:type==='CHANGE'?'表单变更':'表单作废',exact:true}).click();
  if(type==='CHANGE'){await p.getByLabel('报工数量',{exact:true}).fill(String(quantity));await p.getByLabel('物料批号',{exact:true}).fill('E2E-'+c.code+'-'+quantity);}
  await p.getByRole('button',{name:type==='CHANGE'?'提交变更审批':'提交作废审批',exact:true}).click();
  const dialog=p.getByRole('dialog');await dialog.getByLabel(type==='CHANGE'?'变更原因':'作废原因').fill('真实全流程闭环验收 '+c.code);
  const choices=await api('applicant','GET','/workflow/record-control/candidates?businessType='+type);
  const candidate=choices.find(x=>x.workflowDefinitionId===String(type==='CHANGE'?883010000200:883010000300));assert.ok(candidate,'Dedicated fixture approval workflow');
  await dialog.getByLabel('审批流程版本').click();await p.getByRole('option',{name:candidate.templateName+' · V'+candidate.versionNumber,exact:true}).click();
  await credentials(dialog,'applicant');
  const response=p.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/v1/record-control/requests');
  await dialog.getByRole('button',{name:'签署并确认提交',exact:true}).click();const body=await (await response).json();assert.equal(body.code,200,JSON.stringify(body));
  await p.getByText('申请已提交，原表单仍保持已完成状态，等待审批。',{exact:true}).waitFor();
  const request=body.data;
  if(type==='CHANGE') assert.equal(sql(`SELECT jsonb_typeof(proposed_values_json::jsonb->'qty') FROM record_control_request WHERE id=${request.id}`),'number');
  const tasks=await api('manager','GET','/workflow/operations/instances/'+request.workflow_instance_id);
  return {...request,taskId:tasks.tasks.find(t=>t.status==='PENDING').id};
}
async function requestDecision(request,role,approve=true) {
  const p=await go(role,`/records/approvals/${request.taskId}/${request.id}`);
  await p.getByRole('button',{name:approve?'审批通过':'审批退回',exact:true}).click();
  const d=p.getByRole('dialog');await d.getByLabel(approve?'审批意见':'退回原因').fill('全流程核对 '+(approve?'通过':'退回'));
  await credentials(d,role);const response=p.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/record-control/workflow-tasks/'));
  await d.getByRole('button',{name:approve?'签署并通过':'签署并退回',exact:true}).click();const result=await (await response).json();assert.equal(result.code,200,JSON.stringify(result));await p.waitForURL(base+'/records/approvals');
}
async function reassign(instanceId,key,roleTarget) {
  const p=await go('manager','/workflow/interventions');
  await p.getByLabel('流程名称／业务编号',{exact:true}).fill(key);await p.getByRole('button',{name:'查询',exact:true}).click();
  const row=p.getByRole('row').filter({has:p.getByRole('cell',{name:key,exact:true})});await row.getByRole('button',{name:'重新分配',exact:true}).click();
  const d=p.getByRole('dialog',{name:'重新分配',exact:true});await d.getByRole('combobox',{name:'新处理人'}).click();
  await p.getByRole('option',{name:new RegExp('uat_'+roleTarget)}).click();await d.getByLabel('重新分配原因').fill('全流程责任调整');await credentials(d,'manager');
  const response=p.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/reassign'));
  await d.getByRole('button',{name:'签署并重新分配',exact:true}).click();assert.equal((await (await response).json()).code,200);await p.getByText('重新分配成功',{exact:true}).waitFor();
  assert.ok((await api('manager','GET','/workflow/operations/instances/'+instanceId)).logs.some(x=>x.action==='TASK_REASSIGN'));
}
async function initialSummary(c,approve) {
  const endpoint=`/dhr-instances/${c.dhrId}/summary`;const w=await api('applicant','GET',endpoint);
  const draft=await api('applicant','PUT',endpoint+'/draft',{expectedScopeHash:w.sourceScopeHash,overlayDirectories:[],placements:[]});
  const version=await api('applicant','POST',endpoint+'/submit',{expectedDraftId:draft.id,expectedRevision:draft.revision,manualReview:{qualityAndExceptionsReviewed:true,sourceSignaturesReviewed:true,completeScopeReviewed:true,note:'隔离夹具初始化已完成来源'}});
  c.versionId=version.id;
  const list=await api('reviewer','GET','/dhr-reviews?view=PENDING&page=0&size=100&keyword='+encodeURIComponent(c.objectNo));
  c.reviewTask=list.content.find(t=>t.dhrId===c.dhrId);assert.ok(c.reviewTask,'DHR fixture pending task');
  if(approve) await api('reviewer','POST',`/dhr-reviews/${c.reviewTask.id}/actions`,{action:'APPROVE',expectedSnapshotHash:c.reviewTask.snapshotHash,opinion:'初始化正式冻结版本',account:'uat_reviewer',password:signPassword});
}
async function dhrDecision(c,role,approve) {
  const p=await go(role,'/dhr-management/review');await p.getByRole('textbox').first().fill(c.objectNo);await p.getByRole('button',{name:'查询',exact:true}).click();
  await p.getByRole('button',{name:'查看并审批 DHR-'+c.objectNo,exact:true}).click();
  const detail=await api(role,'GET','/dhr-reviews/'+(c.latestTask||c.reviewTask).id);
  const action=detail.buttons.find(b=>b.action===(approve?'APPROVE':'RETURN'));
  const label=action.label+(action.requiresSignature?'并签署':'');
  const review=p.getByRole('dialog').first();await review.getByRole('button',{name:label,exact:true}).click();
  const d=p.getByRole('dialog').last();await d.getByLabel('操作意见').fill('完整流程核查 '+(approve?'通过':'退回整理'));
  if(await d.getByLabel('签署人用户名',{exact:true}).count())await credentials(d,role);
  const response=p.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/dhr-reviews/')&&r.url().endsWith('/actions'));
  await d.getByRole('button',{name:'确认',exact:true}).click();assert.equal((await (await response).json()).code,200);
}
async function openSummary(c,submitted=false) {
  const p=await go('applicant','/dhr-management/summary');
  if(submitted){await p.getByLabel('汇总状态',{exact:true}).click();await p.getByRole('option',{name:'已提交',exact:true}).click();}
  await p.getByLabel('关键词',{exact:true}).fill(c.objectNo);await p.getByRole('button',{name:'查询',exact:true}).click();
  await p.getByRole('button',{name:(submitted?'查看冻结版本 ':'进入汇总 ')+'DHR-'+c.objectNo,exact:true}).click();return p;
}

try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  await step('actual-login-four-roles',async()=>{for(const role of Object.keys(users))await login(role);});
  await step('authenticated-candidates-without-create-authorities-and-anonymous-rejection',async()=>{
    const owned=await api('applicant','GET','/record-control/records/by-number?instanceNo='+cases.WITHDRAW.instanceNo);
    assert.equal(owned.id,cases.WITHDRAW.recordId,'Frontend must reach the separately prepared disposable database before any business write');
    const me=await api('applicant','GET','/auth/me');assert.ok(!me.permissions.includes('record-control.corrections.create'));assert.ok(!me.permissions.includes('record-control.voids.create'));
    for(const type of ['CHANGE','OBSOLETE'])assert.ok((await api('applicant','GET','/workflow/record-control/candidates?businessType='+type)).length);
    const response=await sessions.applicant.context.request.get(base+'/api/v1/workflow/record-control/candidates?businessType=CHANGE');assert.notEqual((await response.json()).code,200);
    assert.notEqual((await api('applicant','GET','/workflow/record-control/candidates?businessType=DHR_SUMMARY',undefined,false)).code,200);
  });
  await step('prepare-real-frozen-dhr-fixtures-through-services',async()=>{await initialSummary(cases.CHANGE,true);await initialSummary(cases.VOID,true);await initialSummary(cases['DHR-CYCLE'],false);});
  await step('signed-request-withdraw-releases-lock-and-allows-new-request',async()=>{
    const c=cases.WITHDRAW,request=await submitRequest(c,'CHANGE',0);const original=sql(`SELECT current_revision_id FROM form_instance_record WHERE id=${c.recordId}`);
    const p=await go('applicant','/records/requests/'+request.id);await p.getByRole('button',{name:'撤回申请',exact:true}).click();const d=p.getByRole('dialog');await d.getByLabel('撤回原因').fill('全流程撤回重提');await d.getByRole('button',{name:'撤回申请',exact:true}).click();await p.getByText('申请已撤回',{exact:true}).waitFor();
    assert.equal(sql(`SELECT status FROM record_control_request WHERE id=${request.id}`),'WITHDRAWN');assert.equal(sql(`SELECT current_revision_id FROM form_instance_record WHERE id=${c.recordId}`),original);
    assert.equal(sql(`SELECT count(*) FROM workflow_task WHERE instance_id=${request.workflow_instance_id} AND status IN ('PENDING','PROCESSING')`),'0');
    c.request=await submitRequest(c,'CHANGE',121);assert.notEqual(c.request.id,request.id);await screenshot('withdraw-and-resubmit');
  });
  await step('handler-transfer-signed-manager-reassignment-and-original-approval',async()=>{
    const c=cases.TRANSFER,r=await submitRequest(c);let p=await go('reviewer',`/records/approvals/${r.taskId}/${r.id}`);
    await p.getByRole('button',{name:'转办',exact:true}).click();let d=p.getByRole('dialog',{name:'转办任务',exact:true});await d.getByRole('combobox',{name:'新处理人'}).click();await p.getByRole('option',{name:/uat_target/}).click();await d.getByLabel('转办原因').fill('当前处理人转办');await credentials(d,'reviewer');await d.getByRole('button',{name:'签署并转办',exact:true}).click();await p.getByText('转办成功',{exact:true}).waitFor();
    assert.equal(sql(`SELECT assignee_id FROM workflow_task WHERE id=${r.taskId}`),users.target);
    const old=await api('reviewer','POST',`/record-control/workflow-tasks/${r.taskId}/approve`,{opinion:'旧处理人拒绝验证',account:'uat_reviewer',password:signPassword},false);assert.notEqual(old.code,200);
    await reassign(r.workflow_instance_id,r.request_no,'reviewer');await requestDecision(r,'reviewer');
    assert.equal(sql(`SELECT status FROM record_control_request WHERE id=${r.id}`),'APPROVED');assert.equal(sql(`SELECT values_json::jsonb->>'qty' FROM form_instance_record WHERE id=${c.recordId}`),'120');await screenshot('record-transfer-reassign-approve');
  });
  await step('return-finishes-old-request-and-requires-new-number',async()=>{
    const c=cases.RETURN,r=await submitRequest(c);const original=sql(`SELECT current_revision_id FROM form_instance_record WHERE id=${c.recordId}`);await requestDecision(r,'reviewer',false);
    assert.equal(sql(`SELECT status FROM record_control_request WHERE id=${r.id}`),'RETURNED');assert.equal(sql(`SELECT current_revision_id FROM form_instance_record WHERE id=${c.recordId}`),original);
    c.request=await submitRequest(c,'CHANGE',122);assert.notEqual(c.request.request_no,r.request_no);await requestDecision(c.request,'reviewer');
  });
  await step('change-effective-frozen-history-current-contribution-and-notice',async()=>{
    const c=cases.CHANGE,frozen=sql(`SELECT md5(to_jsonb(v)::text) FROM dhr_summary_version v WHERE id=${c.versionId}`),r=await submitRequest(c,'CHANGE',135);await requestDecision(r,'reviewer');
    assert.equal(sql(`SELECT md5(to_jsonb(v)::text) FROM dhr_summary_version v WHERE id=${c.versionId}`),frozen);assert.equal(sql(`SELECT values_json::jsonb->>'qty' FROM form_instance_record WHERE id=${c.recordId}`),'135');
    assert.equal(sql(`SELECT count(*) FROM dhr_evidence_impact WHERE record_id=${c.recordId}`),'1');assert.equal(sql(`SELECT count(*) FROM dhr_impact_notification n JOIN dhr_evidence_impact i ON i.id=n.impact_id WHERE i.record_id=${c.recordId}`),'1');
    const notices=await api('applicant','GET','/dhr-impact-notifications?page=0');assert.ok(JSON.stringify(notices).includes(c.instanceNo));
    const others=await api('target','GET','/dhr-impact-notifications?page=0');assert.ok(!JSON.stringify(others).includes(c.instanceNo));
    await go('applicant','/records/requests/'+r.id);await screenshot('changed-revision-history');
    const p=sessions.applicant.page;await p.getByRole('button',{name:/^通知，/}).click();const popup=p.getByRole('dialog',{name:'DHR 证据变更提醒',exact:true});await popup.getByText(new RegExp(c.instanceNo)).waitFor();await popup.getByRole('button',{name:'标为已读 DHR-'+c.objectNo+' V1',exact:true}).click();
    assert.equal(sql(`SELECT count(*) FROM dhr_impact_notification n JOIN dhr_evidence_impact i ON i.id=n.impact_id WHERE i.record_id=${c.recordId} AND n.read_at IS NOT NULL`),'1');await screenshot('personal-impact-notification');
  });
  await step('formalized-dhr-revision-creates-draft-and-old-body-remains-readable',async()=>{
    const c=cases.CHANGE,frozen=sql(`SELECT md5(to_jsonb(v)::text) FROM dhr_summary_version v WHERE id=${c.versionId}`),p=await openSummary(c,true);
    await p.getByRole('button',{name:'发起修订',exact:true}).click();const d=p.getByRole('dialog').last();await d.getByLabel('操作意见').fill('变更生效后基于最新定版重新整理');
    const response=p.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/summary/reorganize'));await d.getByRole('button',{name:'确认',exact:true}).click();const result=await (await response).json();assert.equal(result.code,200,JSON.stringify(result));
    assert.equal(sql(`SELECT summary_status FROM dhr_instance WHERE id=${c.dhrId}`),'DRAFT');assert.equal(sql(`SELECT md5(to_jsonb(v)::text) FROM dhr_summary_version v WHERE id=${c.versionId}`),frozen);
    await p.getByLabel('档案版本',{exact:true}).click();await p.getByRole('option',{name:'V1 · 已通过',exact:true}).click();
    const historical=await api('applicant','GET',`/dhr-instances/${c.dhrId}/summary/versions/${c.versionId}`);assert.equal(historical.version.candidates.find(r=>r.id===c.recordId).fieldValues.qty,100);await screenshot('formalized-revision-old-v1');
  });
  await step('obsolete-effective-and-frozen-version-remains-original',async()=>{
    const c=cases.VOID,frozen=sql(`SELECT md5(to_jsonb(v)::text) FROM dhr_summary_version v WHERE id=${c.versionId}`),r=await submitRequest(c,'OBSOLETE');await requestDecision(r,'reviewer');
    assert.equal(sql(`SELECT status FROM form_instance_record WHERE id=${c.recordId}`),'OBSOLETE');assert.equal(sql(`SELECT md5(to_jsonb(v)::text) FROM dhr_summary_version v WHERE id=${c.versionId}`),frozen);await screenshot('obsolete-effective');
    const p=await go('applicant','/dhr-management/filling');await p.getByLabel('DHR 状态',{exact:true}).click();await p.getByRole('option',{name:'全部',exact:true}).click();await p.getByLabel('关键词',{exact:true}).fill(c.objectNo);await p.getByRole('button',{name:'查询',exact:true}).click();await p.getByRole('button',{name:'打开 DHR 填报 DHR-'+c.objectNo,exact:true}).click();
    await p.getByRole('button',{name:'DHR 查看选项',exact:true}).click();await p.getByRole('menuitemcheckbox',{name:/显示作废表单/}).click();await p.getByText(c.instanceNo,{exact:false}).first().waitFor();await screenshot('obsolete-low-frequency-view');
  });
  await step('dhr-pending-blocks-change-then-native-return-allows-request',async()=>{
    const c=cases['DHR-CYCLE'],p=await go('applicant','/records/change');await p.getByLabel('表单实例编号',{exact:true}).fill(c.instanceNo);await p.getByRole('button',{name:'查询',exact:true}).click();await p.getByRole('button',{name:'表单变更',exact:true}).waitFor();
    const source=await api('applicant','GET','/record-control/records/by-number?instanceNo='+c.instanceNo);
    const refused=await api('applicant','POST','/record-control/requests',{requestType:'CHANGE',instanceNo:c.instanceNo,sourceRevisionId:source.current_revision_id,proposedValues:{...source.fieldValues,qty:125},reason:'在审拒绝验证',workflowDefinitionId:'883010000200',workflowVersionId:'883010000201',account:'uat_applicant',password:signPassword,idempotencyKey:crypto.randomUUID()},false);assert.notEqual(refused.code,200);assert.match(refused.message,/DHR.*审批/);
    await dhrDecision(c,'reviewer',false);assert.equal(sql(`SELECT summary_status FROM dhr_instance WHERE id=${c.dhrId}`),'DRAFT');c.request=await submitRequest(c,'CHANGE',125);
    const w=await api('applicant','GET',`/dhr-instances/${c.dhrId}/summary`);const submit=await api('applicant','POST',`/dhr-instances/${c.dhrId}/summary/submit`,{expectedDraftId:w.draft.id,expectedRevision:w.draft.revision,manualReview:{qualityAndExceptionsReviewed:true,sourceSignaturesReviewed:true,completeScopeReviewed:true,note:'在审阻断验证'}},false);assert.notEqual(submit.code,200);assert.match(submit.message,/审批中的变更或作废/);await requestDecision(c.request,'reviewer');
  });
  await step('native-summary-resubmit-v2-signed-dhr-reassign-and-native-approval-with-audit',async()=>{
    const c=cases['DHR-CYCLE'],frozen=sql(`SELECT md5(to_jsonb(v)::text) FROM dhr_summary_version v WHERE id=${c.versionId}`),p=await openSummary(c);
    await p.getByRole('button',{name:'提交汇总',exact:true}).click();const d=p.getByRole('dialog').last();for(const label of ['确认质量结论与异常处置已核查','确认源表单签署已核查','确认完整证据范围已核查'])await d.getByRole('checkbox',{name:label,exact:true}).check();await d.getByLabel('核查说明').fill('对变更后的当前修订重新核查');
    const response=p.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/summary/submit'));await d.getByRole('button',{name:'确认并提交',exact:true}).click();const result=await (await response).json();assert.equal(result.code,200,JSON.stringify(result));c.latestVersionId=result.data.id;
    assert.equal(result.data.versionNo,2);const wf=sql(`SELECT workflow_instance_id FROM dhr_summary_review WHERE summary_version_id=${c.latestVersionId}`);await reassign(wf,'DHR-'+c.objectNo+' · V2','target');
    const tasks=await api('target','GET','/dhr-reviews?view=PENDING&page=0&size=100&keyword='+encodeURIComponent(c.objectNo));c.latestTask=tasks.content.find(x=>x.dhrId===c.dhrId);assert.ok(c.latestTask);
    assert.notEqual((await api('reviewer','GET','/dhr-reviews/'+c.latestTask.id,undefined,false)).code,200);
    await dhrDecision(c,'target',true);assert.equal(sql(`SELECT summary_status FROM dhr_instance WHERE id=${c.dhrId}`),'FORMALIZED');assert.equal(sql(`SELECT md5(to_jsonb(v)::text) FROM dhr_summary_version v WHERE id=${c.versionId}`),frozen);
    const audit=await api('target','GET',`/dhr-reviews/${c.latestTask.id}/audit?page=0`);assert.ok(audit.events.some(x=>x.action==='REASSIGN'&&JSON.parse(x.after).assigneeId===users.target));
    const all=await api('applicant','GET',`/dhr-instances/${c.dhrId}/summary/audit?page=0`);assert.ok(all.events.some(x=>x.action==='REASSIGN'));
    const q=await go('target','/dhr-management/review');await q.getByRole('tab',{name:'我的已审',exact:true}).click();await q.getByLabel('关键词',{exact:true}).fill(c.objectNo);await q.getByRole('button',{name:'查询',exact:true}).click();await q.getByRole('cell',{name:'DHR-'+c.objectNo,exact:true}).click();await q.getByRole('tab',{name:'数据审计',exact:true}).click();await q.getByRole('button',{name:/重新分配/}).click();await q.getByText('签署人',{exact:true}).filter({visible:true}).first().waitFor();await screenshot('dhr-v2-domain-audit');
  });
  await step('ordinary-form-real-fill-save-submit-transfer-reassign-and-sign-approve',async()=>{
    const c0=cases.FORM,fill=await go('applicant','/dhr-management/filling');await fill.getByLabel('DHR 状态',{exact:true}).click();await fill.getByRole('option',{name:'全部',exact:true}).click();await fill.getByLabel('关键词',{exact:true}).fill(c0.objectNo);await fill.getByRole('button',{name:'查询',exact:true}).click();await fill.getByRole('button',{name:'打开 DHR 填报 DHR-'+c0.objectNo,exact:true}).click();await fill.getByRole('dialog').first().getByPlaceholder('报工数量',{exact:true}).fill('0');await fill.getByRole('dialog').first().getByRole('button',{name:'保存',exact:true}).click();await fill.getByText('表单操作已保存',{exact:true}).waitFor();assert.equal(sql(`SELECT jsonb_typeof(values_json::jsonb->'qty')||':'||(values_json::jsonb->>'qty') FROM form_instance_record WHERE id=${c0.recordId}`),'number:0');
    const c=cases.FORM,p=await go('applicant','/form-management/filling');await p.getByLabel('关键词',{exact:true}).fill(c.instanceNo);await p.getByRole('button',{name:'查询',exact:true}).click();let row=p.getByRole('row').filter({has:p.getByRole('cell',{name:c.instanceNo,exact:true})});await row.getByRole('button',{name:'进入填报',exact:true}).click();
    let d=p.getByRole('dialog').first();const number=d.getByPlaceholder('报工数量',{exact:true});await number.fill('');await number.pressSequentially('1.25');assert.equal(await number.inputValue(),'1.25');await d.getByRole('button',{name:'保存',exact:true}).click();await p.getByText('草稿已保存',{exact:true}).waitFor();
    assert.equal(sql(`SELECT jsonb_typeof(values_json::jsonb->'qty')||':'||(values_json::jsonb->>'qty') FROM form_instance_record WHERE id=${c.recordId}`),'number:1.25');await d.getByRole('button',{name:'提交',exact:true}).click();await p.getByText('提交成功',{exact:true}).waitFor();
    const old=await go('reviewer','/form-management/review');await old.getByLabel('关键词',{exact:true}).fill(c.instanceNo);await old.getByRole('button',{name:'查询',exact:true}).click();row=old.getByRole('row').filter({has:old.getByRole('cell',{name:c.instanceNo,exact:true})});await row.getByRole('button',{name:'转办',exact:true}).click();d=old.getByRole('dialog');await d.getByRole('combobox',{name:/新处理人|转办给/}).click();await old.getByRole('option',{name:/uat_target/}).click();await d.getByLabel('转办原因').fill('普通表单当班处理人转办');await d.getByRole('button',{name:'确认转办',exact:true}).click();await old.getByText(/已转办给/).waitFor();
    await reassign('form-'+c.recordId,c.instanceNo,'reviewer');let r=await go('reviewer','/form-management/review');await r.getByLabel('关键词',{exact:true}).fill(c.instanceNo);await r.getByRole('button',{name:'查询',exact:true}).click();row=r.getByRole('row').filter({has:r.getByRole('cell',{name:c.instanceNo,exact:true})});await row.getByRole('button',{name:'处理审批',exact:true}).click();d=r.getByRole('dialog').first();await d.getByRole('button',{name:'退回',exact:true}).click();let sign=r.getByRole('dialog').last();await sign.getByLabel('处理意见').fill('退回重填验证旧改派不泄漏到下一轮');await sign.getByRole('button',{name:'确认',exact:true}).click();await r.getByText('退回成功',{exact:true}).waitFor();
    assert.equal(sql(`SELECT state_json::jsonb#>>'{operations,op,forms,form,transferAssignees,review}' FROM production_execution WHERE object_id=${c.objectId}`),'');
    const again=await go('applicant','/form-management/filling');await again.getByLabel('关键词',{exact:true}).fill(c.instanceNo);await again.getByRole('button',{name:'查询',exact:true}).click();await again.getByRole('row').filter({has:again.getByRole('cell',{name:c.instanceNo,exact:true})}).getByRole('button',{name:'进入填报',exact:true}).click();await again.getByRole('dialog').first().getByRole('button',{name:'提交',exact:true}).click();await again.getByText('提交成功',{exact:true}).waitFor();
    r=await go('reviewer','/form-management/review');await r.getByLabel('关键词',{exact:true}).fill(c.instanceNo);await r.getByRole('button',{name:'查询',exact:true}).click();
    await r.getByRole('row').filter({has:r.getByRole('cell',{name:c.instanceNo,exact:true})}).getByRole('button',{name:'处理审批',exact:true}).click();
    d=r.getByRole('dialog').first();await d.getByPlaceholder('报工数量',{exact:true}).fill('2.5');await d.getByRole('button',{name:'审批并签署',exact:true}).click();
    sign=r.getByRole('dialog').last();await credentials(sign,'reviewer');await sign.getByRole('button',{name:'确认',exact:true}).click();await r.getByText('审批成功',{exact:true}).waitFor();
    assert.equal(sql(`SELECT status||':'||jsonb_typeof(values_json::jsonb->'qty')||':'||(values_json::jsonb->>'qty') FROM form_instance_record WHERE id=${c.recordId}`),'COMPLETED:number:2.5');assert.ok(Number(sql(`SELECT count(*) FROM audit_event WHERE entity_type='PRODUCTION_EXECUTION' AND entity_id='${c.objectId}' AND action='REASSIGN'`))>0);
    const view=await api('manager','GET','/workflow/operations/instances/form-'+c.recordId);assert.equal(view.status,'COMPLETED');assert.ok(view.logs.some(x=>x.action==='TASK_REASSIGN'));
    const auditPage=await go('applicant','/form-management/list');await auditPage.getByLabel('关键词',{exact:true}).fill(c.instanceNo);await auditPage.getByRole('button',{name:'查询',exact:true}).click();await auditPage.getByRole('cell',{name:c.instanceNo,exact:true}).click();await auditPage.getByRole('tab',{name:'数据审计',exact:true}).click();await auditPage.getByRole('button',{name:/重新分配/}).click();await auditPage.getByText('签署人',{exact:true}).filter({visible:true}).first().waitFor();await screenshot('ordinary-form-domain-audit');
  });
  assert.deepEqual(errors,[]);assert.deepEqual(mainIntegrity(),before);console.log('PASS main-data-preserved');
} catch(error) {console.error(error.stack);process.exitCode=1;}
finally {await save();if(browser)await browser.close();}
