/* eslint-disable vue/no-setup-props-destructure */
import { computed, defineComponent, PropType, ref } from 'vue';
import { useNamespace, IFormCollapse, IFormCollapseController } from '@gct/runtime';
import { Collapse } from 'ant-design-vue';
import './gct-form-collapse.scss';

/**
 * 表单折叠面板
 */
export const GctFormCollapse = defineComponent({
  name: 'GctFormCollapse',
  props: {
    c: {
      type: Object as PropType<IFormCollapseController>,
      required: true,
    },
    model: {
      type: Object as PropType<IFormCollapse>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('form-collapse');

    const keys = ref([0]);

    const style: IParams = {};

    if (props.model.width) {
      style[ns.cssVarName('form-collapse-width')] = props.model.width;
    }
    if (props.model.height) {
      style[ns.cssVarName('form-collapse-height')] = props.model.height;
    }

    const activeKeys = ref<string[]>([]);
    activeKeys.value = props.model.children?.map((item) => item.name) || [];

    const expandIconPosition = computed(() => {
      return props.model.expandIconPosition === 'left' ? 'left' : 'right';
    });

    return { ns, keys, style, activeKeys, expandIconPosition };
  },
  render() {
    if (this.c.state.keepalive !== true && this.c.state.visible === false) {
      return null;
    }
    const items: any[] = this.$slots.default?.() || [];
    return (
      <Collapse
        class={[
          this.ns.b(),
          this.ns.is('hidden', this.c.state.visible === false),
          this.ns.m('icon-' + (this.model.expandIconStyle || 'up-down')),
        ]}
        style={this.style}
        accordion={this.model.accordion}
        expandIconPosition={this.expandIconPosition}
        v-model:activeKey={this.activeKeys}
      >
        {this.model.children?.map((item, index) => {
          const _item = items[index];
          if (_item.props.c.state.visible === false) {
            return;
          }
          const collapsible = item.collapsible !== false ? undefined : 'disabled';
          return (
            <Collapse.Panel key={item.name} header={item.title} collapsible={collapsible}>
              {items[index]}
            </Collapse.Panel>
          );
        })}
      </Collapse>
    );
  },
});

export default GctFormCollapse;
