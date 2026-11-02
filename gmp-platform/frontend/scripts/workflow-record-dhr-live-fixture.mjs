import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

export const database = process.env.WORKFLOW_LIVE_DATABASE;
export const base = process.env.WORKFLOW_LIVE_URL;
if (!/^edhr_record_control_test_closure_e2e_[a-z0-9_]+$/.test(database || '')
  || !/^http:\/\/(localhost|127\.0\.0\.1):13002$/.test(base || '')) throw new Error('Explicit disposable database and dedicated 13002 frontend are required');
export const sql = query => execFileSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-d', database, '-At', '-c', query], { encoding: 'utf8' }).trim();
if (sql('SELECT current_database()') !== database) throw new Error('Wrong fixture database');
const literal = value => "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";
const row = (table, id) => JSON.parse(sql(`SELECT to_jsonb(t) FROM ${table} t WHERE id=${id}`));
const clone = (table, source, changes) => `INSERT INTO ${table} SELECT (jsonb_populate_record(NULL::${table},(SELECT to_jsonb(t) FROM ${table} t WHERE id=${source})||${literal(changes)})).*`;
const now = '2026-11-03T00:00:00';
export const users = { applicant: '883010000001', reviewer: '883010000002', target: '883010000003', manager: '883010000004' };
export const loginPassword = 'Uat1030!Pass', signPassword = 'Uat1030!Sign';
const canvas = { schema: 'edhr-template-designer-react', version: 1, payload: { currentPageId: 'p1', pages: [{ id: 'p1', name: '闭环验收表单',
  nodes: ['value', 'qty', 'unit', 'note'].map((fieldId, index) => ({ id: 'node-' + fieldId, type: fieldId === 'qty' ? 'inputnumber' : 'input',
    props: { label: ['物料批号','报工数量','单位','备注'][index], placeholder: ['物料批号','报工数量','单位','备注'][index] },
    style: { position: 'absolute', cellRange: { t: index * 2 + 1, l: 1, b: index * 2 + 2, r: 6 } }, bindings: { fieldId, displayLabel: ['物料批号','报工数量','单位','备注'][index] } })),
  sheet: { rowCount: 12, columnCount: 8, defaultRowHeight: 36, defaultColumnWidth: 98, rowHeights: Array(12).fill(36), columnWidths: Array(8).fill(98), showGridLines: true, canvasMode: 'sheet', paperMode: 'table' }, cells: {}, mergedCells: [], medias: [], images: [] }] } };

export function prepareFixture() {
  if (sql("SELECT count(*) FROM production_object WHERE object_no LIKE 'E2E-CLOSURE-%'") !== '0') throw new Error('Fixture already used; restore the owned disposable clone before rerunning');
  const statements=[];
  // All grants are restricted to accounts in this disposable database clone.
  const permissions = ['form-management.filling', 'form-management.review', 'form-instances.view', 'workflow.logs', 'records.dhr-filling', 'dhr.filling.act'];
  permissions.forEach((code,i) => [883010000030,883010000031].forEach((role,j) => statements.push(`INSERT INTO role_permission(id,role_id,permission_id) SELECT ${883020090000+i*10+j},${role},p.id FROM permission p WHERE p.code='${code}' AND NOT EXISTS(SELECT 1 FROM role_permission rp WHERE rp.role_id=${role} AND rp.permission_id=p.id)`)));
  const orderId = '883020000108';
  statements.push(clone('work_order',883010000108,{id:orderId,order_no:'E2E-CLOSURE-WO',status:'IN_PROCESS',planned_quantity:700,created_at:now,updated_at:now}));
  const original = row('form_instance_record',883010002000);
  const originalRevision = row('form_instance_revision',original.current_revision_id);
  const execution = JSON.parse(sql('SELECT to_jsonb(e) FROM production_execution e WHERE object_id=883010001000'));
  const cases = [];
  for (const [index,code] of ['WITHDRAW','TRANSFER','RETURN','CHANGE','VOID','DHR-CYCLE','FORM'].entries()) {
    const objectId=String(883020001000+index), recordId=String(883020002000+index), revisionId=String(883020003000+index), dhrId=String(883020004000+index);
    const objectNo='E2E-CLOSURE-'+code, instanceNo='FR-E2E-CLOSURE-'+code;
    statements.push(clone('production_object',883010001000,{id:objectId,work_order_id:orderId,object_no:objectNo,status:index===6?'IN_PROGRESS':'COMPLETED',created_at:now,updated_at:now}));
    const snapshot=JSON.parse(execution.snapshot_json), state=JSON.parse(execution.state_json);
    Object.assign(snapshot.context,{workOrderId:orderId,workOrderNo:'E2E-CLOSURE-WO',objectNo,objectId});
    const form=snapshot.operations[0].forms[0]; form.name='闭环验收·'+code; form.canvas=JSON.stringify(canvas);
    const progress=state.operations.op.forms.form; progress.instanceNo=instanceNo;
    state.history=[]; state.operations.op.status=index===6?'IN_PROGRESS':'COMPLETED';
    if (index===6) {
      form.flow={nodes:[{id:'fill',data:{kind:'START',label:'填写'}},{id:'review',data:{kind:'APPROVAL',label:'闭环复核',config:{approverSubjects:[{type:'USER',id:users.reviewer}],buttonEvents:[{action:'APPROVE',event:'BEFORE',signatureMethod:'ACCOUNT_PASSWORD'}]}}},{id:'end',data:{kind:'END',label:'结束'}}],edges:[{id:'a',source:'fill',target:'review'},{id:'b',source:'review',target:'end'}]};
      Object.assign(progress,{status:'ACTIVE',active:['fill'],done:[],approvers:{},restrictedApprovers:{},transferAssignees:{}});
    }
    statements.push(clone('form_instance_record',original.id,{id:recordId,object_id:objectId,object_no:objectNo,instance_no:instanceNo,work_order_id:orderId,work_order_no:'E2E-CLOSURE-WO',snapshot_json:JSON.stringify(form),status:index===6?'ACTIVE':'COMPLETED',current_revision_id:null,active_request_id:null,created_at:now,updated_at:now,created_by_id:users.applicant}));
    if(index!==6) { statements.push(clone('form_instance_revision',originalRevision.id,{id:revisionId,record_id:recordId,request_id:null,revision_no:1,created_at:now})); statements.push(`UPDATE form_instance_record SET current_revision_id=${revisionId} WHERE id=${recordId}`); }
    statements.push(`INSERT INTO production_execution(object_id,snapshot_json,state_json,revision,started_at,updated_at) VALUES(${objectId},${literal(snapshot)}::text,${literal(state)}::text,0,'${now}','${now}')`);
    if([3,4,5,6].includes(index)) statements.push(clone('dhr_instance',883010004004,{id:dhrId,dhr_no:'DHR-'+objectNo,production_object_id:objectId,object_no:objectNo,work_order_id:orderId,work_order_no:'E2E-CLOSURE-WO',summary_status:'NOT_STARTED',created_at:now,updated_at:now}));
    cases.push({code,objectId,objectNo,recordId,instanceNo,dhrId:[3,4,5,6].includes(index)?dhrId:null});
  }
  sql('BEGIN;'+statements.join(';')+';COMMIT;');
  return { database, base, cases };
}

export function mainIntegrity() {
  const tables=['record_control_request','form_instance_record','form_instance_revision','production_execution','dhr_instance','dhr_summary_version','dhr_summary_review','workflow_instance','workflow_task'];
  return Object.fromEntries(tables.map(table=>[table,execFileSync('psql',['-X','-d','edhr_dev','-At','-c',`SELECT count(*)||':'||md5(COALESCE(string_agg(to_jsonb(t)::text,'' ORDER BY ${table==='production_execution'?'object_id':table==='dhr_summary_review'?'summary_version_id':'id'}),'')) FROM ${table} t`],{encoding:'utf8'}).trim()]));
}
if(process.argv.includes('--prepare')) {
  const manifest=prepareFixture(); writeFileSync(process.env.WORKFLOW_LIVE_MANIFEST,JSON.stringify(manifest,null,2)+'\n'); console.log(JSON.stringify(manifest));
}
