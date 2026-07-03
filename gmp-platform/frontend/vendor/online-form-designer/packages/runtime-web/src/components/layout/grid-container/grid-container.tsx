import { defineComponent, PropType } from 'vue';
import { useNamespace, IGridContainer, IGridItem } from '@gct/runtime';
import './grid-container.scss';

/**
 * 栅格布局
 */
export const GridContainer = defineComponent({
  name: 'GridContainer',
  props: {
    layout: Object as PropType<IGridContainer>,
  },
  setup() {
    const ns = useNamespace('grid-container');
    return { ns };
  },
  render() {
    const l = this.layout || ({} as IGridContainer);
    let items: any[] = this.$slots.default?.() || [];
    if (items.length > 0) {
      items = items[0].children || [];
    }
    return (
      <a-row class={this.ns.b()} wrap={true} gutter={l.gutter}>
        {items.map((item) => {
          if (!item) {
            return null;
          }
          const model = item.props!.model.gridItem as IGridItem;
          return (
            <a-col span={model ? (model.span ?? 24) : 24} offset={model ? (model.offset ?? 0) : 0}>
              {item}
            </a-col>
          );
        })}
      </a-row>
    );
  },
});

export default GridContainer;
