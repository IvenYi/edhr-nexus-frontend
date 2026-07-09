import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import './vue3-dnd-not-found.scss';

export const Vue3DndNotFound = defineComponent({
  name: 'Vue3DndNotFound',
  props: {
    showIcon: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('vue3-dnd-not-found');
    return { ns };
  },
  render() {
    return (
      <div class={[this.ns.b(), this.ns.is('with-icon', this.showIcon)]}>
        {this.showIcon ? (
          <span class={this.ns.e('icon')}>
            <svg-icon src="/assets/design-view/pic_quesheng_gray.svg" />
          </span>
        ) : null}
        <span class={this.ns.e('msg')}>{this.message}</span>
      </div>
    );
  },
});
