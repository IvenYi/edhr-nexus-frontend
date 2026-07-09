/* eslint-disable import/no-extraneous-dependencies */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { glob } from 'glob';
import { Plugin } from 'vite';

function getDistPath(): string {
  const command = process.env.npm_lifecycle_event || 'build';
  const index = command.lastIndexOf(':');
  return `dist/${command.substring(index + 1)}`;
}

export function systemJsTransformHtml(
  htmlGlobPath = `${getDistPath()}/src/projects/*/*.html`,
  importJsonPath = join(process.cwd(), getDistPath(), 'extras/system-imports.json'),
): Plugin[] {
  const p: Plugin = {
    name: 'gct:System',
    apply: 'build',
    closeBundle() {
      // 重新改写 index.html 部分代码
      glob.sync(htmlGlobPath, { cwd: process.cwd() }).forEach((pathStr: string) => {
        const htmlFilePath = pathStr;
        if (existsSync(htmlFilePath)) {
          let html = readFileSync(htmlFilePath, 'utf-8');
          // 删除预加载声明
          html = html.replace(/<link rel="modulepreload"(.*?)>/g, '');
          // 删除模块化 script
          html = html.replaceAll(/(<script type="module"(.*?)>)(.|\n)*?(<\/script>)/g, '');
          // 删除 nomodule，放出 systemjs 模块
          html = html.replaceAll('<script nomodule', '<script');
          // 删除 crossorigin 属性，所有的都是同一域下，无需次参数
          html = html.replaceAll(' crossorigin="anonymous"', '');
          html = html.replaceAll(' crossorigin', '');
          // 匹配所有的 css 和 js 文件，加上时间戳
          const scriptReg = /\.(css|js|json)"/g;
          const time = new Date().getTime();
          html = html.replace(scriptReg, `.$1?time=${time}"`);
          writeFileSync(htmlFilePath, html, 'utf-8');
        } else {
          console.error(`ERROR: ${htmlFilePath} 文件未找到`);
        }
      });
      // 重新修改 system-import.json 补充时间戳
      {
        const systemImportPath = importJsonPath;
        if (existsSync(systemImportPath)) {
          const content = readFileSync(systemImportPath, 'utf-8');
          if (content) {
            const json = JSON.parse(content);
            const items = json.imports as Record<string, string>;
            const styles = json.styles as Record<string, string | string[]>;
            const date = new Date();
            // eslint-disable-next-line no-restricted-syntax, guard-for-in
            for (const key in items) {
              const val = items[key];
              items[key] = `${val}?time=${date.getTime()}`;
            }
            // eslint-disable-next-line no-restricted-syntax, guard-for-in
            for (const key in styles) {
              const val = styles[key];
              if (Array.isArray(val)) {
                styles[key] = val.map((v) => `${v}?time=${date.getTime()}`);
              } else {
                styles[key] = `${val}?time=${date.getTime()}`;
              }
            }
            writeFileSync(systemImportPath, JSON.stringify(json, null, 2), 'utf-8');
          }
        } else {
          console.error(`ERROR: ${systemImportPath} 文件未找到`);
        }
      }
    },
  };
  return [p];
}
