import { FIELD_TYPE_CATEGORY, FIELD_TYPE } from '@/enums/appEnum';
import { isNil } from 'lodash-es';

type Tag =
  | 'show:always' // 都显示
  | 'hide:always' // 都不显示
  | 'show:platform' // 平台-普通应用
  | 'show:medpro' // 平台-MedPro应用
  | 'show:edhr' // 平台-eDHR应用
  | 'show:edhr-online' // eDHR 在线表单
  | 'show:qms' // 平台-QMS应用
  | 'show:qms-online' // qms 在线表单
  | 'show:medpro-online' // MedPro 在线表单
  | 'hide:datamodel' // 数据模型场景隐藏
  | 'hide:submodel' // 子模型隐藏
  | 'hide:platform-submodel-deep' // 子模型二级或更深隐藏
  | 'hide:medpro-submodel-deep' // 子模型二级或更深隐藏
  | 'hide:online-submodel'; // 在线表单子模型

type ShowCtx = {
  suiteKey?: string; // 'MEDPRO' | 'eDHR' | other
  isSubModel?: boolean;
  isDataModel?: boolean;
  isInOnlineForm?: boolean;
  maxSubLevel?: number;
};

const TAG_PREDICATES: Record<Tag, (ctx: ShowCtx) => boolean> = {
  'show:always': () => true,
  'hide:always': () => true, // hide:always 总是成立（后面会优先判断 hide）
  'show:platform': (ctx) => isNil(ctx.suiteKey),
  'show:medpro': (ctx) => ctx.suiteKey === 'MEDPRO' && !ctx.isInOnlineForm,
  'show:edhr': (ctx) => ctx.suiteKey === 'eDHR' && !ctx.isInOnlineForm,
  'show:edhr-online': (ctx) => ctx.suiteKey === 'eDHR' && !!ctx.isInOnlineForm,
  'show:medpro-online': (ctx) => ctx.suiteKey === 'MEDPRO' && !!ctx.isInOnlineForm,
  'show:qms': (ctx) => ctx.suiteKey === 'QMS' && !ctx.isInOnlineForm,
  'show:qms-online': (ctx) => ctx.suiteKey === 'QMS' && !!ctx.isInOnlineForm,
  'hide:datamodel': (ctx) => !!ctx.isDataModel,
  'hide:submodel': (ctx) => !!ctx.isSubModel,
  'hide:platform-submodel-deep': (ctx) =>
    isNil(ctx.suiteKey) && !!ctx.isSubModel && ctx.maxSubLevel !== 1,
  'hide:medpro-submodel-deep': (ctx) =>
    ctx.suiteKey === 'MEDPRO' && !ctx.isInOnlineForm && !!ctx.isSubModel && ctx.maxSubLevel !== 1,
  'hide:online-submodel': (ctx) => !!ctx.isSubModel && !!ctx.isInOnlineForm,
};

function shouldShowContent(meta, type, ctx: ShowCtx = {}): boolean {
  const tags = meta[type] ?? [];

  for (const t of tags) {
    if (t.startsWith('hide')) {
      const pred = TAG_PREDICATES[t as Tag];
      if (pred && pred(ctx)) return false;
    }
  }

  for (const t of tags) {
    if (t.startsWith('show')) {
      const pred = TAG_PREDICATES[t as Tag];
      if (pred && pred(ctx)) return true;
    }
  }

  return false;
}

const FIELD_META: Partial<Record<FIELD_TYPE, Tag[]>> = {
  [FIELD_TYPE.PRIMARY_KEY]: ['hide:always'],
  [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY]: ['hide:always'],
  [FIELD_TYPE.TEXT]: ['show:always'],
  [FIELD_TYPE.LONG_TEXT]: ['show:always'],
  [FIELD_TYPE.INTEGER]: ['show:always'],
  [FIELD_TYPE.LONG]: ['show:always'],
  [FIELD_TYPE.DOUBLE]: ['show:always'],
  [FIELD_TYPE.DECIMAL]: ['show:always'],
  [FIELD_TYPE.BOOLEAN]: ['show:always'],
  [FIELD_TYPE.DATE]: ['show:always'],
  [FIELD_TYPE.TIME]: ['show:always'],
  [FIELD_TYPE.DATE_TIME]: ['show:always'],
  [FIELD_TYPE.IMAGE]: ['show:always'],
  [FIELD_TYPE.ATTACHMENT]: ['show:always'],
  [FIELD_TYPE.SERIAL]: ['show:platform', 'show:medpro', 'hide:datamodel'],
  [FIELD_TYPE.MASTERSLAVE]: [
    'show:always',
    'hide:platform-submodel-deep',
    'hide:medpro-submodel-deep',
    'hide:online-submodel',
  ],
  [FIELD_TYPE.USER]: ['show:always'],
  [FIELD_TYPE.USER_MULTI]: ['show:always'],
  [FIELD_TYPE.ORG]: ['show:always'],
  [FIELD_TYPE.ORG_MULTI]: ['show:always'],
  [FIELD_TYPE.ENUM]: ['show:platform', 'show:medpro'],
  [FIELD_TYPE.ENUM_MULTI]: ['show:platform', 'show:medpro'],
  [FIELD_TYPE.OPTION]: ['show:medpro-online', 'show:edhr-online', 'show:qms-online'],
  [FIELD_TYPE.OPTION_MULTI]: ['show:medpro-online', 'show:edhr-online', 'show:qms-online'],
  [FIELD_TYPE.REF]: ['show:platform', 'show:medpro', 'show:medpro-online', 'show:edhr', 'show:qms'],
  [FIELD_TYPE.REF_MULTI]: ['show:platform', 'show:medpro', 'show:medpro-online'],
  [FIELD_TYPE.RDO_REF]: ['show:medpro'],
  [FIELD_TYPE.EXPRESSION]: ['show:platform', 'show:medpro', 'hide:datamodel'],
  [FIELD_TYPE.EXPRESSION_CONDITION]: ['show:platform', 'show:medpro', 'hide:datamodel'],
  [FIELD_TYPE.AGG]: ['show:platform', 'show:medpro', 'hide:datamodel', 'hide:submodel'],
  [FIELD_TYPE.ESOP]: ['show:medpro'],
  [FIELD_TYPE.TRANSACTION]: ['show:medpro', 'hide:datamodel'],
  [FIELD_TYPE.LABEL_TEMPLATE]: ['show:platform', 'show:medpro', 'hide:datamodel'],
  [FIELD_TYPE.LABEL_TEMPLATE_REF]: ['show:platform', 'show:medpro'],
  [FIELD_TYPE.DOCUMENT_TEMPLATE]: ['hide:always'],
  [FIELD_TYPE.SERIALRULE]: ['show:platform', 'show:medpro', 'hide:datamodel'],
  [FIELD_TYPE.PRINTER]: ['show:platform', 'show:medpro'],
  [FIELD_TYPE.MESSAGE_TMPL]: ['show:platform', 'show:medpro'],
  [FIELD_TYPE.RANGE_USER]: ['show:platform', 'show:medpro'],
  [FIELD_TYPE.SIGNATURE]: ['show:always'],
  [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: ['show:platform', 'show:medpro'],
  [FIELD_TYPE.E_DHR_TEMPLATE]: ['show:medpro'],
  [FIELD_TYPE.DATA_TABLE_FORMULA]: ['hide:always'],
  [FIELD_TYPE.READONLYCMP]: ['hide:always'],
  [FIELD_TYPE.Biz_Process]: ['hide:always'],
  [FIELD_TYPE.Approval_Process]: ['show:platform', 'show:medpro'],
  [FIELD_TYPE.MATERIAL_NO]: ['show:edhr-online'],
  [FIELD_TYPE.RELATED_LOT_NO]: ['show:edhr-online'],
  [FIELD_TYPE.PRODUCT]: ['show:edhr-online'],
  [FIELD_TYPE.DEVICE]: ['show:edhr-online'],
  [FIELD_TYPE.MFG_ORDER]: ['show:edhr-online'],
  [FIELD_TYPE.RECORD_NO]: ['show:edhr-online'],
  [FIELD_TYPE.TRACE_DATE]: ['show:edhr-online'],
  [FIELD_TYPE.ORDER_NO]: ['show:edhr-online'],
  [FIELD_TYPE.ROUTING_OPERATION]: ['show:edhr-online'],
  [FIELD_TYPE.GOOD_QTY]: ['show:edhr-online'],
  [FIELD_TYPE.NOT_GOOD_QTY]: ['show:edhr-online'],
  [FIELD_TYPE.REPORT_START_TIME]: ['show:edhr-online'],
  [FIELD_TYPE.REPORT_END_TIME]: ['show:edhr-online'],
  [FIELD_TYPE.WORK_HOURS]: ['show:edhr-online'],
  [FIELD_TYPE.PRODUCTION_DATE]: ['show:edhr-online'],
  [FIELD_TYPE.REPORTER]: ['show:edhr-online'],
  [FIELD_TYPE.NOT_GOOD_REASON]: ['show:edhr-online'],
  [FIELD_TYPE.NOT_GOOD_GROUP]: ['show:edhr-online'],
  [FIELD_TYPE.SCRAP_REASON]: ['show:edhr-online'],
  [FIELD_TYPE.SCRAP_GROUP]: ['show:edhr-online'],
  [FIELD_TYPE.SCRAP_QTY]: ['show:edhr-online'],
  [FIELD_TYPE.SCRAP_MATERIAL]: ['show:edhr-online'],
  [FIELD_TYPE.SCRAP_MATERIAL_NO]: ['show:edhr-online'],
  [FIELD_TYPE.DESTRUCTIVE_TEST_QTY]: ['show:edhr-online'],
  [FIELD_TYPE.PRODUCT_CHECK_QTY]: ['show:edhr-online'],
  [FIELD_TYPE.MATERIAL_CHECK_QTY]: ['show:edhr-online'],
  [FIELD_TYPE.DEVICE_REF]: ['show:medpro-online'],
  [FIELD_TYPE.DEVICE_REF_MULTI]: ['show:medpro-online'],
  [FIELD_TYPE.WAREHOUSE_RECEIPT_NO]: ['show:edhr-online'],
  [FIELD_TYPE.WAREHOUSE_RECEIPT_DATE]: ['show:edhr-online'],
  [FIELD_TYPE.WAREHOUSE_MANAGER]: ['show:edhr-online'],
  [FIELD_TYPE.WAREHOUSE_IN_OUT]: ['show:edhr-online', 'hide:submodel'],
};

export function getNeedShowFields(ctx: ShowCtx = {}) {
  return (Object.keys(FIELD_META) as FIELD_TYPE[]).filter((f) =>
    shouldShowContent(FIELD_META, f, ctx),
  );
}

const CATEGORIES_META: Partial<Record<FIELD_TYPE_CATEGORY, Tag[]>> = {
  [FIELD_TYPE_CATEGORY.ALL]: ['show:always'],
  [FIELD_TYPE_CATEGORY.BASIC]: ['show:always'],
  [FIELD_TYPE_CATEGORY.LOGIC]: ['show:always'],
  [FIELD_TYPE_CATEGORY.TRACE]: ['show:edhr-online'],
  [FIELD_TYPE_CATEGORY.BUSINESS]: ['show:edhr-online'],
  [FIELD_TYPE_CATEGORY.MATERIAL]: ['show:edhr-online'],
  [FIELD_TYPE_CATEGORY.PRODUCE]: ['show:medpro-online'],
  [FIELD_TYPE_CATEGORY.BALANCE]: ['show:edhr-online'],
};

export function getNeedShowCategories(ctx: ShowCtx = {}) {
  return (Object.keys(CATEGORIES_META) as FIELD_TYPE_CATEGORY[]).filter((f) =>
    shouldShowContent(CATEGORIES_META, f, ctx),
  );
}

// 判断类型是否属于某个字段组
export const isTypeInGroup = (type: string, group: string[]) => group.includes(type);

// 生成自动字段key
export const generateAutoFieldKey = (type: string, fieldGroup: string[], keyList: string[]) => {
  if (!isTypeInGroup(type, fieldGroup)) return;
  const nums = keyList
    .filter((i) => i.startsWith(type))
    .map((i) => parseInt(i.match(/\d+/)?.[0] || '0', 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${type}_${max + 1}_`;
};
