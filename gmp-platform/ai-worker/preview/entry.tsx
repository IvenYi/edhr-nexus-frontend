// Headless renderer entry. Reuses the product component; not a user-facing page.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import FormDocumentPreview from '../../frontend/src/pages/master-data/template-designer-react/components/form-preview/FormDocumentPreview';
import { parseReactTemplateDesignerDocument } from '../../frontend/src/pages/master-data/template-designer-react/utils/document';

const root=createRoot(document.getElementById('root')!);
const theme=createTheme({typography:{fontFamily:'"PingFang SC","Noto Sans CJK SC",sans-serif'}});
Object.assign(window,{ async renderAiPreview(snapshot:any) {
  const documentModel=parseReactTemplateDesignerDocument({id:snapshot.templateId,name:'表单配置预览'} as any,snapshot.version,{forEditing:true});
  flushSync(()=>root.render(<ThemeProvider theme={theme}><FormDocumentPreview document={documentModel}/></ThemeProvider>));
  await document.fonts.ready;
  await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
  const papers=[...document.querySelectorAll<HTMLElement>('[data-mock-fill-page-paper],[data-word-preview-page]')];
  if(papers.length!==documentModel.canvas.pages.length)throw new Error('Native preview page count mismatch');
  const issues:Array<{code:string;message:string}>=[];
  for(const page of documentModel.canvas.pages) {
    if(page.wordDocument)continue;
    const visit=(nodes:typeof page.nodes)=>nodes.forEach(node=>{
      if(node.bindings?.fieldId && !node.bindings.hidden && node.type!=='sub-table') {
        const range=node.style.cellRange as any;
        if(!range || !['t','l','b','r'].every(key=>Number.isInteger(range[key])) || range.t<1 || range.l<1 || range.b>page.sheet.rowCount || range.r>page.sheet.columnCount)
          issues.push({code:'FIELD_LAYOUT_INVALID',message:node.id});
      }
      visit(node.children??[]);
    });visit(page.nodes);
  }
  for(const cell of document.querySelectorAll<HTMLElement>('[data-mock-fill-sheet-cell]')) {
    const text=cell.querySelector<HTMLElement>('span');
    if(!text?.textContent?.trim())continue;
    const style=getComputedStyle(cell);
    if(text.scrollHeight>cell.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)+2 || text.scrollWidth>text.clientWidth+2)
      issues.push({code:'TEXT_CLIPPED',message:text.textContent.slice(0,160)});
  }
  for(const paper of papers) if(paper.scrollWidth>paper.clientWidth+2)issues.push({code:'PAGE_OVERFLOW',message:'内容超出纸张宽度'});
  for(const image of document.images)if(!image.complete || image.naturalWidth===0)issues.push({code:'IMAGE_UNAVAILABLE',message:'图片未能在隔离预览中加载'});
  return {pages:papers.length,fieldControls:document.querySelectorAll('[data-mock-fill-field-cell],[data-form-preview-field]').length,issues:issues.slice(0,999),issueTotal:issues.length,height:document.documentElement.scrollHeight};
}});
