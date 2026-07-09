import { computed, defineComponent } from 'vue';
import { LowCodeWidget, useNamespace } from '@gct/runtime';
import { useDragLayer, XYCoord } from 'vue3-dnd';
import { toRefs } from '@vueuse/core';
import { IDragDataItem } from '../../interface';
import './vue3-dnd-item-preview.scss';

interface DragLayerReturn {
  isDragging: boolean;
  item: IDragDataItem<LowCodeWidget.BasicSchema>;
  offset: XYCoord | null;
}

export const Vue3DndItemPreview = defineComponent({
  name: 'Vue3DndItemPreview',
  setup() {
    const ns = useNamespace('vue3-dnd-item-preview');

    const t = window.$t;

    const collect = useDragLayer<DragLayerReturn>((monitor) => {
      return {
        isDragging: !!monitor.isDragging(), // 是否拖拽中
        item: monitor.getItem(), // 拖拽信息
        offset: monitor.getClientOffset(),
      };
    });

    const { isDragging, item, offset } = toRefs(collect);

    const pos = computed<string>(() => {
      if (!offset.value) {
        return '';
      }
      const { x, y } = offset.value;
      return `transform: translate(${x}px, ${y}px)`;
    });

    return () => {
      return (
        <div
          class={[ns.b(), ns.is('dragging', item.value?.data && isDragging.value)]}
          style={pos.value}
        >
          <span class={ns.e('icon')}>
            <i class="iconfont icon-yidong"></i>
          </span>
          <span class={ns.e('label')}>
            {t(item.value?.data?.name || 'sys.pageDesigner.unknownComponent')}
          </span>
        </div>
      );
    };
  },
});
