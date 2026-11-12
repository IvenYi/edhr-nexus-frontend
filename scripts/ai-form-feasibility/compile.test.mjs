import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { out, json, loadDesigner, compile, preserveProtocol } from './common.mjs';
import { assessDraft } from './assess.mjs';
const designer = await loadDesigner();
const sample = await json('samples/clean.json');
const {lookupItems} = await json('catalog.json');
const field = {key:'good',label:'合格数量',type:'number',source:'D8',range:'E8:I8',config:{numberMode:'integer',precision:0}};
const draft = {name:'测试',fields:[field],bindings:[],questions:[],skipped:[]};
test('compiler preserves original cells and produces the native document envelope',()=>{
  const {document,payload,errors} = compile(draft,sample,designer,lookupItems);
  assert.deepEqual(errors,[]);
  assert.deepEqual(document.canvas.pages[0].cells,sample.page.cells);
  assert.equal(document.canvas.pages[0].nodes[0].bindings.fieldId,'good');
  assert.equal(JSON.parse(payload.modelDesignJson).payload.fields[0].id,'good');
  assert.equal(sample.page.nodes.length,0);
});
test('invalid source, out-of-sheet ranges and duplicate field keys are rejected',()=>{
  for (const bad of [{...field,range:'A500'},{...field,source:'J37'}]) assert.ok(compile({...draft,fields:[bad]},sample,designer,lookupItems).errors.length);
  assert.ok(compile({...draft,fields:[field,field]},sample,designer,lookupItems).errors.length);
});
test('unsupported source catalog and dangling binding are rejected',()=>{
  assert.ok(compile({...draft,fields:[{...field,type:'reference',config:{sourceType:'arbitrary'}}]},sample,designer,lookupItems).errors.length);
  assert.ok(compile({...draft,bindings:[{modelId:'production',sources:{goodQuantity:'missing'}}]},sample,designer,lookupItems).errors.length);
});
test('assessment does not count an empty proposal as success and detects covered labels',()=>{
  const empty = assessDraft({...draft,fields:[]},'clean',sample);
  assert.equal(empty.matchedSlots,0); assert.equal(empty.coreBinding,false);
  const bad = assessDraft({...draft,fields:[{...field,range:'D8:E8'}]},'clean',sample);
  assert.ok(bad.simpleLabelOverlaps.some(x=>x.labelCell==='D8'));
});
test('unsupported fractional placement and intersecting native grid fields cannot be saved',()=>{
  const fraction = compile({...draft,fields:[{...field,box:{x:0,y:0,w:0.5,h:0.5}}]},sample,designer,lookupItems);
  assert.ok(fraction.errors.some(e=>e.includes('不支持分数区域')));
  const overlap = compile({...draft,fields:[field,{...field,key:'second'}]},sample,designer,lookupItems);
  assert.ok(overlap.errors.some(e=>e.includes('同一单元格区域')));
});
test('protocol is immutable across reruns and a mismatch preserves the original bytes',async()=>{
  const name = 'local/protocol-test-'+randomUUID()+'.json';
  try {
    await preserveProtocol(name,{version:1,model:'test'});
    const before = await readFile(out+'/'+name,'utf8');
    await preserveProtocol(name,{model:'test',version:1});
    await assert.rejects(preserveProtocol(name,{version:2,model:'test'}),/拒绝覆盖旧证据/);
    assert.equal(await readFile(out+'/'+name,'utf8'),before);
  } finally { await unlink(out+'/'+name); }
});
