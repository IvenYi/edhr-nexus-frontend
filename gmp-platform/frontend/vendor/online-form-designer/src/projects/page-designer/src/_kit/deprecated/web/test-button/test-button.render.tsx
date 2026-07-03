import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import './test-button.render.scss';

export const TestButtonRender = defineComponent({
  name: 'TestButton',
  setup() {
    const ns = useNamespace('test-button');
    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-button>网页端插件按钮绘制测试</a-button>
      </div>
    );
  },
});

export default TestButtonRender;
