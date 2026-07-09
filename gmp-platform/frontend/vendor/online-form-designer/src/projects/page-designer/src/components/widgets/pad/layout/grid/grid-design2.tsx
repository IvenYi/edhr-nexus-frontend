import { defineComponent } from 'vue';
import { LowCodeWidget, useNamespace } from '@gct/runtime';
import { widgetProps } from '/@/projects/page-designer/src/hooks/useWidget';
import { IRenderContainerOptions } from '/@/projects/page-designer/src/designer/interface';
import './grid-design2.scss';

export const GridDesign2 = defineComponent({
  name: 'GridDesign2',
  props: widgetProps,
  setup() {
    const ns = useNamespace('grid-design2');
    return { ns };
  },
  render() {
    const container = this.$slots.container?.({
      parentWidget: this.widget,
      children: this.widget.children,
      config: {
        isDrag: false,
        isDrop: false,
      },
      content: (
        <a-row
          gutter={[this.widget.props.gutter || 0, 0]}
          class={[this.ns.b()]}
          style={{
            height: this.widget.style.height ? `${this.widget.style.height}px` : 'auto',
            overflow: 'auto',
          }}
        >
          {this.widget.children?.map((item, i) => {
            return (
              <a-col
                class={[item?.children?.length ? null : this.ns.e('col')]}
                span={item.props.span}
              >
                {this.$slots.item?.({
                  parentWidget: this.widget,
                  children: this.widget.children,
                  widget: item,
                  index: i,
                  config: { isDrag: false, isDelete: false, direction: 'horizontal' },
                })}
              </a-col>
            );
          })}
        </a-row>
      ),
    } as IRenderContainerOptions<LowCodeWidget.BasicSchema>);

    return container;
  },
});
