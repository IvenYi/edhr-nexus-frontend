import { defineComponent, PropType } from 'vue';
import { useNamespace, useGctFormValue, ITextareaEditor } from '@gct/runtime';

export const GctFormTextarea = defineComponent({
  name: 'GctFormTextarea',
  props: {
    model: {
      type: Object as PropType<ITextareaEditor>,
      required: true,
    },
    value: {
      type: String,
      default: null,
    },
  },
  emits: ['update:value'],
  setup() {
    const ns = useNamespace('gct-form-textarea');

    const val = useGctFormValue();

    const handleBlur = (): void => {
      if (typeof val.value === 'string') {
        val.value = val.value.trim();
      }
    };

    return { ns, val, handleBlur };
  },
  render() {
    return (
      <a-textarea
        v-model:value={this.val}
        class={this.ns.b()}
        auto-size={this.model.autoSize}
        show-count={this.model.max != null}
        maxlength={this.model.max}
        placeholder={this.model.placeholder}
        onBlur={this.handleBlur}
        {...(this.model.props || {})}
      />
    );
  },
});
