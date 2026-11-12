import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {build} from 'esbuild';
import {paragraph,drawing,table,mergedTable,wordPackage} from './fixtures/template-designer-react/word-table-reuse.mjs';

const root=path.resolve(import.meta.dirname,'..'),require=createRequire(import.meta.url),{chromium}=require('playwright');
const reference=process.env.WORD_REUSE_REFERENCE_COMMIT??'8a415040babc1cc91ca9f5683bf0db46829eea76',baseline=process.env.WORD_REUSE_BASELINE_COMMIT;
for(const sha of [reference,baseline].filter(Boolean))if(!/^[0-9a-f]{40}$/.test(sha))throw new Error('commit must be a full SHA');
const artifacts=process.env.WORD_REUSE_ARTIFACTS??path.join(os.tmpdir(),'edhr-word-table-reuse');await mkdir(artifacts,{recursive:true});
const temporary=await mkdtemp(path.join(os.tmpdir(),'edhr-word-reuse-')),sourcePath='src/pages/master-data/template-designer-react/utils/importWord.ts';
const sourceFor=commit=>commit?execFileSync('git',['show',commit+':gmp-platform/frontend/'+sourcePath],{cwd:root,encoding:'utf8'}):readFile(path.join(root,sourcePath),'utf8');
const sources={candidate:await sourceFor(baseline),reference:await sourceFor(reference)},results=[];let server,browser;
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
try {
  for(const tag of ['candidate','reference'])await build({absWorkingDir:root,stdin:{loader:'ts',resolveDir:root,contents:`import{importWordToCanvasPage}from'./src/pages/master-data/template-designer-react/utils/importWord';(window as any).__wordImport_${tag}=importWordToCanvasPage;`},outfile:path.join(temporary,tag+'.js'),bundle:true,platform:'browser',format:'esm',alias:{'@':path.join(root,'src')},logLevel:'silent',plugins:[{name:'count-original-table-parser-entry-only',setup(plugin){plugin.onLoad({filter:/\/utils\/importWord\.ts$/},args=>{
    const marker='function parseTable(tableNode: Element): ParsedTable {';assert.ok(sources[tag].includes(marker));
    return{contents:sources[tag].replace(marker,marker+`\n(window as any).__wordCalls.${tag}++;`),loader:'ts',resolveDir:path.dirname(args.path)};
  });}}]});
  server=http.createServer(async(req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1);
    if(['candidate.js','reference.js'].includes(name)){res.setHeader('Content-Type','text/javascript');res.end(await readFile(path.join(temporary,name)));}
    else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><meta charset="utf-8"><body><script type="module" src="/candidate.js"></script><script type="module" src="/reference.js"></script></body></html>');}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/usr/bin/chromium'});
  const cases=['empty-and-paragraph','table-no-images','merged-multiple-tables','nested-table','missing-image-reference','fresh-and-concurrent','malformed-and-retry','capacity-300-50'];
  for(const name of cases){const context=await browser.newContext(),page=await context.newPage(),record={case:name,comparisons:[]};page.setDefaultTimeout(10000);
    try {
      await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.__wordImport_candidate&&window.__wordImport_reference);
      async function compare(bytes,label='sample'){
        await writeFile(path.join(artifacts,name+'-'+label+'.docx'),bytes);
        const output=await page.evaluate(async data=>{
          window.__wordCalls={candidate:0,reference:0};const values={};
          for(const tag of ['reference','candidate']){const start=performance.now();try{
            const p=await window['__wordImport_'+tag](new File([new Uint8Array(data)],'same-name.docx'),{pageId:'target-page',pageName:'目标页'});
            values[tag]={page:JSON.parse(JSON.stringify(p)),calls:window.__wordCalls[tag],durationMs:performance.now()-start};
          }catch(e){values[tag]={error:String(e.message),calls:window.__wordCalls[tag],durationMs:performance.now()-start};}}
          return values;
        },[...bytes]);
        assert.deepEqual(output.candidate.page,output.reference.page,'complete CanvasPage output must remain identical');assert.equal(output.candidate.error,output.reference.error);
        record.comparisons.push({label,...output,candidatePageSha256:output.candidate.page?hash(output.candidate.page):null,referencePageSha256:output.reference.page?hash(output.reference.page):null});return output;
      }
      if(name==='empty-and-paragraph'){
        for(const body of ['',paragraph('合法空白旁的正文'),'<w:p>'+drawing()+'</w:p>']){const d=await compare(await wordPackage(body),'part-'+record.comparisons.length);assert.equal(d.candidate.calls,0);}
      }else if(name==='table-no-images'){
        const d=await compare(await wordPackage(table(4,0)));assert.equal(d.candidate.page.wordDocument.blocks[0].cells.length,8);assert.equal(d.candidate.calls,1);
      }else if(name==='merged-multiple-tables'){
        const d=await compare(await wordPackage(paragraph('前置说明 '.repeat(20))+mergedTable()+paragraph('中间说明')+table(4,3)+'<w:p>'+drawing()+'</w:p>'));
        assert.equal(d.candidate.page.wordDocument.blocks.length,2);assert.equal(d.candidate.page.nodes.filter(n=>n.type==='static-image').length,6);assert.equal(d.candidate.calls,2);
      }else if(name==='nested-table'){
        const body='<w:tbl><w:tblGrid><w:gridCol w:w="6000"/></w:tblGrid><w:tr><w:tc>'+paragraph('外层')+table(2,2)+'</w:tc></w:tr></w:tbl>';
        const d=await compare(await wordPackage(body));assert.equal(d.candidate.page.wordDocument.blocks.length,1);assert.equal(d.candidate.calls,1);
      }else if(name==='missing-image-reference'){
        const d=await compare(await wordPackage(table(2,1),{missingRelationship:true}));assert.equal(d.candidate.page.nodes.filter(n=>n.type==='static-image').length,0);assert.equal(d.candidate.calls,1);
      }else if(name==='fresh-and-concurrent'){
        const a=await wordPackage(table(4,3,'来源A')),b=await wordPackage(table(2,1,'来源B'));
        for(const[label,bytes]of [['A',a],['B',b]]){const d=await compare(bytes,label);assert.ok(d.candidate.page.wordDocument.blocks[0].cells[0].text.includes('来源'+label));assert.equal(d.candidate.calls,1);}
        const d=await page.evaluate(async({a,b})=>{window.__wordCalls={candidate:0,reference:0};const out={};for(const tag of ['reference','candidate'])out[tag]=await Promise.all([a,b].map(data=>window['__wordImport_'+tag](new File([new Uint8Array(data)],'same-name.docx'))));return{out,calls:window.__wordCalls};},{a:[...a],b:[...b]});
        assert.deepEqual(d.out.candidate,d.out.reference);assert.equal(d.calls.candidate,2);record.concurrent=d;
      }else if(name==='malformed-and-retry'){
        const bad=await compare(await wordPackage(table(2,1),{malformed:true}),'bad');assert.ok(bad.candidate.error);assert.equal(bad.candidate.calls,0);
        const good=await compare(await wordPackage(table(2,1)),'retry');assert.equal(good.candidate.calls,1);
      }else{
        const bytes=await wordPackage(table(300,50));for(let i=0;i<3;i++)await compare(bytes,'repeat-'+i);
        for(const d of record.comparisons){assert.equal(d.candidate.calls,1);assert.equal(d.candidate.page.wordDocument.blocks[0].cells.length,600);assert.equal(d.candidate.page.nodes.filter(n=>n.type==='static-image').length,50);}
      }
      record.outcome='passed';
    }catch(error){record.outcome='failed';record.failure=String(error);}
    results.push(record);await context.close();
  }
}finally{await browser?.close();await new Promise(resolve=>server?server.close(resolve):resolve());await rm(temporary,{recursive:true,force:true});}
await writeFile(path.join(artifacts,'result.json'),JSON.stringify({head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),selectedCandidateBaseline:baseline??null,reference,
  sourceSha256:Object.fromEntries(Object.entries(sources).map(([k,v])=>[k,createHash('sha256').update(v).digest('hex')])),scope:'Actual JSZip/XML/Word parser;only counts original parseTable entry;full old/new CanvasPage comparison;duration informational,parse count deterministic',results},null,2)+'\n');
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.outcome==='passed').length,failed:results.filter(r=>r.outcome==='failed').length,artifacts}));
assert.ok(results.length===8&&results.every(r=>r.outcome==='passed'),'Word table reuse assertions failed');
