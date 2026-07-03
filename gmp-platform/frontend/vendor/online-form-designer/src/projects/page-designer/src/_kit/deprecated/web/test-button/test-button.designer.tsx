import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import './test-button.designer.scss';

export const TestButtonDesigner = defineComponent({
  name: 'TestButton',
  setup() {
    const ns = useNamespace('test-button');
    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-button>网页端插件测试按钮</a-button>
      </div>
    );
  },
});

export default TestButtonDesigner;
