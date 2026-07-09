import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import './gct-view-header.scss';

export const GctViewHeader = defineComponent({
  name: 'GctViewHeader',
  props: {
    title: {
      type: String,
    },
  },
  setup() {
    const ns = useNamespace('gct-view-header');
    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('title')}>
          <span>{this.title}</span>
        </div>
        <div class={this.ns.e('actions')}>
          {/* <a-space>
            <a-button>保存</a-button>
            <a-button>取消</a-button>
          </a-space> */}
        </div>
      </div>
    );
  },
});

export default GctViewHeader;
