import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { isDeepStrictEqual } from 'node:util';
import { build } from '../../gmp-platform/frontend/node_modules/esbuild/lib/main.js';

export const root = path.resolve(import.meta.dirname, '../..');
export const out = path.join(root, 'output/ai-form-builder-v1-20261112/experiments');
export const apiBase = 'http://127.0.0.1:18091/api/v1';
export const templatesPath = '/master-data/template-modeling/form-templates';
export const requireFrontend = createRequire(path.join(root, 'gmp-platform/frontend/package.json'));
export const json = async name => JSON.parse(await readFile(path.join(out, name), 'utf8'));
export async function save(name, value) {
  const file = path.join(out, name);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2) + '\n');
}

export async function preserveProtocol(name, value) {
  const file = path.join(out, name);
  await mkdir(path.dirname(file), { recursive: true });
  try {
    await writeFile(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    if (!isDeepStrictEqual(JSON.parse(await readFile(file, 'utf8')), value)) {
      throw new Error('实验协议已存在且内容不同；请保留原批次并使用新的隔离实验目录，拒绝覆盖旧证据');
    }
  }
}

export async function api(url, method = 'GET', body, token) {
  if (!url.startsWith('/') || url.startsWith('//')) throw new Error('Only local relative API routes are allowed');
  const response = await fetch(apiBase + url, { method, signal: AbortSignal.timeout(30000),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok || ![0, 200].includes(result.code)) throw new Error(`API ${response.status}: ${result.message ?? result.msg ?? result.code}`);
  return result.data;
}

export async function login() {
  const result = await api('/auth/login', 'POST', { username: 'admin', password: 'admin123' });
  return result.token ?? result.accessToken;
}

export async function loadDesigner() {
  const frontend = path.join(root, 'gmp-platform/frontend');
  const file = path.join(out, `local/designer-${process.pid}.cjs`);
  await mkdir(path.dirname(file), { recursive: true });
  await build({ absWorkingDir: frontend, stdin: { resolveDir: frontend, contents: `
    export { importExcelToCanvasPage } from './src/pages/master-data/template-designer-react/utils/importExcel';
    export { createEmptyTemplateDesignerDocument, serializeTemplateDesignerDocument } from './src/pages/master-data/template-designer-react/utils/document';
    export { getFieldTypeDefinition } from './src/pages/master-data/template-designer-react/registry/fieldRegistry';
  ` }, bundle: true, platform: 'node', format: 'cjs', outfile: file, logLevel: 'silent' });
  return createRequire(import.meta.url)(file);
}

export function range(address) {
  const match = /^([A-Z]+)([1-9]\d*)(?::([A-Z]+)([1-9]\d*))?$/.exec(address);
  if (!match) throw new Error('Invalid cell range: ' + address);
  const col = letters => [...letters].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
  return { t: Number(match[2]), l: col(match[1]), b: Number(match[4] ?? match[2]), r: col(match[3] ?? match[1]) };
}

export function compile(draft, sample, designer, lookupItems) {
  const page = structuredClone(sample.page);
  const errors = [], keys = new Set();
  const fields = [];
  const types = new Set(['text', 'number', 'datetime', 'reference', 'signature', 'attachment', 'image']);
  for (const [index, proposed] of (draft.fields ?? []).entries()) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(proposed.key) || keys.has(proposed.key)) { errors.push('字段key必须唯一且为英文标识'); continue; }
    keys.add(proposed.key);
    if (!types.has(proposed.type)) { errors.push('不支持字段类型：' + proposed.type); continue; }
    let cell;
    try { cell = range(proposed.range); } catch (error) { errors.push(error.message); continue; }
    if (cell.t > cell.b || cell.l > cell.r || cell.t < 1 || cell.b > page.sheet.rowCount || cell.r > page.sheet.columnCount) {
      errors.push(proposed.key + ': 字段范围超出原表'); continue;
    }
    if (!sample.input.cells.some(c => c.address === proposed.source)) errors.push(proposed.key + ': 依据必须指向原表已有文字单元格');
    if (proposed.box && (proposed.box.x !== 0 || proposed.box.y !== 0 || proposed.box.w !== 1 || proposed.box.h !== 1)) {
      errors.push(proposed.key + ': 当前单元格画布不支持分数区域；需先拆分表格，本轮工具不提供拆分');
    }
    for (const existing of page.nodes) {
      const other = existing.style?.cellRange;
      if (other && cell.t <= other.b && cell.b >= other.t && cell.l <= other.r && cell.r >= other.l) errors.push(proposed.key + ': 与字段 ' + existing.bindings.fieldId + ' 占用同一单元格区域');
    }
    const definition = designer.getFieldTypeDefinition(proposed.type);
    const field = definition.defaultField(proposed.label, index + 1);
    Object.assign(field, { id: proposed.key, code: proposed.key, groupId: 'default-group',
      typeConfig: { ...field.typeConfig, ...(proposed.config ?? {}) } });
    if (field.type === 'reference' && !['material', 'equipment', 'user', 'department', 'product', 'scrapReason', 'defectReason'].includes(field.typeConfig.sourceType)) errors.push(field.id + ': 不支持的引用目录');
    fields.push(field);
    const widths = page.sheet.columnWidths, heights = page.sheet.rowHeights;
    const sum = (values, start, end) => values.slice(start, end).reduce((a, b) => a + b, 0);
    const box = proposed.box ?? { x: 0, y: 0, w: 1, h: 1 };
    if (![box.x, box.y, box.w, box.h].every(Number.isFinite) || box.x < 0 || box.y < 0 || box.w <= 0 || box.h <= 0 || box.x + box.w > 1.001 || box.y + box.h > 1.001) errors.push(field.id + ': box必须在单元格区域内');
    const width = sum(widths, cell.l - 1, cell.r), height = sum(heights, cell.t - 1, cell.b);
    page.nodes.push({ id: 'ai-' + field.id, type: definition.defaultComponentType, parentId: null, children: [],
      props: { label: field.name }, bindings: { fieldId: field.id, required: false, readonly: false, hidden: false, widgetConfig: {} },
      style: { position: 'absolute', cellRange: cell,
        compLeft: sum(widths, 0, cell.l - 1) + width * box.x,
        compTop: sum(heights, 0, cell.t - 1) + height * box.y,
        compWidth: width * box.w, compHeight: height * box.h } });
  }
  if (!fields.length) errors.push('未生成可编辑字段');
  const bindings = (draft.bindings ?? []).map((binding, i) => {
    for (const key of Object.values(binding.sources ?? {})) if (!keys.has(key)) errors.push('用途引用了不存在的字段：' + key);
    return { id: 'ai-binding-' + (i + 1), enabled: true, modelId: binding.modelId, sources: binding.sources };
  });
  const document = designer.createEmptyTemplateDesignerDocument({ schema: 'edhr-template-designer-react', version: 1,
    templateId: 'experiment', versionId: 'experiment', templateName: draft.name, versionLabel: 'V1.0' },
  { model: { groups: [{ id: 'default-group', name: '默认分组' }], fields, projection: { version: 'form-projection-v1', bindings, lookupItems } },
    canvas: { pages: [page] } });
  return { document, payload: designer.serializeTemplateDesignerDocument(document), errors };
}
