import { defineComponent } from 'vue';
import { LowCodeWidget, useNamespace } from '@gct/runtime';
import { IRenderContentItemOptions } from '/@/projects/page-designer/src/designer/interface';
import VantButton from '../../__components__/vantButton.vue';
import './bottom-button-design2.scss';

export const BottomButtonDesign2 = defineComponent({
  name: 'BottomButtonDesign2',
  props: {
    parentWidget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
      required: true,
    },
    widget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    children: {
      type: Array as PropType<LowCodeWidget.BasicSchema[]>,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('bottom-button-design2');
    return { ns };
  },
  render() {
    return this.$slots.default?.({
      parentWidget: this.parentWidget,
      widget: this.widget,
      index: this.index,
      children: this.children,
      config: { mode: 'move', isDrop: false, isDrag: false },
      props: {
        class: this.ns.b(),
      },
      itemContent: () => {
        return (
          <VantButton
            {...{ ...this.widget.props, ...this.$attrs }}
            widget={this.widget}
            class="van-button"
          ></VantButton>
        );
      },
    } as IRenderContentItemOptions<LowCodeWidget.BasicSchema>);
  },
});
