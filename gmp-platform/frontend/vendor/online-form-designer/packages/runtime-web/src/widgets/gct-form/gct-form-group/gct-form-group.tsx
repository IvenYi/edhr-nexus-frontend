/* eslint-disable vue/no-setup-props-destructure */
import { defineComponent, PropType, ref } from 'vue';
import { useNamespace, IFormGroup, IFormGroupController } from '@gct/runtime';
import './gct-form-group.scss';

/**
 * 表单分组
 */
export const GctFormGroup = defineComponent({
  name: 'GctFormGroup',
  props: {
    c: {
      type: Object as PropType<IFormGroupController>,
      required: true,
    },
    model: {
      type: Object as PropType<IFormGroup>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('gct-form-group');

    const keys = ref([0]);

    function renderContainer(items: any[]) {
      if (props.model.layout === 'flex') {
        return <flex-container layout={props.model.flex}>{items}</flex-container>;
      }
      if (props.model.layout === 'grid') {
        return <grid-container layout={props.model.grid}>{items}</grid-container>;
      }
      console.error('不支持的layout类型' + props.model.layout);
    }

    const style: IParams = {};

    if (props.model.width) {
      style[ns.cssVarName('form-group-width')] = props.model.width;
    }
    if (props.model.height) {
      style[ns.cssVarName('form-group-height')] = props.model.height;
    }

    return { ns, keys, style, renderContainer };
  },
  render() {
    if (this.c.state.keepalive !== true && this.c.state.visible === false) {
      return null;
    }
    const items: any[] = this.$slots.default?.() || [];
    if (this.model.isCollapse) {
      return (
        <a-collapse
          v-model:activeKey={this.keys}
          class={[
            this.ns.b(),
            this.ns.is('hidden-header', this.model.showHeader === false),
            this.ns.is('hidden', this.c.state.visible === false),
          ]}
          style={this.style}
          ghost
        >
          <a-collapse-panel key="0" header={this.model.title}>
            {this.renderContainer(items)}
          </a-collapse-panel>
        </a-collapse>
      );
    }
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('hidden-header', this.model.showHeader === false),
          this.ns.is('hidden', this.c.state.visible === false),
          this.model.class,
        ]}
        style={this.style}
      >
        {this.model.showHeader === false ? (
          <div class={this.ns.e('title')}>{this.model.title}</div>
        ) : null}
        <div class={this.ns.e('content')}>{this.renderContainer(items)}</div>
      </div>
    );
  },
});

export default GctFormGroup;
