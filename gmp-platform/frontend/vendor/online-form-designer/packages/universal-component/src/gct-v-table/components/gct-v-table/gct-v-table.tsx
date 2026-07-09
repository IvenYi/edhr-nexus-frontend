import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import { useNamespace } from '@gct-paas/core';
import { useResizeObserver } from '@vueuse/core';
import { ColumnDefine, ListTable, type ListTableConstructorOptions } from '@visactor/vtable';
import type {
  CheckboxColumnDefine,
  CustomRenderFunctionArg,
  IRowSeriesNumber,
  RadioColumnDefine,
} from '@visactor/vtable/es/ts-types';
import type {
  IDataVTableQuery,
  IGctVTableExpose,
  IGctVTableProps,
  IVTableColumn,
  IVTableDataItem,
  IVTableOperationColumn,
} from '../../interface';
import { useGctVTableStore } from '../../store';
import { getCustomTableTheme } from '../../v-table-theme';
import {
  createFieldColumnPluginInstance,
  createHeaderColumnPluginInstance,
  OperationColumnPlugin,
} from '../../v-table-plugin';
import { PresetPluginType, TABLE_EVENTS } from '../../constants';
import { GctVTableRowEdit } from '../gct-v-table-row-edit/gct-v-table-row-edit';
import './gct-v-table.scss';
import { createGroup, createText } from '@visactor/vtable/es/vrender';
import { suppressNextEvent } from '../../utils';

/**
 * 基于 VTable 组件封装的通用表格组件
 */
export const GctVTable = defineComponent({
  name: 'GctVTable',
  props: {
    config: {
      type: Object as PropType<IGctVTableProps['config']>,
      required: true,
    },
    maxHeight: {
      type: Number,
      default: 540,
    },
  },
  emits: [
    TABLE_EVENTS.CHECK_CHANGE,
    TABLE_EVENTS.SINGLE_CHECK_CHANGE,
    TABLE_EVENTS.ROW_CLICK,
    TABLE_EVENTS.DATA_CHANGE,
    TABLE_EVENTS.SORT_CHANGE,
  ],
  setup(props, { slots, expose, emit }) {
    const t = window.$t;
    const ns = useNamespace('v-table');
    const tableRef = ref<HTMLDivElement>();
    const containerRef = ref<HTMLDivElement>();

    const store = useGctVTableStore();

    store.setConfig(props.config);

    const tableHeight = ref<number>(0);

    const domStyle = getComputedStyle(document.body as HTMLElement);
    const _primaryColor = domStyle.getPropertyValue('--van-primary-color').trim();
    const _textColor1 = domStyle.getPropertyValue('--gct-color-text-1').trim();

    watch(
      props.config,
      () => {
        resetConfig();
      },
      { deep: true },
    );

    // 计算容器高度
    const containerHeight = computed<string>(() => {
      const isEmpty = store.dataCount === 0 && !store.isLoading;
      // if (store.isRowEdit) {
      //   // 如果编辑的是最后一条数据，则增加一些高度避免遮挡保存按钮
      //   if (store.rowEditIndex === store.getRecords().length) {
      //     return `${tableHeight.value + 60}px`;
      //   }
      // }
      if (isEmpty) {
        return `${tableHeight.value + 200}px`;
      }
      if (store.cfg.isDragSort) {
        return `${tableHeight.value + 3}px`;
      }
      return `${tableHeight.value}px`;
    });

    /**
     * 表格重绘
     * 加载完数据也要触发一次重绘表格，避免一些样式计算异常
     * 同时计算表格高度：内容未超过最大高度时使用内容高度，否则使用最大高度
     */
    function redraw(): void {
      if (store.tableInst) {
        // 计算所有行的高度（包括表头行）
        const allRowHeight = store.tableInst.getRowsHeight(0, store.getRecords().length);
        // 根据分页模式设置表格高度：
        // - 当 pageMode = 'none' 时，高度完全由内容决定，不受 maxHeight 限制
        // - 其他模式下，使用内容高度与 maxHeight 的较小值
        const tableHeightVal =
          store.cfg.pageMode === 'none' ? allRowHeight : Math.min(allRowHeight, props.maxHeight);
        tableHeight.value = tableHeightVal;
        store.redraw();
      }
    }

    // 监听容器大小变化并重绘表格
    useResizeObserver(containerRef, () => {
      redraw();
    });

    /**
     * 计算占位列宽度
     */
    function calcLastColWidth(tableInst: ListTable, row: number, col: number): number {
      // 获取前边所有的列宽度之和
      const allColWidth = tableInst.getCellsRectWidth(0, row, col - 1, row);
      // 获取后边所有的列宽度之和
      const rightColWidth = tableInst.getCellsRectWidth(col + 1, row, tableInst.colCount - 1, row);
      // 获取 canvas 画布宽度
      const canvasWidth = tableInst.container.clientWidth || 0;
      // 计算当前列需要的宽度
      const _width = canvasWidth - allColWidth - rightColWidth;
      return _width > 0 ? _width : 0;
    }

    /**
     * 绘制字段列
     *
     * @param {IVTableColumn} colCfg
     * @return {*}  {ColumnDefine}
     */
    function renderFieldColumn(colCfg: IVTableColumn, isLastCol: boolean = false): ColumnDefine {
      const customDefineOptions: Partial<ColumnDefine> = colCfg.defineOptions ?? {};
      let lastColWidth: number = -1;

      return {
        field: colCfg.name,
        title: colCfg.title,
        width: colCfg.width ?? 'auto',
        // minWidth: 128,
        disableHover: true,
        disableHeaderHover: true,
        disableHeaderSelect: true,
        headerCustomLayout(args: CustomRenderFunctionArg) {
          const pluginInst = createHeaderColumnPluginInstance(store, colCfg, args.col);
          const rootContainer = pluginInst.render(args);
          // 如果是最后一列，计算宽度以占满剩余空间
          if (isLastCol) {
            if (args.row === 0) {
              const { row, col } = args;
              lastColWidth = calcLastColWidth(args.table as ListTable, row, col);
            }
            if (lastColWidth > 0) {
              rootContainer.setAttribute('width', lastColWidth);
            }
          }
          return {
            rootContainer,
            renderDefault: false,
          };
        },
        customLayout(args: CustomRenderFunctionArg) {
          const { row, col } = args;
          const data = store.tableInst.getRecordByRowCol(col, row);
          const pluginInst = createFieldColumnPluginInstance(store, colCfg, data, row);
          const rootContainer = pluginInst.render(args);

          // 如果是最后一列，计算宽度以占满剩余空间
          if (isLastCol) {
            if (args.row === 1) {
              const { row, col } = args;
              lastColWidth = calcLastColWidth(args.table as ListTable, row, col);
            }
            if (lastColWidth > 0) {
              rootContainer.setAttribute('width', lastColWidth);
            }
          }
          return {
            rootContainer,
            renderDefault: false,
          };
        },
        ...customDefineOptions,
      } as ColumnDefine;
    }

    /**
     * 绘制操作列
     *
     * @param {IVTableOperationColumn} colCfg
     * @return {*}  {ColumnDefine}
     */
    function renderOperationColumn(colCfg: IVTableOperationColumn): ColumnDefine {
      return {
        field: 'operation',
        title: t('sys.operation'),
        width: colCfg.width || 'auto',
        disableHover: true,
        disableHeaderHover: true,
        disableHeaderSelect: true,
        disableColumnResize: true,
        customLayout(args: CustomRenderFunctionArg) {
          const { row, col } = args;
          const data = store.tableInst.getRecordByRowCol(col, row);
          const tag = `${PresetPluginType.OPERATION_COLUMN}-${data[store.cfg.key]}-${args.row}-${
            args.col
          }`;
          let pluginInst = store.cellPluginManager.get(tag) as OperationColumnPlugin;
          if (!pluginInst) {
            pluginInst = new OperationColumnPlugin(
              store,
              colCfg as IVTableOperationColumn,
              data,
              row,
            );
            store.cellPluginManager.set(tag, pluginInst);
          }
          return {
            rootContainer: pluginInst.render(args),
            renderDefault: true,
          };
        },
      };
    }

    function getColumns(): ColumnDefine[] {
      const cols: ColumnDefine[] = [];
      if (store.cfg.checkMode === 'single') {
        // 单项列
        cols.push({
          field: 'check',
          title: '',
          width: 46,
          cellType: 'radio',
          disableHover: true,
          disableHeaderHover: true,
          disableHeaderSelect: true,
          disableColumnResize: true,
          headerStyle: {
            radioStyle: {
              checkedFill: _primaryColor,
              checkedStroke: _primaryColor,
            },
          },
          style: {
            radioStyle: {
              checkedFill: _primaryColor,
              checkedStroke: _primaryColor,
            },
          },
        } as RadioColumnDefine);
      } else if (store.cfg.checkMode === 'multiple') {
        // 复选列
        cols.push({
          field: 'check',
          title: '',
          width: 46,
          headerType: 'checkbox',
          cellType: 'checkbox',
          disableHover: true,
          disableHeaderHover: true,
          disableHeaderSelect: true,
          disableColumnResize: true,
          headerStyle: {
            checkboxStyle: {
              checkedFill: _primaryColor,
              checkedStroke: _primaryColor,
            },
          },
          style: {
            checkboxStyle: {
              checkedFill: _primaryColor,
              checkedStroke: _primaryColor,
            },
          },
        } as CheckboxColumnDefine);
      }
      if (store.cfg.isSerialNumber && !store.cfg.isDragSort) {
        // 序号列
        cols.push({
          field: '___order',
          title: t('sys.index'),
          width: 66,
          cellType: 'text',
          disableHover: true,
          disableHeaderHover: true,
          disableHeaderSelect: true,
          disableColumnResize: true,
          headerStyle: {
            fontSize: 16,
            lineHeight: 20,
            color: _textColor1,
          },
          customLayout(args: CustomRenderFunctionArg) {
            const { row } = args;
            const group = createGroup({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: args.rect?.height,
              width: args.rect?.width,
            });
            const text = createText({
              text: row,
              fontSize: 16,
              lineHeight: 20,
              fill: _textColor1,
            });
            group.addChild(text);
            return {
              rootContainer: group,
              renderDefault: false,
            };
          },
        });
      }
      // 添加中间字段列和操作列
      const allNormalCols = [...store.fixedCols, ...store.normalCols];
      allNormalCols.forEach((colCfg, index) => {
        // 最后一个普通列需要计算宽度占满剩余空间
        const isLastCol = index === allNormalCols.length - 1;
        cols.push(renderFieldColumn(colCfg, isLastCol));
      });

      // 添加右侧冻结列
      store.fixedRightCols.forEach((colCfg) => {
        if (colCfg.type === 'actions') {
          cols.push(renderOperationColumn(colCfg as IVTableOperationColumn));
          return;
        }
        cols.push(renderFieldColumn(colCfg));
      });

      return cols;
    }

    /**
     * 计算左侧冻结列数量
     */
    function calcFrozenColCount(): number {
      let count = store.fixedCols.length;
      if (store.cfg.checkMode === 'single' || store.cfg.checkMode === 'multiple') {
        count += 1;
      }
      if (store.cfg.isSerialNumber === true) {
        count += 1;
      }
      return count;
    }

    function rowSeriesNumberCfg(): IRowSeriesNumber | undefined {
      if (store.cfg.isSerialNumber && store.cfg.isDragSort) {
        const cfg: IRowSeriesNumber = {
          title: store.cfg.isSerialNumber ? t('sys.index') : '',
          width: store.cfg.isSerialNumber ? 'auto' : 32,
          disableColumnResize: true,
          dragOrder: store.cfg.isDragSort,
          headerStyle: {
            fontSize: 16,
            lineHeight: 20,
            color: store.cfg.isSerialNumber ? _textColor1 : '',
          },
          style: {
            fontSize: store.cfg.isSerialNumber ? 16 : 0,
            textAlign: 'center',
            color: store.cfg.isSerialNumber ? _textColor1 : '',
          },
        };
        return cfg;
      }
    }

    /**
     * 获取 VTable 配置项
     *
     * @return {*}  {ListTableConstructorOptions}
     */
    function getListTableOptions(): ListTableConstructorOptions {
      return {
        widthMode: 'standard',
        heightMode: 'standard',
        autoHeightInAdaptiveMode: false,
        defaultHeaderRowHeight: 48,
        defaultRowHeight: 48,
        customComputeRowHeight({ row, table }) {
          if (row >= 1) {
            const data = (table as ListTable).getRecordByRowCol(0, row) as IVTableDataItem;
            // 动态样式计算变更后的重置此值在 pretreatDefaultColumnData 方法中，这里做缓存避免重复计算
            if (data._MAX_ROW_HEIGHT) {
              return data._MAX_ROW_HEIGHT;
            }
            if (data._STYLE) {
              const keys = Object.keys(data._STYLE);
              let maxHeight = 48;
              keys.forEach((field) => {
                const contentFont =
                  data._STYLE?.[field]?.contentFont ||
                  store.cfg.columns?.find((col) => col.name === field)?._item?.style?.contentFont;
                if (contentFont && contentFont.fontSize) {
                  const _height = Number(contentFont.fontSize) * 3;
                  if (_height > maxHeight) {
                    maxHeight = _height;
                  }
                }
              });
              data._MAX_ROW_HEIGHT = maxHeight;
              return maxHeight;
            }
          }
          return 48;
        },
        overscrollBehavior: store.cfg.pageMode === 'none' ? 'auto' : 'none',
        // 左侧冻结列数量
        frozenColCount: calcFrozenColCount(),
        // 右侧冻结列数量
        rightFrozenColCount: store.fixedRightCols.length,
        select: {
          disableHeaderSelect: true,
          highlightMode: 'row',
          disableDragSelect: true,
          outsideClickDeselect: true,
        },
        columns: getColumns(),
        rowSeriesNumber: rowSeriesNumberCfg(),
        theme: getCustomTableTheme(containerRef.value!),
      };
    }

    /**
     * 计算内容是否已经撑满容器，内容没撑满时需要加载更多数据
     */
    function isContentFull(): boolean {
      const allRowHeight = store.tableInst.getRowsHeight(0, store.getRecords().length);
      const tableHeight = tableRef.value?.clientHeight || 0;
      return allRowHeight >= tableHeight;
    }

    async function loadMore(query?: Partial<IDataVTableQuery>): Promise<void> {
      await store.loadMore(query);
      if (!isContentFull() && store.isMore) {
        return new Promise<void>((resolve) => {
          setTimeout(async () => {
            await loadMore(query);
            resolve();
          }, 100);
        });
      } else {
        redraw();
      }
    }

    async function initVTable(): Promise<void> {
      // 监听滚动事件实现懒加载
      store.tableInst.on(ListTable.EVENT_TYPE.SCROLL, async (args) => {
        if (!store.isMore) {
          return;
        }
        if (store.isLoading || store.isLoadingMore) {
          args.event?.stopPropagation();
          return;
        }
        // 获取滚动信息
        const { scrollTop, viewHeight } = args;
        const allRowHeight = store.tableInst.getRowsHeight(0, store.getRecords().length);
        // 计算距离底部的距离
        const distanceToBottom = allRowHeight - scrollTop - viewHeight;
        // 底部加载触发阀值
        const threshold = store.cfg.threshold || 30;
        // 底部距离小于阀值时触发加载更多
        if (distanceToBottom < threshold) {
          await loadMore();
        }
      });

      store.tableInst.on(ListTable.EVENT_TYPE.CHECKBOX_STATE_CHANGE, (args) => {
        // 行列均为0时为全选操作
        if (args.row === 0 && args.field === 'check') {
          if (args.checked === false) {
            store.uncheckAll();
          } else {
            store.checkAll();
          }
        } else if (args.originData) {
          store.checkRow(args.originData, args.checked);
        }
        emit(TABLE_EVENTS.CHECK_CHANGE, store.getCheckedRows());
      });

      store.tableInst.on(ListTable.EVENT_TYPE.RADIO_STATE_CHANGE, (args) => {
        if (args.originData) {
          store.singleRowCheck(args.originData);
          emit(TABLE_EVENTS.SINGLE_CHECK_CHANGE, store.getCheckedRows()[0]);
        }
      });

      store.tableInst.on(ListTable.EVENT_TYPE.CLICK_CELL, (args) => {
        console.debug('click cell', args);
        if (args.field === 'operation') {
          return;
        }
        if (args.originData && args.field !== 'check') {
          suppressNextEvent();
          emit(TABLE_EVENTS.ROW_CLICK, args.originData);
        }
      });

      store.tableInst.on(ListTable.EVENT_TYPE.SELECTED_CELL, (args) => {
        console.debug('selected cell', args);
      });

      // 行拖拽排序结束后会触发
      store.tableInst.on(ListTable.EVENT_TYPE.CHANGE_HEADER_POSITION, (args) => {
        emit(TABLE_EVENTS.SORT_CHANGE, store.getRecords(), {
          from: args.source.row,
          to: args.target.row,
        });
      });
    }

    async function load(query?: Partial<IDataVTableQuery>): Promise<void> {
      await store.loadData(query);
      nextTick(() => {
        if (!isContentFull() && store.isMore) {
          loadMore(query);
        } else {
          redraw();
        }
      });
    }

    async function search(query?: Partial<IDataVTableQuery>): Promise<void> {
      if (typeof query === 'string') {
        query = {};
      }
      await store.search(query);
      nextTick(() => {
        if (!isContentFull() && store.isMore) {
          loadMore();
        } else {
          redraw();
        }
      });
      // search 时算整体重新加载，遂回到顶部
      store.tableInst.setScrollTop(0);
    }

    /**
     * 监听 config.columns 变化，重新生成列并更新表格
     */
    function updateTableColumns(): void {
      if (store.tableInst) {
        store.options.columns = getColumns();
        store.options.frozenColCount = calcFrozenColCount();
        store.options.rightFrozenColCount = store.fixedRightCols.length;
        store.tableInst.updateColumns(store.options.columns);
      }
    }

    /**
     * 关闭行编辑
     *
     * @param {boolean} success
     * @return {*}  {Promise<void>}
     */
    async function onCloseRowEdit(success: boolean): Promise<void> {
      if (!success) {
        // 取消编辑直接关闭
        store.setEditRow(-1);
        return;
      }
      // 关闭后需要对编辑后的行数据进行预处理，以防公式计算等列的值有问题
      await store.cfg.pipe?.data?.([store.rowEditData as IVTableDataItem]);
      // 重置编辑行插件样式
      store.cellPluginManager.getByRow(store.rowEditIndex).forEach((plugin) => {
        if (plugin.resetStyle) {
          plugin.resetStyle();
        }
      });
      // 关闭行编辑，表格需要重绘指定行
      store.tableInst.updateRecords([store.rowEditData], [store.rowEditIndex - 1]);
      store.setEditRow(-1);
    }
    store.evt.on('closeEdit', onCloseRowEdit);

    /**
     * 重新设置表格配置
     *
     */
    function resetConfig(): void {
      store.setConfig(props.config);
      updateTableColumns();
    }

    onMounted(async () => {
      store.$el = containerRef.value as any;
      store.options = getListTableOptions() as any;
      store.setTableInst(new ListTable(tableRef.value!, store.options as any));
      // 初始化表格配置
      await initVTable();
      // 环境初始化
      await store.init();
      // 默认加载数据
      if (store.cfg.autoLoad) {
        await load();
      } else {
        // 如果不自动加载数据，默认认为没有更多数据，等手动触发加载时，由触发位置改为 true
        store.isMore = false;
      }
    });

    onBeforeUnmount(() => {
      store.cellPluginManager.disposeAll();
      store.tableInst.release();
    });

    function onDataChange(...args: any[]): void {
      emit(TABLE_EVENTS.DATA_CHANGE, ...args);
    }

    expose({
      search,
      uncheckAll: store.uncheckAll,
      checkAll: store.checkAll,
      getCheckedRows: store.getCheckedRows,
      addItems: (...args) => {
        store.addItems(...args);
        redraw();
      },
      setItems: store.setItems,
      updateItems: store.updateItems,
      removeItems: store.removeItems,
      getItems: () => store.getRecords(),
      getSourceItems: store.getSourceItems,
      getRemovedItems: () => store.deletedItems,
      getRemovedSourceItems: store.getRemovedSourceItems,
      redraw,
      resetConfig,
    } as IGctVTableExpose);

    return () => {
      const isEmpty = store.dataCount === 0 && !store.isLoading;
      return (
        <div class={ns.b()} ref={containerRef} style={{ height: containerHeight.value }}>
          {store.isRowEdit ? (
            slots.rowEdit ? (
              slots.rowEdit()
            ) : (
              <GctVTableRowEdit onDataChange={onDataChange}>{slots}</GctVTableRowEdit>
            )
          ) : null}
          <div class={ns.e('table')} ref={tableRef} />
          {isEmpty ? (
            <div class={ns.e('table-empty')}>
              <span class={ns.e('table-empty-image')}>
                <img src={import.meta.env.BASE_URL + 'assets/empty.png'}></img>
              </span>
              <span class={ns.e('table-empty-text')}>{t('sys.noData')}</span>
            </div>
          ) : null}
          {store.isLoading ? (
            <div class={ns.e('table-loading')}>
              <i class="gct-iconfont icon-loading"></i>
              <span>{t('sys.loadingText')}</span>
            </div>
          ) : null}
        </div>
      );
    };
  },
});
