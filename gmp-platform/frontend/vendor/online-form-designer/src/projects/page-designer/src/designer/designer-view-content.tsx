import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import DesignerNav from './nav/nav.vue';
import DesignerToolkit from './toolkits/toolkit.vue';
import DesignerStage from './stage/stage.vue';
import DesignerPanel from './panels/panel.vue';
import { Vue3DndItemPreview } from './components/vue3-dnd-item-preview/vue3-dnd-item-preview';
import { useToolkit } from '../hooks/useToolkit';
import './designer-view-content.scss';

export const DesignerViewContent = defineComponent({
  name: 'DesignerViewContent',
  props: {
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ns = useNamespace('designer-view-content');

    const { toolkitFixed } = useToolkit();

    const dragResizeWidth = ref<number>(-1);

    function onChangeDragResizeWidth(width: number) {
      dragResizeWidth.value = width;
    }

    const dragWidth = computed(() => {
      return dragResizeWidth.value !== -1
        ? `${dragResizeWidth.value}px`
        : toolkitFixed.value
          ? '650px'
          : '250px';
    });

    return () => {
      return (
        <div
          class={[ns.b(), ns.is('hidden', props.hidden)]}
          style={{ '--drag-resize-width': dragWidth.value, '--xxx': dragResizeWidth.value }}
        >
          <div class={[ns.e('toolkit'), ns.is('fixed', toolkitFixed.value)]}>
            <DesignerNav />
            <DesignerToolkit onDragResizeWidth={onChangeDragResizeWidth} />
          </div>
          <div class={[ns.e('content'), ns.is('fixed', toolkitFixed.value)]}>
            <Vue3DndItemPreview />
            <DesignerStage class={ns.e('stage')} />
          </div>
          <div class={ns.e('panel')}>
            <DesignerPanel />
          </div>
        </div>
      );
    };
  },
});
