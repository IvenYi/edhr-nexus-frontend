import { ref, onMounted, reactive, computed, nextTick, h } from 'vue';
import type { VxeGridProps } from 'vxe-table';
import type { ReportConditionDTO } from '/@/apis/gct-apaas/model/index';
import {
  postReportDataListStatistic,
  postReportDataListByPage4Cross,
} from '/@/apis/gct-apaas/ReportDataController';
import { ReportTable, type2formatMapping } from '../../schema/index';
import { useElementSize, watchDebounced } from '@vueuse/core';
import { groupBy, cloneDeep } from 'lodash-es';
import {
  SelectItem,
  createFieldiTem,
  createSelectioniTem,
  calculateMultiSpans,
  transformSourceData,
  spanMethod,
  useTableParameter,
  getMinWidthByTitle,
  getFirstField,
  dfsNonRecursive,
} from './hooks';
import { REPORT_TABLE_PAGE_TYPE } from '../../constants';
import { getReportHeader } from './report-hooks';
/**交叉表 */
export function useCrossTable(
  widget: ReportTable,
  { vxeTable, parentRef, drillingLinkList, renderTotal, transformValueByField },
) {
  const apiConfig = getReportHeader();
  const loading = ref(true);
  const exportConfig = reactive({ numFormat: true });
  const firstField = ref('');
  /**列汇总 */
  const listStatisticData = ref({});
  /**行汇总 */
  const row_listStatisticData = ref({});
  /**总页数 */
  const total = ref(0);
  /**父容器动态高度 */
  const { height } = useElementSize(parentRef);
  const maxHeight = computed(() => height.value - 16);
  const { query_args = {}, exp_args = [] } = drillingLinkList.findLast((i) => true) || {};
  const {
    column_subtotals,
    row_subtotals,
    serialNumber,
    calculationMethod,
    row_calculationMethod,
    fieldMap,
    indicatorDimension,
    mergeCell,
    pageType,
    _field_proto_map,
    pager,
    leftFixed,
    rightFixed,
  } = widget;
  const rowDimension = ref(widget.rowDimension.filter((i) => fieldMap[i]) || []);
  const columnDimension = ref(widget.columnDimension.filter((i) => fieldMap[i]) || []);
  //是否只有行模式
  const only_col = computed(
    () => !rowDimension.value.length && !!rowDimension.value.length && !indicatorDimension.length,
  );

  const { pagination, createColunm, filter_query_data, queryDataByTable } = useTableParameter(
    widget,
    { exp_args, query_args },
  );
  //行维度
  const rowSelectItems = computed<SelectItem[]>(() =>
    createFieldiTem(rowDimension.value, fieldMap),
  );

  //列维度
  const columnSelectItems = computed<SelectItem[]>(() =>
    createFieldiTem(columnDimension.value, fieldMap),
  );

  //行小计
  const rowSubTotalItems = computed<SelectItem[]>(
    () =>
      row_subtotals?.filter((i) => {
        return columnSelectItems.value.at(-1)?.fieldKey !== i.fieldKey;
      }) || [],
  );
  //列小计
  const columnSubTotalItems = computed<SelectItem[]>(
    () =>
      column_subtotals?.filter((i) => {
        return rowSelectItems.value.at(-1)?.fieldKey !== i.fieldKey;
      }) || [],
  );
  //指标
  const metricSelectItems: SelectItem[] = createFieldiTem(
    indicatorDimension,
    fieldMap,
    'polymerization_function',
  );
  //列指标总计
  const dimension_selectItems = createSelectioniTem(
    indicatorDimension,
    fieldMap,
    calculationMethod!,
    'col_function',
  );
  //列总计
  const row_selectItems = createSelectioniTem(
    rowDimension.value,
    fieldMap,
    calculationMethod!,
    'col_function',
  );
  // console.log(rowDimension, row_selectItems, fieldMap, calculationMethod);
  //行指标总计
  const row_dimension_selectItems = createSelectioniTem(
    indicatorDimension,
    fieldMap,
    row_calculationMethod!,
    'row_function',
  );
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
          if (!column.params) return;
          const value = listStatisticData.value[column.field];
          return renderTotal(value, column.params, {
            totalData: listStatisticData.value,
            numFormat: exportConfig.numFormat,
          });
        });
      return [totalCount];
    },
    rowConfig: {
      useKey: true,
    },
    columnConfig: {
      useKey: true,
    },
    spanMethod,
  });

  async function getDataByHttp() {
    if (!rowSelectItems.value.length && !columnSelectItems.value.length) {
      loading.value = false;
      vxeTable.value.loadColumn([]);
      return;
    }
    /**行维度不存在的时候 */
    loading.value = true;
    const reportBody = {
      ...queryDataByTable.value,
      rowSubTotalItems: rowSubTotalItems.value,
      rowSelectItems: rowSelectItems.value,
      columnSelectItems: columnSelectItems.value,
      columnSubTotalItems: columnSubTotalItems.value,
      metricSelectItems,
      pageType: pageType === REPORT_TABLE_PAGE_TYPE.FIRST_DIMENSION,
    };
    const { rowData, columnData, rowSubTotalData, columnSubTotalData } =
      ((await postReportDataListByPage4Cross(reportBody, apiConfig)) as any) || {};
    if (columnData?.data?.length) {
      /**临时处理方式 方式列过多 数据卡死 */
      columnData.data.splice(100);
    }
    const list = transformSourceData(
      rowData?.data || columnData?.data,
      rowData?.dict || columnData?.dict,
    );
    // console.log(columnData);
    total.value = rowData?.totalCount ?? columnData?.totalCount ?? 0;
    const { columns } = getReportConfig(columnData || {});
    if (columnSubTotalData) {
      for (const k in columnSubTotalData) {
        const subData = columnSubTotalData[k];
        columnSubTotalData[k] = transformSourceData(subData, {
          ...columnData?.dict,
          ...rowData?.dict,
        });
      }
    }
    await vxeTable.value.loadColumn(columns);
    const data = getDataByColunms(list, columnSubTotalData || {}, rowSubTotalData || {});
    /**合并单元格打标识 */
    mergeCell && calculateMultiSpans(columns, data, _field_proto_map, vxeTable);
    await vxeTable.value.sort(
      pagination.sorts?.map((i) => {
        return {
          field: i.sortField,
          order: i.sortType,
        };
      }),
    );
    console.log(columns, data);
    await vxeTable.value.loadData(data);
    loading.value = false;
    firstField.value = getFirstField(columns);
  }
  /**行列交叉逻辑 */
  function getDataByColunms(data_list = [], columnSubTotalData, rowSubTotalData) {
    /**没有配置列字段的时候 */
    if (!columnSelectItems.value.length) {
      /**列小计 ***********/
      const columnSubTotalData_keys = Object.keys(columnSubTotalData);
      columnSubTotalData_keys.forEach((k) => {
        addTotalDataByCol(data_list, k, columnSubTotalData[k]);
      });
      /**行总计 */
      if (Object.keys(row_listStatisticData.value).length) {
        data_list.forEach((row) => {
          const ValueKey = rowSelectItems.value
            .map((i) => getValueByKey(row, i.fieldKey))
            .join('_');
          const total_col_data = row_listStatisticData.value[ValueKey] || {};
          Object.assign(row, total_col_data);
        });
      }
      return data_list;
    } else if (!rowSelectItems.value.length) {
      const col_length = columnSelectItems.value.length;
      /**没有配置行字段的时候 */
      const data = metricSelectItems.map((k) => {
        const fieldItem = fieldMap['indicator:' + k.fieldKey];
        const key = `st_${k.function?.toLocaleLowerCase()}_${fieldItem.field}`;
        const row = data_list.reduce(
          (pre, curr) => {
            const value = curr[key];
            const ValueKey = columnSelectItems.value
              .map((i) => getValueByKey(curr, i.fieldKey))
              .join('_');
            pre[ValueKey] = value;
            return pre;
          },
          {
            _gct_header: fieldItem.fieldName,
            total_row: row_listStatisticData.value[fieldItem.field],
          },
        );
        /**行小计逻辑 */
        rowSubTotalItems.value.forEach((sub) => {
          const r_key = sub.fieldKey;
          const from_key = `rst_${sub.function?.toLocaleLowerCase()}_${fieldItem.field}`;
          const list = rowSubTotalData[r_key];
          list.forEach((curr) => {
            const col_key = getKeysByRowData(col_length, columnSelectItems.value, r_key, curr);
            const sub_key = `${col_key}_${sub.function?.toLocaleLowerCase()}`;
            row[sub_key] = curr[from_key];
          });
        });
        return row;
      });
      return data;
    } else {
      /**行列都配置的时候 */
      const row_data = new Set();
      const rowMap = groupBy(data_list, (row) => {
        const keys = rowSelectItems.value.map((i) => getValueByKey(row, i.fieldKey)).join('_');
        row_data.add(keys);
        return keys;
      });
      const data = Array.from(row_data).map((k) => {
        const total_row_data = row_listStatisticData.value[k] || {};
        const _list = rowMap[k] || [];
        return _list.reduce(
          (pre, curr) => {
            Object.assign(pre, curr);
            metricSelectItems.forEach((m) => {
              const { fieldKey } = m;
              const key = `st_${m.function?.toLocaleLowerCase()}_${fieldKey}`;
              const col_key = columnSelectItems.value
                .map((i) => getValueByKey(curr, i.fieldKey))
                .join('_');
              pre[`${col_key}_${key}`] = curr[key];
            });
            return pre;
          },
          { ...total_row_data },
        );
      });
      /**行小计逻辑 */
      rowSubTotalItems.value.forEach((row) => {
        const k = row.fieldKey;
        const list = rowSubTotalData[k];
        list && addTotalDataByRow(data, row, list);
      });

      /**列小计 ***********/
      const columnSubTotalData_keys = Object.keys(columnSubTotalData);
      columnSubTotalData_keys.forEach((k) => {
        addTotalDataByCol(data, k, columnSubTotalData[k]);
      });
      return data;
    }
  }
  /**行小计 */
  function addTotalDataByRow(data, item, rowSubTotalData: any[]) {
    const col_length = columnSelectItems.value.length;
    const { fieldKey } = item;
    const colTotalMap = groupBy(rowSubTotalData, (row) => {
      const keys = rowSelectItems.value.map((i) => getValueByKey(row, i.fieldKey)).join('_');
      return keys;
    }) as any;
    for (const k in colTotalMap) {
      const map_list = colTotalMap[k];
      colTotalMap[k] = map_list.reduce((pre, curr) => {
        metricSelectItems.forEach((m) => {
          const { fieldKey } = m;
          const from_key = `st_${m.function?.toLocaleLowerCase()}_${fieldKey}`;
          const col_key = getKeysByCol(curr);
          pre[`${col_key}_${item.function?.toLocaleLowerCase()}_${from_key}`] =
            curr[`rst_${item.function?.toLocaleLowerCase()}_${fieldKey}`];
        });
        return pre;
      }, {});
    }
    data.forEach((row) => {
      const keys = rowSelectItems.value.map((i) => getValueByKey(row, i.fieldKey)).join('_');
      Object.assign(row, colTotalMap[keys]);
    });

    /**获取列元素key */
    function getKeysByCol(row): string {
      return getKeysByRowData(col_length, columnSelectItems.value, fieldKey, row);
    }
  }

  /**插入列小计 根据列字段 插入数据 */
  //fieldKey 列小计的字段维度
  function addTotalDataByCol(data, fieldKey: string, columnSubTotalData: any[]) {
    // console.log(fieldKey, columnSubTotalData);
    /**需要列小计的同类型字段数组 小计规则不一样 */
    const subTotal_list = columnSubTotalItems.value.filter((i) => i.fieldKey === fieldKey);
    const rowLength = rowSelectItems.value.length;
    const col_length = columnSelectItems.value.length;
    const colTotalMap = groupBy(columnSubTotalData, (row) => {
      return getKeysByRow(row);
    }) as any;
    const lastFieldIndex = rowSelectItems.value.findIndex((i) => i.fieldKey === fieldKey);
    const total_title_key = rowSelectItems.value[lastFieldIndex + 1]?.fieldKey;
    for (const k in colTotalMap) {
      const map_list = colTotalMap[k];
      colTotalMap[k] = subTotal_list.map((i) => {
        return map_list.reduce(
          (pre, row) => {
            const col_key = columnSelectItems.value
              .map((i) => getValueByKey(row, i.fieldKey))
              .join('_');
            Object.assign(pre, {
              ...row,
              [total_title_key]: i.totalAlias,
              _GCT_: {},
              _is_total: true,
              total_field: total_title_key,
              _is_total_function: i.function,
            });
            const col_value = {};
            metricSelectItems.forEach((m) => {
              const to_keys_list: string[] = col_key ? [col_key] : [];
              const form_key = `cst_${i.function?.toLocaleLowerCase()}_${m.fieldKey}`;
              const metric_key = `st_${m.function?.toLocaleLowerCase()}_${m.fieldKey}`;
              to_keys_list.push(metric_key);
              const formValue = row[form_key];
              const total_key = to_keys_list.join('_');
              pre[total_key] = formValue;
              if (pre?._DICT) {
                pre._DICT = {
                  ...pre._DICT,
                  [metric_key]: formValue,
                };
              }
              col_value[m.fieldKey] = formValue;
            });

            /**行列小计交叉逻辑数据 */
            rowSubTotalItems.value.map((i) => {
              const keys = getKeysByCol(row, i.fieldKey);
              if (pre._is_total_map[keys]) {
                pre._is_total_map[keys].push(col_value);
              } else {
                pre._is_total_map[keys] = [col_value];
              }
            });
            pre.total_row_col.push(col_value);
            return pre;
          },
          { _is_total_map: {}, total_row_col: [] },
        );
      });
    }
    for (let i = 0; i < data.length; i++) {
      const row = data[i],
        next_row = data[i + 1];
      // if (row._is_total) continue;
      const curr_keys = getKeysByRow(row);
      const next_keys = next_row ? getKeysByRow(next_row) : null;
      if (curr_keys !== next_keys) {
        const add_value_list = colTotalMap[curr_keys];
        /**循环插入不同计算 */
        add_value_list?.forEach((row) => {
          data.splice(i + 1, 0, row);
          i++;
        });
      }
    }
    /**获取行元素key */
    function getKeysByRow(row): string {
      return getKeysByRowData(rowLength, rowSelectItems.value, fieldKey, row);
    }
    /**获取列元素key */
    function getKeysByCol(row, key): string {
      return getKeysByRowData(col_length, columnSelectItems.value, key, row);
    }
  }

  async function search(queryData: ReportConditionDTO = {}) {
    filter_query_data.value = queryData;
    /**列总计 */
    await geTotalHttp();
    /**行总计 */
    await geRowTotalHttp(row_dimension_selectItems, rowSelectItems.value);
    await getDataByHttp();
    await vxeTable.value.updateFooter();
  }
  /**处理字段相关 */
  function getReportConfig(columnData) {
    const columns = <VxeGridProps['columns']>[
      {
        type: 'seq',
        width: 60,
        title: window.$t('sys.index'),
        visible: serialNumber,
        fixed: 'left',
        className: '',
      },
    ];
    const column_data_list = transformSourceData(columnData.data, columnData.dict);
    /**指标数组 */
    const indicator_list = metricSelectItems.map((f) => {
      const row = fieldMap['indicator:' + f.fieldKey];
      const col = createColunm(row);
      col.field = `st_${f.function?.toLocaleLowerCase()}_${f.fieldKey}`;
      return col;
    });
    if (rowDimension.value.length) {
      getColunmsByRowlist(columns, column_data_list, indicator_list);
    } else {
      /**行维度不存在的时候 */
      getColunmsByNoRowlist(columns, column_data_list);
    }
    /**行总计尾部添加一列 */
    getColunmsByRowTotal(columns, indicator_list);

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
    return {
      columns: columns.map((p) => {
        if (p?.params?.fieldType === 'electronic_signature' && p.title) {
          return {
            ...p,

            title: (p.title && p.title[0] === '['
              ? JSON.parse(p.title).map((y) => y.url || y.username)
              : p.title
            ).toString(),
            params: {
              ...p.params,
              displayTitle: p.title,
            },
          };
        }

        return p;
      }),
    };
  }

  /**存在行维度的时候 通用逻辑*/
  function getColunmsByRowlist(columns: VxeGridProps['columns'], column_data_list, indicator_list) {
    /**包装行维度 */
    rowDimension.value.forEach((i) => {
      const row = fieldMap[i];
      const data = row ? createColunm(row) : null;
      data && columns!.push(data);
    });
    rowSubTotalItems.value?.forEach((item) => {
      const totalAlias = item.totalAlias;
      const fieldKey = item.fieldKey;
      const lastFieldIndex = columnSelectItems.value.findIndex((i) => i.fieldKey === fieldKey);
      const total_title_key = columnSelectItems.value[lastFieldIndex + 1]?.fieldKey;
      for (let i = 0; i < column_data_list.length; i++) {
        const row = column_data_list[i],
          next_row = column_data_list[i + 1];
        const curr_keys = row[fieldKey];
        const next_keys = next_row?.[fieldKey];
        if (curr_keys !== next_keys) {
          const add_value = {
            ...row,
            _GCT_: {},
            _is_rst: true,
            _DICT: { _title: totalAlias, _fieldKey: fieldKey },
          };
          add_value[total_title_key] = item.function?.toLocaleLowerCase();
          column_data_list.splice(i + 1, 0, add_value);
          i++;
        }
      }
    });
    const roots: any[] = [],
      treeMap = {},
      length = columnDimension.value.length,
      parentKeyList: string[] = [];
    for (let i = 0; i < length; i++) {
      const params = fieldMap[columnDimension.value[i]];
      const filedKey = params.field,
        parentKey = fieldMap[columnDimension.value[i - 1]]?.field,
        map = {},
        lastNode = i === length - 1;
      const column_data = { params, slots: { header: 'header' } };

      if (parentKey) {
        /**记录链路 */
        parentKeyList.push(parentKey);
        for (const k in treeMap[parentKey]) {
          const _node = treeMap[parentKey][k];
          /**说明走到行小计列了 */
          if (_node._is_rst) continue;
          const children = [];
          _node.children.forEach((row) => {
            /**跳过小计 */
            if (row.params) return;
            const title = row?._DICT[filedKey] || row[filedKey];
            const value_key = row[filedKey] || '';
            const title_key = k + '_' + value_key;
            if (title_key in map) {
              map[title_key].children.push({ ...row });
            } else if (row._is_rst) {
              /**小计逻辑 */
              if (row._DICT._fieldKey === parentKey) {
                const key = _node.key + '_' + value_key;
                const _title = row._DICT._title;
                const node = {
                  title: _title,
                  children: [{ ...row }],
                  key,
                  ...column_data,
                  minWidth: getMinWidthByTitle(_title),
                  _is_rst: true,
                };
                map[title_key] = node;
                children.push(node);
              }
            } else {
              const key = _node.key + '_' + value_key;
              const node = {
                ...createColunm({ ...column_data.params, fieldName: title }),
                children: [{ ...row }],
                key,
                ...column_data,
                formatter: () => '--',
              };
              map[title_key] = node;
              children.push(node);
            }
          });
          _node.children = children;
        }
      } else {
        column_data_list.forEach((row) => {
          const title = row?._DICT[filedKey] || row[filedKey];
          const value_key = row[filedKey] || '';
          if (value_key in map) {
            map[value_key].children.push({ ...row });
          } else {
            const node = {
              ...createColunm({ ...column_data.params, fieldName: title }),
              children: [{ ...row }],
              key: value_key,
              ...column_data,
              formatter: () => '--',
            };
            map[value_key] = node;
            roots.push(node);
          }
        });
      }

      for (const k in map) {
        const _is_rst = map[k]?._is_rst;
        if (lastNode || _is_rst) {
          const valueData = map[k].children[0];
          const _parentKeys = parentKeyList.map((i) => valueData[i]).join('_');

          map[k].children = indicator_list.map((i) => {
            return {
              ...i,
              field: map[k].key + '_' + i.field,
              params: {
                ...i.params,
                _is_total: _is_rst,
                _parentKeyList: [...parentKeyList],
                _parentKeys,
              },
            };
          });
        }
      }

      treeMap[filedKey] = map;
    }
    if (!roots.length) {
      roots.push(...indicator_list);
    }
    columns?.push(...roots);
  }

  /**不存在行维度的时候 添加 序号后面的表头 */
  function getColunmsByNoRowlist(columns: VxeGridProps['columns'], column_data_list) {
    const tree_node = [];
    columnDimension.value.reduce((pre, id) => {
      const title = fieldMap[id].fieldName;
      const node = {
        title,
        children: [],
        field: '_gct_header',
        minWidth: getMinWidthByTitle(title),
      };
      pre.push(node);
      return node.children;
    }, tree_node);
    //添加首列列字段
    columns!.push(...tree_node);
    /**列添加 小计 */
    rowSubTotalItems.value?.forEach((item) => {
      const totalAlias = item.totalAlias;
      const fieldKey = item.fieldKey;
      const lastFieldIndex = columnSelectItems.value.findIndex((i) => i.fieldKey === fieldKey);
      const total_title_key = columnSelectItems.value[lastFieldIndex + 1]?.fieldKey;
      for (let i = 0; i < column_data_list.length; i++) {
        const row = column_data_list[i],
          next_row = column_data_list[i + 1];
        const curr_keys = row[fieldKey];
        const next_keys = next_row?.[fieldKey];
        if (curr_keys !== next_keys) {
          const add_value = {
            ...row,
            _GCT_: {},
            _is_rst: true,
            _DICT: { _title: totalAlias, _fieldKey: fieldKey },
          };
          add_value[total_title_key] = item.function?.toLocaleLowerCase();
          column_data_list.splice(i + 1, 0, add_value);
          i++;
        }
      }
    });
    const roots: any[] = [],
      treeMap = {},
      length = columnDimension.value.length;
    for (let i = 0; i < length; i++) {
      const params = fieldMap[columnDimension.value[i]];
      const filedKey = params.field,
        parentKey = fieldMap[columnDimension.value[i - 1]]?.field,
        map = {},
        lastNode = i === length - 1;
      if (parentKey) {
        for (const k in treeMap[parentKey]) {
          const _node = treeMap[parentKey][k];
          /**说明走到行小计列了 */
          if (_node._is_rst) continue;
          const children = [];
          _node.children.forEach((row) => {
            /**跳过小计 */
            if (row.params) return;
            const title = row?._DICT[filedKey] || row[filedKey];
            const value_key = row[filedKey];
            const title_key = k + '_' + value_key;
            if (title_key in map) {
              map[title_key].children.push({ ...row });
            } else if (row._is_rst) {
              /**小计逻辑 */
              if (row._DICT._fieldKey === parentKey) {
                const key = _node.key + '_' + value_key;
                const _title = row._DICT._title;
                const node = {
                  title: _title,
                  children: [{ ...row }],
                  key,
                  minWidth: getMinWidthByTitle(_title),
                  _is_rst: true,
                };
                map[title_key] = node;
                children.push(node);
              }
            } else {
              const key = treeMap[parentKey][k].key + '_' + value_key;
              const node = {
                title,
                children: [{ ...row }],
                key,
                minWidth: getMinWidthByTitle(title),
              };
              map[title_key] = node;
              children.push(node);
            }
          });
          treeMap[parentKey][k].children = children;
        }
      } else {
        column_data_list.forEach((row) => {
          const title = row?._DICT[filedKey] || row[filedKey];
          const value_key = row[filedKey];
          if (value_key in map) {
            map[value_key].children.push({ ...row });
          } else {
            const node = {
              title,
              children: [{ ...row }],
              key: value_key,
              minWidth: getMinWidthByTitle(title),
            };
            map[value_key] = node;
            roots.push(node);
          }
        });
      }

      for (const k in map) {
        const _is_rst = map[k]?._is_rst;
        if (lastNode || _is_rst) {
          map[k].children = [];
          map[k].field = map[k].key;
          map[k].slots = { footer: 'footer', default: 'default' };
          map[k].params = params;
        }
      }
      treeMap[filedKey] = map;
    }
    columns?.push(...roots);
  }

  /**行总计添加表头 */
  function getColunmsByRowTotal(columns: VxeGridProps['columns'], indicator_list) {
    if (!row_calculationMethod?.open) return;
    if (rowSelectItems.value.length) {
      const children = indicator_list.map((i) => {
        const field = `total_${i.params.field}`;
        const params = { ...i.params, field, fieldKey: field, _is_total: true };
        return {
          ...i,
          field,
          params,
        };
      });
      columns!.push({
        title: row_calculationMethod.totalAlias,
        fixed: 'right',
        children,
      });
    } else {
      columns!.push({
        title: row_calculationMethod.totalAlias,
        fixed: 'right',
        field: 'total_row',
        width: 120,
      });
    }
  }
  /**列总计 */
  async function geTotalHttp() {
    if (row_selectItems.length) {
      const { data = [] } =
        (await postReportDataListStatistic(
          {
            ...queryDataByTable.value,
            selectItems: row_selectItems,
          },
          apiConfig,
        )) || {};
      listStatisticData.value = data[0] || {};
    }
    if (!dimension_selectItems.length) return;
    const { data = [] } =
      (await postReportDataListStatistic(
        {
          ...queryDataByTable.value,
          selectItems: [...dimension_selectItems, ...columnSelectItems.value],
          groupItems: columnSelectItems.value.map(({ fieldKey }) => ({ fieldKey })),
        },
        apiConfig,
      )) || {};
    const col_length = columnSelectItems.value.length;
    data.forEach((row) => {
      const first_key = columnSelectItems.value
        .map((i) => getValueByKey(row, i.fieldKey))
        .join('_');
      const col_value = {};
      metricSelectItems.forEach((k) => {
        const fieldKey = k.fieldKey,
          fun = k.function?.toLocaleLowerCase();
        const rowValue = row[fieldKey];
        /**行维度不存在有特殊逻辑 */
        const valueKey = rowSelectItems.value.length
          ? first_key
            ? `${first_key}_st_${fun}_${fieldKey}`
            : `st_${fun}_${fieldKey}`
          : first_key;
        listStatisticData.value[valueKey] = rowValue;
        col_value[fieldKey] = rowValue;
      });
      /**行列总计交叉 */
      const totalKey = 'total_row_col';
      if (listStatisticData.value[totalKey]) {
        listStatisticData.value[totalKey].push(col_value);
      } else {
        listStatisticData.value[totalKey] = [col_value];
      }
      /**小计交叉 */
      rowSubTotalItems.value.map((i) => {
        const keys = getKeysByRowData(col_length, columnSelectItems.value, i.fieldKey, row);
        if (listStatisticData.value[keys]) {
          listStatisticData.value[keys].push(col_value);
        } else {
          listStatisticData.value[keys] = [col_value];
        }
      });
      /**总计对应的函数 */
      dimension_selectItems.forEach((i) => {
        const fun_key = i.fieldKey + '_function';
        listStatisticData.value[fun_key] = i.function;
      });
    });
  }
  /**行总计 */
  async function geRowTotalHttp(selectItems: SelectItem[] = [], rowSelectItems: SelectItem[] = []) {
    if (!selectItems.length) return;
    const { data = [] } =
      (await postReportDataListStatistic(
        {
          ...queryDataByTable.value,
          selectItems: [...selectItems, ...rowSelectItems],
          groupItems: rowSelectItems.map(({ fieldKey }) => ({ fieldKey })),
        },
        apiConfig,
      )) || {};

    if (rowSelectItems.length) {
      row_listStatisticData.value = data.reduce((preValue, currValue) => {
        const keys = rowSelectItems.map((i) => getValueByKey(currValue, i.fieldKey)).join('_');
        const totalValue = selectItems.reduce((pre, curr) => {
          const value = currValue[curr.fieldKey];
          const key = `total_${curr.fieldKey}`;
          pre[key] = value;
          return pre;
        }, {});
        preValue[keys] = totalValue;
        return preValue;
      }, {});
    } else {
      row_listStatisticData.value = data[0];
    }
  }

  async function reloadTableColumn(options, ready) {
    rowDimension.value =
      options[0]?.children?.map((i) => i.key)?.filter((i) => fieldMap[i].visible !== false) || [];
    columnDimension.value =
      options[1]?.children.map((i) => i.key)?.filter((i) => fieldMap[i].visible !== false) || [];
    ready || search();
  }

  onMounted(async () => {
    search();
  });

  /**导出专用查询所有数据 */
  async function getExportDataByHttp({ config: { dateFormat = true, numFormat = true } }) {
    if (!rowSelectItems.value.length && !columnSelectItems.value.length) return;
    const reportBody = {
      ...queryDataByTable.value,
      rowSubTotalItems: rowSubTotalItems.value,
      rowSelectItems: dateFormat
        ? rowSelectItems.value
        : transformDefaultByDateType(rowSelectItems.value, fieldMap, 'dimension:'),
      columnSelectItems: dateFormat
        ? columnSelectItems.value
        : transformDefaultByDateType(columnSelectItems.value, fieldMap, 'dimension:'),
      columnSubTotalItems: columnSubTotalItems.value,
      metricSelectItems: transformDefaultByDateType(metricSelectItems, fieldMap, 'indicator:'),
      pageType: pageType === REPORT_TABLE_PAGE_TYPE.FIRST_DIMENSION,
      pageSize: 9999,
    };
    const { rowData, columnData, rowSubTotalData, columnSubTotalData } =
      ((await postReportDataListByPage4Cross(reportBody, apiConfig)) as any) || {};
    exportConfig.numFormat = numFormat;
    const list = transformSourceData(
      rowData?.data || columnData?.data,
      rowData?.dict || columnData?.dict,
    );
    if (columnSubTotalData) {
      for (const k in columnSubTotalData) {
        const subData = columnSubTotalData[k];
        columnSubTotalData[k] = transformSourceData(subData, {
          ...columnData?.dict,
          ...rowData?.dict,
        });
      }
    }
    const data = getDataByColunms(list, columnSubTotalData || {}, rowSubTotalData || {});
    const columns = vxeTable.value.getColumns();
    mergeCell && calculateMultiSpans(cloneDeep(columns), data, _field_proto_map);
    return data.map((row) => {
      return columns.reduce(
        (total, column) => {
          if (column.field && column.params) {
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
    reloadTableColumn,
    firstField,
    only_col,
    gridOptions,
    pagination,
    total,
    reload: getDataByHttp,
    search,
    listStatisticData,
    maxHeight,
    loading,
    getExportDataByHttp,
  };
}

/**根据日期格式返回默认 */
function transformDefaultByDateType(fieldItem: SelectItem[], fieldMap, prefix) {
  return fieldItem.map((item) => {
    if (item.format) {
      return {
        ...item,
        format: type2formatMapping[fieldMap[prefix + item.fieldKey].dateTimeTypeFormatting],
      };
    }
    return item;
  });
}

function getValueByKey(row, key) {
  return row?.[key];
}

/**动态获取元素key */
function getKeysByRowData(rowLength, rowSelectItems, fieldKey, row): string {
  const keys: string[] = [];
  for (let i = 0; i < rowLength; i++) {
    const item = rowSelectItems[i];
    const row_key = item.fieldKey;
    keys.push(row[row_key]);
    if (row_key === fieldKey) break;
  }
  return keys.join('_');
}
