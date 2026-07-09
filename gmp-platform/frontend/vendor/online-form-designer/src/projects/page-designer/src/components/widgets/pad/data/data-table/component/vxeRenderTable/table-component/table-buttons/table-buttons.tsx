import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { MoreOutlined } from '@ant-design/icons-vue';
import './table-buttons.scss';

export const TableButtons = defineComponent({
  name: 'TableButtons',
  props: {
    widgets: {
      type: Array<any>,
      default: () => [],
    },
  },
  emits: ['runEvent'],
  setup(_, { emit }) {
    const ns = useNamespace('table-buttons');

    const runEvent = (action: any) => {
      emit('runEvent', action);
    };

    return { ns, runEvent };
  },
  render() {
    const slots = this.$slots.default?.();
    return (
      <div class={this.ns.b()}>
        {slots}
        <a-dropdown trigger="click">
          <a class="ant-dropdown-link">
            <MoreOutlined class="icon-more" />
          </a>
          {{
            overlay: () => (
              <a-menu>
                {this.widgets.map((action, i) => {
                  return (
                    <a-menu-item key={i}>
                      <getPopAction action={i} onRunEvent={this.runEvent} />
                    </a-menu-item>
                  );
                })}
              </a-menu>
            ),
          }}
        </a-dropdown>
      </div>
    );
  },
});
