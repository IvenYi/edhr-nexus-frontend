import { defineComponent, PropType } from 'vue';
import { StyleFontController } from './style-font.controller';
import { IFont } from '@gct/base';
import { useNamespace, useGctFormValue, IFormItem } from '@gct/runtime';
import { IStyleFont } from '../../interface';
import './style-font.scss';

/**
 * 文本样式编辑器
 */
export const StyleFont = defineComponent({
  name: 'StyleFont',
  inheritAttrs: false,
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<IStyleFont>,
      required: true,
    },
    value: {
      type: Object as PropType<IFont>,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('style-font');

    const c = new StyleFontController(props.model);

    const val = useGctFormValue();

    return { ns, c, val };
  },
  render() {
    return (
      <font-editor
        v-model:value={this.val}
        {...(this.model.props || {})}
        class={[this.ns.b(), this.ns.is('readonly', this.model.readonly)]}
      />
    );
  },
});

export default StyleFont;
