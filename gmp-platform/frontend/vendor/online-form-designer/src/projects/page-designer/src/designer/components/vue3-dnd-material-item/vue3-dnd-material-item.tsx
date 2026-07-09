import { defineComponent, nextTick, onMounted, ref, toRefs } from 'vue';
import { LowCodeWidget, useNamespace } from '@gct/runtime';
import { useDrag } from 'vue3-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { IDragCollect, IDragDataItem, IDropResult, IVue3DndItemOptions } from '../../interface';
import { DESIGN_TYPE } from '../../../constant';
import { useDesignerController } from '../../../hooks/useDesigner';
import { useSelectedWidget } from '../../../hooks/useSelectedWidget';
import './vue3-dnd-material-item.scss';

export const Vue3DndMaterialItem = defineComponent({
  name: 'Vue3DndMaterialItem',
  props: {
    // 分组标识
    group: {
      type: String,
      required: true,
    },
    // 当前项下标
    index: {
      type: Number,
      required: true,
    },
    // 当前项数据
    item: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
      required: true,
    },
    config: {
      type: Object as PropType<IVue3DndItemOptions>,
      required: true,
    },
    clone: {
      type: Function,
    },
  },
  setup(props) {
    const ns = useNamespace('vue3-dnd-material-item');

    const elRef = ref<HTMLDivElement | null>(null);

    const c = useDesignerController();

    const { config } = toRefs(props);

    const { setHoverWidget } = useSelectedWidget();

    const [collect, drag, preview] = useDrag<
      IDragDataItem<LowCodeWidget.BasicSchema>,
      IDropResult,
      IDragCollect
    >({
      type: DESIGN_TYPE,
      canDrag() {
        return config.value.canDrag ? config.value.canDrag(props.item) : true;
      },
      item: () => {
        c.state.isDragging = true;
        const data = props.clone ? props.clone(props.item) : props.item;
        return {
          dragType: config.value.type ?? DESIGN_TYPE,
          id: data.id || '',
          group: props.group,
          data,
          mode: config.value.mode,
          index: props.index,
          types: [data.type],
        };
      },
      collect: (monitor) => {
        return {
          canDrag: monitor.canDrag(),
          isDragging: monitor.isDragging(),
        };
      },
      end: async (item, monitor) => {
        c.state.isDragging = false;
        const r = monitor.getDropResult();
        if (r && r.asyncDrop) {
          const result = await r.asyncDrop;
          if (result && result.success && result.group !== props.group) {
            c.force();
            nextTick(() => {
              c.changeSelectHighlight();
            });
          }
        }
        setHoverWidget();
        c.cancelExpansion();
      },
      options: config.value.dragOptions,
      previewOptions: config.value.previewOptions,
    });
    drag(elRef);

    onMounted(() => {
      if (preview) {
        preview(getEmptyImage(), { captureDraggingState: true });
      }
    });

    return { ns, elRef, collect };
  },
  render() {
    return (
      <div ref="elRef" class={this.ns.b()}>
        {this.$slots.default?.()}
      </div>
    );
  },
});
