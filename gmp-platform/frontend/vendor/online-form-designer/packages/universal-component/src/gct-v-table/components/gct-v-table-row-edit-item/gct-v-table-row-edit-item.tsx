import { defineComponent, PropType, provide } from 'vue';
import { useNamespace } from '@gct-paas/core';
import type {
  IVTableEditingItemRenderProps,
  IVTableEditingCol,
  IVTableEditingRow,
} from '../../interface';
import {
  GCT_V_TABLE_ROW_EDIT_RENDER_PREFIX,
  GCT_V_TABLE_ROW_EDITING_COL_KEY,
} from '../../constants';
import './gct-v-table-row-edit-item.scss';

export const GctVTableRowEditItem = defineComponent({
  name: 'GctVTableRowEditItem',
  props: {
    editingRow: {
      type: Object as PropType<IVTableEditingRow>,
      required: true,
    },
    editingCol: {
      type: Object as PropType<IVTableEditingCol>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const ns = useNamespace('v-table-row-edit-item');
    // 声明当前作用域下的表格行编辑列实例
    provide<IVTableEditingCol>(GCT_V_TABLE_ROW_EDITING_COL_KEY, props.editingCol);

    return () => {
      let content: any;
      const type = props.editingCol.col.editor?.type;
      if (type) {
        const slotRender = slots[`${GCT_V_TABLE_ROW_EDIT_RENDER_PREFIX}${type}`];
        if (slotRender) {
          content = slotRender({
            col: props.editingCol.col,
            record: props.editingRow.data,
          } as IVTableEditingItemRenderProps);
        } else {
          content = <span>未实现的行编辑编辑器类型 - {type}</span>;
        }
      } else if (slots.editorItem) {
        content = slots.editorItem({
          col: props.editingCol.col,
          record: props.editingRow.data,
        } as IVTableEditingItemRenderProps);
      } else {
        content = <span>未配置行编辑编辑器类型</span>;
      }
      return (
        <div
          class={[
            ns.b(),
            ns.is('readonly', props.editingCol.readonly),
            ns.is('disabled', props.editingCol.disabled),
          ]}
        >
          {content}
        </div>
      );
    };
  },
});
