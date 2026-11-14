import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const sha=value=>createHash('sha256').update(value).digest('hex');
// bundlePath is trusted deployment configuration, never a model argument.
export async function createNativePreview(bundlePath) {
  const bundle=await readFile(bundlePath,'utf8'), rendererHash=sha(bundle);
  return async ({snapshot,signal,directory})=>{
    signal.throwIfAborted();
    const parsed=JSON.parse(snapshot.version.canvasDesignJson),canvas=parsed.payload??parsed;
    if(!Array.isArray(canvas.pages)||!canvas.pages.length||canvas.pages.length>10)throw new Error('Preview supports 1–10 saved pages');
    if(parsed.schema!=='edhr-template-designer-react'||parsed.version!==1)throw new Error('Preview requires the native persisted design format');
    for(const page of canvas.pages) {
      const sheet=page.sheet;
      if(!sheet || !Number.isInteger(sheet.rowCount)||!Number.isInteger(sheet.columnCount)||sheet.rowCount<1||sheet.columnCount<1||sheet.rowCount*sheet.columnCount>20000)
        throw new Error('Preview grid exceeds bounded renderer scope');
    }
    const browser=await chromium.launch({headless:true});
    const controller=new AbortController(), combined=AbortSignal.any([signal,controller.signal]);
    const close=()=>{ void browser.close().catch(()=>{}); };
    combined.addEventListener('abort',close,{once:true});
    const timeout=setTimeout(()=>controller.abort(new Error('Preview deadline exceeded')),30000);
    try {
      combined.throwIfAborted();
      const context=await browser.newContext({viewport:{width:1600,height:1000},serviceWorkers:'block',acceptDownloads:false});
      let blocked=0;
      const html='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; font-src data:; connect-src \'none\'; frame-src \'none\'"><div id="root"></div>';
      let served=false;
      await context.route('**/*',route=>{
        if(!served && route.request().isNavigationRequest() && route.request().url()==='https://edhr-preview.invalid/') {
          served=true;return route.fulfill({status:200,contentType:'text/html',body:html});
        }
        blocked++;return route.abort();
      });
      const page=await context.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto('https://edhr-preview.invalid/');
      await page.addScriptTag({content:bundle});
      if(errors.length)throw new Error('Preview initialization failed: '+errors[0]);
      const result=await page.evaluate(input=>window.renderAiPreview(input),snapshot);
      if(errors.length || result.height>20000 || result.issueTotal>999)throw new Error('Preview rendering incomplete or exceeds scope');
      if(blocked)result.issues.push({code:'EXTERNAL_RESOURCE_BLOCKED',message:'预览未访问外部资源，需核对相关图片或内容'});
      const png=await page.screenshot({fullPage:true,animations:'disabled'});
      combined.throwIfAborted();
      await mkdir(directory,{recursive:true,mode:0o700});
      const imageHash=sha(png);
      const manifest={revision:snapshot.version.revision,rendererHash,imageHash,pages:result.pages,fieldControls:result.fieldControls,issues:result.issues};
      const artifactHash=sha(JSON.stringify(manifest));
      await writeFile(join(directory,'preview.png'),png,{mode:0o600});
      await writeFile(join(directory,'manifest.json'),JSON.stringify(manifest),{mode:0o600});
      return {artifactHash,pages:result.pages,fieldControls:result.fieldControls,issues:result.issues,artifact:'preview.png',rendererHash,
        limitations:['原生只读预览，不执行引用选择、上传或签署','布局测量不证明视觉完全正确；外部图片和网络均不可用']};
    } finally {clearTimeout(timeout);combined.removeEventListener('abort',close);await browser.close();}
  };
}
