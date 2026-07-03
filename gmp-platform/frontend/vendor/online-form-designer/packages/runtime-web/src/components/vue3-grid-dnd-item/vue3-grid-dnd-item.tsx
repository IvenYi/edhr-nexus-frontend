import { defineComponent, ref, PropType, computed, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useDrag, useDrop } from 'vue3-dnd';
import './vue3-grid-dnd-item.scss';

export const Vue3GridDndItem = defineComponent({
  name: 'Vue3GridDndItem',
  props: {
    index: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    move: {
      type: Function as PropType<(isBefore: boolean, row: any, dragData: any) => void>,
    },
    end: {
      type: Function as PropType<(data: any) => void>,
    },
  },
  setup(props) {
    const ns = useNamespace('vue3-grid-dnd-item');

    /**
     * 找到指定父
     *
     * @author zhanghanrui
     * @date 2024-09-26 10:09:34
     * @param {HTMLElement} node
     * @param {string} tag
     * @return {*}  {(HTMLElement | null)}
     */
    function findParent(node: HTMLElement, tag: string): HTMLElement | null {
      if (node && node.classList.contains(tag)) {
        return node;
      }
      return findParent(node.parentElement!, tag);
    }

    const rootRef = ref<HTMLDivElement | null>(null);

    const dragRef = computed<HTMLElement | null>(() => {
      if (rootRef.value) {
        const node = findParent(rootRef.value, 'vxe-body--row');
        if (node) {
          return node;
        }
      }
      return null;
    });

    const isBeforeHover = ref<boolean>(false);

    const [dragCollect, drag, preview] = useDrag<any, any, any>({
      type: 'vue3-grid-dnd-item',
      item: () => {
        return props.data;
      },
      collect: (monitor) => {
        return {
          canDrag: monitor.canDrag(),
          isDragging: monitor.isDragging(),
        };
      },
      end(draggedItem) {
        if (props.end) {
          props.end(draggedItem);
        }
      },
    });

    const [dropCollect, drop] = useDrop<any, any, any>({
      accept: 'vue3-grid-dnd-item',
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId() as string,
          canDrop: monitor.canDrop(),
          isShallowOver: monitor.isOver({ shallow: true }),
        };
      },
      hover(item: any, monitor) {
        if (monitor.canDrop() === false || dragCollect.value.isDragging === true) {
          return;
        }
        if (props.data === item) {
          return;
        }
        const isOver = monitor.isOver({ shallow: true });
        if (isOver) {
          const rect = rootRef.value!.getBoundingClientRect();
          const offset = monitor.getClientOffset()!;
          const { top, height } = rect;
          const { y } = offset;
          const half = height / 2;
          const difference = y - top - half;
          if (difference < 0) {
            isBeforeHover.value = true;
          } else {
            isBeforeHover.value = false;
          }
        }
      },
      canDrop() {
        if (dragCollect.value.isDragging === true) {
          return false;
        }
        return true;
      },
      drop(item, monitor) {
        if (monitor.canDrop() === false || dragCollect.value.isDragging === true) {
          return;
        }
        if (props.data === item) {
          return;
        }
        if (props.move) {
          props.move(isBeforeHover.value, props.data, item);
        }
      },
    });

    drag(rootRef);
    drop(dragRef);
    preview(dragRef);

    watch([dropCollect, isBeforeHover], () => {
      if (!dragRef.value) {
        return;
      }
      dragRef.value.classList.remove(
        ns.is('over', true),
        ns.is('before', true),
        ns.is('after', true),
      );
      if (dropCollect.value.canDrop && dropCollect.value.isShallowOver) {
        const n = ns.is('over', true);
        const x = isBeforeHover.value ? ns.is('before', true) : ns.is('after', true);
        dragRef.value.classList.add(n, x);
      }
    });

    watch(dragCollect, () => {
      if (!dragRef.value) {
        return;
      }
      dragRef.value.classList.remove(ns.is('dragging', true));
      if (dragCollect.value.isDragging) {
        dragRef.value.classList.add(ns.is('dragging', true));
      }
    });

    return { ns, rootRef, dropCollect };
  },
  render() {
    return (
      <div ref="rootRef" class={this.ns.b()}>
        {this.$slots.default?.()}
      </div>
    );
  },
});
