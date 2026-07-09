import { defineComponent, PropType } from 'vue';
import { StylePositionController } from './style-position.controller';
import { useNamespace, useGctFormValue, IFormItem } from '@gct/runtime';
import { IPosition } from '@gct/base';
import { IStylePosition } from '../../interface';
import './style-position.scss';

/**
 * 定位编辑器
 */
export const StylePosition = defineComponent({
  name: 'StylePosition',
  inheritAttrs: false,
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<IStylePosition>,
      required: true,
    },
    value: {
      type: Object as PropType<IPosition>,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('style-position');

    const c = new StylePositionController(props.model);

    const val = useGctFormValue();

    return { ns, c, val };
  },
  render() {
    return (
      <position-editor
        v-model:value={this.val}
        {...(this.model.props || {})}
        class={[this.ns.b(), this.ns.is('readonly', this.model.readonly)]}
      />
    );
  },
});

export default StylePosition;
