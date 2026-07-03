import { defineComponent, PropType } from 'vue';
import {
  ColorEditorController,
  useNamespace,
  useGctFormValue,
  IColorEditor,
  IFormItem,
} from '@gct/runtime';
import './gct-form-color.scss';

/**
 * 颜色选择编辑器
 */
export const GctFormColor = defineComponent({
  name: 'GctFormColor',
  inheritAttrs: false,
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<IColorEditor>,
      required: true,
    },
    value: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('form-color');

    const c = new ColorEditorController(props.model);

    const val = useGctFormValue();

    return { ns, c, val };
  },
  render() {
    return (
      <color-editor
        v-model:value={this.val}
        {...(this.model.props || {})}
        class={[this.ns.b(), this.ns.is('readonly', this.model.readonly)]}
      />
    );
  },
});

export default GctFormColor;
