import { defineComponent, h, inject, provide } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { GCT_FIELD_CONFIG, useTableEditingCol, useTableEditingRow } from '@gct/universal-component/gct-v-table';
import './gct-v-table-vant-row-edit-item.scss';

export const GctVTableVantRowEditItem = defineComponent({
  name: 'GctVTableVantRowEditItem',
  setup() {
    const ns = useNamespace('v-table-vant-row-edit-item');

    const editingRow = useTableEditingRow();
    const editingCol = useTableEditingCol();

    const getRenderComponentByType = inject<Function>('getRenderComponentByType');

    // 列字段配置
    const fieldCfg = editingCol.col._cfg;
    if (fieldCfg) {
      provide<IObject>(GCT_FIELD_CONFIG, fieldCfg);
    }

    return () => {
      const { type } = editingCol.widget;
      const { fieldType, bindCompStyleType } = editingCol.widget.props;
      const comp = getRenderComponentByType?.(type, fieldType, false);

      return (
        <div
          class={[
            ns.b(),
            ns.e(fieldType),
            ns.is('readonly', editingCol.readonly),
            ns.is('disabled', editingCol.disabled),
            bindCompStyleType ? ns.em(fieldType, bindCompStyleType.toLowerCase()) : '',
          ]}
        >
          {comp
            ? h(comp, {
                class: ns.is('v-table', true),
                widget: editingCol.widget,
                formData: editingRow.data,
                modelValue: editingCol.value,
                'onUpdate:modelValue': (v: any) => {
                  editingCol.value = v;
                },
              })
            : null}
        </div>
      );
    };
  },
});
