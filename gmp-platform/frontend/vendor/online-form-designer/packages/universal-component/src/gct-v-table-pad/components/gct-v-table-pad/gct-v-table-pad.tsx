import { defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { GctVTable, TABLE_EVENTS } from '@gct/universal-component/gct-v-table';
import type { IGctVTableExpose, IGctVTableProps } from '@gct/universal-component/gct-v-table';
import { GctVTableVantRowEdit } from '../gct-v-table-vant-row-edit/gct-v-table-vant-row-edit';
import './gct-v-table-pad.scss';

export const GctVTablePad = defineComponent({
  name: 'GctVTablePad',
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
  setup(props, { slots, emit, expose }) {
    const ns = useNamespace('v-table-pad');

    const vTableRef = ref<IGctVTableExpose>();

    expose({
      search(...args) {
        return vTableRef.value?.search(...args);
      },
      uncheckAll() {
        return vTableRef.value?.uncheckAll();
      },
      checkAll() {
        return vTableRef.value?.checkAll();
      },
      getCheckedRows() {
        return vTableRef.value?.getCheckedRows();
      },
      addItems(...args) {
        return vTableRef.value?.addItems(...args);
      },
      setItems(...args) {
        return vTableRef.value?.setItems(...args);
      },
      updateItems(...args) {
        return vTableRef.value?.updateItems(...args);
      },
      removeItems(...args) {
        return vTableRef.value?.removeItems(...args);
      },
      getItems() {
        return vTableRef.value?.getItems();
      },
      getSourceItems() {
        return vTableRef.value?.getSourceItems();
      },
      getRemovedItems() {
        return vTableRef.value?.getRemovedItems();
      },
      getRemovedSourceItems() {
        return vTableRef.value?.getRemovedSourceItems();
      },
      redraw() {
        return vTableRef.value?.redraw();
      },
      resetConfig() {
        return vTableRef.value?.resetConfig();
      },
    } as IGctVTableExpose);

    return () => {
      return (
        <GctVTable
          ref={vTableRef}
          class={ns.b()}
          config={props.config}
          maxHeight={props.maxHeight}
          onCheckChange={(...args) => emit(TABLE_EVENTS.CHECK_CHANGE, ...args)}
          onSingleCheckChange={(...args) => emit(TABLE_EVENTS.SINGLE_CHECK_CHANGE, ...args)}
          onRowClick={(...args) => emit(TABLE_EVENTS.ROW_CLICK, ...args)}
          onDataChange={(...args) => emit(TABLE_EVENTS.DATA_CHANGE, ...args)}
          onSortChange={(...args) => emit(TABLE_EVENTS.SORT_CHANGE, ...args)}
        >
          {{
            rowEdit() {
              return (
                <GctVTableVantRowEdit
                  onDataChange={(...args) => emit(TABLE_EVENTS.DATA_CHANGE, ...args)}
                >
                  {slots}
                </GctVTableVantRowEdit>
              );
            },
          }}
        </GctVTable>
      );
    };
  },
});
