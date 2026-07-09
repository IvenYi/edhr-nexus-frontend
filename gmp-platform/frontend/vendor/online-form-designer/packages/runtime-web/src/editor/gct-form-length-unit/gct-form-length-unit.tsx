import { defineComponent, PropType } from 'vue';
import {
  LengthUnitEditorController,
  useNamespace,
  useGctFormValue,
  ILengthUnitEditor,
  IFormItem,
} from '@gct/runtime';
import './gct-form-length-unit.scss';

/**
 * 带单位长度字符串编辑器
 */
export const GctFormLengthUnit = defineComponent({
  name: 'GctFormLengthUnit',
  inheritAttrs: false,
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<ILengthUnitEditor>,
      required: true,
    },
    value: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('form-length-unit');

    const c = new LengthUnitEditorController(props.model);

    const val = useGctFormValue();

    return { ns, c, val };
  },
  render() {
    return (
      <length-unit-editor
        v-model:value={this.val}
        {...(this.model.props || {})}
        class={[this.ns.b(), this.ns.is('readonly', this.model.readonly)]}
      />
    );
  },
});

export default GctFormLengthUnit;
