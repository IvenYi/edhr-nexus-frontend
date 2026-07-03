import { computed, defineComponent, onUnmounted, type PropType, provide, ref, toRaw } from 'vue';
import { IModal, useNamespace } from '@gct-paas/core';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import { GCT_TABLE_SCHEMA_KEY } from '@gct/universal-component/gct-v-table';
import { GctVTablePad } from '@gct/universal-component/gct-v-table-pad';
import type {
  IDataVTable,
  IDataVTableQuery,
  IGctVTableExpose,
  IVTableColumn,
  IVTableDataItem,
} from '@gct/universal-component/gct-v-table';
import { cloneDeep, debounce } from 'lodash-es';
import { useQueryfilter } from '/@page-designer/components/widgets/hooks/listhook';
import { transformSourceData } from '../../../hooks/utils';
import { useDataTableActionsConfig } from './v-table-actions';
import { RenderTableButtons } from './component/render-table-buttons/render-table-buttons';
import {
  dependencyToShowSync,
  tableWidgetToRequired,
  tableWidgetToShow,
} from '/@/projects/web-render/src/render/Event/Dependency/useDependencyToShow';
import { LowCodeWidget } from '@gct/runtime';
import { IDataTableComponentExpose } from '/@/projects/page-designer/src/interface/pad';
import { _createColumnsConfig } from './v-table-column-pretreat';
import { pretreatColumnsData } from './v-table-data-pretreat';
import { getRenderComponentByType } from '../../field/render';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import './data-v-table-render.scss';

export const GctPadDataTable = defineComponent({
  name: 'GctPadDataTable',
  props: {
    widget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
      required: true,
    },
    tableParamsData: {
      type: Object as PropType<IObject>,
    },
  },
  setup(props, { expose }) {
    const t = window.$t;
    // 组件未初始化完成前不渲染表格
    const isInit = ref<boolean>(false);
    const ns = useNamespace('pad-data-table');
    const vTableRef = ref<IGctVTableExpose>(null!);
    const Event = getPageEvent();

    const allColumns = ref<IVTableColumn[]>([]);

    provide(GCT_TABLE_SCHEMA_KEY, props.widget);

    provide('getRenderComponentByType', getRenderComponentByType);

    /**
     * 选中数据数量，只有多选模式下有效
     */
    const checkCount = ref(0);

    // 操作列配置
    const actionWidget = computed(() => {
      const actionWidget = widget.children?.find((col) => {
        return col.alias === '操作';
      });
      return actionWidget;
    });
    const actionWidgets = computed(() => {
      return actionWidget.value?.children || [];
    });

    const { widget } = props;

    const { style } = toRaw(widget);

    const {
      model,
      modeldata,
      initializeLoad,
      serialNumber,
      rowSelectionType,
      refSearch,
      collation,
      datafilter,
      customdataSource,
      datasourceConfig,
    } = toRaw(widget.props);

    const fieldWidget = widget.children?.find((col) => {
      return col.alias === '字段组';
    });
    /* 所有表格字段 */
    const fieldWidgets = ref<LowCodeWidget.BasicSchema[]>(cloneDeep(fieldWidget?.children || []));

    const checkMode = computed(() => {
      if (rowSelectionType === 'gct_radio') {
        return 'single';
      }
      if (rowSelectionType === 'checkbox') {
        return 'multiple';
      }
      return 'none';
    });

    const showHeader = computed(() => {
      return (
        (checkMode.value === 'multiple' && checkCount.value > 0) ||
        (headerBtnGroupItems.value && headerBtnGroupItems.value.length > 0)
      );
    });

    const maxHeight = computed(() => {
      let _height: number = style?.maxHeight ? Number(style.maxHeight) : 540;
      if (showHeader.value) {
        _height -= 58;
      }
      return _height;
    });

    // 查询条件解析
    const queryFilter = useQueryfilter(datafilter);

    // 头部按钮配置
    const headerBtnGroup = computed(() => {
      if (widget.children && widget.children[2]?.children?.length) {
        return widget.children[2];
      }
      return null;
    });

    const headerBtnGroupItems = computed(() => {
      if (widget.children && widget.children[2]?.children?.length) {
        return widget.children[2].children;
      }
      return null;
    });

    // 配置的默认排序
    const sortFields = computed(() => {
      return collation && collation.length > 0
        ? collation
            .filter((item) => item.collationField)
            .map((item) => {
              return {
                sortField: item.collationField,
                sortType: item.collationSort,
              };
            })
        : [];
    });

    // 外键字段配置
    const foreignFields = computed(() => {
      return fieldWidgets.value
        .filter((i) => {
          return i.props.isFieldModel && i.props.bindFieldLink && i.props.bindFieldLink.length > 0;
        })
        .map((i) => i.props.bindFieldLink!.join('.'));
    });

    // 保存设置入表格的查询条件，避免翻页时丢失
    const queryData = ref<Partial<IDataVTableQuery>>({});

    /**
     * 触发表格搜索，由事件触发调用
     */
    function search(query?: Partial<IDataVTableQuery>): Promise<void> {
      if (!vTableRef.value) return Promise.resolve();
      if (query) {
        queryData.value.exp = query.exp;
        queryData.value.query = query.query;
      }
      return vTableRef.value.search();
    }

    async function onInit(): Promise<void> {
      if (refSearch) {
        Event.initSearchs(refSearch, search, widget.id);
        /** 从查询组件内获取查询条件 */
        const searchVm = (await Event.getComponent(refSearch)) as any;
        const query = (await searchVm.getBodyBySearch()) || {};
        queryData.value.exp = query.exp;
        queryData.value.query = query.query;
      }
    }

    /**
     * 构建查询参数
     *
     * @param {Partial<IDataVTableQuery>} params
     * @returns {*}  {IDataVTableQuery}
     */
    function genQueryParams(params: Partial<IDataVTableQuery>): IDataVTableQuery {
      // tableParamsData 是传入的基础过滤结构，例如: { "parent_id_": "123" }
      // params 是表格查询构建，所有优先级最低
      // queryData 是保存的查询条件，优先级最高
      const _query = {
        ...params,
      };
      if (sortFields.value.length > 0) {
        _query.sorts = sortFields.value;
      }
      if (foreignFields.value.length > 0) {
        _query.foreignFields = foreignFields.value;
      }
      _query.query = {
        ...(props.tableParamsData || {}),
        ...(_query.query || {}),
        ...queryData.value.query,
        ...queryFilter.query,
      };

      _query.exp = queryFilter.getExp(_query.exp) || queryFilter.getExp(queryData.value.exp);
      return _query as IDataVTableQuery;
    }

    /**
     * 根据操作列的显隐配置，处理每行数据的可操作权限
     *
     * @param {IVTableDataItem[]} items
     */
    async function transformItemsActions(items: IVTableDataItem[]) {
      // 操作列配置
      const all: Promise<void>[] = [];
      if (actionWidgets.value && actionWidgets.value.length > 0) {
        items.forEach((row) => {
          row._ACTIONS = [];
          actionWidgets.value.forEach((btnWidget: LowCodeWidget.BasicSchema) => {
            all.push(
              dependencyToShowSync(btnWidget, row).then((show) => {
                if (show === true) {
                  row._ACTIONS!.push(btnWidget.id);
                }
              }),
            );
          });
        });
      }
      await Promise.all(all);
    }

    /**
     * 根据表格列的配置进行数据预处理
     *
     * @param {IVTableDataItem[]} items
     */
    async function _pretreatColumnsData(items: IVTableDataItem[]) {
      if (fieldWidgets.value.length > 0) {
        await pretreatColumnsData(fieldWidgets.value, items, {
          event: Event,
          queryData: queryData,
        });
      }
      await transformItemsActions(items);
    }

    /**
     * 格式化表格返回的数据，计算每列数据的操作列权限
     *
     * @param {IObject[]} data
     * @param {IObject} dict
     * @returns {*}  {IObject[]}
     */
    async function transformItems(data: IObject[], dict: IObject): Promise<IObject[]> {
      const items = transformSourceData(data, dict) as IVTableDataItem[];
      await _pretreatColumnsData(items);
      return items;
    }

    /**
     * 由表格触发的数据加载
     *
     * @param params
     * @returns
     */
    async function load(
      params: Partial<IDataVTableQuery>,
    ): Promise<{ items: IObject[]; total: number }> {
      let data: IObject | null = null;
      if (customdataSource && datasourceConfig?.name) {
        const dataExtraParams = datasourceConfig?.extraParams;
        data = (await Event.runExportByName(
          datasourceConfig?.name,
          genQueryParams(params),
          {},
          dataExtraParams,
        )) as unknown as IObject;
      } else {
        data = await Event.context.$httpBizService(
          {
            action: 'listByPage',
            key: model,
            modelCategory: modeldata?.modelCategory,
          },
          genQueryParams(params),
        );
      }
      if (data) {
        const _items = await transformItems(data.data, data.dict);
        return {
          items: _items,
          total: data.totalCount,
        };
      }
      return {
        items: [],
        total: 0,
      };
    }

    async function onSave(data: IObject): Promise<boolean> {
      const { model, modeldata = {}, doNotSubmit } = widget.props;
      let res: string = '';
      if (doNotSubmit !== true) {
        res = (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: modeldata.modelCategory!,
            modelKey: model!,
            bsKey: 'saveOrUpdate',
          },
          data,
        )) as unknown as string;
        if (!res) {
          console.error('VTable 行编辑保存失败', data);
          return false;
        }
      }
      return true;
    }

    const config: IDataVTable = {
      key: 'id_',
      autoLoad: initializeLoad ?? true,
      isSerialNumber: serialNumber,
      checkMode: checkMode.value,
      columns: [],
      pipe: {
        data: _pretreatColumnsData,
      },
      init(): Promise<void> {
        return onInit();
      },
      load(params) {
        return load(params);
      },
      save(data: IObject): Promise<boolean> {
        return onSave(data);
      },
    };

    /**
     * 计算列配置
     *
     * @returns {*}  {Promise<void>}
     */
    async function calcColumns(): Promise<void> {
      // 根据配置解析字段配置信息
      if (fieldWidgets.value && fieldWidgets.value.length > 0) {
        const all = fieldWidgets.value.map((col: LowCodeWidget.BasicSchema) => {
          return _createColumnsConfig(props.widget, col);
        });
        allColumns.value = await Promise.all(all);
        config.columns = allColumns.value;
      }
    }

    /**
     * 重新计算列配置（防抖程序内的逻辑，非人为操作逻辑）
     */
    const refreshColumns = debounce(() => {
      vTableRef.value.resetConfig();
    }, 50);

    /**
     * 根据列公式隐藏配置,过滤出需要显示的列
     */
    function initColumns(): void {
      fieldWidgets.value.forEach((col) => {
        tableWidgetToShow(col, (res) => {
          if (col.props.hidden != res) {
            col.props.hidden = res;
            refreshColumns();
          }
        });
        tableWidgetToRequired(col, (res) => {
          if (col.props.required != res) {
            col.props.required = res;
            refreshColumns();
          }
        });
      });
    }

    function openChecksModal(): void {
      let column = (fieldWidgets.value as any[]).find((row) => {
        if (row.isField === true && row.props.fixedAlign === 'left') {
          return row;
        }
      });
      if (!column) {
        column = fieldWidgets.value[0];
      }
      const checkboxRow = vTableRef.value.getCheckedRows();
      // gct.openUtil
      //   .modal<IModal>(
      //     DataTableChecks,
      //     { items: checkboxRow, widget: column },
      //     { footer: false, width: 640, height: 540 },
      //   )
      //   .then((_) => {
      //     if (_.ok) {
      //       console.debug('选择的数据', _);
      //     }
      //   });
      console.debug('选择的数据', checkboxRow, column);
    }

    const _init = async () => {
      await calcColumns();
      initColumns();
      // 根据配置解析操作列配置信息
      if (actionWidget.value) {
        const columnConfig = useDataTableActionsConfig(this, actionWidget.value, Event);
        if (columnConfig) {
          config.columns.push(columnConfig);
        }
      }
      isInit.value = true;
    };

    function checkChange(rows: IVTableDataItem[]) {
      checkCount.value = rows.length;
      Event.runEventByName('checkboxEvent', widget.events, cloneDeep(rows));
    }

    function singleCheckChange(row: IVTableDataItem) {
      Event.runEventByName('radioEvent', widget.events, cloneDeep(row));
    }

    function rowClick(row: IVTableDataItem) {
      Event.runEventByName('cellClickEvent', widget.events, cloneDeep(row));
    }

    function clearAllSelected() {
      vTableRef.value.uncheckAll();
    }

    onUnmounted(() => {
      if (refSearch) {
        Event.cancelInitSearchs(refSearch, widget.id);
      }
    });

    _init();

    expose({
      async reload(queryData = {}) {
        setTimeout(() => {
          vTableRef.value.search(queryData as any);
        }, 50);
      },
      async addDataSource(data, dict = {}) {
        data = cloneDeep(data);
        const _items = (await transformItems(
          Array.isArray(data) ? data : [data],
          dict,
        )) as IVTableDataItem[];
        vTableRef.value.addItems(_items);
      },
      async deleteByChecked() {
        console.error('deleteByChecked Method not implemented.');
      },
      async fullValidate() {
        console.error('fullValidate Method not implemented.');
      },
      getCurrentSelectedValue() {
        return cloneDeep(vTableRef.value.getCheckedRows());
      },
      getDataSource() {
        return cloneDeep(vTableRef.value.getItems());
      },
      getParameters() {
        console.error('getParameters Method not implemented.');
        return {};
      },
      getSelectedValue() {
        return cloneDeep(vTableRef.value.getCheckedRows());
      },
      async setDataSource(data, dict = {}) {
        data = cloneDeep(data);
        const _items = (await transformItems(
          Array.isArray(data) ? data : [data],
          dict,
        )) as IVTableDataItem[];
        vTableRef.value.setItems(_items);
      },
      async setParamsData(_query, _paginationData) {
        console.error('setParamsData Method not implemented.');
      },
      async setSeleckedByKeys(_rowKey, _keys) {
        console.error('setSeleckedByKeys Method not implemented.');
      },
      async validateByIndex(_rowIndex) {
        console.error('validateByIndex Method not implemented.');
      },
    } as IDataTableComponentExpose);

    return () => {
      if (isInit.value !== true) {
        return;
      }
      return (
        <div class={[ns.b(), ns.is('with-header', showHeader.value)]}>
          {showHeader.value ? (
            <div class={ns.e('header')}>
              <div class={ns.e('header-left')}>
                {checkCount.value > 0 ? (
                  <div class={ns.e('select-info')} onClick={openChecksModal}>
                    <span class={ns.em('select-info', 'text')}>
                      {t('sys.batchOperation.selected')}
                      <span class={ns.em('select-info', 'count')}>{checkCount.value}</span>
                      {t('sys.batchOperation.lines')}
                    </span>
                    <span class={ns.em('select-info', 'clear')} onClick={clearAllSelected}>
                      <i class="iconfont icon-cuowu2"></i>
                    </span>
                  </div>
                ) : null}
              </div>
              <div class={ns.e('header-right')}>
                {headerBtnGroupItems.value && (
                  <RenderTableButtons
                    class={ns.e('header-buttons')}
                    visibleButtons={headerBtnGroup.value?.visibleButtons}
                    buttons={headerBtnGroupItems.value}
                    isRef={true}
                  />
                )}
              </div>
            </div>
          ) : null}
          <div class={ns.e('table')}>
            <GctVTablePad
              ref={vTableRef}
              config={config}
              maxHeight={maxHeight.value}
              onCheckChange={checkChange}
              onSingleCheckChange={singleCheckChange}
              onRowClick={rowClick}
            />
          </div>
        </div>
      );
    };
  },
});

export default GctPadDataTable;
