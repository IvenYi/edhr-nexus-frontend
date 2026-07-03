/* eslint-disable vue/no-setup-props-destructure */
import { defineComponent, mergeProps, PropType } from 'vue';
import { useNamespace, IFormCollapsePane, IFormCollapsePaneController } from '@gct/runtime';
import './gct-form-collapse-pane.scss';

/**
 * 表单折叠面板项
 */
export const GctFormCollapsePane = defineComponent({
  name: 'GctFormCollapsePane',
  props: {
    c: {
      type: Object as PropType<IFormCollapsePaneController>,
      required: true,
    },
    model: {
      type: Object as PropType<IFormCollapsePane>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('form-collapse-pane');

    const style: IParams = {};

    function renderContainer(items: any[]) {
      if (props.model.layout === 'flex') {
        return <flex-container layout={props.model.flex}>{items}</flex-container>;
      }
      if (props.model.layout === 'grid') {
        return <grid-container layout={props.model.grid}>{items}</grid-container>;
      }
      console.error('不支持的layout类型' + props.model.layout);
    }

    if (props.model.width) {
      style[ns.cssVarName('form-collapse-pane-width')] = props.model.width;
    }
    if (props.model.height) {
      style[ns.cssVarName('form-collapse-pane-height')] = props.model.height;
    }

    return { ns, style, renderContainer };
  },
  render() {
    if (this.c.state.keepalive !== true && this.c.state.visible === false) {
      return null;
    }
    const items: any[] = this.$slots.default?.() || [];
    const lastVNode = items[items.length - 1];
    if (lastVNode) {
      lastVNode.props = mergeProps(lastVNode.props || {}, {
        class: this.ns.e('last-child'),
      });
    }

    return (
      <div
        class={[this.ns.b(), this.ns.is('hidden', this.c.state.visible === false)]}
        style={this.style}
      >
        {this.renderContainer(items)}
      </div>
    );
  },
});

export default GctFormCollapsePane;
