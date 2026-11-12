import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {build} from 'esbuild';

const root=path.resolve(import.meta.dirname,'..'),require=createRequire(import.meta.url),ExcelJS=require('exceljs');
const baseline=process.env.EXCEL_IMAGES_BASELINE_COMMIT;
if(baseline&&!/^[0-9a-f]{40}$/.test(baseline))throw new Error('baseline must be a complete SHA');
const temporary=await mkdtemp(path.join(os.tmpdir(),'edhr-excel-images-'));
const png=await readFile(path.join(root,'scripts/fixtures/template-designer-react/sample-badge.png'));
const digest=b=>createHash('sha256').update(b).digest('hex');
let importExcel,createDoc,serialize,parse,store;
try {
  const outfile=path.join(temporary,'runtime.cjs');
  await build({absWorkingDir:root,stdin:{resolveDir:root,loader:'ts',contents:`
    export {importExcelToCanvasPage as importExcel} from './src/pages/master-data/template-designer-react/utils/importExcel';
    export {createEmptyTemplateDesignerDocument as createDoc,serializeTemplateDesignerDocument as serialize,parseReactTemplateDesignerDocument as parse} from './src/pages/master-data/template-designer-react/utils/document';
    export {useTemplateDesignerStore as store} from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
  `},outfile,bundle:true,platform:'node',format:'cjs',alias:{'@':path.join(root,'src')},logLevel:'silent',
  plugins:baseline?[{name:'old-excel-adapter-only',setup(plugin){plugin.onLoad({filter:/\/utils\/importExcel\.ts$/},args=>({
    contents:execFileSync('git',['show',baseline+':gmp-platform/frontend/'+path.relative(root,args.path)],{cwd:root,encoding:'utf8'}),loader:'ts',resolveDir:path.dirname(args.path)}));}}]:[]});
  ({importExcel,createDoc,serialize,parse,store}=require(outfile));
}finally{await rm(temporary,{recursive:true,force:true});}

async function fixture(anchors,name='images.xlsx') {
  const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('导入图片');ws.pageSetup.orientation='portrait';
  ws.columns=Array.from({length:6},()=>({width:12}));ws.getCell('A1').value='图示';ws.getCell('F10').value=0;
  const ids=[];
  for(const item of anchors){
    const index=item.media??0;
    if(ids[index]===undefined)ids[index]=wb.addImage({buffer:png,extension:'png'});
    ws.addImage(ids[index],{tl:{col:1,row:2},...item.range});
  }
  const bytes=await wb.xlsx.writeBuffer(),loaded=new ExcelJS.Workbook();await loaded.xlsx.load(bytes);
  const sources=loaded.worksheets[0].getImages().map(image=>image.model);
  const page=await importExcel(new File([bytes],name),{pageId:'target-page',pageName:'目标页'});
  return{page,sources};
}
function mediaIntact(page,count){
  assert.equal(page.medias.length,count);
  for(const media of page.medias){assert.ok(media.src.startsWith('data:image/png;base64,'));assert.equal(digest(Buffer.from(media.src.split(',')[1],'base64')),digest(png));}
  for(const image of page.images)assert.ok(page.medias.some(media=>media.id===image.mediaId));
}
for(const [width,height] of [[180,72],[49,101]])test(`one-cell image retains explicit ${width}x${height} pixels and original anchor`,async()=>{
  const{page,sources}=await fixture([{range:{ext:{width,height}}}]);
  assert.equal(sources[0].range.br,undefined);assert.deepEqual(sources[0].range.ext,{width,height});
  assert.deepEqual(page.images[0].layout,{left:125,top:72,width,height});assert.equal(page.id,'target-page');mediaIntact(page,1);
});
test('one media reused at different extents retains both independent image geometries',async()=>{
  const{page}=await fixture([{range:{ext:{width:180,height:72}}},{range:{tl:{col:2,row:4},ext:{width:90,height:36}}}]);
  assert.equal(page.images.length,2);assert.equal(page.images[0].mediaId,page.images[1].mediaId);
  assert.deepEqual(page.images.map(i=>i.layout),[{left:125,top:72,width:180,height:72},{left:250,top:144,width:90,height:36}]);mediaIntact(page,1);
});
test('multiple media keep their own references and sizes',async()=>{
  const{page}=await fixture([{media:0,range:{ext:{width:180,height:72}}},{media:1,range:{ext:{width:88,height:44}}}]);
  assert.equal(page.images.length,2);assert.notEqual(page.images[0].mediaId,page.images[1].mediaId);
  assert.deepEqual(page.images.map(i=>[i.layout.width,i.layout.height]),[[180,72],[88,44]]);mediaIntact(page,2);
});
test('two-cell anchors keep the original coordinate-difference geometry',async()=>{
  const{page,sources}=await fixture([{range:{br:{col:3,row:5}}}]);
  assert.equal(sources[0].range.ext,undefined);assert.deepEqual(page.images[0].layout,{left:125,top:72,width:250,height:108});mediaIntact(page,1);
});
test('existing minimum image dimensions remain 24 pixels',async()=>{
  const{page}=await fixture([{range:{ext:{width:10,height:12}}}]);
  assert.deepEqual(page.images[0].layout,{left:125,top:72,width:24,height:24});mediaIntact(page,1);
});
test('image-free Excel and zero-valued cells retain their original behavior',async()=>{
  const{page}=await fixture([]);assert.deepEqual(page.images,[]);assert.deepEqual(page.medias,[]);assert.equal(page.cells['10:6'].value,'0');
});
test('xlsm extension follows the same OOXML image path',async()=>{
  const{page}=await fixture([{range:{ext:{width:180,height:72}}}],'images.xlsm');
  assert.equal(page.images[0].layout.width,180);assert.equal(page.images[0].layout.height,72);mediaIntact(page,1);
});
test('actual import store command retains identity, model, other page and history; saved read retains images',async()=>{
  const{page}=await fixture([{range:{ext:{width:180,height:72}}}]);
  const row={id:'template',name:'图片'},version={id:'version',version:'V2'};
  const doc=createDoc({schema:'edhr-template-designer-react',version:1,templateId:row.id,versionId:version.id,templateName:row.name,versionLabel:version.version});
  doc.canvas.pages[0].name='原名称';doc.canvas.pages.push({...structuredClone(doc.canvas.pages[0]),id:'other-page'});
  doc.workflow.config={description:'保留流程'};store.getState().setDocument(doc);store.getState().addField('text','保留模型');store.getState().markSaved();
  const before=structuredClone(store.getState().document),undoCount=store.getState().undoStack.length;
  store.getState().replaceCurrentPageFromImport(page);const after=structuredClone(store.getState().document);
  assert.equal(after.canvas.pages[0].id,before.canvas.pages[0].id);assert.equal(after.canvas.pages[0].name,'原名称');
  assert.deepEqual(after.model,before.model);assert.deepEqual(after.workflow,before.workflow);assert.deepEqual(after.canvas.pages[1],before.canvas.pages[1]);
  assert.equal(store.getState().undoStack.length,undoCount+1);assert.equal(store.getState().isDirty(),true);
  store.getState().undoCanvasChange();assert.deepEqual(store.getState().document,before);store.getState().redoCanvasChange();assert.deepEqual(store.getState().document,after);
  const read=parse(row,{...version,...serialize(after)},{forEditing:true});
  assert.deepEqual(read.canvas.pages[0].images,page.images);assert.equal(read.canvas.pages[0].images[0].layout.width,180);mediaIntact(read.canvas.pages[0],1);
});
test('unreadable workbook rejects instead of returning an accepted image page',async()=>{
  await assert.rejects(()=>importExcel(new File([new Uint8Array([0x50,0x4b,0x03,0x04])],'broken.xlsx')));
});
