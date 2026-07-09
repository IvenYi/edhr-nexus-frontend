import { computed, defineComponent, PropType, toRefs } from 'vue';
import { LowCodeWidget, useNamespace } from '@gct/runtime';
import { Search } from '/@/projects/page-designer/src/types/web';
import {
  IRenderContainerOptions,
  IVue3DndItemOptions,
} from '../../../../../designer/interface/i-vue3-dnd-item-options/i-vue3-dnd-item-options';
import './search-design2.scss';

export const SearchDesign2 = defineComponent({
  name: 'SearchDesign2',
  props: {
    widget: {
      type: Object as PropType<Search>,
      required: true,
    },
    expand: {
      type: Boolean,
      default: false,
    },
    btnWidth: {
      type: Number,
      default: 100,
    },
    dataPlaceholder: {
      type: String,
    },
  },
  setup(props) {
    const ns = useNamespace('search-design2');

    const { maxLength, rowLength } = toRefs(props.widget.props);

    const config = computed<IVue3DndItemOptions<LowCodeWidget.BasicSchema>>(() => {
      return {
        mode: 'move',
        type: 'search-design',
        direction: rowLength.value === 1 ? 'horizontal' : 'vertical',
      };
    });

    return { ns, maxLength, config };
  },
  render() {
    const widgets = this.$slots.widgets?.({
      parentWidget: this.widget,
      children: this.widget.children,
      renderChildren: this.widget.children?.filter((_, i) => {
        if (this.expand === true) {
          return true;
        }
        return i < this.maxLength;
      }),
      config: this.config,
      itemContent: ({ element, index }) => {
        return this.$slots.content?.({
          element,
          index,
        });
      },
    } as IRenderContainerOptions<LowCodeWidget.BasicSchema>);
    return this.$slots.container?.({
      props: {
        class: [this.ns.b(), 'widget-drag', this.ns.is('btn-full', this.btnWidth === 100)],
        dragPlaceholder: this.dataPlaceholder,
      },
      parentWidget: this.widget,
      config: this.config,
      children: this.widget.children,
      content: widgets?.concat(this.$slots.searchBtn?.() as any),
    });
  },
});
