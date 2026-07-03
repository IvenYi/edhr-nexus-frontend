<template>
  <div ref="wrapRef" :class="getWrapperClass">
    <BasicForm
      ref="formRef"
      submitOnReset
      v-bind="getFormProps"
      v-if="getBindValues.useSearchForm"
      :tableAction="tableAction"
      @register="registerForm"
      @submit="handleSearchInfoChange"
      @advanced-change="redoHeight"
    >
      <template #[replaceFormSlotKey(item)]="data" v-for="item in getFormSlotKeys">
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
    </BasicForm>

    <slot name="beforeTable"></slot>

    <a-table
      ref="tableElRef"
      v-bind="getBindValues"
      v-model:expandedRowKeys="expandKeysList"
      :rowClassName="getRowClassName"
      v-show="getEmptyDataIsShowTable"
      @change="handleTableChange"
      :class="emptyFull ? 'empty-basic-table-wrapper' : ''"
    >
      <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
        <template v-if="showDragIcon(Object.keys($slots), item, data)">
          <span class="gct-handle" :class="data.record?.undragable ? 'unsortable' : ''"
            ><holder-outlined v-if="!data.record?.undragable" class="handle-icon"
          /></span>
          <span v-if="data?.column?.dataIndex && data?.record?.[data.column.dataIndex]">
            {{ data.record[data.column.dataIndex] }}
          </span>
          <slot v-else :name="item" v-bind="data || {}"></slot>
        </template>
        <slot v-else :name="item" v-bind="data || {}"></slot>
      </template>
      <template #headerCell="{ column }">
        <template v-if="rowDraggable && column?.dataIndex === getBindValues.columns[0].dataIndex">
          <span v-if="isTreeTable" class="pr26px"></span>
          <span v-else class="pr8px"></span>
          <HeaderCell :column="column" />
        </template>
        <HeaderCell v-else :column="column" />
      </template>
      <!-- 增加对antdv3.x兼容 -->
      <template #bodyCell="data">
        <slot name="bodyCell" v-bind="data || {}"></slot>
      </template>
      <!--      <template #[`header-${column.dataIndex}`] v-for="(column, index) in columns" :key="index">-->
      <!--        <HeaderCell :column="column" />-->
      <!--      </template>-->
    </a-table>
  </div>
</template>
<script lang="ts">
  import type {
    BasicTableProps,
    TableActionType,
    SizeType,
    ColumnChangeParam,
  } from './types/table';

  import { defineComponent, ref, computed, unref, toRaw, inject, watchEffect } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { PageWrapperFixedHeightKey } from '/@/components/Page';
  import HeaderCell from './components/HeaderCell.vue';
  import { InnerHandlers } from './types/table';

  import { usePagination } from './hooks/usePagination';
  import { useColumns } from './hooks/useColumns';
  import { useDataSource } from './hooks/useDataSource';
  import { useLoading } from './hooks/useLoading';
  import { useRowSelection } from './hooks/useRowSelection';
  import { useTableScroll } from './hooks/useTableScroll';
  import { useTableScrollTo } from './hooks/useScrollTo';
  import { useCustomRow } from './hooks/useCustomRow';
  import { useTableStyle } from './hooks/useTableStyle';
  import { useTableHeader } from './hooks/useTableHeader';
  import { useTableExpand } from './hooks/useTableExpand';
  import { createTableContext } from './hooks/useTableContext';
  import { useTableFooter } from './hooks/useTableFooter';
  import { useTableForm } from './hooks/useTableForm';
  import { useDesign } from '/@/hooks/web/useDesign';

  import { cloneDeep, last, merge, omit, pick } from 'lodash-es';
  import { basicProps } from './props';
  import { isFunction, isNullAndUnDef } from '/@/utils/is';
  import { warn } from '/@/utils/log';

  import Sortable from 'sortablejs';

  export default defineComponent({
    name: 'BasicTable',
    components: {
      BasicForm,
      HeaderCell,
    },
    props: basicProps,
    emits: [
      'fetch-success',
      'fetch-error',
      'selection-change',
      'register',
      'row-click',
      'row-dbClick',
      'row-contextmenu',
      'row-mouseenter',
      'row-mouseleave',
      'edit-end',
      'edit-cancel',
      'edit-row-end',
      'edit-change',
      'expanded-rows-change',
      'change',
      'columns-change',
      'row-drag-end', // 拖拽后的回调
    ],
    setup(props, { attrs, emit, slots, expose }) {
      const tableElRef = ref(null);
      const tableData = ref([]);
      const expandKeysList = ref([]);

      const wrapRef = ref(null);
      const formRef = ref(null);
      const innerPropsRef = ref<Partial<BasicTableProps>>();
      const tableDataIds = ref<string[]>([]);

      const { prefixCls } = useDesign('basic-table');
      const [registerForm, formActions] = useForm();

      const getProps = computed(() => {
        return { ...props, ...unref(innerPropsRef) } as BasicTableProps;
      });
      const flatTableData = computed(() => {
        const flatten = (array: Recordable[] = []) => {
          return ([] as Recordable[]).concat(
            ...array.map((item) => {
              return ([] as Recordable[]).concat({ ...item }, flatten(item.children || []));
            }),
          );
        };

        return flatten(props.dataSource);
      });

      const showDragIcon = (slots, item, data) => {
        // 目前已知expandIcon和bodyCell两个插槽
        // expandIcon存在时，拖拽图标塞到这个插槽中；否则，塞到bodyCell的第一个元素中
        return (
          props.rowDraggable &&
          ((slots.includes('expandIcon') && item === 'expandIcon') ||
            (!slots.includes('expandIcon') &&
              item === 'bodyCell' &&
              data.column?.dataIndex === getBindValues.value.columns[0].dataIndex))
        );
      };

      const isFixedHeightPage = inject(PageWrapperFixedHeightKey, false);
      watchEffect(() => {
        unref(isFixedHeightPage) &&
          props.canResize &&
          warn(
            "'canResize' of BasicTable may not work in PageWrapper with 'fixedHeight' (especially in hot updates)",
          );
      });

      const { getLoading, setLoading } = useLoading(getProps);
      const {
        getPaginationInfo,
        getPagination,
        setPagination,
        setShowPagination,
        getShowPagination,
      } = usePagination(getProps);

      const {
        getRowSelection,
        getRowSelectionRef,
        getSelectRows,
        setSelectedRows,
        clearSelectedRowKeys,
        getSelectRowKeys,
        deleteSelectRowByKey,
        setSelectedRowKeys,
      } = useRowSelection(getProps, tableData, emit);

      const {
        handleTableChange: onTableChange,
        getDataSourceRef,
        getDataSource,
        getRawDataSource,
        setTableData,
        updateTableDataRecord,
        deleteTableDataRecord,
        insertTableDataRecord,
        findTableDataRecord,
        fetch,
        getRowKey,
        reload,
        getAutoCreateKey,
        updateTableData,
      } = useDataSource(
        getProps,
        {
          tableData,
          getPaginationInfo,
          setLoading,
          setPagination,
          getFieldsValue: formActions.getFieldsValue,
          clearSelectedRowKeys,
        },
        emit,
      );

      function handleTableChange(...args) {
        onTableChange.call(undefined, ...args);
        emit('change', ...args);
        // 解决通过useTable注册onChange时不起作用的问题
        const { onChange } = unref(getProps);
        onChange && isFunction(onChange) && onChange.call(undefined, ...args);
      }

      const {
        getViewColumns,
        getColumns,
        setCacheColumnsByField,
        setCacheColumns,
        setColumns,
        getColumnsRef,
        getCacheColumns,
      } = useColumns(getProps, getPaginationInfo);

      const { getScrollRef, redoHeight } = useTableScroll(
        getProps,
        tableElRef,
        getColumnsRef,
        getRowSelectionRef,
        getDataSourceRef,
        wrapRef,
        formRef,
      );

      const { scrollTo } = useTableScrollTo(tableElRef, getDataSourceRef);

      const { customRow } = useCustomRow(getProps, {
        setSelectedRowKeys,
        getSelectRowKeys,
        clearSelectedRowKeys,
        getAutoCreateKey,
        emit,
      });

      const { getRowClassName } = useTableStyle(getProps, prefixCls);

      const { getExpandOption, expandAll, expandRows, collapseAll } = useTableExpand(
        getProps,
        tableData,
        emit,
      );

      const handlers: InnerHandlers = {
        onColumnsChange: (data: ColumnChangeParam[]) => {
          emit('columns-change', data);
          // support useTable
          unref(getProps).onColumnsChange?.(data);
        },
      };

      const { getHeaderProps } = useTableHeader(getProps, slots, handlers);

      const { getFooterProps } = useTableFooter(
        getProps,
        getScrollRef,
        tableElRef,
        getDataSourceRef,
      );

      const { getFormProps, replaceFormSlotKey, getFormSlotKeys, handleSearchInfoChange } =
        useTableForm(getProps, slots, fetch, getLoading);

      const getBindValues = computed(() => {
        const dataSource = unref(getDataSourceRef);
        let propsData: any = {
          ...attrs,
          customRow,
          ...unref(getProps),
          ...unref(getHeaderProps),
          scroll: unref(getScrollRef),
          loading: unref(getLoading),
          tableLayout: 'fixed',
          rowSelection: unref(getRowSelectionRef),
          rowKey: unref(getRowKey),
          columns: toRaw(unref(getViewColumns)),
          pagination: toRaw(unref(getPaginationInfo)),
          dataSource,
          footer: unref(getFooterProps),
          ...unref(getExpandOption),
        };
        // if (slots.expandedRowRender) {
        //   propsData = omit(propsData, 'scroll');
        // }

        propsData = omit(propsData, ['class', 'onChange']);
        return propsData;
      });

      const getWrapperClass = computed(() => {
        const values = unref(getBindValues);
        return [
          prefixCls,
          attrs.class,
          {
            [`${prefixCls}-form-container`]: values.useSearchForm,
            [`${prefixCls}--inset`]: values.inset,
          },
        ];
      });

      const getEmptyDataIsShowTable = computed(() => {
        const { emptyDataIsShowTable, useSearchForm } = unref(getProps);
        if (emptyDataIsShowTable || !useSearchForm) {
          return true;
        }
        return !!unref(getDataSourceRef).length;
      });

      function setProps(props: Partial<BasicTableProps>) {
        innerPropsRef.value = { ...unref(innerPropsRef), ...props };
      }

      const tableAction: TableActionType = {
        reload,
        getSelectRows,
        setSelectedRows,
        clearSelectedRowKeys,
        getSelectRowKeys,
        deleteSelectRowByKey,
        setPagination,
        setTableData,
        updateTableDataRecord,
        deleteTableDataRecord,
        insertTableDataRecord,
        findTableDataRecord,
        redoHeight,
        setSelectedRowKeys,
        setColumns,
        setLoading,
        getDataSource,
        getRawDataSource,
        setProps,
        getRowSelection,
        getPaginationRef: getPagination,
        getColumns,
        getCacheColumns,
        emit,
        updateTableData,
        setShowPagination,
        getShowPagination,
        setCacheColumnsByField,
        expandAll,
        expandRows,
        collapseAll,
        scrollTo,
        getSize: () => {
          return unref(getBindValues).size as SizeType;
        },
        setCacheColumns,
      };
      createTableContext({ ...tableAction, wrapRef, getBindValues });

      expose(tableAction);

      emit('register', tableAction, formActions);

      // 获取拖拽行在树中的索引
      const getTargeIndex = (list, id, arr = []) => {
        return list.reduce((total, item, index) => {
          if (item.id.toString() === id) {
            return [...total, index];
          } else {
            if (item.children && item.children.length) {
              let childArr = getTargeIndex(item.children, id, [...arr, index]);
              if (childArr.length === [...arr, index].length) {
                childArr = total;
              }
              return childArr;
            } else {
              return total;
            }
          }
        }, arr);
      };

      const judgeBelong = (key, list = []) => {
        return list.find((item) => {
          if (item.id.toString() === key) {
            return true;
          } else {
            if (item.children && item.children.length) {
              return judgeBelong(key, item.children);
            } else {
              return false;
            }
          }
        });
      };

      return {
        formRef,
        tableElRef,
        getBindValues,
        getLoading,
        registerForm,
        handleSearchInfoChange,
        getEmptyDataIsShowTable,
        handleTableChange,
        getRowClassName,
        wrapRef,
        tableAction,
        redoHeight,
        getFormProps: getFormProps as any,
        replaceFormSlotKey,
        getFormSlotKeys,
        getWrapperClass,
        columns: getViewColumns,
        tableDataIds,
        flatTableData,
        showDragIcon,
        expandKeysList,
        getTargeIndex,
        judgeBelong,
      };
    },

    mounted() {
      this.expandKeysList = this.getBindValues.expandedRowKeys;
      if (this.rowDraggable) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _this = this;

        // TODO: 将树形排序

        setTimeout(() => {
          const rows = this.$el.querySelector('tbody.ant-table-tbody');
          let expandKeysList;
          let targetRowKey;
          let relatedRowKey;
          let dragIndexArr = [];
          let isInsertAfter = false;
          let parentMenu;
          let sortableEl = null;
          sortableEl = new Sortable(rows, {
            group: 'basic-table-rows',
            animation: 150,
            handle: '.gct-handle',
            dataIdAttr: 'data-row-key',
            filter: '.unsortable', // 指定不可拖动项的选择器
            onStart({ item }) {
              targetRowKey = item?.dataset?.rowKey;
              if (_this.isTreeTable) {
                dragIndexArr = [];
                expandKeysList = cloneDeep(_this.expandKeysList);
                if (targetRowKey) {
                  dragIndexArr = _this.getTargeIndex(
                    _this.getBindValues.dataSource,
                    targetRowKey.toString(),
                  );
                  if (dragIndexArr.length > 1) {
                    parentMenu =
                      dragIndexArr.length === 2
                        ? _this.getBindValues.dataSource[dragIndexArr[0]]
                        : _this.getBindValues.dataSource[dragIndexArr[0]].children[dragIndexArr[1]];
                    _this.expandKeysList = _this.expandKeysList.filter((item) => {
                      return !parentMenu.children.map((n) => n.id).includes(item);
                    });
                  } else {
                    parentMenu = undefined;
                    _this.expandKeysList = [];
                  }
                }
              }
            },
            onMove: (evt) => {
              const { related, willInsertAfter } = evt;
              console.log('related-----evt', evt);
              if (_this.isTreeTable) {
                let canMove;
                let relatedIndexArr = [];
                if (!related?.dataset?.rowKey) {
                  return false;
                }
                relatedIndexArr = _this.getTargeIndex(
                  _this.getBindValues.dataSource,
                  related?.dataset?.rowKey?.toString(),
                );
                if (relatedIndexArr.length !== dragIndexArr.length) {
                  canMove = false;
                } else {
                  canMove = relatedIndexArr
                    .slice(0, -1)
                    .every((item, index) => item === dragIndexArr[index]);
                }
                if (canMove) {
                  relatedRowKey = related.dataset.rowKey;
                  isInsertAfter = willInsertAfter;
                }
                return canMove;
              } else {
                if (related?.children?.[0]?.outerHTML?.indexOf('unsortable') > -1) {
                  return false;
                }
                if (related?.dataset?.rowKey) {
                  relatedRowKey = related.dataset.rowKey;
                  isInsertAfter = willInsertAfter;
                }
                return true;
              }
            },
            onEnd: async () => {
              let relatedItem;
              let targetItem;
              if (_this.isTreeTable) {
                _this.expandKeysList = expandKeysList;
                if (parentMenu) {
                  parentMenu.children.forEach((item) => {
                    if (item.id === relatedRowKey) {
                      relatedItem = item;
                    }
                    if (item.id === targetRowKey) {
                      targetItem = item;
                    }
                  });
                } else {
                  _this.getBindValues.dataSource.forEach((item) => {
                    if (item.id === relatedRowKey) {
                      relatedItem = item;
                    }
                    if (item.id === targetRowKey) {
                      targetItem = item;
                    }
                  });
                }
              } else {
                _this.getBindValues.dataSource.forEach((item) => {
                  const id = item.id ?? item.key;
                  if (id === relatedRowKey) {
                    relatedItem = item;
                  }
                  if (id === targetRowKey) {
                    targetItem = item;
                  }
                });
              }
              if (!relatedItem) return;
              const ids = _this.getBindValues.dataSource.map((item) => item.id);
              const tempList = sortableEl?.toArray()?.filter((i) => ids.includes(i));
              const reqParams = _this.isTreeTable
                ? {
                    id: targetItem.id,
                    parentId: parentMenu?.id || 'ROOT',
                    sortNum: isInsertAfter ? relatedItem.sortNum : relatedItem.sortNum + 1,
                  }
                : {
                    id: targetItem.id,
                    targetSortNum: isInsertAfter ? relatedItem.sortNum : relatedItem.sortNum + 1,
                    sortList: tempList,
                  };

              if (_this.rowDragApi && typeof _this.rowDragApi === 'function') {
                await _this.rowDragApi(reqParams);
              }
              let dragEndList = [];
              sortableEl?.toArray()?.forEach((item) => {
                const dataItem = _this.getBindValues.dataSource?.find((n) => n.key === item);
                if (dataItem) {
                  dragEndList.push(dataItem);
                }
              });

              this.$emit('row-drag-end', {
                dragEndList,
                expandKeysList: _this.expandKeysList,
                dragItemKey: targetRowKey,
                showMessage: true,
              });
            },
          });
        }, 0);
      }
    },
  });
</script>
<style lang="less">
  @border-color: #cecece4d;

  @prefix-cls: ~'@{namespace}-basic-table';

  [data-theme='dark'] {
    .ant-table-tbody > tr:hover.ant-table-row-selected > td,
    .ant-table-tbody > tr.ant-table-row-selected td {
      background-color: #262626;
    }
  }

  .@{prefix-cls} {
    max-width: 100%;
    height: 100%;

    .ant-table-tbody,
    .ant-table-thead {
      > tr {
        > td,
        > th {
          border-right: 1px solid transparent !important;
        }
      }
    }

    &-row__striped {
      td {
        background-color: @app-content-background;
      }
    }

    &-form-container {
      padding: 16px;

      .ant-form {
        width: 100%;
        margin-bottom: 16px;
        padding: 12px 10px 6px;
        border-radius: 2px;
        background-color: @component-background;
      }
    }

    .ant-table-cell {
      .ant-tag {
        margin-right: 0;
      }
    }

    .ant-table-wrapper {
      padding: 6px;
      border-radius: 2px;
      background-color: @component-background;

      .ant-table-title {
        // min-height: 40px;
        padding: 0 0 8px !important;
      }

      .ant-table.ant-table-bordered .ant-table-title {
        border: none !important;
      }
    }

    .empty-basic-table-wrapper.ant-table-wrapper:has(
        div.ant-spin-nested-loading > div.ant-spin-container > div.ant-table-empty
      ) {
      .ant-spin-nested-loading
        > div.ant-spin-container
        > div.ant-table-empty
        > div.ant-table-container
        > div.ant-table-body {
        max-height: none !important;

        tbody.ant-table-tbody .ant-table-cell .ant-empty-normal {
          margin: 252px 0;
        }
      }
    }

    .ant-table {
      width: 100%;
      overflow-x: hidden;

      &-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 6px;
        border-bottom: none;
      }

      //.ant-table-tbody > tr.ant-table-row-selected td {
      //background-color: fade(@primary-color, 8%) !important;
      //}
    }

    .ant-pagination {
      margin: 10px 0 0 !important;
    }

    .ant-table-footer {
      padding: 0;

      .ant-table-wrapper {
        padding: 0;
      }

      table {
        border: none !important;
      }

      .ant-table-body {
        overflow-x: hidden !important;
        //  overflow-y: scroll !important;
      }

      td {
        padding: 12px 8px;
      }
    }

    &--inset {
      .ant-table-wrapper {
        padding: 0;
      }
    }
  }

  .ant-table-thead {
    th {
      background-color: #f5f5f5;
    }
  }

  .ant-table-tbody > tr:hover:not(.ant-table-expanded-row) > td:has(.gct-handle) {
    padding-left: 24px;

    .gct-handle {
      position: absolute;
      left: 6px;

      .handle-icon {
        visibility: visible;
      }
    }
  }

  .ant-table .ant-table-tbody > tr > td:has(.gct-handle) {
    padding-left: 24px !important;

    .gct-handle {
      position: absolute;
      left: 6px;
      cursor: pointer;

      .handle-icon {
        visibility: hidden;
      }

      &:hover {
        .handle-icon {
          color: var(--ant-primary-color);
        }
      }
    }
  }

  .vben-basic-table {
    .ant-table-container {
      .ant-table-cell-fix-right-first {
        &::before {
          content: '';
          position: absolute;
          z-index: 2;
          top: 0;
          right: 0;
          bottom: 0;
          width: 0;
          margin-right: -2px;
          outline: 2px solid #fff;
        }
      }
    }
  }
</style>
