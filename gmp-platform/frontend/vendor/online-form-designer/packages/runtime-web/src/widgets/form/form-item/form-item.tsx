import { defineComponent, PropType } from 'vue';
import { useNamespace, IFormItem } from '@gct/runtime';
import './form-item.scss';

export const AppFormItem = defineComponent({
  name: 'AppFormItem',
  props: {
    model: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('app-form-item');

    return { ns };
  },
  render() {
    return (
      <a-form-item label={this.model.label} class={this.ns.b()}>
        {this.$slots.default?.()}
      </a-form-item>
    );
  },
});
