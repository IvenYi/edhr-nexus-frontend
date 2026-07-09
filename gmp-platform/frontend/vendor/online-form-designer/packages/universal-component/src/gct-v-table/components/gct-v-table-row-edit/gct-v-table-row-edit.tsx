import { computed, defineComponent, onBeforeUnmount, PropType, provide, ref } from 'vue';
import { t, useNamespace, useOverlayScrollbars } from '@gct/runtime';
import { cloneDeep } from 'lodash-es';
import { useResizeObserver } from '@vueuse/core';
import type { IVTableEditingRow, IVTableEditColumn } from '../../interface';
import { useGctVTableRowEditStore, useGctVTableStore } from '../../store';
import { GCT_V_TABLE_ROW_EDITING_ROW_KEY, TABLE_EVENTS } from '../../constants';
import { GctVTableRowEditItem } from '../gct-v-table-row-edit-item/gct-v-table-row-edit-item';
import './gct-v-table-row-edit.scss';

export const GctVTableRowEdit = defineComponent({
  name: 'GctVTableRowEdit',
  props: {
    // 表单保存前调用的校验方法
    validate: {
      type: Function as PropType<() => Promise<boolean>>,
    },
  },
  emits: [TABLE_EVENTS.DATA_CHANGE],
  setup(props, { slots, emit, expose }) {
    const ns = useNamespace('v-table-row-edit');

    const tableStore = useGctVTableStore();
    const store = useGctVTableRowEditStore();
    // 声明当前作用域下的表格行编辑行实例
    provide<IVTableEditingRow>(GCT_V_TABLE_ROW_EDITING_ROW_KEY, store.rowEditingItem!);

    // 行编辑保存时的加载状态
    const isLoading = ref(false);

    const contentWidth = computed(() => {
      return store.contentWidths.reduce((total, w) => total + w, 0);
    });

    const loadingIcon = `${import.meta.env.DEV ? '' : '.'}/assets/pad/table/pad-loading.svg`;

    const contentRef = ref<HTMLDivElement>();

    function onClose(e: MouseEvent): void {
      e.stopPropagation();
      tableStore.evt.emit('closeEdit', false);
    }

    async function onSave(e: MouseEvent): Promise<void> {
      e.stopPropagation();
      isLoading.value = true;
      if (props.validate) {
        const valid = await props.validate();
        if (!valid) {
          isLoading.value = false;
          return;
        }
      }
      const saveData = store.getChangedRowEditData();
      const updateKeys = Object.keys(saveData);
      if (updateKeys.length > 0) {
        saveData[tableStore.cfg.key] = store.rowEditingItem!.data[tableStore.cfg.key] || '';
        if (tableStore.cfg.save) {
          const success = await tableStore.cfg.save(cloneDeep(saveData));
          if (!success) {
            return;
          }
        }
        delete saveData[tableStore.cfg.key];
        updateKeys.forEach((key) => {
          store.rowEditData![key] = saveData[key];
        });
        if (store.rowEditData._DICT) {
          // 需要单独更新合并 _DICT 字段,保持引用不变
          Object.assign(store.rowEditData!._DICT!, store.rowEditingItem!.data._DICT);
        }
        const saveDataClone = cloneDeep(saveData);
        tableStore.evt.emit('editSaved', [saveDataClone]);
        emit(TABLE_EVENTS.DATA_CHANGE, store.rowEditData);
        isLoading.value = false;
      }
      tableStore.evt.emit('closeEdit', true);
    }

    const overlayScrollbars = useOverlayScrollbars(
      contentRef,
      {
        overflow: {
          y: 'hidden',
        },
      },
      {
        scroll: (_, e) => {
          tableStore.tableInst.setScrollLeft((e.target as HTMLElement).scrollLeft);
        },
      },
    );

    function containerScrollTo(left: number): void {
      const { viewport } = overlayScrollbars.value.elements();
      if (viewport) {
        viewport.scrollTo(left, 0);
      }
    }

    useResizeObserver(contentRef, () => {
      const scrollLeft = tableStore.tableInst.getScrollLeft();
      containerScrollTo(scrollLeft);
    });

    function errorScrollTo(col: number): void {
      // 计算列的起始和结束位置
      let colStart = 0;
      for (let i = 0; i < col; i++) {
        colStart += store.contentWidths[i];
      }
      const colEnd = colStart + store.contentWidths[col];

      // 获取视口信息
      const { viewport } = overlayScrollbars.value.elements();
      if (!viewport) return;

      const scrollLeft = viewport.scrollLeft;
      const viewportWidth = viewport.clientWidth;

      // 如果列已在可视范围内，不操作
      if (colStart >= scrollLeft && colEnd <= scrollLeft + viewportWidth) {
        return;
      }

      // 计算需要滚动的目标位置
      let targetScrollLeft = scrollLeft;
      if (colStart < scrollLeft) {
        targetScrollLeft = colStart;
      } else if (colEnd > scrollLeft + viewportWidth) {
        targetScrollLeft = colEnd - viewportWidth;
      }

      containerScrollTo(targetScrollLeft);
    }

    onBeforeUnmount(() => {
      // 清理行编辑状态管理
      store.$dispose();
    });

    expose({
      errorScrollTo(col: number) {
        errorScrollTo(col);
      },
    });

    /**
     * 绘制占位单元格
     *
     * @param {number} width
     * @return {*}
     */
    function renderPlaceholderItem(width: number) {
      return (
        <div
          class={[ns.e('item'), ns.em('item', 'transparent')]}
          style={{ width: `${width}px`, height: `${store.containerHeight}px` }}
        >
          <div
            class={[ns.e('item-placeholder-content')]}
            style={{ height: `${store.height}px` }}
          ></div>
          <div
            class={[ns.e('item-placeholder-error'), ns.is('hidden', !store.isError)]}
            style={{ height: `${store.errorHeight}px` }}
          ></div>
        </div>
      );
    }

    /**
     * 绘制行编辑单元格
     *
     * @param {IVTableEditColumn} col
     * @param {number} width
     * @return {*}
     */
    function renderRowEditItem(col: IVTableEditColumn, width: number) {
      // 只读状态下渲染占位单元格
      if (col.type !== 'edit') {
        return renderPlaceholderItem(width);
      }
      return (
        <div
          key={col.name}
          class={ns.e('item')}
          style={{ width: `${width}px`, height: `${store.containerHeight}px` }}
        >
          <GctVTableRowEditItem
            style={{ height: `${store.height}px` }}
            editingRow={store.rowEditingItem!}
            editingCol={store.rowEditingItem!.col[col.name]}
          >
            {slots}
          </GctVTableRowEditItem>
        </div>
      );
    }

    return () => {
      const content = (
        <div class={ns.e('form')} onClick={(e) => e.stopPropagation()}>
          {store.leftFixedWidths.length > 0 ? (
            <div class={ns.e('left-fixed')}>
              {store.leftFixedWidths.map((width) => {
                return renderPlaceholderItem(width);
              })}
            </div>
          ) : null}
          {store.contentWidths.length > 0 ? (
            <div
              ref={contentRef}
              class={ns.e('content')}
              style={{ height: store.containerHeight + 'px' }}
            >
              <div class={ns.e('content-inner')} style={{ width: contentWidth.value + 'px' }}>
                {store.contentWidths.map((width, index) => {
                  return renderRowEditItem(store.normalCols[index] as IVTableEditColumn, width);
                })}
              </div>
            </div>
          ) : null}
          {store.rightFixedWidths.length > 0 ? (
            <div class={ns.e('right-fixed')}>
              {store.rightFixedWidths.map((width) => {
                return renderPlaceholderItem(width);
              })}
            </div>
          ) : null}
        </div>
      );
      return (
        <div class={ns.b()}>
          <div class={ns.e('mask')}></div>
          <div
            class={ns.e('form-wrapper')}
            style={{ top: `${store.top}px`, height: `${store.containerHeight}px` }}
          >
            {slots.tableForm?.({ content })}
          </div>
          <div
            class={ns.e('actions')}
            onClick={(e) => e.stopPropagation()}
            style={{ top: `${store.top + store.containerHeight}px` }}
          >
            <div class={ns.e('action-btn')} onClick={onClose}>
              <span>{t('sys.cancel')}</span>
            </div>
            <div class={ns.e('action-line')}></div>
            <div
              class={[
                ns.e('action-btn'),
                ns.em('action-btn', 'confirm'),
                ns.is('loading', isLoading.value),
              ]}
              onClick={onSave}
            >
              {!isLoading.value ? (
                <span>{t('sys.okText')}</span>
              ) : (
                <span class={ns.e('loading-icon')}>
                  <pad-svg-icon src={loadingIcon} />
                </span>
              )}
            </div>
          </div>
        </div>
      );
    };
  },
});
