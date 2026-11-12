import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { root } from '../common.mjs';
const exec = promisify(execFile);
const wrapper = os.homedir() + '/.codex/skills/playwright/scripts/playwright_cli.sh';

export async function nativePreview({ runId, code, revision, sequence }) {
  const session = 'ai-v3-' + runId, folder = `${root}/output/playwright/ai-agent-v3/${runId}/${sequence}`;
  await mkdir(folder, { recursive: true });
  const run = async (...args) => {
    const r = await exec(wrapper, ['--session', session, ...args], { cwd: root, maxBuffer: 4 * 1024 * 1024, timeout: 120000 });
    if (/### Error/.test(r.stdout)) throw new Error(r.stdout.slice(0, 1200));
    return r.stdout;
  };
  try {
    await run('open', 'http://127.0.0.1:15175/master-data/form-templates', '--headed');
    const body = `async (page) => {
      await page.setViewportSize({width:1600,height:1100});
      await page.getByRole('textbox').first().waitFor();
      if (await page.getByRole('textbox',{name:'用户名',exact:true}).count()) {
        await page.getByRole('textbox',{name:'用户名',exact:true}).fill('admin');
        await page.getByRole('textbox',{name:'密码',exact:true}).fill('admin123');
        await page.getByRole('button',{name:'登 录',exact:true}).click();
        await page.waitForURL(url=>!url.pathname.endsWith('/login'));
      }
      await page.goto('http://127.0.0.1:15175/master-data/form-templates');
      await page.getByRole('textbox',{name:'表单编码',exact:true}).fill(${JSON.stringify(code)});
      await page.getByRole('button',{name:'查询',exact:true}).click();
      const row=page.getByRole('row').filter({has:page.getByRole('cell',{name:${JSON.stringify(code)},exact:true})});
      await row.getByRole('button').first().click();
      await page.getByRole('button',{name:'设计',exact:true}).click();
      await page.getByRole('button',{name:'模拟填报',exact:true}).click();
      await page.getByRole('button',{name:'关闭模拟填报',exact:true}).waitFor();
      const metrics=await page.getByRole('dialog').last().evaluate(dialog=>{
        const issues=[...dialog.querySelectorAll('[data-mock-fill-sheet-cell]')].flatMap(cell=>{
          const span=cell.querySelector('span'), style=getComputedStyle(cell);
          if(!span?.textContent?.trim())return [];
          const h=cell.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
          const clipped=span.scrollHeight>h+2||span.scrollWidth>span.clientWidth+2;
          return clipped?[{text:span.textContent,gridRow:style.gridRow,gridColumn:style.gridColumn,height:cell.clientHeight,neededHeight:span.scrollHeight+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom),width:span.clientWidth,neededWidth:span.scrollWidth}]:[];
        });
        const scroller=[...dialog.querySelectorAll('*')].find(e=>e.scrollHeight>e.clientHeight+40&&/auto|scroll/.test(getComputedStyle(e).overflowY));
        if(scroller)scroller.setAttribute('data-agent-preview-scroll','true');
        return {issues,fieldControls:dialog.querySelectorAll('[data-mock-fill-field-cell]').length,scrollHeight:scroller?.scrollHeight??1100,viewport:scroller?.clientHeight??1100};
      });
      const images=[];const count=Math.min(6,Math.max(1,Math.ceil(metrics.scrollHeight/metrics.viewport)));
      for(let i=0;i<count;i++){
        const scroll=page.locator('[data-agent-preview-scroll]');if(await scroll.count())await scroll.evaluate((e,p)=>{e.scrollTop=p;},i*metrics.viewport);
        const file=${JSON.stringify(folder)}+'/view-'+i+'.png';await page.screenshot({path:file,animations:'disabled'});images.push(file);
      }
      return {...metrics,images};
    }`;
    const output = await run('run-code', body);
    await writeFile(folder + '/browser.log', output, { mode: 0o600 });
    const result = output.match(/### Result\s*\n([\s\S]*?)\n### /);
    if (!result) throw new Error('浏览器未返回预览测量结果');
    return { ...JSON.parse(result[1]), revision, scope: 'saved native mock-fill UI; no real upload, signing or production submission', evidenceDirectory: folder };
  } finally { await run('close').catch(() => {}); }
}
