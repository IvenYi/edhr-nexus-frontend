import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { build } from 'esbuild';

const root=path.resolve(import.meta.dirname,'..');
const temporary=await mkdtemp(path.join(os.tmpdir(),'edhr-document-read-'));
const baseline=process.env.DOCUMENT_READ_BASELINE_COMMIT;
if(baseline&&!/^[0-9a-f]{40}$/.test(baseline))throw new Error('baseline must be a complete SHA');
let parse,createDocument,serialize;
try {
  const outfile=path.join(temporary,'document.cjs');
  await build({absWorkingDir:root,stdin:{resolveDir:root,loader:'ts',contents:`
    export {parseReactTemplateDesignerDocument as parse,createEmptyTemplateDesignerDocument as createDocument,
      serializeTemplateDesignerDocument as serialize} from './src/pages/master-data/template-designer-react/utils/document';
  `},outfile,bundle:true,platform:'node',format:'cjs',alias:{'@':path.join(root,'src')},logLevel:'silent',
  plugins:baseline?[{name:'original-document-runtime',setup(plugin){plugin.onLoad({filter:/\/utils\/document\.ts$/},args=>({
    contents:execFileSync('git',['show',baseline+':gmp-platform/frontend/'+path.relative(root,args.path)],{cwd:root,encoding:'utf8'}),loader:'ts',resolveDir:path.dirname(args.path)}));}}]:[]});
  ({parse,createDocument,serialize}=createRequire(import.meta.url)(outfile));
} finally {await rm(temporary,{recursive:true,force:true});}

const row={id:'read-template',name:'读取保护'};
const meta={schema:'edhr-template-designer-react',version:1,templateId:row.id,versionId:'read-version',templateName:row.name,versionLabel:'V1'};
const wrap=payload=>JSON.stringify({schema:meta.schema,version:1,payload});
const strict=version=>parse(row,{id:meta.versionId,version:'V1',...version},{forEditing:true});

test('current document retains all three slices, field/page identities, bindings and zero through an editing read',()=>{
  const doc=createDocument(meta);
  doc.model.fields=[{id:'stable-field',code:'value',name:'数量',type:'number',sortOrder:1,status:'enabled',groupId:'default-group',typeConfig:{min:0,precision:2}}];
  doc.model.projection={version:'form-projection-v1',bindings:[{id:'trace',enabled:true,modelId:'formTrace',sources:{lookup:'stable-field'}}]};
  doc.canvas.pages[0].cells={'1:1':{value:0}};
  doc.workflow={nodes:[{id:'start',type:'START',position:{x:0,y:0},data:{label:'开始'}}],edges:[],config:{description:'原流程'}};
  const source=serialize(doc),before=JSON.stringify(source),result=strict(source);
  assert.equal(result.model.fields[0].id,'stable-field');assert.equal(result.canvas.pages[0].id,doc.canvas.pages[0].id);
  assert.equal(result.canvas.pages[0].cells['1:1'].value,0);assert.deepEqual(result.model.projection,doc.model.projection);
  assert.deepEqual(result.workflow,doc.workflow);assert.equal(JSON.stringify(source),before);
  assert.deepEqual(serialize(strict(serialize(result))),serialize(result));
});

for(const empty of [undefined,null,'','   ']) test(`empty source ${JSON.stringify(empty)} remains an editable initial draft`,()=>{
  const result=strict({modelDesignJson:empty,canvasDesignJson:empty,workflowDesignJson:empty});
  assert.equal(result.meta.versionId,meta.versionId);assert.deepEqual(result.model.fields,[]);
  assert.equal(result.canvas.pages.length,1);assert.deepEqual(result.workflow.nodes,[]);
});
test('the three exact API empty initial formats remain usable without migrating them',()=>{
  const result=strict({modelDesignJson:'{"fields":[]}',canvasDesignJson:'{"layers":[]}',workflowDesignJson:'{"nodes":[],"edges":[]}'});
  assert.equal(result.canvas.pages.length,1);assert.deepEqual(result.model.fields,[]);assert.deepEqual(result.workflow.edges,[]);
});
test('empty objects and empty current payloads remain incomplete drafts',()=>{
  for(const value of ['{}',wrap({})]) assert.doesNotThrow(()=>strict({modelDesignJson:value,canvasDesignJson:value,workflowDesignJson:value}));
});

const invalid=[
  ['model syntax','modelDesignJson','{"fields":'],['canvas syntax','canvasDesignJson','{"pages":'],['workflow syntax','workflowDesignJson','{"nodes":'],
  ['unknown schema','modelDesignJson',JSON.stringify({schema:'future-designer',version:1,payload:{fields:[]}})],
  ['unsupported version','canvasDesignJson',JSON.stringify({schema:meta.schema,version:2,payload:{pages:[]}})],
  ['missing version','modelDesignJson',JSON.stringify({schema:meta.schema,payload:{fields:[]}})],
  ['null payload','modelDesignJson',wrap(null)],['array payload','canvasDesignJson',wrap([])],
  ['missing payload','workflowDesignJson',JSON.stringify({schema:meta.schema,version:1})],
  ['literal null','modelDesignJson','null'],['array root','canvasDesignJson','[]'],
  ['model fields shape','modelDesignJson',wrap({fields:{unexpected:'field'}})],
  ['model groups shape','modelDesignJson',wrap({groups:'not-an-array'})],
  ['canvas pages shape','canvasDesignJson',wrap({pages:{unexpected:'page'}})],
  ['canvas null page','canvasDesignJson',wrap({pages:[null]})],
  ['workflow nodes shape','workflowDesignJson',wrap({nodes:'not-an-array'})],
  ['workflow edges shape','workflowDesignJson',wrap({edges:{}})],
  ['unsupported nonempty bare model','modelDesignJson','{"fields":[{"id":"do-not-erase"}]}'],
];
for(const [name,key,value] of invalid) test(`editing rejects ${name} instead of substituting an empty document`,()=>{
  assert.throws(()=>strict({[key]:value}));
});

test('the default read-only parser retains its existing compatibility behavior',()=>{
  const result=parse(row,{id:'readonly',version:'V1',modelDesignJson:'{"fields":[{"id":"legacy"}]}' });
  assert.deepEqual(result.model.fields,[]);assert.equal(result.meta.versionId,'readonly');
});
test('editing validation parses each persisted slice at most once',()=>{
  const source=serialize(createDocument(meta)),texts=new Set(Object.values(source));
  const original=JSON.parse;let calls=0;
  JSON.parse=(text,...args)=>{if(texts.has(text))calls++;return original(text,...args);};
  try {strict(source);} finally {JSON.parse=original;}
  assert.ok(calls<=3,`read parsed the three slices ${calls} times`);
});

for(const type of ['future-number',42,{},[], 'constructor','toString','__proto__']) test(`editing rejects unsupported explicit field type ${JSON.stringify(type)} before it can be saved as text`,()=>{
  const source={modelDesignJson:wrap({fields:[{id:'keep-field',type,typeConfig:{custom:'keep-config'}}]})};
  const before=JSON.stringify(source);
  assert.throws(()=>strict(source));assert.equal(JSON.stringify(source),before);
});

test('all current and explicitly mapped legacy field types remain editable',()=>{
  const types=['text','number','datetime','signature','attachment','image','singleSelect','multiSelect','reference','subTable'];
  const legacy={input:'text',link:'text',textarea:'text',inputnumber:'number',inputdouble:'number',datepicker:'datetime',datetimepicker:'datetime',timepicker:'datetime',radio:'singleSelect',select:'singleSelect',switch:'singleSelect',checkbox:'multiSelect',userpicker:'reference',department:'reference','sub-table':'subTable',readonlycmp:'text'};
  for(const [type,expected] of [...types.map(type=>[type,type]),...Object.entries(legacy)]){
    const result=strict({modelDesignJson:wrap({fields:[{id:'keep-field',type,typeConfig:{custom:'keep-config'}}]})});
    assert.equal(result.model.fields[0].type,expected);assert.equal(result.model.fields[0].id,'keep-field');
    assert.equal(result.model.fields[0].typeConfig.custom,'keep-config');
  }
});

test('missing and blank field types keep incomplete-draft defaults',()=>{
  for(const type of [undefined,null,'','   ']){
    const result=strict({modelDesignJson:wrap({fields:[{id:'draft-field',type}]})});
    assert.equal(result.model.fields[0].type,'text');assert.equal(result.model.fields[0].id,'draft-field');
  }
});

test('unknown field types retain the existing read-only fallback without altering source JSON',()=>{
  const source={id:'readonly',version:'V1',modelDesignJson:wrap({fields:[{id:'unknown-field',type:'future-number'}]})};
  const before=JSON.stringify(source),result=parse(row,source);
  assert.equal(result.model.fields[0].type,'text');assert.equal(JSON.stringify(source),before);
});
