import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, '../..');
const SCHEMA_VERSION = '1.0.0';
const SOURCE_FILE_NAME = 'GCT_eDHR_功能详细规格与AI实现提示词.md';

const sourceFile = resolve(workspaceRoot, SOURCE_FILE_NAME);
const frontendMetadataDir = resolve(
  workspaceRoot,
  'gmp-platform/frontend/src/features/gct-edhr/metadata',
);
const backendSpecFile = resolve(
  workspaceRoot,
  'gmp-platform/backend/src/main/resources/gct/gct-page-specs.json',
);

const generatedPagesFile = resolve(frontendMetadataDir, 'generatedPages.ts');
const generatedMenusFile = resolve(frontendMetadataDir, 'generatedMenus.ts');

const SYSTEM_FIELDS = [
  'id',
  'tenantId',
  'status',
  'createdBy',
  'createdAt',
  'updatedBy',
  'updatedAt',
  'remark',
];

const BASE_STATUSES = ['草稿', '启用', '禁用', '已删除'];
const BUSINESS_STATUSES = ['待处理', '处理中', '已完成', '已驳回', '已撤回', '已作废'];

const EXPECTED_MODULE_COUNTS = {
  操作面板: 1,
  基础建模: 24,
  生产管理: 13,
  检验管理: 10,
  放行管理: 4,
  记录管理: 17,
  统计报表: 17,
  系统管理: 13,
};

const EXPECTED_TYPE_COUNTS = {
  master: 40,
  list: 22,
  report: 11,
  transaction: 9,
  execution: 8,
  approval: 6,
  dashboard: 3,
};

const MODULE_MENU_ICONS = {
  操作面板: 'Dashboard',
  基础建模: 'AccountTree',
  生产管理: 'PrecisionManufacturing',
  检验管理: 'Storage',
  放行管理: 'Storage',
  记录管理: 'Storage',
  统计报表: 'Dashboard',
  系统管理: 'Settings',
};

const SLUGS = {
  操作面板: 'operation-panel',
  基础建模: 'basic-modeling',
  生产管理: 'production-management',
  检验管理: 'inspection-management',
  放行管理: 'release-management',
  记录管理: 'record-management',
  统计报表: 'statistics-reports',
  系统管理: 'system-management',

  工厂建模: 'factory-modeling',
  产品建模: 'product-modeling',
  设备建模: 'equipment-modeling',
  模板建模: 'template-modeling',
  制程建模: 'process-modeling',
  原因建模: 'reason-modeling',
  流程建模: 'workflow-modeling',
  标签建模: 'label-modeling',
  生产准备: 'production-preparation',
  批次生产: 'batch-production',
  SN生产: 'serial-production',
  生产配置: 'production-configuration',
  检验作业: 'inspection-operations',
  检验建模: 'inspection-modeling',
  检验配置: 'inspection-configuration',
  放行作业: 'release-operations',
  放行配置: 'release-configuration',
  表单管理: 'form-management',
  DHR管理: 'dhr-management',
  记录本: 'record-book',
  变更管理: 'change-management',
  记录打印: 'record-printing',
  报表: 'reports',
  看板: 'dashboards',
  自定义: 'custom-reporting',
  组织权限: 'organization-permissions',
  集成中心: 'integration-center',
  审计追踪: 'audit-tracking',
  系统配置: 'system-configuration',

  工作台: 'workbench',
  车间建模: 'workshop-modeling',
  产品家族: 'product-family',
  产品列表: 'product-list',
  SOP文档: 'sop-document',
  单位建模: 'unit-modeling',
  设备类型: 'equipment-type',
  设备列表: 'equipment-list',
  表单模板: 'form-template',
  DHR模板: 'dhr-template',
  流转单模板: 'routing-ticket-template',
  编码规则: 'coding-rule',
  工序建模: 'operation-modeling',
  工艺路线: 'process-route',
  制程配置: 'process-configuration',
  不良分类: 'defect-category',
  不良原因: 'defect-reason',
  报废分类: 'scrap-category',
  报废原因: 'scrap-reason',
  审核流程: 'approval-workflow',
  流程日志: 'workflow-log',
  流程干预: 'workflow-intervention',
  标签参数: 'label-parameter',
  标签模板: 'label-template',
  解析规则: 'parsing-rule',
  工单管理: 'work-order-management',
  批次管理: 'batch-management',
  SN管理: 'serial-management',
  生产执行: 'production-execution',
  返工执行: 'rework-execution',
  批次事务: 'batch-transaction',
  返工列表: 'rework-list',
  SN事务: 'serial-transaction',
  事务列表: 'transaction-list',
  事务配置: 'transaction-configuration',
  检验执行: 'inspection-execution',
  检验列表: 'inspection-list',
  检验事务: 'inspection-transaction',
  检验方法: 'inspection-method',
  检验项目: 'inspection-item',
  检验分类: 'inspection-category',
  检验方案: 'inspection-plan',
  检验规程: 'inspection-procedure',
  放行列表: 'release-list',
  放行规程: 'release-procedure',
  表单填报: 'form-filling',
  表单审核: 'form-approval',
  表单列表: 'form-list',
  DHR填报: 'dhr-filling',
  DHR汇总: 'dhr-summary',
  DHR审核: 'dhr-approval',
  DHR列表: 'dhr-list',
  我的记录本: 'my-record-book',
  记录本填报: 'record-book-filling',
  记录本列表: 'record-book-list',
  记录本标签: 'record-book-label',
  表单变更: 'form-change',
  DHR变更: 'dhr-change',
  记录本变更: 'record-book-change',
  变更审核: 'change-approval',
  我的打印: 'my-printing',
  打印列表: 'print-list',
  生产追溯: 'production-traceability',
  检验追溯: 'inspection-traceability',
  放行追溯: 'release-traceability',
  表单追溯: 'form-traceability',
  DHR追溯: 'dhr-traceability',
  记录本追溯: 'record-book-traceability',
  报工记录: 'work-report-record',
  报废记录: 'scrap-record',
  消耗记录: 'consumption-record',
  消息记录: 'message-record',
  标签记录: 'label-record',
  运营座舱: 'operations-cockpit',
  生产监控: 'production-monitoring',
  品质监控: 'quality-monitoring',
  数据集: 'dataset',
  报表查看: 'report-view',
  报表设计: 'report-design',
  用户管理: 'user-management',
  组织成员: 'organization-member',
  角色管理: 'role-management',
  权限管理: 'permission-management',
  用户席位: 'user-seat',
  连接流: 'connection-flow',
  连接器: 'connector',
  数据源: 'data-source',
  设备互联: 'equipment-connectivity',
  数据追溯: 'data-traceability',
  登录日志: 'login-log',
  系统设置: 'system-settings',
  模型设置: 'model-settings',

  处理: 'process',
  详情: 'detail',
  重置: 'reset',
  查询: 'query',
  导出: 'export',
  导入: 'import',
  模板导入: 'template-import',
  新建: 'create',
  编辑: 'edit',
  删除: 'delete',
  复制: 'copy',
  版本创建: 'version-create',
  版本复制: 'version-copy',
  设计: 'design',
  版本对比: 'compare-version',
  配置: 'configure',
  保存: 'save',
  删除文件: 'delete-file',
  添加字段: 'add-field',
  添加: 'add',
  移除并交接: 'remove-and-transfer',
  新建分类: 'create-category',
  禁用: 'disable',
  启用: 'enable',
  查看: 'view',
  拆分: 'split',
  撤回: 'withdraw',
  打印: 'print',
  导入标签模板: 'label-template-import',
  发布: 'publish',
  放行: 'release',
  汇总: 'summarize',
  检验: 'inspect',
  结束: 'finish',
  流程配置: 'workflow-configure',
  批量下载: 'batch-download',
  取消发布: 'unpublish',
  权限配置: 'permission-configure',
  填报: 'fill',
  下载: 'download',
  新建报表: 'create-report',
  新建数据集: 'create-dataset',
  移动: 'move',
  执行详情: 'execution-detail',
  重置密码: 'reset-password',
  转办: 'transfer',
  转发: 'forward',
  审核: 'approve',
  审批: 'approve',
  驳回: 'reject',
  提交: 'submit',
};

const SEMANTIC_TRANSITION_ACTION_CODES = new Set([
  'release',
  'withdraw',
  'finish',
  'transfer',
  'reset_password',
  'approve',
  'reject',
  'submit',
  'process',
  'disable',
  'enable',
  'delete',
  'copy',
  'version_create',
  'version_copy',
  'print',
  'download',
  'export',
  'import',
  'publish',
  'unpublish',
  'save',
  'configure',
]);

function stableHash(value) {
  return createHash('sha1').update(value).digest('hex').slice(0, 8);
}

function sourceHash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function slugifyLabel(label) {
  const compactLabel = label.replace(/\s+/g, '');
  if (SLUGS[compactLabel]) return SLUGS[compactLabel];

  const ascii = compactLabel
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return ascii || `item-${stableHash(compactLabel)}`;
}

function toFieldName(label) {
  if (/^[A-Za-z][A-Za-z0-9]*$/.test(label)) return label;
  return `field_${stableHash(label)}`;
}

function toActionCode(label) {
  return slugifyLabel(label).replace(/-/g, '_');
}

function normalizeActionLabel(label) {
  return label.trim().replace(/\s+/g, '');
}

function parseMarkdownSections(markdown) {
  const stopIndex = markdown.search(/^## 12\./m);
  if (stopIndex < 0) {
    throw new Error('Could not find "## 12." stop marker in GCT spec document.');
  }

  const content = markdown.slice(0, stopIndex);
  const headingPattern = /^###\s+(\d+\.\d+)\.\s+(.+)$/gm;
  const matches = [...content.matchAll(headingPattern)];

  return matches.map((match, index) => {
    const next = matches[index + 1];
    return {
      section: match[1],
      headingText: match[2].trim(),
      body: content.slice(match.index, next?.index ?? content.length).trim(),
    };
  });
}

function splitHeading(headingText) {
  const [modulePart, detailPart] = headingText.split(/\s+\/\s+/);
  if (!modulePart || !detailPart) {
    throw new Error(`Invalid page heading: ${headingText}`);
  }

  if (!detailPart.includes('>')) {
    const label = detailPart.trim();
    return {
      module: modulePart.trim(),
      group: label,
      label,
      title: `${modulePart.trim()} / ${label}`,
    };
  }

  const [group, label] = detailPart.split(/\s+>\s+/);
  return {
    module: modulePart.trim(),
    group: group.trim(),
    label: label.trim(),
    title: `${modulePart.trim()} / ${group.trim()} > ${label.trim()}`,
  };
}

function readInline(body, label) {
  const match = body.match(new RegExp(`^\\*\\*${label}\\*\\*：(.+)$`, 'm'));
  return match?.[1].trim() ?? '';
}

function readBlock(body, label) {
  const marker = `**${label}**：`;
  const start = body.indexOf(marker);
  if (start < 0) return '';

  const rest = body.slice(start + marker.length);
  const nextHeading = rest.search(/\n\n\*\*[^*]+\*\*：/);
  return rest.slice(0, nextHeading < 0 ? undefined : nextHeading).trim();
}

function readAiPrompt(body) {
  const match = body.match(/\*\*AI 开发提示词\*\*：\s*```text\s*([\s\S]*?)\s*```/);
  return match?.[1].trim() ?? '';
}

function parseFieldList(raw) {
  if (!raw || raw.trim() === '无') return [];

  const fields = new Map();
  const matches = [...raw.matchAll(/`([^`]+)`/g)];

  for (const match of matches) {
    const sourceLabel = match[1].trim();
    const required = /^\*\s*/.test(sourceLabel);
    const label = sourceLabel.replace(/^\*\s*/, '').trim();
    if (!label) continue;

    const existing = fields.get(label);
    fields.set(label, {
      label,
      required: Boolean(existing?.required || required),
    });
  }

  return [...fields.values()];
}

function makeField(label, required, usage, system = false) {
  return {
    id: system ? `system-${label}` : `field-${stableHash(label)}`,
    name: toFieldName(label),
    label,
    required,
    system,
    usages: [usage],
  };
}

function mergeFields(...fieldGroups) {
  const merged = new Map();

  for (const fields of fieldGroups) {
    for (const field of fields) {
      const existing = merged.get(field.label);
      if (existing) {
        existing.required = existing.required || field.required;
        existing.system = existing.system || field.system;
        existing.usages = [...new Set([...existing.usages, ...field.usages])];
      } else {
        merged.set(field.label, { ...field, usages: [...field.usages] });
      }
    }
  }

  return [...merged.values()];
}

function parseActions(raw) {
  if (!raw || raw.trim() === '无') return [];

  const actions = new Map();
  const matches = [...raw.matchAll(/`([^`]+)`/g)];

  for (const match of matches) {
    const sourceLabel = match[1].trim();
    const label = normalizeActionLabel(sourceLabel);
    if (!label) continue;

    actions.set(label, {
      id: `action-${stableHash(label)}`,
      code: toActionCode(label),
      label,
      sourceLabel,
      permissionRequired: true,
      auditRequired: true,
    });
  }

  return [...actions.values()];
}

function parseApiSuggestions(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim().replace(/^-\s*/, ''))
    .filter(Boolean);
}

function makeStateTransitions(actions) {
  return actions
    .filter((action) => isSemanticTransitionAction(action.code))
    .map((action) => ({
      from: '当前状态',
      to: '目标状态',
      action: action.code,
      auditRequired: true,
    }));
}

function isSemanticTransitionAction(actionCode) {
  return (
    SEMANTIC_TRANSITION_ACTION_CODES.has(actionCode) ||
    actionCode.endsWith('_import') ||
    actionCode.endsWith('_export') ||
    actionCode.endsWith('_download') ||
    actionCode.endsWith('_print') ||
    actionCode.endsWith('_configure')
  );
}

function makePage(sectionData) {
  const heading = splitHeading(sectionData.headingText);
  const sectionSlug = sectionData.section.replace('.', '-');
  const moduleSlug = slugifyLabel(heading.module);
  const groupSlug = slugifyLabel(heading.group);
  const pageBaseSlug = slugifyLabel(heading.label);
  const pageSlug = `${pageBaseSlug}-${sectionSlug}`;
  const path = `/gct-edhr/${moduleSlug}/${groupSlug}/${pageSlug}`;

  const querySpecs = parseFieldList(readInline(sectionData.body, '查询字段'));
  const listSpecs = parseFieldList(readInline(sectionData.body, '列表字段'));
  const formSpecs = parseFieldList(readInline(sectionData.body, '表单 / 详情业务字段建议'));

  const queryFields = querySpecs.map((field) =>
    makeField(field.label, field.required, 'query', false),
  );
  const listFields = listSpecs.map((field) => makeField(field.label, field.required, 'list', false));
  const formFields = formSpecs.map((field) => makeField(field.label, field.required, 'form', false));
  const systemFields = SYSTEM_FIELDS.map((field) =>
    makeField(field, ['id', 'tenantId', 'status'].includes(field), 'system', true),
  );
  const actions = parseActions(readInline(sectionData.body, '页面功能动作'));

  return {
    code: `gct_${sectionData.section.replace('.', '_')}_${pageBaseSlug.replace(/-/g, '_')}`,
    section: sectionData.section,
    module: heading.module,
    moduleSlug,
    group: heading.group,
    groupSlug,
    title: heading.title,
    label: heading.label,
    pageSlug,
    path,
    type: readInline(sectionData.body, '页面类型'),
    positioning: readInline(sectionData.body, '功能定位'),
    businessScenario: readInline(sectionData.body, '业务场景'),
    boundary: readInline(sectionData.body, '功能边界'),
    interfaceSuggestion: readBlock(sectionData.body, '接口建议'),
    apiSuggestions: parseApiSuggestions(readBlock(sectionData.body, '接口建议')),
    acceptanceCriteria: readInline(sectionData.body, '验收标准'),
    aiPrompt: readAiPrompt(sectionData.body),
    stateFlow: readBlock(sectionData.body, '状态与流程'),
    baseStatuses: BASE_STATUSES,
    businessStatuses: BUSINESS_STATUSES,
    queryFields,
    listFields,
    formFields,
    systemFields,
    fields: mergeFields(queryFields, listFields, formFields, systemFields),
    actions,
    stateTransitions: makeStateTransitions(actions),
  };
}

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function assertExpectedCounts(label, actual, expected) {
  const failures = [];
  for (const [key, count] of Object.entries(expected)) {
    if (actual[key] !== count) {
      failures.push(`${label} ${key}: expected ${count}, got ${actual[key] ?? 0}`);
    }
  }

  const unexpected = Object.keys(actual).filter((key) => !(key in expected));
  for (const key of unexpected) {
    failures.push(`${label} ${key}: unexpected count ${actual[key]}`);
  }

  if (failures.length) {
    throw new Error(failures.join('\n'));
  }
}

function assertGeneratedPages(pages) {
  if (pages.length !== 99) {
    throw new Error(`Expected 99 GCT eDHR pages, got ${pages.length}.`);
  }

  assertExpectedCounts('module', countBy(pages, (page) => page.module), EXPECTED_MODULE_COUNTS);
  assertExpectedCounts('page type', countBy(pages, (page) => page.type), EXPECTED_TYPE_COUNTS);

  const uniquePaths = new Set(pages.map((page) => page.path));
  if (uniquePaths.size !== pages.length) {
    throw new Error('Generated page paths are not unique.');
  }

  for (const page of pages) {
    if (!/^\/gct-edhr\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/.test(page.path)) {
      throw new Error(`Generated non-ASCII or invalid path for ${page.title}: ${page.path}`);
    }

    const fallbackAction = page.actions.find((action) => action.code.startsWith('item_'));
    if (fallbackAction) {
      throw new Error(`Generated fallback action code for ${page.title}: ${fallbackAction.label}`);
    }
  }
}

function makeMenus(pages) {
  return Object.keys(EXPECTED_MODULE_COUNTS).map((module) => {
    const modulePages = pages.filter((page) => page.module === module);
    const labelCounts = countBy(modulePages, (page) => page.label);

    return {
      label: module,
      icon: MODULE_MENU_ICONS[module],
      children: modulePages.map((page) => ({
        label: labelCounts[page.label] > 1 ? `${page.group} / ${page.label}` : page.label,
        path: page.path,
      })),
    };
  });
}

function makeFrontendMenuModule(menus) {
  return {
    id: 'gct-edhr',
    label: 'GCT',
    icon: 'Dashboard',
    menus,
  };
}

function makeGeneratedHeader() {
  return [
    '// This file is generated by scripts/gct/generate-gct-specs.mjs.',
    '// Do not edit by hand.',
    '',
  ].join('\n');
}

function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function normalizeGeneratedAt(documentDate) {
  return /^\d{4}-\d{2}-\d{2}$/.test(documentDate)
    ? `${documentDate}T00:00:00.000+08:00`
    : documentDate;
}

async function writeGeneratedFiles(pages, menus, metadata) {
  const menuModule = makeFrontendMenuModule(menus);
  const backendPayload = {
    ...metadata,
    source: SOURCE_FILE_NAME,
    pageCount: pages.length,
    moduleCounts: countBy(pages, (page) => page.module),
    pageTypeCounts: countBy(pages, (page) => page.type),
    menus,
    pages,
  };

  await mkdir(frontendMetadataDir, { recursive: true });
  await mkdir(dirname(backendSpecFile), { recursive: true });

  await writeFile(
    generatedPagesFile,
    `${makeGeneratedHeader()}import type { EdhrPageMeta } from '../types';\n\nexport const GCT_EDHR_SPEC_METADATA = ${JSON.stringify(
      metadata,
      null,
      2,
    )} as const;\n\nexport const GCT_EDHR_PAGES = ${JSON.stringify(
      pages,
      null,
      2,
    )} as const as unknown as EdhrPageMeta[];\n`,
  );

  await writeFile(
    generatedMenusFile,
    `${makeGeneratedHeader()}import type { SidebarModule } from '@/utils/constants';\n\nexport const GCT_EDHR_MENU_MODULE = ${JSON.stringify(
      menuModule,
      null,
      2,
    )} as const as unknown as SidebarModule;\n`,
  );

  await writeFile(backendSpecFile, serialize(backendPayload));
}

async function main() {
  const markdown = await readFile(sourceFile, 'utf8');
  const documentDate = markdown.match(/^生成日期：(.+)$/m)?.[1].trim() ?? 'unknown';
  const metadata = {
    schemaVersion: SCHEMA_VERSION,
    sourceFile: SOURCE_FILE_NAME,
    sourceHash: sourceHash(markdown),
    generatedAt: normalizeGeneratedAt(documentDate),
  };
  const pages = parseMarkdownSections(markdown).map(makePage);

  assertGeneratedPages(pages);

  const menus = makeMenus(pages);
  await writeGeneratedFiles(pages, menus, metadata);

  console.log(`Generated ${pages.length} GCT eDHR page specs.`);
  console.log(`- ${generatedPagesFile}`);
  console.log(`- ${generatedMenusFile}`);
  console.log(`- ${backendSpecFile}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
