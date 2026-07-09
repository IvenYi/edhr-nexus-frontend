import { existsSync, readFileSync } from 'node:fs';

const failures = [];
const checkedFiles = ['index.html', 'src/index.css'];
const blockedPatterns = [
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
  /https?:\/\/[^"']*font/i,
];

for (const path of checkedFiles) {
  const url = new URL(`../${path}`, import.meta.url);
  if (!existsSync(url)) {
    failures.push(`${path}: missing file`);
    continue;
  }
  const content = readFileSync(url, 'utf8');
  for (const pattern of blockedPatterns) {
    if (pattern.test(content)) {
      failures.push(`${path}: contains blocked external font reference ${pattern}`);
    }
  }
}

if (failures.length > 0) {
  console.error('External font verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('External font verification passed.');
