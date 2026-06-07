import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const failures = [];

function mustInclude(file, token, reason) {
  const content = read(file);
  if (!content.includes(token)) {
    failures.push(`${file}: missing ${JSON.stringify(token)} (${reason})`);
  }
}

function mustNotInclude(file, token, reason) {
  const content = read(file);
  if (content.includes(token)) {
    failures.push(`${file}: should not include ${JSON.stringify(token)} (${reason})`);
  }
}

mustInclude('src/App.tsx', "main: '#1890ff'", 'Vue Admin Plus primary color');
mustInclude('src/App.tsx', "default: '#f6f8f9'", 'workspace background');
mustInclude('src/App.tsx', "borderRadius: 5", '5px base radius');
mustInclude('src/App.tsx', "'PingFang SC', Arial, 'Microsoft YaHei', sans-serif", 'target Chinese admin font stack');
mustInclude('src/App.tsx', "height: 32", 'compact 32px controls');
mustInclude('src/App.tsx', "boxShadow: 'none'", 'no heavy card/button shadows');
mustInclude('src/App.tsx', "#f5f7fa", 'table header background');
mustInclude('src/App.tsx', "#909399", 'secondary/table header text');
mustInclude('src/index.css', "background-color: #f6f8f9", 'body background');
mustInclude('src/index.css', "color: #515a6e", 'body text color');
mustNotInclude('src/index.css', "Noto Sans SC", 'old font stack should be replaced');

if (failures.length > 0) {
  console.error('Style constraint verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Style constraint verification passed.');
