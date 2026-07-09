import { defineComponent, PropType, computed } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IDesignNode } from '@gct/base';
import './render-card-view-page.scss';

export const RenderCardViewPage = defineComponent({
  name: 'RenderCardViewPage',
  props: {
    model: {
      type: Object as PropType<IDesignNode>,
      default: () => ({}),
    },
    context: {
      type: Object,
      default: () => ({}),
    },
    preview: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const ns = useNamespace('render-mobile-card-view-page');

    const style = computed(() => {
      const { data } = props.model;
      const style: IObject = {};
      if (props.model) {
        style.backgroundColor = data.background;
        style.borderRadius = `${data.border_radius}px`;
        const padding = data.spacing?.[1];
        if (padding) {
          style.paddingTop = padding.top;
          style.paddingRight = padding.right;
          style.paddingBottom = padding.bottom;
          style.paddingLeft = padding.left;
        }
      }
      return style;
    });

    const data = computed(() => {
      return props.model?.data || {};
    });

    return () => {
      return (
        <div class={[ns.b(), ns.is('simple', data.value.mode === 'simple')]} style={style.value}>
          {slots.default?.()}
        </div>
      );
    };
  },
});
