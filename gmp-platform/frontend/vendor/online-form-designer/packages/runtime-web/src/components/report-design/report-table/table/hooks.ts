import { ref, onMounted, reactive, computed, nextTick, h } from 'vue';
import type { VxeGridProps } from 'vxe-table';
import type { ReportConditionDTO } from '/@/apis/gct-apaas/model/index';
import {
  postReportDataListByPage,
  postReportDataListStatistic,
} from '/@/apis/gct-apaas/ReportDataController';
import {
  ReportTable,
  BaseField,
  Calculation,
  SummaryCalculationMethod,
  dimensionEnum,
} from '../../schema/index';
import { useElementSize, watchDebounced } from '@vueuse/core';
import { isSortFiled } from '/@page-designer/utils';
import { FIELD_TYPE } from '@gct/runtime';
import { cloneDeep, includes } from 'lodash-es';
import { getReportHeader } from './report-hooks';

export function useReportTable(
  widget: ReportTable,
  { vxeTable, parentRef, drillingLinkList, renderTotal, transformValueByField },
) {
  const apiConfig = getReportHeader();
  /**明细表的汇总 */
  const listStatisticData = ref({});
  /**列字段配置信息 */
  const columnsOptions = ref<any[]>([]);
  const exportConfig = reactive({ numFormat: true });
  const loading = ref(true);
  /**第一个字段 总计样式使用 */
  const firstField = ref();
  /**总页数 */
  const total = ref(0);
  /**表格数据 */
  const tableData = ref([]);
  /**父容器动态高度 */
  const { height } = useElementSize(parentRef);
  const maxHeight = computed(() => height.value - 16);
  const { query_args = {}, exp_args = [] } = drillingLinkList.findLast((i) => true) || {};
  const {
    calculationMethod,
    serialNumber,
    dataColumn = [],
    fieldMap,
    multiLevelHeader,
    headerGrouping = [],
    mergeCell,
    _field_proto_map,
    pager,
    leftFixed,
    rightFixed,
  } = widget;
  const { pagination, createColunm, filter_query_data, queryDataByTable } = useTableParameter(
    widget,
    { exp_args, query_args },
  );
  const rowSelectItems = createFieldiTem(dataColumn, fieldMap);
  /**总计参数 */
  const cell_selectItems = createSelectioniTem(
    dataColumn,
    fieldMap,
    calculationMethod!,
    'col_function',
  );
  columnsOptions.value = getReportConfig(multiLevelHeader ? headerGrouping : undefined) || [];
  const seqMethod = pager
    ? ({ $rowIndex }) => {
        const start = $rowIndex + 1;
        return (pagination.pageNo! - 1) * pagination.pageSize! + start;
      }
    : undefined;
  const gridOptions = reactive<VxeGridProps<any>>({
    showFooter: !!calculationMethod?.open,
    autoResize: true,
    showOverflow: false,
    showHeaderOverflow: true,
    showFooterOverflow: !!serialNumber,
    footerRowClassName: 'footerRow',
    seqConfig: {
      seqMethod,
    },
    footerMethod({ columns, data }) {
      const totalCount = columns
        .filter((i) => i.visible !== false)
        .map((column) => {
          if (!column.field || column.type === 'seq') return calculationMethod?.totalAlias;
          const value = listStatisticData.value[column.field];
          return renderTotal(value, column.params, { numFormat: exportConfig.numFormat });
        });
      return [totalCount];
    },
    rowConfig: {
      useKey: true,
    },
    spanMethod,
  });

  // 分离出模型下钻字段放入 foreignFields，同时返回 selectItems
  const getQueryParams = (items: SelectItem[]) => {
    const foreignFields: string[] = [];

    const selectItems = items.map((item) => {
      const { fieldKey: key } = item;
      const isRelated = key.includes('.');
      const fieldKey = isRelated ? key.split('.')[0] : key;

      if (isRelated) {
        foreignFields.push(key);
      }

      return {
        ...item,
        fieldKey,
      };
    });

    return { foreignFields, selectItems };
  };

  async function getDataByHttp(queryData: ReportConditionDTO = {}) {
    const queryParams = getQueryParams(rowSelectItems);
    // debugger;

    loading.value = true;
    const { data, totalCount, dict } =
      (await postReportDataListByPage(
        {
          ...queryDataByTable.value,
          ...queryParams,
        },
        apiConfig,
      )) || {};
    total.value = totalCount || 0;
    tableData.value = transformSourceData(data, dict);
    /**合并单元格打标识 */
    if (mergeCell) {
      calculateMultiSpans(columnsOptions.value, tableData.value, _field_proto_map, vxeTable);
    } else {
      vxeTable.value.loadColumn(columnsOptions.value);
    }
    await vxeTable.value.sort(
      pagination.sorts?.map((i) => {
        return {
          field: i.sortField,
          order: i.sortType,
        };
      }),
    );
    await vxeTable.value.loadData(tableData.value);
    loading.value = false;
  }

  async function search(queryData: ReportConditionDTO = {}) {
    filter_query_data.value = queryData;
    await geTotalHttp(cell_selectItems);
    await getDataByHttp();
  }
  /**处理字段相关 */
  function getReportConfig(headerGrouping) {
    const columns = <VxeGridProps['columns']>[
      {
        type: 'seq',
        width: 56,
        title: window.$t('sys.index'),
        visible: serialNumber,
        fixed: 'left',
        className: '',
      },
    ];
    if (headerGrouping) {
      const treeData = treeMap(headerGrouping, (node) => {
        if (node.isGroup) {
          return {
            title: node.title,
            align: 'center',
            visible: !!node.children?.length,
            isGroup: true,
          };
        } else {
          return fieldMap[node.key] ? createColunm(fieldMap[node.key]) : null;
        }
      });
      columns!.push(...treeData);
    } else {
      dataColumn.forEach((i) => {
        const row = fieldMap[i];
        const data = row ? createColunm(row) : null;
        data && columns!.push(data);
      });
    }
    /**反向遍历 */
    !!rightFixed &&
      dfsNonRecursive(columns!, true, (node, index) => {
        if (index < rightFixed) {
          node.fixed = 'right';
        }
      });
    /**正向遍历 */
    /** 序号 不算在冻结字段内 */
    !!leftFixed &&
      dfsNonRecursive(columns!, false, (node, index) => {
        if (index <= leftFixed) {
          node.fixed = 'left';
        }
      });
    /**识别总计样式 */
    firstField.value = getFirstField(columns);
    return columns;
  }
  async function geTotalHttp(selectItems) {
    if (!selectItems.length) return;
    const { data } =
      (await postReportDataListStatistic(
        {
          ...queryDataByTable.value,
          selectItems,
        },
        apiConfig,
      )) || {};
    listStatisticData.value = data[0] || {};
  }

  function reload() {
    getDataByHttp();
  }
  async function reloadTableColumn(options) {
    columnsOptions.value = getReportConfig(options) || [];
    if (mergeCell) {
      calculateMultiSpans(columnsOptions.value, tableData.value, _field_proto_map, vxeTable);
    } else {
      vxeTable.value.loadColumn(columnsOptions.value);
    }
  }

  onMounted(() => {
    search();
  });

  /**导出专用查询所有数据 */
  async function getExportDataByHttp({ config: { dateFormat = true, numFormat = true } }) {
    exportConfig.numFormat = numFormat;
    const selectItems = dateFormat
      ? rowSelectItems
      : (rowSelectItems.map((i) => ({ ...i, format: null })) as any);

    const queryParams = getQueryParams(selectItems);

    const { data, dict } = await postReportDataListByPage(
      {
        ...queryDataByTable.value,
        ...queryParams,
        pageSize: 9999,
      },
      apiConfig,
    );
    const list = transformSourceData(data, dict);
    const columns = vxeTable.value.getColumns();
    mergeCell && calculateMultiSpans(cloneDeep(columns), list, _field_proto_map);
    return list.map((row) => {
      return columns.reduce(
        (total, column) => {
          if (column.field) {
            total[column.field] = transformValueByField(column.params, row, column.field, {
              numFormat,
            });
          }
          return total;
        },
        { ...row },
      );
    });
  }
  return {
    firstField,
    gridOptions,
    pagination,
    total,
    reload,
    search,
    listStatisticData,
    maxHeight,
    loading,
    reloadTableColumn,
    getExportDataByHttp,
  };
}

/**公共参数 */
export function useTableParameter(widget: ReportTable, { exp_args, query_args }) {
  // console.log(exp_args, query_args)
  const { sorts, dataFilter, modelKey, modelCategory, pageSize, pager, headerSorting } = widget;
  /**数据筛选 */
  const useFilter = useQueryfilter(dataFilter);
  const pagination = reactive<ReportConditionDTO>({
    pageSize: pager ? pageSize : 9999,
    pageNo: 1,
    query: { ...query_args },
    sorts,
    exp: exp_args?.length ? `AND(${exp_args.join(',')})` : '',
    modelCategory,
    modelKey,
  });
  /**快捷过滤临时缓存查询条件 */
  const filter_query_data = ref<any>({});
  /**实际查询使用的对象 */
  const queryDataByTable = computed(() => {
    const { query = {}, exp = '' } = filter_query_data.value;
    return {
      ...pagination,
      query: {
        ...pagination.query,
        ...query,
        ...useFilter.query,
      },
      exp: useFilter.getExp(exp, pagination.exp),
      sorts: pagination.sorts?.filter((i) => i.sortField),
    };
  });
  /**生成表格列 */
  function createColunm(row: BaseField) {
    const title = row.fieldName ?? '';
    const field = row.field;
    const visible = row?.visible !== false;
    const align = row.horizontal || 'left';
    const vertical = `gct-cell-${row.vertical || 'center'} `;
    const width = 'auto';
    const slots = {
      footer: 'footer',
      default: 'default',
      // header: 'header'
    };
    const minWidth = getMinWidthByTitle(title, row.fieldType);
    const sortable =
      headerSorting && isSortFiled(row.fieldType) && row.inDimension === dimensionEnum.ROW;
    return {
      field,
      title,
      width,
      slots,
      minWidth: headerSorting ? minWidth + 15 : minWidth,
      visible,
      params: row,
      sortable,
      headerClassName: vertical,
      className: vertical,
      align,
      cellType: 'string',
    };
  }

  return { pagination, useFilter, createColunm, filter_query_data, queryDataByTable };
}

/**合并单元格 */
export function spanMethod({ column, row }) {
  const field = column.field;
  const rowspan =
    row.total_field && row.total_field === column.property
      ? 1
      : (field ? row._GCT_?.[field]?.row_span : null) ?? 1;
  return { rowspan, colspan: 1 };
}

/**
 * 数据筛选生成查询条件
 * @param dataFilter
 * @returns
 */
export const useQueryfilter = (dataFilter) => {
  let queryFilter = {},
    exp = '';
  try {
    const dataRule = dataFilter?.dataRule;
    exp = dataRule?.exp;
    const query = dataRule?.query || {};
    for (const k in query) {
      queryFilter[k] = query[k];
    }
  } catch (error) {}

  function getExp(...arg) {
    const explist = [exp, ...arg].filter((i) => i);
    const expkey = explist.join(',');
    if (explist.length > 1) {
      return `AND(${expkey})`;
    } else {
      return expkey;
    }
  }
  return { query: queryFilter, getExp, exp };
};

/**明细表数据转化 */
export function transformSourceData(data, dict) {
  if (dict && data) {
    return data.map((row, index) => {
      const _DICT = Object.keys(row).reduce((total, curr) => {
        const map = dict[curr],
          value = row[curr];
        if (map && value) {
          try {
            const label = value.split(',').map((k) => map[k]) + '';
            total[curr] = label;
          } catch (error) {}
        } else {
          total[curr] = row[curr];
        }
        return total;
      }, {});
      // 补全关联模型下钻字段字典
      Object.assign(_DICT, row.__FOREIGN__);
      return { ...row, _DICT, _GCT_: {} };
    });
  }
  return data || [];
}

/**合并单元格提前打标识 */
export function calculateMultiSpans(
  columns: VxeGridProps['columns'],
  data: any[],
  _field_proto_map,
  vxeTable?: any,
) {
  data.forEach((row) => {
    row._GCT_ = {};
  });
  const column_list = flattenColumns(columns!);
  const length = column_list?.length || 0;
  /**上一个合并过的字段 */
  let lastField;
  for (let i = 0; i < length; i++) {
    const fieldItem = column_list![i];
    const lastItem = column_list![i - 1];
    /**序号 或者隐藏列跳开 */
    if (fieldItem.type === 'seq' || fieldItem.visible === false) continue;
    if (is_span_function(fieldItem, _field_proto_map)) break;
    const field = fieldItem.field!;
    let is_span = false,
      cacheByIds: number[] = [];
    data.forEach((row, _rowIndex) => {
      const prevRow = data[_rowIndex - 1];
      let nextRow = data[_rowIndex + 1];
      let count_row_span = 0;
      const cellValue = row[field],
        prevValue = prevRow?.[field];
      const includes_Ids = row._GCT_?.[lastField]?.row_span_ids || [];
      if (prevRow && prevValue === cellValue && (!lastField || includes_Ids.includes(_rowIndex))) {
        //已经被合并
        count_row_span = 0;
      } else {
        /**计算往下合并多少行 */
        count_row_span = 1;
        cacheByIds = [];
        // count_row_span 不能超过上一个合并过的字段 的合并数量
        while (
          nextRow &&
          nextRow?.[field] === cellValue &&
          (!lastField || includes_Ids.includes(count_row_span + _rowIndex))
        ) {
          cacheByIds.push(count_row_span + _rowIndex);
          nextRow = data[++count_row_span + _rowIndex];
        }
      }
      row._GCT_[field] = {
        row_span: count_row_span,
        row_span_ids: cacheByIds,
      };
      if (count_row_span > 1) is_span = true;
    });
    if (!is_span) break;
    lastField = field;
    fieldItem.className = (fieldItem.className || '') + 'gct_span_line';
    /**序号 */
    if (lastItem && lastItem.type === 'seq') {
      lastItem.className = (lastItem.className || '') + 'gct_span_line';
    }
  }
  vxeTable && vxeTable.value.loadColumn(columns);
}
/**拍平tree */
function flattenColumns(columns: any[], childrenKey = 'children') {
  const result: any[] = [];
  function dfs(cols: any[]) {
    cols.forEach((col) => {
      if (col[childrenKey] && col[childrenKey].length) {
        dfs(col[childrenKey]);
      } else {
        result.push(col);
      }
    });
  }
  dfs(columns);
  return result;
}
/**根据title计算宽度 */
export function getMinWidthByTitle(title, fieldType?: any) {
  if (fieldType === FIELD_TYPE.DATE_TIME) return 150;
  if (fieldType === FIELD_TYPE.DATE) return 100;
  const minWidth = (title + '' || '').length * 20;
  return minWidth < 80 ? 80 : minWidth > 180 ? 180 : minWidth;
}
function treeMap(tree, callback) {
  return tree
    .map((node) => {
      // 调用回调函数处理当前节点
      const newNode = callback(node);

      // 如果当前节点有子节点，递归处理子节点
      if (node.children && node.children.length > 0) {
        newNode.children = treeMap(node.children, callback);
      } else if (newNode) {
        // 确保子节点存在（即使为空数组）
        newNode.children = [];
      }
      // 返回处理后的节点
      return newNode;
    })
    .filter((i) => i);
}

/**返回总计维度数组 */
export function createSelectioniTem(
  list: string[] = [],
  fieldMap: { [key: string]: BaseField },
  calculation: Calculation,
  funKey: string = 'function',
): SelectItem[] {
  if (!calculation?.open) return [];
  return list
    .map((i) => {
      const fieldItem = fieldMap[i] || {};
      return {
        distinct: fieldItem[funKey] === SummaryCalculationMethod.NO_REPEAT_COUNT,
        fieldKey: fieldItem.field,
        format: fieldItem.format,
        function: getFun(fieldItem, funKey),
        includeNull: calculation.includeNull,
        type: fieldItem.fieldType,
      };
    })
    .filter((i) => i.fieldKey && i.function);
}

/**返回字段维度数组 */
export function createFieldiTem(
  list: string[] = [],
  fieldMap: { [key: string]: BaseField },
  funKey?: string,
) {
  const items: SelectItem[] = [];
  list.forEach((k) => {
    const fieldItem = fieldMap[k];
    if (fieldItem?.field && fieldItem?.visible) {
      items.push({
        type: fieldItem.fieldType,
        fieldKey: fieldItem.field,
        format: fieldItem.format,
        mappingType: fieldItem.mappingType,
        function: funKey ? getFun(fieldItem, funKey) : undefined,
        distinct: funKey
          ? fieldItem[funKey] === SummaryCalculationMethod.NO_REPEAT_COUNT
          : undefined,
      });
    }
  });
  return items;
}
function getFun(fieldItem: BaseField, key: string = 'function') {
  if (!fieldItem.visible) return;
  if (fieldItem[key] === SummaryCalculationMethod.NO_REPEAT_COUNT) {
    return SummaryCalculationMethod.COUNT;
  }
  return fieldItem[key];
}

/**判断字段能否合并 */
function is_span_function(fieldItem: any, _field_proto_map: any) {
  let fieldType = fieldItem?.params?.fieldType;
  if (!fieldType || !fieldItem.field) return true;
  const { mappingType } = _field_proto_map[fieldItem.field] || {};
  // _field_proto_map
  /**不支持行合并的单元格字段 */
  const noSpanField = [FIELD_TYPE.DOUBLE, FIELD_TYPE.INTEGER, FIELD_TYPE.LONG, FIELD_TYPE.DECIMAL];
  if ([FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(fieldType)) {
    fieldType = mappingType;
  }
  return noSpanField.includes(fieldType);
}
const invalidValues = [null, '', undefined];
export interface SelectItem {
  distinct?: boolean; // 去重
  fieldKey: string; // 字段key
  format?: string; // 格式化，比如yyyy-MM
  function?: string; // 函数
  includeNull?: boolean; // 空值参与计算
  type: FIELD_TYPE;
}

/**
 * 获取第一个有效的显示字段
 */
export function getFirstField(data: VxeGridProps['columns'] = []): string {
  const childrenKey = 'children';
  const stack = cloneDeep(data);
  let fieldKey = '';
  while (stack.length > 0 && !fieldKey) {
    const node = stack.shift(); // 取出栈顶节点
    if (node?.visible !== false || node.type === 'seq') {
      fieldKey = node?.field || '';
    }
    // 将子节点逆序压入栈中（保证顺序正确）
    if (node && Array.isArray(node[childrenKey])) {
      for (let i = node[childrenKey].length - 1; i >= 0; i--) {
        stack.unshift(node[childrenKey][i]);
      }
    }
  }

  return fieldKey;
}

/**
 * 非递归深度优先遍历tree 末节点
 * @param {Object} root - 树的根节点
 * @param {string} reverse - true 表示反向
 * @param {Function} callback - 对每个节点的处理函数 (node) => void
 */
export function dfsNonRecursive(root: any[], reverse, callback) {
  if (!root) return;
  const childrenKey = 'children';
  // 使用栈模拟递归
  const stack = [...root];
  let index = 0;
  while (stack.length > 0) {
    const node = reverse ? stack.pop() : stack.shift(); // 取出栈顶节点
    // 将子节点逆序压入栈中（保证顺序正确）
    if (Array.isArray(node[childrenKey]) && node.isGroup) {
      if (reverse) {
        const list: any[] = [];
        for (let i = node[childrenKey].length - 1; i >= 0; i--) {
          list.unshift(node[childrenKey][i]);
        }
        stack.push(...list);
      } else {
        for (let i = node[childrenKey].length - 1; i >= 0; i--) {
          stack.unshift(node[childrenKey][i]);
        }
      }
      const nodeLength = countLeafNodes(node, childrenKey) - 1;
      /**父节点也需要遍历 */
      callback(node, index + nodeLength);
    } else {
      callback(node, index);
      index++;
    }
  }
}

function countLeafNodes(node, childrenKey = 'children') {
  if (!node) return 0; // 空节点直接返回0

  const children = node[childrenKey];
  // 判断是否为叶子节点：无子节点或子节点为空数组
  if (!children || !Array.isArray(children) || children.length === 0) {
    return 1;
  }

  // 递归统计子节点的叶子数量
  return children.reduce((acc, child) => acc + countLeafNodes(child, childrenKey), 0);
}
