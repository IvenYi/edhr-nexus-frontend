import { computed, reactive, Ref, ref } from 'vue';
import { ListTable, ListTableConstructorOptions } from '@visactor/vtable';
import { cloneDeep, isNumber, merge } from 'lodash-es';
import { IGctVTableBaseStore } from '../interface/store';
import {
  IDataVTable,
  IDataVTablePagination,
  IDataVTableQuery,
  IGctVTableEvent,
  IVTableDataItem,
} from '../interface';
import { VTableCellPluginInstCache } from '../utils';
import mitt from 'mitt';

export function createGctVTableBaseStore(): IGctVTableBaseStore {
  const evt = mitt<IGctVTableEvent>();

  const $el = ref<HTMLDivElement | null>(null);

  // VTable 配置项
  const options = ref<ListTableConstructorOptions>({});

  const cellPluginManager = new VTableCellPluginInstCache();

  const cfg: IDataVTable = reactive({
    key: '',
    columns: [],
    checkMode: 'none',
    autoLoad: true,
    pageMode: 'scroll',
    pageSize: 20,
    threshold: 30,
    isEmptyText: true,
    pipe: {},
    async load() {
      throw new Error('表格加载方法未实现');
    },
  });

  const fixedCols = computed(() => {
    return cfg.columns.filter((col) => {
      const hidden =
        typeof col.hidden === 'function' ? col.hidden(col._item as any) : col.hidden === true;
      return col.fixed === 'left' && !hidden;
    });
  });

  const fixedRightCols = computed(() => {
    return cfg.columns.filter((col) => {
      // 当时操作列时，且表格为只读模式，则不渲染该列
      if (col.type === 'actions' && cfg.readonly === true) {
        return false;
      }
      const hidden =
        typeof col.hidden === 'function' ? col.hidden(col._item as any) : col.hidden === true;
      return col.fixed === 'right' && !hidden;
    });
  });

  const normalCols = computed(() => {
    return cfg.columns.filter((col) => {
      const hidden =
        typeof col.hidden === 'function' ? col.hidden(col._item as any) : col.hidden === true;
      return !col.fixed && !hidden;
    });
  });

  function setConfig(config: IDataVTable): void {
    merge(cfg, config);
    cfg.columns = config.columns || [];
    if (!cfg.key) {
      throw new Error('表格配置项必须指定 key 属性作为行数据主键标识');
    }
  }

  // VTable 表格实例
  let _tableInst: ListTable;
  function setTableInst(table: ListTable): void {
    _tableInst = table;
  }
  const tableInst = computed<ListTable>(() => {
    return _tableInst;
  });

  function redraw(): void {
    tableInst.value.renderWithRecreateCells();
  }

  function _updateRecordCounts(): void {
    dataCount.value = (_tableInst?.records || []).length;
  }

  function getRecords(): IVTableDataItem[] {
    _updateRecordCounts();
    return (_tableInst?.records || []) as IVTableDataItem[];
  }

  const deletedItems = ref<IVTableDataItem[]>([]);
  const checkedItems = ref<IVTableDataItem[]>([]);
  const dataCount = ref<number>(0);

  // 是否已经选中了全部数据
  const _isCheckAll = ref<boolean>(false);

  const isLoading = ref<boolean>(false);
  // 正在加载更多数据
  const isLoadingMore = ref<boolean>(false);
  function startLoading(): void {
    isLoading.value = true;
  }
  function endLoading(): void {
    isLoading.value = false;
  }
  function startLoadMore(): void {
    isLoadingMore.value = true;
  }
  function endLoadMore(): void {
    isLoadingMore.value = false;
  }

  const pagination = ref<IDataVTablePagination>({
    pageNo: 1,
    pageSize: 10,
    total: 0,
  });
  // 是否还可以加载更多数据
  const isMore = ref<boolean>(true);

  async function init(): Promise<void> {
    if (cfg.init) {
      await cfg.init();
    }
  }

  async function loadMore(query?: Partial<IDataVTableQuery>): Promise<void> {
    if (isLoading.value || isLoadingMore.value || !isMore.value) {
      return;
    }
    // 每次加载分页加1
    pagination.value.pageNo += 1;
    return loadData(query);
  }

  /**
   * 重置表格状态，主要用于表格重新加载，或者搜索时
   */
  function _resetTableState(): void {
    // 重置分页信息
    pagination.value.pageNo = 1;
    pagination.value.total = 0;
    // 重置是否加载更多数据
    isMore.value = true;
    _updateRecordCounts();
  }

  /**
   * 对已经加载回来的数据进行处理
   * 1. 补充序号字段
   */
  function _transformItems(data: IVTableDataItem[]): IVTableDataItem[] {
    return cloneDeep(data);
  }

  async function loadData(query?: Partial<IDataVTableQuery>): Promise<void> {
    startLoading();
    if (pagination.value.pageNo > 1) {
      startLoadMore();
    }
    const opts: IDataVTableQuery = {
      pageNo: pagination.value.pageNo,
      pageSize: pagination.value.pageSize,
      ...query,
    };
    try {
      if (cfg.load) {
        const res = await cfg.load(opts);
        if (res) {
          const _items = _transformItems(res.items);
          if (isLoadingMore.value) {
            tableInst.value.addRecords(_items);
          } else {
            cellPluginManager.disposeAll();
            // 重新设置表格数据后，清空之前的删除数据记录
            deletedItems.value = [];
            tableInst.value.setRecords(_items);
          }
          if (isNumber(res.total)) {
            pagination.value.total = res.total;
          }
          if (_isCheckAll.value) {
            checkAll();
          }
          if (!_items || _items.length == 0 || getRecords().length >= pagination.value.total) {
            isMore.value = false;
          }
        } else {
          // 没有数据返回时，表示没有更多数据了
          isMore.value = false;
        }
      }
    } catch (error) {
      isMore.value = false;
      throw error;
    } finally {
      endLoading();
      if (pagination.value.pageNo > 1) {
        endLoadMore();
      }
      _updateRecordCounts();
    }
  }

  async function search(query?: Partial<IDataVTableQuery>): Promise<void> {
    _resetTableState();
    deletedItems.value = [];
    cellPluginManager.disposeAll();
    await loadData(query);
  }

  function setItems(data: IVTableDataItem[]): void {
    _resetTableState();
    const _items = _transformItems(data);
    // 销毁现有数据的插件绘制实例
    cellPluginManager.disposeAll();
    deletedItems.value = [];
    // 自己通过setDataSource设置表格数据不触发listByPage
    isMore.value = false;
    // 重新设置表格数据
    tableInst.value.setRecords(_items);
  }

  function updateItems(rows: IVTableDataItem[]): void {
    const _rows = _transformItems(rows);
    const _updateRows: IVTableDataItem[] = [];
    const _updateKeys: number[] = [];
    _rows.forEach((_row) => {
      const itemIndex = getRecords().findIndex((it) => it[cfg.key] === _row[cfg.key]);
      if (itemIndex !== -1) {
        _updateRows.push(_row);
        _updateKeys.push(itemIndex);
      } else {
        console.warn(
          `更新表格数据时，未找到对应的行数据，跳过更新，行主键：${_row[cfg.key]}，行数据：`,
          _row,
        );
      }
    });
    tableInst.value.updateRecords(_updateRows, _updateKeys);
    redraw();
  }

  function removeItems(rows: IVTableDataItem[]): void {
    const indexes: number[] = [];
    getRecords().forEach((item, i) => {
      const itemIndex = rows.findIndex((it) => it[cfg.key] === item[cfg.key]);
      if (itemIndex !== -1) {
        indexes.push(i);
        item.deleted_ = true;
        deletedItems.value.push(cloneDeep(item));
      }
    });
    tableInst.value.deleteRecords(indexes);
    _updateRecordCounts();
    evt.emit('removed', rows);
  }

  function getRemovedSourceItems(): IObject[] {
    const sourceItems: IObject[] = [];
    const allCols = cfg.columns.filter((item) => {
      return item.type === 'default' || item.type === 'edit';
    });
    deletedItems.value.forEach((item) => {
      const sourceItem: IObject = {};
      allCols.forEach((col) => {
        // 当列配置了 skipWhenHidden 且列是隐藏状态时，跳过该列
        if (col.skipWhenHidden) {
          const hidden =
            typeof col.hidden === 'function' ? col.hidden(col._item as any) : col.hidden === true;
          if (hidden) {
            return;
          }
        }
        const field = col.name;
        if (item[field] != null) {
          sourceItem[field] = item[field];
        }
      });
      // 一定要返回主键 id 字段
      sourceItem[cfg.key] = item[cfg.key];
      // id_ 为后端通用，方便后端识别，不需要的可以外部再删除
      sourceItem.id_ = item.id_;
      // 标记为删除状态
      sourceItem.delete_ = true;
      sourceItems.push(sourceItem);
    });
    return sourceItems;
  }

  function addItems(data: IVTableDataItem[]): void {
    const _items = _transformItems(data);
    // getRecords() = getRecords().concat(_items);
    tableInst.value.addRecords(_items);
    _updateRecordCounts();
  }

  function getSourceItems(): IObject[] {
    const sourceItems: IObject[] = [];
    const allCols = cfg.columns.filter((item) => {
      return item.type === 'default' || item.type === 'edit';
    });
    getRecords().forEach((item) => {
      const sourceItem: IObject = {};
      allCols.forEach((col) => {
        // 当列配置了 skipWhenHidden 且列是隐藏状态时，跳过该列数据提交
        if (col.skipWhenHidden) {
          const hidden =
            typeof col.hidden === 'function' ? col.hidden(col._item as any) : col.hidden === true;
          if (hidden) {
            return;
          }
        }
        const field = col.name;
        if (item[field] != null) {
          sourceItem[field] = item[field];
        }
      });
      // 一定要返回主键 id 字段
      sourceItem[cfg.key] = item[cfg.key];
      // id_ 为后端通用，方便后端识别，不需要的可以外部再删除
      sourceItem.id_ = item.id_;
      sourceItems.push(sourceItem);
    });
    return sourceItems;
  }

  function checkRow(item: IVTableDataItem, checked?: boolean): void {
    const _itemIndex = getRecords().findIndex((it) => it[cfg.key] === item[cfg.key]);
    const _item = getRecords()[_itemIndex];
    if (_item) {
      if (!_item.check) {
        _item.check = { checked: false };
      }
      if (checked != null) {
        _item.check.checked = checked;
      } else {
        _item.check.checked = !_item.check.checked;
      }
      tableInst.value.setCellCheckboxState(0, _itemIndex + 1, _item.check.checked);
    }
  }

  function singleRowCheck(item: IVTableDataItem, checked?: boolean): void {
    const checks = getCheckedRows();
    checks.forEach((it) => {
      if (it.check) {
        it.check.checked = false;
      }
    });
    // 如果已经指定为不选中，则不进行选中操作，因为上面已经清空选中状态了
    if (checked !== false) {
      checkRow(item, checked);
    }
  }

  function checkAll(): void {
    getRecords().forEach((item, index) => {
      item.check = item.check || { checked: false };
      if (item.check.checked !== true) {
        item.check.checked = true;
        tableInst.value.setCellCheckboxState(0, index + 1, true);
      }
    });
    _isCheckAll.value = true;
  }

  function uncheckAll(): void {
    getRecords().forEach((item, index) => {
      if (item.check) {
        if (item.check.checked !== false) {
          item.check.checked = false;
          tableInst.value.setCellCheckboxState(0, index + 1, false);
        }
      }
    });
    _isCheckAll.value = false;
  }

  function getCheckedRows(): IVTableDataItem[] {
    return getRecords().filter((item) => {
      return item.check?.checked === true;
    });
  }

  return {
    evt,
    $el: $el as Ref<HTMLDivElement | null>,
    options: options as Ref<ListTableConstructorOptions>,
    cfg,
    cellPluginManager,
    fixedCols,
    fixedRightCols,
    normalCols,
    setConfig,
    tableInst,
    setTableInst,
    redraw,
    init,
    getRecords,
    deletedItems,
    checkedItems,
    dataCount,
    isLoading,
    startLoading,
    endLoading,
    isMore,
    isLoadingMore,
    startLoadMore,
    endLoadMore,
    pagination,
    loadMore,
    loadData,
    search,
    setItems,
    addItems,
    updateItems,
    removeItems,
    getSourceItems,
    getRemovedSourceItems,
    checkRow,
    singleRowCheck,
    checkAll,
    uncheckAll,
    getCheckedRows,
  };
}
