import { computed, defineComponent, ref, toRefs } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useElementBounding } from '@vueuse/core';
import './design-item-hover-title.css';

export const DesignItemHoverTitle = defineComponent({
  name: 'DesignItemHoverTitle',
  props: {
    top: {
      type: Number,
      default: 0,
    },
    left: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      default: '',
    },
    halfRect: {
      type: Object,
      required: true,
    },
    hoverEl: {
      type: HTMLDivElement,
    },
  },
  setup(props) {
    const ns = useNamespace('design-item-hover-title');

    const elRef = ref<HTMLElement | null>(null);

    const { hoverEl } = toRefs(props);

    const { width, height } = useElementBounding(elRef);

    const style = computed(() => {
      return {
        opacity: isShow.value ? 1 : 0,
        top: `${props.top - height.value}px`,
        left: `${props.left - width.value}px`,
      };
    });

    const isShow = computed(() => {
      if (!hoverEl.value) {
        return true;
      }
      const { top, right, bottom, left } = props.halfRect;
      return !(
        top > 0 ||
        right > 0 ||
        bottom - hoverEl.value.clientHeight > 0 ||
        left - hoverEl.value.clientWidth > 0
      );
    });

    return { ns, elRef, style, isShow };
  },
  render() {
    return (
      <div ref="elRef" class={this.ns.b()} style={this.style}>
        {this.content}
      </div>
    );
  },
});
