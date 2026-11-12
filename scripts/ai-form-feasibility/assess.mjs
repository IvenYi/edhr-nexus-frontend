// Independent checks, never imported by run.mjs or sent to the provider.
import { readdir } from 'node:fs/promises';
import { out, json, save, range, login, api } from './common.mjs';

const slots = { clean: [], label: [], scrap: [] };
const add = (sample, source, types, options = {}) => slots[sample].push({ source, types: types.split('|'), ...options });
for (const [source, types] of [['A4','text|reference'],['E4','text|reference'],['H4','number'],['A5','text|reference'],['E5','text|reference'],['D8','number'],['D9','number'],['D10','text|reference'],['D11','number'],['D12','signature|reference'],['D13','signature|reference'],['D14','datetime'],['D15','text|reference'],['A19','signature|reference'],['F19','datetime']]) add('clean',source,types);
for (const [source, types] of [['A5','text|reference'],['E5','number'],['H5','text'],['A6','text|reference'],['E6','datetime']]) add('label',source,types);
for (const start of [8,12,16,20]) for (const [col,types] of [['A','text|reference'],['D','reference|signature|text'],['E','reference|signature|text'],['F','number'],['G','reference|signature|text'],['H','number'],['I','reference|signature|text'],['J','reference|signature|text'],['K','number'],['L','number'],['M','text']]) add('label',col+'7',types,{start,end:start+3});
add('label','L24','signature|reference|text');
for (const source of ['B32','G32','L32','B42','G42','L42','D53','L53']) add('label',source,'attachment|image');
for (const source of ['A37','F37','K37','A47','F47','K47','A58','K58']) add('label',source,'datetime');
add('label','K59','signature|reference|text');
for (const [source,types] of [['A5','text'],['F5','text|reference'],['A6','reference|text'],['F6','text|reference'],['A7','text|reference'],['F7','number']]) add('scrap',source,types);
for (const [source,types,labelPattern] of [['A8','text|reference','原因'],['A8','signature|reference','申请'],['A8','datetime','申请|日期'],['A9','signature|reference','批准|代表'],['A9','datetime','批准|代表|日期'],['A10','text','结果'],['A10','attachment|image','照片|附件'],['A10','signature|reference','处理'],['A10','datetime','处理'],['A10','signature|reference','财务'],['A10','datetime','财务']]) add('scrap',source,types,{labelPattern});

export function assessDraft(draft, sampleId, sample) {
  const used = new Set(), matched = [], missing = [];
  for (const slot of slots[sampleId]) {
    const field = draft.fields.find(f => {
      const cell = range(f.range);
      return !used.has(f.key) && f.source === slot.source && slot.types.includes(f.type)
        && (!slot.start || cell.t >= slot.start && cell.b <= slot.end)
        && (!slot.labelPattern || new RegExp(slot.labelPattern).test(f.label));
    });
    if (field) { used.add(field.key); matched.push({slot,field:field.key}); } else missing.push(slot);
  }
  const simpleLabelOverlaps = [];
  for (const field of draft.fields) {
    const rect = range(field.range);
    for (const cell of sample.input.cells) {
      // Compound paragraphs need rendered review, not a whole-cell exclusion test.
      if (cell.text.includes('\n') && field.box) continue;
      const point = range(cell.address), merged = sample.input.mergedCells.find(m => point.t >= m.t && point.t <= m.b && point.l >= m.l && point.l <= m.r) ?? point;
      if (!field.box && rect.t <= merged.b && rect.b >= merged.t && rect.l <= merged.r && rect.r >= merged.l) simpleLabelOverlaps.push({field:field.key,labelCell:cell.address});
    }
  }
  const field = key => draft.fields.find(f => f.key === key);
  const prod = draft.bindings.filter(b => b.modelId === 'production');
  const cons = draft.bindings.filter(b => b.modelId === 'consumption');
  const scrap = draft.bindings.filter(b => b.modelId === 'scrap');
  const coreBinding = sampleId === 'clean'
    ? prod.length === 1 && field(prod[0].sources.goodQuantity)?.source === 'D8' && field(prod[0].sources.ngQuantity)?.source === 'D9' && !prod[0].sources.outputQuantity
    : sampleId === 'label'
      ? cons.length === 4 && [8,12,16,20].every(start => cons.some(b => {
        const qty = field(b.sources.quantity), mat = field(b.sources.material);
        return qty?.source === 'K7' && range(qty.range).t >= start && range(qty.range).b <= start+3 && mat?.type === 'reference' && mat.config.sourceType === 'material' && range(mat.range).t >= start && range(mat.range).b <= start+3;
      }))
      : scrap.length === 1 && field(scrap[0].sources.quantity)?.source === 'F7' && field(scrap[0].sources.material)?.source === 'A6' && !prod.length;
  const invented = sampleId === 'clean' ? draft.fields.filter(f => ['A1','B16','D16'].includes(f.source)).map(f => f.key)
    : sampleId === 'scrap' ? draft.fields.filter(f => range(f.source).t >= 12).map(f => f.key) : [];
  const nativeGridOverlaps = [];
  for (const [i,a] of draft.fields.entries()) for (const b of draft.fields.slice(i+1)) {
    const x = range(a.range), y = range(b.range);
    if (x.t<=y.b && x.b>=y.t && x.l<=y.r && x.r>=y.l) nativeGridOverlaps.push([a.key,b.key]);
  }
  const unsupportedFractionalFields = draft.fields.filter(f=>f.box && (f.box.x!==0 || f.box.y!==0 || f.box.w!==1 || f.box.h!==1)).map(f=>f.key);
  return {coreSlots:slots[sampleId].length,matchedSlots:matched.length,missing,matched,unmatchedFields:draft.fields.filter(f=>!used.has(f.key)).map(f=>f.key),simpleLabelOverlaps,nativeGridOverlaps,unsupportedFractionalFields,coreBinding,invented,questions:draft.questions.length};
}

if (process.argv[1] === import.meta.filename) {
  const token = await login(), assessments = [];
  for (const id of (await readdir(out+'/runs')).sort()) {
    const result = await json('runs/'+id+'/result.json').catch(()=>null);
    if (!result || result.status !== 'saved') continue;
    const draft = await json('runs/'+id+'/draft.json'), sample = await json('samples/'+result.sampleId+'.json');
    const assessment = {runId:id, ...assessDraft(draft,result.sampleId,sample)};
    const readback = await json('runs/'+id+'/readback.json');
    const model = JSON.parse(readback.versions.find(v=>v.id===result.versionId).modelDesignJson).payload;
    const values = {};
    for (const f of draft.fields) {
      if (f.type === 'number') {
        values[f.key] = result.sampleId === 'clean' ? ({D8:30,D9:2,H4:100,D11:3}[f.source] ?? 7)
          : result.sampleId === 'label' ? ({E5:500,F7:100,H7:80,K7:60,L7:20}[f.source] ?? 7)+Math.floor((range(f.range).t-8)/4)
          : 3;
      } else if (f.type === 'datetime') values[f.key] = '2026-11-12';
      else if (f.type === 'reference') values[f.key] = {id:'1',sourceType:f.config.sourceType,code:'SIM-ONLY',name:'仅用于纯函数投影的合成值'};
      else if (f.type === 'text') values[f.key] = 'SIM-'+f.key;
      // No fabricated signature or attachment evidence.
    }
    // This endpoint is pure projection, not runtime candidate authorization or production submission.
    try {
      const projected = await api('/master-data/template-modeling/projection-preview','POST',{model,values},token);
      assessment.projection = {status:'returned',records:projected.length,business:projected.filter(p=>p.modelId!=='formTrace')};
      await save('runs/'+id+'/projection.json',{scope:'synthetic values; no reference identity resolution, signature, or production commit',values,projected});
    } catch(error) { assessment.projection={status:'rejected',error:error.message}; }
    assessments.push(assessment);
  }
  await save('assessment.json',{method:'Core-slot presence/type and repeated-record coverage, not precision/recall or customer approval. Coordinates with box require rendered review. Expectations were not supplied to model.',slots,assessments});
  console.log(JSON.stringify(assessments.map(a=>({run:a.runId,coverage:a.matchedSlots+'/'+a.coreSlots,overlaps:a.simpleLabelOverlaps.length,binding:a.coreBinding,questions:a.questions,projection:a.projection.status})),null,2));
}
