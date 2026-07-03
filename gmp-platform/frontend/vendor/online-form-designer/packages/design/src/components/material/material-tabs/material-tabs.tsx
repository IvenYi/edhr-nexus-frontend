import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import './material-tabs.scss';

export const MaterialTabs = defineComponent({
  name: 'MaterialTabs',
  props: {
    tabs: {
      type: Array<{ id: string; label: string; icon: string }>,
      required: true,
    },
    active: {
      type: String,
      required: true,
    },
  },
  emits: ['update:active', 'change'],
  setup(_props, { emit }) {
    const ns = useNamespace('material-tabs');

    const onChange = (e: MouseEvent, tag: string) => {
      e.stopPropagation();
      emit('update:active', tag);
      emit('change', tag);
    };

    return { ns, onChange };
  },
  render() {
    const slots = this.$slots.default ? this.$slots.default() : [];
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('left')}>
          {this.tabs.map((tab) => (
            <div
              class={[this.ns.e('item'), this.ns.is('active', tab.id === this.active)]}
              onClick={(e) => this.onChange(e, tab.id)}
            >
              <div class={this.ns.e('item-icon')}>
                <i class={`iconfont ${tab.icon}`}></i>
              </div>
              <div class={this.ns.e('item-label')}>{tab.label}</div>
            </div>
          ))}
        </div>
        <div class={this.ns.b('right')}>
          {slots.map((slot) => {
            const { props } = slot;
            if (props) {
              if (props.tabTag === this.active) {
                props.style = { display: 'block' };
              } else {
                props.style = { display: 'none' };
              }
            }
            return slot;
          })}
        </div>
      </div>
    );
  },
});
