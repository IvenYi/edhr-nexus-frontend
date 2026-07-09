import { computed, defineComponent, PropType, ref, toRefs, TransitionGroup } from 'vue';
import { IDragDataItem, IDropResult, IVue3DndDraggableOptions, useNamespace } from '@gct/runtime';
import { useDrop } from 'vue3-dnd';
import { createUUID } from 'qx-util';
import { merge } from 'lodash-es';
import { Vue3DndDraggableItem } from '../vue3-dnd-draggable-item/vue3-dnd-draggable-item';
import './vue3-dnd-draggable.scss';

export const Vue3DndDraggable = defineComponent({
  name: 'Vue3DndDraggable',
  props: {
    opts: {
      type: Object as PropType<IVue3DndDraggableOptions>,
      default: () => {
        return {};
      },
    },
    items: {
      type: Array<any>,
      required: true,
    },
  },
  emits: ['add', 'remove', 'move'],
  setup(props, { emit }) {
    const ns = useNamespace('vue3-dnd-draggable');

    const groupId = createUUID();

    const rootRef = ref<HTMLElement | null>(null);

    const { opts, items } = toRefs(props);

    const key = computed(() => {
      return config.value.key || 'id';
    });

    const config = computed(() => {
      return merge(
        {
          type: 'Vue3DndDraggable',
          direction: 'vertical',
        },
        opts.value,
      );
    });

    const [collect, drop] = useDrop<IDragDataItem, IDropResult, any>({
      accept: config.value.type,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId() as string,
          canDrop: monitor.canDrop(),
          isShallowOver: monitor.isOver({ shallow: true }),
        };
      },
      canDrop(item, monitor) {
        if (props.items.length > 0) {
          return false;
        }
        if (config.value.canDropContainer) {
          return config.value.canDropContainer(item, monitor);
        }
        return true;
      },
      drop(item, monitor) {
        if (config.value.dropContainer) {
          return config.value.dropContainer(item, monitor) as IDropResult;
        }
        if (monitor.canDrop() !== false) {
          items.value.push(item);
        }
        return {
          group: groupId,
        };
      },
    });
    drop(rootRef);

    const onAdd = (isBefore: boolean, id: string, data: any) => {
      const i = items.value.findIndex((item) => item[key.value] === id);
      items.value.splice(isBefore ? i : i + 1, 0, data);
      emit('add', data, i);
    };

    const onRemove = (index: number) => {
      items.value.splice(index, 1);
      emit('remove', index);
    };

    const onMove = (isBefore: boolean, id: string, moveId: string) => {
      // 放置位置下标
      const index = items.value.findIndex((item) => item[key.value] === id);
      // 移动数据下标
      const moveIndex = items.value.findIndex((item) => item[key.value] === moveId);
      // 旧数据
      const item = items.value[moveIndex];
      // 放入新位置
      const newIndex = isBefore ? index : index + 1;
      if ((!isBefore && newIndex === moveIndex) || (isBefore && newIndex - 1 === moveIndex)) {
        return;
      }
      items.value.splice(newIndex, 0, item);
      // 删除老位置数据
      if (newIndex < moveIndex) {
        // 新位置在老位置前，因为先插入所以需要+1位置删除
        items.value.splice(moveIndex + 1, 1);
      } else {
        // 新位置在老位置后，因为先插入位置无变动直接删除即可
        items.value.splice(moveIndex, 1);
      }
      emit('move', index, newIndex);
    };

    return { ns, groupId, key, rootRef, collect, config, onAdd, onRemove, onMove };
  },
  render() {
    return (
      <div ref="rootRef" class={[this.ns.b(), this.ns.is('over', this.collect.isShallowOver)]}>
        <TransitionGroup name="list">
          {this.items.map((item, index) => {
            return (
              <Vue3DndDraggableItem
                group={this.groupId}
                key={item[this.key] || index}
                index={index}
                item={item}
                config={this.config}
                add={this.onAdd}
                remove={this.onRemove}
                move={this.onMove}
              >
                {{
                  default: (args) => {
                    return this.$slots.draggableItem?.(args);
                  },
                }}
              </Vue3DndDraggableItem>
            );
          })}
        </TransitionGroup>
      </div>
    );
  },
});
