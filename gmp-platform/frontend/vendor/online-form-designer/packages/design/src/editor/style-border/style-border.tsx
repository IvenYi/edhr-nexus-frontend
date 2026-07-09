import { defineComponent, PropType } from 'vue';
import { StyleBorderController } from './style-border.controller';
import { useNamespace, useGctFormValue, IFormItem } from '@gct/runtime';
import { IBorder } from '@gct/base';
import { IStyleBorder } from '../../interface';
import './style-border.scss';

/**
 * 边框编辑器
 */
export const StyleBorder = defineComponent({
  name: 'StyleBorder',
  inheritAttrs: false,
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<IStyleBorder>,
      required: true,
    },
    value: {
      type: Object as PropType<IBorder>,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('style-border');

    const c = new StyleBorderController(props.model);

    const val = useGctFormValue();

    return { ns, c, val };
  },
  render() {
    return (
      <border-editor
        v-model:value={this.val}
        {...(this.model.props || {})}
        showArea={this.model.showArea}
        class={[this.ns.b(), this.ns.is('readonly', this.model.readonly)]}
      />
    );
  },
});

export default StyleBorder;
