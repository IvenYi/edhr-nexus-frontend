import { defineComponent, PropType } from 'vue';
import { useNamespace, useGctFormValue, ITableEditItemController, ITextEditor } from '@gct/runtime';
import './gct-table-date.scss';

/**
 * 文本编辑器
 */
export const GctTableDate = defineComponent({
  name: 'GctTableDate',
  props: {
    c: {
      type: Object as PropType<ITableEditItemController>,
      required: true,
    },
    model: {
      type: Object as PropType<ITextEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value'],
  setup() {
    const ns = useNamespace('table-date');

    const val = useGctFormValue();

    return { ns, val };
  },
  render() {
    if (this.isEdit === false) {
      return <div class={[this.ns.b(), this.ns.e('info')]}>{this.c.value}</div>;
    }
    return (
      <a-date-picker
        picker="date"
        v-model:value={this.val}
        {...(this.model.props || {})}
        class={[this.ns.b(), this.ns.is('error', this.c.state.error)]}
        placeholder={this.model.placeholder}
      />
    );
  },
});
