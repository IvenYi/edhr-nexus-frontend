import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Render the real pages with cached API responses, without a server or database.
const frontendRoot = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const bundle = await build({
  stdin: {
    contents: `export { default as Materials } from './src/pages/master-data/ProcessModelingPage';
export { SnackbarProvider } from './src/components/SnackbarProvider';`,
    resolveDir: frontendRoot,
    loader: 'tsx',
  },
  absWorkingDir: frontendRoot,
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  jsx: 'automatic',
  alias: { '@': `${frontendRoot}/src` },
  logLevel: 'silent',
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0].text)(
  (id) => id.endsWith('.css') ? {} : require(id), compiled, compiled.exports,
);
const { Materials, SnackbarProvider } = compiled.exports;

let checked = 0;
for (const [Component, queryKey, props] of [
  [Materials, 'process-modeling-materials', { pageKey: 'materials' }],
]) {
  for (const [page, size, total] of [[1, 20, 45], [2, 20, 45], [3, 20, 45], [1, 50, 45], [1, 20, 7], [1, 20, 0]]) {
    const count = Math.min(size, Math.max(0, total - (page - 1) * size));
    const content = Array.from({ length: count }, (_, index) => {
      const id = String((page - 1) * size + index + 1);
      const version = { id, code: `MAT-${id}`, name: `物料 ${id}`, version: 'V1', status: 'ACTIVE', materialTypeName: '半成品' };
      return { ...version, versions: [version, { ...version, id: `${id}-v2`, version: 'V2' }], versionCount: 2, materialVersionCount: 2 };
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryDefaults([queryKey], {
      initialData: { content, page, size, totalElements: total, totalPages: Math.ceil(total / size) },
      staleTime: Infinity,
    });
    try {
      const html = renderToStaticMarkup(React.createElement(QueryClientProvider, { client },
        React.createElement(SnackbarProvider, null, React.createElement(Component, props))));
      assert.match(html, new RegExp(`共\\s*${total}\\s*条数据`), `${queryKey}: page=${page}, size=${size}, total=${total}`);
      checked++;
    } finally {
      client.clear();
    }
  }
}
console.log(`Pagination totals verified: ${checked} real-page renders (multiple page payloads, page sizes, filtered/empty results, multiple versions).`);
