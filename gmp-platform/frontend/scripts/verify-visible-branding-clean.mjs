import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(scriptPath), '..', '..', '..');
const selfPath = relative(projectRoot, scriptPath);
const visitedFiles = new Set();

const scanRoots = [
  '.',
  'gmp-platform/backend/src/main/java',
  'gmp-platform/backend/src/main/resources',
  'gmp-platform/frontend/src',
  'gmp-platform/frontend/index.html',
  'gmp-platform/frontend/vendor/online-form-designer/src/hooks/platform',
  'gmp-platform/frontend/vendor/online-form-designer/src/locales',
  'gmp-platform/frontend/vendor/online-form-designer/src/views/sys',
  'gmp-platform/frontend/vendor/online-form-designer/src/components/AppManageCmp/src/components/modal/components',
  'gmp-platform/frontend/vendor/online-form-designer/src/projects/developer-center',
  'gmp-platform/frontend/vendor/online-form-designer/src/projects/ipaas',
  'gmp-platform/frontend/vendor/online-form-designer/src/projects/online-form',
  'gmp-platform/frontend/vendor/online-form-designer/packages/design',
  'gmp-platform/frontend/vendor/online-form-designer/packages/mobile/index.html',
  'gmp-platform/frontend/vendor/online-form-designer/packages/mobile/src/layouts',
  'gmp-platform/frontend/vendor/online-form-designer/packages/mobile/src/viewsPad/login',
];

const ignoredPathParts = new Set([
  '.git',
  'dist',
  'node_modules',
  'target',
  'tmp',
]);

const textExtensions = new Set([
  '.css',
  '.html',
  '.java',
  '.json',
  '.less',
  '.md',
  '.mjs',
  '.scss',
  '.ts',
  '.tsx',
  '.vue',
]);

const forbiddenPatterns = [
  { label: '冠骋/冠骋云', pattern: /冠骋云|冠骋/g },
  { label: '可见 GCT eDHR 文案', pattern: /GCT[\s_]+eDHR/g },
  { label: '可见 GCT 菜单标签', pattern: /["']label["']\s*:\s*["']GCT["']|label:\s*["']GCT["']/g },
  { label: '可见 GCT 错误或说明', pattern: /GCT\s+(?:page|record|action|demo|routes|menu|user-management|divided|sizing|eDHR|页面)/g },
  { label: '可见 GCT mock 值', pattern: /GCT[-_](?:MOCK|page)/g },
];

const findings = [];

function shouldIgnorePath(path) {
  const parts = path.split('/');
  return parts.some((part) => ignoredPathParts.has(part));
}

function walk(path) {
  const relativePath = relative(projectRoot, path);
  if (!relativePath || shouldIgnorePath(relativePath) || relativePath === selfPath) return;

  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) {
      walk(join(path, entry));
    }
    return;
  }

  if (!stat.isFile() || !textExtensions.has(extname(path))) return;

  const normalizedPath = resolve(path);
  if (visitedFiles.has(normalizedPath)) return;
  visitedFiles.add(normalizedPath);

  const source = readFileSync(path, 'utf8');
  for (const { label, pattern } of forbiddenPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const line = source.slice(0, match.index).split('\n').length;
      findings.push(`${relativePath}:${line} ${label}: ${match[0]}`);
    }
  }
}

for (const root of scanRoots) {
  walk(resolve(projectRoot, root));
}

if (findings.length > 0) {
  console.error('Visible branding cleanup verification failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Visible branding cleanup verification passed.');
