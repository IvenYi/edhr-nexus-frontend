import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { root, json, save, login, api, templatesPath } from './common.mjs';

// Separate continuation test on a copy, retaining the initial-generation evidence.
const line = (await readFile(root+'/.env.ai.local','utf8')).split(/\r?\n/).find(l=>l.startsWith('DEEPSEEK_API_KEY='));
const key = line.slice(line.indexOf('=')+1).trim().replace(/^['"]|['"]$/g,'');
const original = await json('runs/clean-C-1/readback.json');
const originalVersion = original.versions[0];
const before = JSON.parse(originalVersion.modelDesignJson);
const instruction = '把“NCR编号”字段名称改为“不合格报告编号”，其他字段、位置和业务用途都不变。';
const request = {model:'deepseek-flash',thinking:{type:'disabled'},temperature:0.2,max_tokens:500,
  messages:[{role:'system',content:'只调用rename_field完成已明确授权的字段改名；只能选择现有字段key，不改变业务含义，不执行其他动作。'},
    {role:'user',content:JSON.stringify({instruction,fields:before.payload.fields.map(f=>({key:f.id,name:f.name,type:f.type}))})}],
  tools:[{type:'function',function:{name:'rename_field',description:'将一个现有字段改名',parameters:{type:'object',required:['key','name'],properties:{key:{type:'string'},name:{type:'string'}}}}}],
  tool_choice:{type:'function',function:{name:'rename_field'}}};
const started = performance.now();
const response = await fetch('https://api.deepseek.com/chat/completions',{method:'POST',signal:AbortSignal.timeout(60000),headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(request)});
if (!response.ok) throw new Error('DeepSeek HTTP '+response.status);
const data = await response.json(), command = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
await save('edit/model.json',{instruction,command,requestId:data.id,usage:data.usage,seconds:(performance.now()-started)/1000});
const target = before.payload.fields.find(f=>f.id===command.key);
assert.equal(target?.name,'NCR编号'); assert.equal(command.name,'不合格报告编号');
const model = structuredClone(before), canvas = JSON.parse(originalVersion.canvasDesignJson);
model.payload.fields.find(f=>f.id===command.key).name = command.name;
for (const page of canvas.payload.pages) for (const node of page.nodes) if (node.bindings?.fieldId===command.key) node.props.label=command.name;
const token = await login();
const template = await api(templatesPath,'POST',{code:'AI-LAB-COLLAB-CLEAN',name:'AI实验 · 连续编辑验证',version:'V1.0',categoryName:'AI验证'},token);
const payload = {modelDesignJson:JSON.stringify(model),canvasDesignJson:JSON.stringify(canvas),workflowDesignJson:originalVersion.workflowDesignJson};
const saved = await api(`${templatesPath}/${template.id}/versions/${template.versions[0].id}/design`,'PUT',payload,token);
const row = (await api(templatesPath+'?code='+template.code+'&size=100','GET',undefined,token)).content.find(r=>r.id===template.id);
const readback = row.versions[0];
assert.equal(readback.modelDesignJson,saved.modelDesignJson); assert.equal(readback.canvasDesignJson,saved.canvasDesignJson);
const normalized = JSON.parse(readback.modelDesignJson);
normalized.payload.fields.find(f=>f.id===command.key).name = target.name;
assert.deepEqual(normalized,before,'all other field and binding configuration remains unchanged');
await save('edit/readback.json',row);
await save('edit/result.json',{status:'passed',instruction,command,templateId:template.id,versionId:readback.id,unchangedModelExceptName:true,scope:'isolated copy; one semantic edit; no production revision/CAS claim'});
console.log('natural language rename and real save/readback: passed');
