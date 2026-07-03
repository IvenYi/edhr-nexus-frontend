import { isNil, omit } from 'lodash-es';

/** 公共基础列配置 */
const baseColumnConfig = {
  minWidth: 100,
  showOverflow: true,
  slots: { default: 'default' },
  align: 'left',
};

function uomFormatter({ cellValue, row, column }: any) {
  const { field } = column;
  return row?._DICT?.[field]?.[cellValue]?.join?.('') ?? cellValue ?? '';
}

const columnFragments = {
  radio: { field: 'radio', type: 'radio', minWidth: 40, showOverflow: false },
  checkbox: { field: 'checkbox', type: 'checkbox', minWidth: 40, showOverflow: false },
  code: {
    title: $t('sys.edhr.field.code'),
    field: 'code_',
    slots: { default: 'rdo_version_render' },
    minWidth: 200,
  },
  name: { title: $t('sys.name'), field: 'name_', minWidth: 200 },
  spec: { title: $t('sys.edhr.spec'), field: 'spec_', minWidth: 120 },
  uom: {
    title: $t('sys.onlineForm.unit'),
    field: 'uom_id_',
    minWidth: 120,
    formatter: uomFormatter,
  },
  desc: { title: $t('sys.description'), field: 'description_', minWidth: 200 },
  lot2sn: { title: $t('sys.edhr.lotOrSn'), field: 'material_no_', minWidth: 200 },
  productCode: {
    title: $t('sys.edhr.productCode'),
    field: 'product_code_',
    minWidth: 200,
    formatter: uomFormatter,
  },
  productName: { title: $t('sys.edhr.productName'), field: 'product_name_', minWidth: 200 },
  // 兼容【DHR变更】展示工单信息2025-11-19
  mfgOrderId: {
    title: $t('sys.edhr.field.mfgOrder'),
    field: 'mfg_order_id_',
    minWidth: 200,
    formatter: uomFormatter,
  },
};

export const getColumns = (orderKeys: string[], isTree = false) => {
  return orderKeys.map((key, index) => {
    const col = (columnFragments as any)[key];
    return {
      ...baseColumnConfig,
      treeNode: isTree && index === 0,
      ...col,
      slots: col.slots ? { ...baseColumnConfig.slots, ...col.slots } : baseColumnConfig.slots,
    };
  });
};

export function renderWithFormatter(column: any = {}, row: any = {}) {
  const { type, field, formatter, params = {} } = column;

  if (type === 'checkbox' || type === 'radio') {
    return;
  }

  const cellValue = row?.[field];
  if (typeof formatter === 'function') {
    return formatter({ cellValue, row, column });
  }
  return cellValue ?? params.defaultValueStr ?? '';
}

/** tree 转换：用于 rdo 场景 */
export const transformTreeData = (options: any[] = [], currentValue?: string) => {
  const highlightIdx = { parent: -1, child: -1 };
  const treeData = (options || []).map((parent, pIndex) => {
    const childrenRaw = parent.__CHILDREN__ ?? [];
    const hasOneChild = childrenRaw.length === 1;
    const rdoLabel = parent.__LABEL__ || parent.name_;
    const parentValue = parent.id_;
    if (parentValue === currentValue) {
      highlightIdx.parent = pIndex;
      highlightIdx.child = -1;
    }
    const children = childrenRaw.map((node: any, cIndex: number) => {
      const childValue = `${parentValue}:${node.id_}`;
      if (childValue === currentValue) {
        highlightIdx.parent = pIndex;
        highlightIdx.child = cIndex;
      }
      return {
        ...node,
        __RDO_LABEL__: rdoLabel,
        __SHOW_LABEL__: node.__SHOW_LABEL__,
        __VALUE__: childValue,
        __P_POS__: pIndex,
        __C_POS__: cIndex,
        __HAS_ONE_CHILD__: hasOneChild,
        __VERSION_NAME__: node.__LABEL__ || node.version_,
      };
    });
    let defaultInfo = children.find((k: any) => k.default_) ?? null;
    // 物料消耗表的时候，子里面只有一个版本，且该版本不是默认版本的时候，也希望按默认版本处理
    if (!defaultInfo && children.length === 1) {
      defaultInfo = children[0];
    }

    return {
      ...omit(parent, '__CHILDREN__'),
      __DEFAULT__: defaultInfo,
      __RDO_LABEL__: rdoLabel,
      __SHOW_LABEL__: parent.__SHOW_LABEL__,
      __VALUE__: parentValue,
      __P_POS__: pIndex,
      __HAS_ONE_CHILD__: hasOneChild,
      children,
    };
  });

  return { data: treeData, highlightIdx };
};

/** table 转换：用于 lot 场景 */
export const transformLotData = (
  options: any[] = [],
  currentValue?: string | string[],
  attr: string[] = ['name_', 'id_'],
) => {
  const [labelAttr, valueAttr] = attr;
  const highlightIdx: { index: number[] } = { index: [] };
  const values = Array.isArray(currentValue)
    ? currentValue.filter((v) => !isNil(v))
    : [currentValue].filter((v) => !isNil(v));
  const showOptions = (options || []).map((item, index) => {
    const value = item[valueAttr];
    if (values.includes(value)) {
      highlightIdx.index.push(index);
    }
    return {
      ...omit(item, '__CHILDREN__'),
      __SHOW_LABEL__: item[labelAttr],
      __VALUE__: value,
      __POS__: index,
    };
  });
  return { data: showOptions, highlightIdx };
};
