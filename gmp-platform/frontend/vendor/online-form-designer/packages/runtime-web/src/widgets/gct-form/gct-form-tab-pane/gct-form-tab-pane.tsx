/* eslint-disable vue/no-setup-props-destructure */
import { defineComponent, PropType } from 'vue';
import { useNamespace, IFormTabPane, IFormTabPaneController } from '@gct/runtime';
import './gct-form-tab-pane.scss';

/**
 * 表单分页pane
 */
export const GctFormTabPane = defineComponent({
  name: 'GctFormTabPane',
  props: {
    c: {
      type: Object as PropType<IFormTabPaneController>,
      required: true,
    },
    model: {
      type: Object as PropType<IFormTabPane>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('form-tab-pane');

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
      style[ns.cssVarName('form-tab-pane-width')] = props.model.width;
    }
    if (props.model.height) {
      style[ns.cssVarName('form-tab-pane-height')] = props.model.height;
    }

    return { ns, style, renderContainer };
  },
  render() {
    if (this.c.state.keepalive !== true && this.c.state.visible === false) {
      return null;
    }
    const items: any[] = this.$slots.default?.() || [];
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

export default GctFormTabPane;
