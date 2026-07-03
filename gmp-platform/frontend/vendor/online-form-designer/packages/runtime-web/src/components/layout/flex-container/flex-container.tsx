import { defineComponent, PropType } from 'vue';
import { FlexItem } from '../flex-item/flex-item';
import { useNamespace, IFlexContainer, IFlexItem, IFormGroup } from '@gct/runtime';
import './flex-container.scss';

/**
 * flex 布局容器
 */
export const FlexContainer = defineComponent({
  name: 'FlexContainer',
  props: {
    layout: Object as PropType<IFlexContainer>,
  },
  setup(props) {
    const ns = useNamespace('flex-container');

    const getStyle = () => {
      const style: IData = {};
      if (props.layout) {
        const { alignContent, alignItems, flexDirection, flexWrap, justifyContent } = props.layout;
        if (alignContent != null) {
          style.alignContent = alignContent;
        }
        if (alignItems != null) {
          style.alignItems = alignItems;
        }
        if (flexDirection != null) {
          style.flexDirection = flexDirection;
        }
        if (flexWrap != null) {
          style.flexWrap = flexWrap;
        }
        if (justifyContent != null) {
          style.justifyContent = justifyContent;
        }
      }
      return style;
    };

    const getItemStyle = (model: IFormGroup) => {
      const style: IData = {};
      if (model) {
        const { width, height } = model;
        if (width != null) {
          style.width = width;
        }
        if (height != null) {
          style.height = height;
        }
      }
      return style;
    };

    return { ns, getStyle, getItemStyle };
  },
  render() {
    let items: any[] = this.$slots.default?.() || [];
    if (items.length > 0) {
      items = items[0].children || [];
    }
    return (
      <div class={this.ns.b()} style={this.getStyle()}>
        {items.map((item) => {
          if (!item) {
            return null;
          }
          const model = item.props!.model.flexItem as IFlexItem;
          return (
            <FlexItem layout={model} style={this.getItemStyle(item.props!.model)}>
              {item}
            </FlexItem>
          );
        })}
      </div>
    );
  },
});

export default FlexContainer;
