import { computed, defineComponent, PropType } from 'vue';
import { StyleSpacingController } from './style-spacing.controller';
import { useNamespace, useGctFormValue, IFormItem } from '@gct/runtime';
import { IStyleSpacing } from '../../interface';
import './style-spacing.scss';

/**
 * 边距编辑器
 */
export const StyleSpacing = defineComponent({
  name: 'StyleSpacing',
  inheritAttrs: false,
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<IStyleSpacing>,
      required: true,
    },
    value: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('style-spacing');

    const c = new StyleSpacingController(props.model);

    const val = useGctFormValue();

    const padding = computed({
      get() {
        return val.value?.[1];
      },
      set(v) {
        const newVal = val.value ? [...val.value] : [];
        newVal[1] = v;
        val.value = newVal;
      },
    });
    const margin = computed({
      get() {
        return val.value?.[0];
      },
      set(v) {
        const newVal = val.value ? [...val.value] : [];
        newVal[0] = v;
        val.value = newVal;
      },
    });

    return { ns, c, val, margin, padding };
  },
  render() {
    return (
      <spacing-editor
        v-model:padding={this.padding}
        v-model:margin={this.margin}
        {...(this.model.props || {})}
        showArea={this.model.showArea}
        class={[this.ns.b(), this.ns.is('readonly', this.model.readonly)]}
      />
    );
  },
});

export default StyleSpacing;
