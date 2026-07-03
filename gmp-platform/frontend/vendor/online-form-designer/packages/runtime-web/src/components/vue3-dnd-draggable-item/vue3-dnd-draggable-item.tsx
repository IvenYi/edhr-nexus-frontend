import { defineComponent, nextTick, onMounted, PropType, ref } from 'vue';
import {
  IDragDataItem,
  IDropResult,
  IRenderOptions,
  IVue3DndDraggableOptions,
  useNamespace,
} from '@gct/runtime';
import { useDrag, useDrop } from 'vue3-dnd';
import './vue3-dnd-draggable-item.scss';

export const Vue3DndDraggableItem = defineComponent({
  name: 'Vue3DndDraggableItem',
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
      type: Object as PropType<any>,
      required: true,
    },
    config: {
      type: Object as PropType<IVue3DndDraggableOptions>,
      required: true,
    },
    // 新增回调
    add: {
      type: Function as PropType<(isBefore: boolean, id: string, data: any) => void>,
      required: true,
    },
    // 删除回调
    remove: {
      type: Function as PropType<(id: any) => void>,
      required: true,
    },
    // 移动回调
    move: {
      type: Function as PropType<(isBefore: boolean, id: string, moveId: string) => void>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('vue3-dnd-draggable-item');

    const elRef = ref<HTMLDivElement | null>(null);

    const isBeforeHover = ref<boolean>(false);

    const { config } = props;

    const [dragCollect, drag, preview] = useDrag<IDragDataItem, IDropResult, any>({
      type: config.type,
      item: () => {
        return {
          group: props.group,
          item: props.item,
        };
      },
      collect: (monitor) => {
        return {
          canDrag: monitor.canDrag(),
          isDragging: monitor.isDragging(),
        };
      },
      canDrag(monitor) {
        if (config.canDrag) {
          return config.canDrag(monitor);
        }
        return true;
      },
      end(item, monitor) {
        if (config.end) {
          return config.end(item, monitor);
        }
        const result = monitor.getDropResult();
        if (result && result.group !== props.group) {
          props.remove(item);
        }
      },
      options: config.dragOptions,
      previewOptions: config.previewOptions,
    });

    const [dropCollect, drop] = useDrop<IDragDataItem, IDropResult, any>({
      accept: config.type,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId() as string,
          canDrop: monitor.canDrop(),
          isShallowOver: monitor.isOver({ shallow: true }),
          isOver: monitor.isOver(),
        };
      },
      hover(item: any, monitor) {
        if (config.hover) {
          return config.hover(item, monitor);
        }
        if (monitor.canDrop() === false || dragCollect.value.isDragging === true) {
          return;
        }
        if (props.item === item.item) {
          return;
        }
        const isOver = monitor.isOver({ shallow: true });
        if (isOver) {
          const rect = elRef.value!.getBoundingClientRect();
          const offset = monitor.getClientOffset()!;
          // 放置线计算偏移量
          const dropOffset = config.offset ?? 0;
          let difference: number = 0;
          if (config.direction === 'vertical') {
            const { top, height } = rect;
            const { y } = offset;
            const half = height / 2;
            difference = y - top - half;
            // 小于偏移量，则不处理
            if (Math.abs(difference) < dropOffset) {
              return;
            }
            if (difference < 0) {
              isBeforeHover.value = true;
            } else {
              isBeforeHover.value = false;
            }
          } else if (config.direction === 'horizontal') {
            const { left, width } = rect;
            const { x } = offset;
            const half = width / 2;
            difference = x - left - half;
            // 小于偏移量，则不处理
            if (Math.abs(difference) < dropOffset) {
              return;
            }
            if (difference < 0) {
              isBeforeHover.value = true;
            } else {
              isBeforeHover.value = false;
            }
          }
          const key = config.key ?? 'id';
          if (item.group === props.group) {
            props.move(isBeforeHover.value, props.item[key], item.item[key]);
          } else {
            props.add(isBeforeHover.value, props.item[key], item.item);
          }
        }
      },
      canDrop(item, monitor) {
        if (config.canDrop) {
          return config.canDrop(item, monitor);
        }
        if (dragCollect.value.isDragging === true) {
          return false;
        }
        return true;
      },
      drop(item, monitor) {
        if (config.drop) {
          return config.drop(item, monitor) as IDropResult;
        }
        return {
          group: props.group,
        };
      },
      options: config.dropOptions,
    });

    if (props.config.isCustomHandle !== true && !props.config.handle) {
      drag(elRef);
    }
    drop(elRef);
    preview(elRef);

    onMounted(() => {
      nextTick(() => {
        if (props.config.handle && elRef.value) {
          const el = elRef.value.querySelector(props.config.handle);
          if (el) {
            drag(el);
          }
        }
      });
    });

    return { ns, elRef, dragCollect, dropCollect, isBeforeHover, drag, preview };
  },
  render() {
    return (
      <div
        ref="elRef"
        class={[
          this.ns.b(),
          this.ns.is('dragging', this.dragCollect.isDragging),
          this.ns.is('shallow-over', this.dropCollect.isShallowOver),
        ]}
      >
        {this.$slots.default?.({
          item: this.item,
          index: this.index,
          isDragging: this.dragCollect.isDragging,
          isShallowOver: this.dropCollect.isShallowOver,
          isOver: this.dropCollect.isOver,
          isBeforeHover: this.isBeforeHover,
          isAfterHover: !this.isBeforeHover,
          direction: this.config.direction,
          drag: this.drag,
          preview: this.preview,
        } as IRenderOptions<any>)}
      </div>
    );
  },
});
