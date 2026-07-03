import { defineComponent } from 'vue';
import { useNamespace, IActionItem } from '@gct/runtime';
import './view-footer.scss';

export const ViewFooter = defineComponent({
  name: 'ViewFooter',
  props: {
    actions: {
      type: Array<IActionItem>,
      default: () => [],
    },
  },
  setup() {
    const ns = useNamespace('view-footer');

    const onClick = async (action: IActionItem) => {
      if (action.onClick) {
        action.loading = true;
        await action.onClick();
        action.loading = false;
      }
    };

    return { ns, onClick };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('content')}>
          <a-space>
            {this.actions.map((action) => {
              return (
                <a-button
                  key={action.text}
                  onClick={() => this.onClick(action)}
                  disabled={action.disabled}
                  loading={action.loading}
                  {...(action.props || {})}
                >
                  {action.text}
                </a-button>
              );
            })}
          </a-space>
        </div>
      </div>
    );
  },
});

export default ViewFooter;
