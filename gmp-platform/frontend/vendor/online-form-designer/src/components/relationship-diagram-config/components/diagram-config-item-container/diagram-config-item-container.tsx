import { defineComponent, onMounted, onUnmounted } from 'vue';
import { useNamespace } from '@gct/runtime';
import './diagram-config-item-container.scss';

export const DiagramConfigItemContainer = defineComponent({
  name: 'DiagramConfigItemContainer',
  props: {
    i: {
      type: Number,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  emits: ['mounted', 'unmounted'],
  setup(props, { emit }) {
    const ns = useNamespace('diagram-config-item-container');

    // 蛇形排序
    const calcPosStyle = () => {
      // 行，从0开始
      const topI = Math.floor(props.i / 3);
      // 列，从0开始
      const leftI = props.i % 3;
      // 单数行
      if (topI % 2 !== 1) {
        return {
          top: 24 * (topI + 1) + 84 * topI + 'px',
          left: 46 * (leftI + 1) + 178 * leftI - 25 + 'px',
        };
      } else {
        // 双数行
        return {
          top: 24 * (topI + 1) + 84 * topI + 'px',
          left: 46 * (3 - leftI) + 178 * (2 - leftI) - 25 + 'px',
        };
      }
    };

    onMounted(() => {
      emit('mounted');
    });

    onUnmounted(() => {
      emit('unmounted');
    });

    return { ns, calcPosStyle };
  },
  render() {
    const slots = this.$slots.default?.();
    return (
      <div id={this.id} class={this.ns.b()} style={this.calcPosStyle()}>
        {slots}
      </div>
    );
  },
});
