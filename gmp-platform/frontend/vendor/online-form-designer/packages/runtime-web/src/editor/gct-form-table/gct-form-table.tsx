import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ITableEditor, useGctFormValue } from '@gct/runtime';

export const GctFormTable = defineComponent({
  name: 'GctFormTable',
  props: {
    model: {
      type: Object as PropType<ITableEditor>,
      required: true,
    },
    value: {
      type: Array<IObject>,
      default: () => [],
    },
  },
  setup(props) {
    const ns = useNamespace('form-table');

    const val = useGctFormValue();

    return () => {
      return (
        <div class={ns.b()}>
          <gct-table
            data={val.value}
            model={props.model.tableModel}
            count={val.value.length.toString()}
            {...(props.model.props || {})}
          />
        </div>
      );
    };
  },
});
