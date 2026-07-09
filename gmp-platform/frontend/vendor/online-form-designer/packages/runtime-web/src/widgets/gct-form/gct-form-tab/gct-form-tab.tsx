/* eslint-disable vue/no-setup-props-destructure */
import { defineComponent, onMounted, PropType, watch } from 'vue';
import { useNamespace, IFormTab, IFormTabController, useFormControllerInst } from '@gct/runtime';
import './gct-form-tab.scss';

/**
 * 表单分页
 */
export const GctFormTab = defineComponent({
  name: 'GctFormTab',
  props: {
    c: {
      type: Object as PropType<IFormTabController>,
      required: true,
    },
    model: {
      type: Object as PropType<IFormTab>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('form-tab');

    const form = useFormControllerInst();

    const style: IParams = {};

    if (props.model.width) {
      style[ns.cssVarName('form-tab-width')] = props.model.width;
    }
    if (props.model.height) {
      style[ns.cssVarName('form-tab-height')] = props.model.height;
    }

    watch(props.c.state, () => {
      form.evt.emit('changeState', props.c.model.name, props.c);
    });

    onMounted(() => {
      const name = props.model.children?.[0]?.name || '';
      console.log('tabs = onMounted', name);
      // eslint-disable-next-line vue/no-mutating-props
      props.c.state.activePane = name;
    });

    return { ns, style };
  },
  render() {
    if (this.c.state.keepalive !== true && this.c.state.visible === false) {
      return null;
    }
    const items: any[] = this.$slots.default?.() || [];
    return (
      <a-tabs
        class={[
          this.ns.b(),
          this.ns.is('hidden', this.c.state.visible === false),
          this.ns.m(this.model.navPosition || 'left'),
        ]}
        style={this.style}
        v-model:activeKey={this.c.state.activePane}
      >
        {this.model.children?.map((item, index) => {
          return (
            <a-tab-pane key={item.name} tab={item.title}>
              {items[index]}
            </a-tab-pane>
          );
        })}
      </a-tabs>
    );
  },
});

export default GctFormTab;
