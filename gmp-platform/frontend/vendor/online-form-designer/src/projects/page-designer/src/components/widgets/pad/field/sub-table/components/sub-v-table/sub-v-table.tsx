import {
  computed,
  defineComponent,
  onMounted,
  type PropType,
  provide,
  ref,
  toRaw,
  watch,
} from 'vue';
import { useNamespace } from '@gct-paas/core';
import { LowCodeWidget, sortTypeEnum } from '@gct/runtime';
import { GCT_TABLE_SCHEMA_KEY } from '@gct/universal-component/gct-v-table';
import { GctVTablePad } from '@gct/universal-component/gct-v-table-pad';
import type {
  IDataVTable,
  IDataVTableQuery,
  IGctVTableExpose,
  IVTableColumn,
  IVTableDataItem,
} from '@gct/universal-component/gct-v-table';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
import { _createColumnsConfig } from '../../../../data/data-v-table/v-table-column-pretreat';
import { pretreatColumnsData } from '../../../../data/data-v-table/v-table-data-pretreat';
import { getRenderComponentByType } from '../../../render';
import {
  dependencyToShowSync,
  tableWidgetToRequired,
  tableWidgetToShow,
} from '/@web-render/render/Event/Dependency/useDependencyToShow';
import { useDataTableActionsConfig } from '../../sub-v-table-actions';
import { createUUID } from 'qx-util';
import './sub-v-table.scss';

export const SubVTable = defineComponent({
  name: 'SubVTable',
  props: {
    formData: {
      type: Object as PropType<IObject>,
      required: true,
    },
    widget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
      required: true,
    },
    parentKey: {
      type: String,
      required: true,
    },
  },
  emits: [
    'update:items',
    'rowClick',
    'rowDelete',
    'rowAdd',
    'rowEdit',
    'rowCopy',
    'sortChange',
    'dataChange',
  ],
  setup(props, { emit, expose }) {
    const ns = useNamespace('sub-v-table');
    const vTableRef = ref<IGctVTableExpose>(null!);
    const isInit = ref<boolean>(false);
    const allColumns = ref<IVTableColumn[]>([]);
    const Event = getPageEvent();

    const { style } = toRaw(props.widget);
    const { customdataSource, datasourceConfig, serialNumber, rowDragSort, collation } =
      props.widget.props;

    const readonly = toRef(() => props.widget.props.readonly);

    const disabled = toRef(() => props.widget.props.disabled);

    watch(readonly, () => {
      config.readonly = readonly.value;
    });

    watch(disabled, () => {
      config.disabled = disabled.value;
    });

    provide(GCT_TABLE_SCHEMA_KEY, props.widget);

    provide('getRenderComponentByType', getRenderComponentByType);

    // 操作列配置
    const actionWidget = computed(() => {
      const actionWidget = props.widget.children?.find((col) => {
        return col.alias === '操作' && !readonly.value;
      });
      return actionWidget;
    });
    const actionWidgets = computed(() => {
      return actionWidget.value?.children || [];
    });

    const fieldWidget = props.widget.children?.find((col) => {
      return col.alias === '字段组';
    });

    /* 所有表格字段 */
    const fieldWidgets = ref<LowCodeWidget.BasicSchema[]>(fieldWidget?.children || []);

    const maxHeight = computed(() => {
      const _height: number = style?.maxHeight ? Number(style.maxHeight) : 540;
      return _height;
    });

    watch(
      () => props.formData.id_,
      (newVal, oldVal) => {
        if (newVal == oldVal) {
          return;
        }
        if (isInit.value && vTableRef.value) {
          vTableRef.value.search();
        }
      },
    );

    // 外键字段配置
    const foreignFields = computed(() => {
      return fieldWidgets.value
        .filter((i) => {
          return i.props.isFieldModel && i.props.bindFieldLink && i.props.bindFieldLink.length > 0;
        })
        .map((i) => i.props.bindFieldLink!.join('.'));
    });

    /**
     * 根据操作列的显隐配置，处理每行数据的可操作权限
     *
     * @param {IVTableDataItem[]} items
     */
    async function transformItemsActions(items: IVTableDataItem[]): Promise<void> {
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
    async function _pretreatColumnsData(items: IVTableDataItem[]): Promise<void> {
      if (fieldWidgets.value.length > 0) {
        await pretreatColumnsData(fieldWidgets.value, items, { event: Event, queryData: ref({}) });
      }
      await transformItemsActions(items);
    }

    /**
     * 格式化表格返回的数据
     *
     * @param {IObject[]} data
     * @param {IObject} dict
     * @returns {*}  {Promise<IVTableDataItem[]>}
     */
    async function transformItems(data: IObject[], dict: IObject): Promise<IVTableDataItem[]> {
      const items = transformSourceData(data, dict) as IVTableDataItem[];
      await _pretreatColumnsData(items);
      return items;
    }

    // 生成排序查询条件
    const querySort = getQuerySort(
      rowDragSort
        ? {
            collationField: 'sort_num_',
            collationSort: sortTypeEnum.ASC,
          }
        : {
            collationField: 'create_time_',
            collationSort: sortTypeEnum.DESC,
            collation: collation,
          },
    );

    /**
     * 支持自定义数据源
     */
    async function getDataSourceByType(id) {
      const querykey = 'ref_master_id_';
      const queryData: IObject = {
        query: { [querykey + '.eq']: id },
        sorts: [...querySort],
        includeSubModel: 1,
      };
      if (foreignFields.value.length > 0) {
        queryData.foreignFields = foreignFields.value;
      }
      if (customdataSource && datasourceConfig?.name) {
        return Event.runExportByName(
          datasourceConfig?.name,
          queryData,
          datasourceConfig.extraParams,
        );
      } else {
        return Event.context.$httpBizService(
          { action: 'listAll', key: props.widget.props.bindModelKey },
          queryData,
        );
      }
    }

    /**
     * 数据加载函数 - 直接使用传入的 items
     */
    async function load(
      _query?: Partial<IDataVTableQuery>,
    ): Promise<{ items: IObject[]; total: number }> {
      await Event.runEventByName('beforeDataLoad', props.widget.events, props.formData);
      if (props.formData.id_) {
        const res = await getDataSourceByType(props.formData.id_);
        const _items = await transformItems(res?.data || [], res.dict || {});
        _items.forEach((item) => {
          if (!item._id) {
            item._id = item.id_ || createUUID();
          }
        });
        return {
          items: _items,
          total: _items.length,
        };
      }
      return { items: [], total: 0 };
    }

    const config: IDataVTable = reactive<IDataVTable>({
      key: '_id',
      pageMode: 'none',
      autoLoad: true,
      isSerialNumber: serialNumber ?? false,
      isDragSort: rowDragSort ?? false,
      checkMode: 'none',
      columns: [],
      pipe: {
        data: _pretreatColumnsData,
      },
      load(query) {
        return load(query);
      },
    });

    /**
     * 计算列配置
     */
    async function calcColumns(): Promise<void> {
      if (fieldWidgets.value && fieldWidgets.value.length > 0) {
        const isRowEdit = props.widget.props.editMode === 'inline';
        const all = fieldWidgets.value.map((col: LowCodeWidget.BasicSchema) => {
          if (isRowEdit !== true) {
            col.props.fieldReadonly = true;
          }
          return _createColumnsConfig(props.widget, col);
        });
        allColumns.value = await Promise.all(all);
        config.columns = allColumns.value;
      }
    }

    /**
     * 初始化表格配置
     */
    const _init = async (): Promise<void> => {
      await calcColumns();
      initColumns();
      isInit.value = true;
    };

    /**
     * 根据列公式隐藏配置,过滤出需要显示的列
     */
    const initColumns = (): void => {
      fieldWidgets.value.forEach((col) => {
        tableWidgetToShow(col, (res) => {
          if (col.props.hidden != res) {
            col.props.hidden = res;
          }
        });
        tableWidgetToRequired(col, (res) => {
          if (col.props.required != res) {
            col.props.required = res;
          }
        });
      });
      // 根据配置解析操作列配置信息
      if (actionWidget.value) {
        const columnConfig = useDataTableActionsConfig(
          exposeFuncs as any,
          actionWidget.value,
          Event,
        );
        if (columnConfig) {
          config.columns.push(columnConfig);
        }
      }
    };

    /**
     * 行点击事件
     *
     * @param {IVTableDataItem} row
     */
    function rowClick(row: IVTableDataItem): void {
      emit('rowClick', row);
    }

    /**
     * 新增数据行，主要用于新建行
     *
     * @param {IVTableDataItem} item
     */
    async function addRow(item: IVTableDataItem): Promise<void> {
      item._id = item.id_ || createUUID();
      const items = await transformItems([item], {});
      vTableRef.value.addItems(items);
      await nextTick();
      vTableRef.value.redraw();
    }

    onMounted(() => {
      _init();
    });

    const exposeFuncs = {
      getItems() {
        return vTableRef.value?.getItems() || [];
      },
      getSourceItems() {
        return vTableRef.value?.getSourceItems() || [];
      },
      getRemovedItems() {
        return vTableRef.value?.getRemovedItems() || [];
      },
      getRemovedSourceItems() {
        return vTableRef.value?.getRemovedSourceItems() || [];
      },
      setItems(items: IVTableDataItem[]) {
        return vTableRef.value?.setItems(items);
      },
      addRow,
      copyRow(row: IVTableDataItem, rowIndex?: number) {
        emit('rowCopy', row, rowIndex);
      },
      deleteRow(row: IVTableDataItem, _rowIndex?: number) {
        vTableRef.value?.removeItems([row]);
      },
      editRow(row: IVTableDataItem, rowIndex?: number) {
        emit('rowEdit', row, rowIndex);
      },
      updateRow(row: IVTableDataItem, _rowIndex?: number) {
        vTableRef.value?.updateItems([row]);
      },
      async setValue(data: any[], dict?: object): Promise<void> {
        const items = await transformItems(data, dict || {});
        vTableRef.value?.setItems(items);
      },
      async addValue(data: any[], dict?: object): Promise<void> {
        const items = await transformItems(data, dict || {});
        vTableRef.value?.addItems(items);
      },
    };

    expose(exposeFuncs);

    return () => {
      if (isInit.value !== true) {
        return null;
      }
      return (
        <div class={ns.b()}>
          <GctVTablePad
            ref={vTableRef}
            config={config}
            maxHeight={maxHeight.value}
            onRowClick={rowClick}
            onSortChange={(...args) => {
              emit('sortChange', ...args);
            }}
            onDataChange={(...args) => {
              emit('dataChange', ...args);
            }}
          />
        </div>
      );
    };
  },
});
