// Build-time only: fixed Git source and explicit records. Never shipped as an Agent file tool.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { root, requireFrontend } from './common.mjs';
const yaml = requireFrontend('yaml');
const sourceCommit = '450379670504ca3f8bd1f65a275f48633dd50379';
const concepts = ['form-template-version','form-template-field','form-lookup-item','form-projection-configuration','form-business-projection','form-instance'];
const selection = {
  'docs/knowledge/ontology.yaml': [...concepts.map(id=>'concept.'+id),'relation.form-field-associated-trace-item','relation.form-business-projection-derived-from-form-instance'],
  'docs/knowledge/glossary.yaml': concepts.map(id=>'term.'+id),
  'docs/knowledge/rules/form-trace-field-binding.yaml': ['rule.form-projection.trace-field-single-binding'],
  'docs/knowledge/rules/form-reference-runtime.yaml': ['rule.form-reference-runtime'],
  'docs/knowledge/open-questions.yaml': ['question.form-projection-defect-count-semantics','question.form-projection-header-shared-fields'],
};
const sha = data=>createHash('sha256').update(data).digest('hex');
const records=[], sources=[];
for(const [file,ids] of Object.entries(selection)) {
  const text=execFileSync('git',['show',sourceCommit+':'+file],{cwd:root,encoding:'utf8'});
  const doc=yaml.parse(text), found=new Set();
  sources.push({file,sha256:sha(text)});
  function visit(value,locator) {
    if(!value || typeof value!=='object')return;
    if(ids.includes(value.id)) {
      found.add(value.id);
      const data=Object.fromEntries(Object.entries(value).filter(([key])=>['id','name','term','definition','description','aliases','kind','termId','source','target','cardinality','explanation','question','context','impact','options','condition','result','trigger','scope','evidenceIds','status','visibility'].includes(key)));
      records.push({id:value.id,status:value.status??'unresolved',visibility:value.visibility??'internal',source:{file,locator,sourceCommit,fileHash:sha(text)},data});
    }
    Object.entries(value).forEach(([key,child])=>visit(child,locator+'.'+key));
  }
  visit(doc,'$');
  if(found.size!==ids.length)throw new Error('Missing selected knowledge in '+file);
}
const payload={id:'form-knowledge-2c-internal',scope:'internal-validation',knowledgeModelVersion:'0.3.25',sourceCommit,sources,records};
const content=JSON.stringify(payload);
const result=JSON.stringify({sha256:sha(content),payload:content},null,2)+'\n';
const folder=root+'/gmp-platform/backend/src/main/resources/ai';
mkdirSync(folder,{recursive:true});
const file=folder+'/form-knowledge-2c.json';
if(process.argv.includes('--check')) { if(readFileSync(file,'utf8')!==result)throw new Error('Knowledge package differs from pinned sources'); }
else writeFileSync(file,result);
console.log('Validated internal knowledge package: '+records.length+' records');
