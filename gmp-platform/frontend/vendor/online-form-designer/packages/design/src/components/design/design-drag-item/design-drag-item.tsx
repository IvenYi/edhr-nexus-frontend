import { computed, defineComponent, nextTick, onMounted, PropType, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { calcStyle, DesignNodeMode, IDesignNode, IDragDataItem } from '@gct/base';
import { useDrag, useDrop } from 'vue3-dnd';
import { clone } from 'lodash-es';
import { toRefs } from '@vueuse/core';
import { getEmptyImage } from 'react-dnd-html5-backend';
import {
  IDragCollect,
  IDropCollect,
  IDropResult,
  IDropResultData,
  INodeProvider,
} from '../../../interface';
import { useDesignViewController } from '../../../hooks';
import { DesignItemAttribute, DesignViewPrefix, InsertNodeMode } from '../../../constant';
import { NodeRegister } from '../../../register';
import { isCanCrop } from '../../../utils';
import './design-drag-item.scss';

export const DesignDragItem = defineComponent({
  name: 'DesignDragItem',
  props: {
    group: {
      type: String,
      required: true,
    },
    parent: {
      type: Object as PropType<IDesignNode>,
    },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    data: {
      type: Object as PropType<IDesignNode>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('design-drag-item');

    const c = useDesignViewController();

    const store = c.store;

    const elRef = ref<HTMLDivElement | null>(null);

    const isBeforeHover = ref<boolean>(false);

    const provider: INodeProvider = NodeRegister.get(props.data.type, store.prefix)!;

    const isActive = computed<boolean>(() => {
      return store.selected?.id === props.data.id;
    });

    const isHover = computed<boolean>(() => {
      return store.hoverId === props.data.id;
    });

    const isExpansion = ref<boolean>(false);

    if (props.parent) {
      watch(
        () => store.count,
        () => {
          // 父展开时子项也需同步 UI 展开模式呈现
          isExpansion.value = store.isDragging && store.expansions.has(props.parent!.id);
        },
      );
    }

    const { data } = toRefs(props.data);

    const style = computed(() => {
      if (provider.isCustomStyle === true) {
        return null;
      }
      return calcStyle(data.value);
    });

    const [dragCollect, drag, preview] = useDrag<IDragDataItem, IDropResult, IDragCollect>({
      type: DesignViewPrefix.CUSTOM_HOME,
      item: () => {
        // 开启正在拖拽状态
        store.setDragging(true);
        return {
          id: props.data.id,
          group: props.group,
          index: props.index,
          data: clone(props.data),
          mode: 'move',
          types: c.types(props.data),
        };
      },
      collect: (monitor) => {
        return {
          canDrag: monitor.canDrag(),
          isDragging: monitor.isDragging(),
        };
      },
      end: async (_, monitor) => {
        store.setDragging(false);
        const r = monitor.getDropResult();
        if (r && r.asyncDrop) {
          const result = await r.asyncDrop;
          if (result && result.success && result.group !== props.group) {
            // 执行成功
          }
        }
        c.dropEnd();
      },
      options: {
        dropEffect: 'move',
      },
    });

    const [dropCollect, drop] = useDrop<IDragDataItem, IDropResult, IDropCollect>({
      accept: DesignViewPrefix.CUSTOM_HOME,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId() as string,
          canDrop: monitor.canDrop(),
          isShallowOver: monitor.isOver({ shallow: true }),
          isOver: monitor.isOver(),
        };
      },
      hover(item: IDragDataItem, monitor) {
        if (monitor.canDrop() === false || dragCollect.value.isDragging === true) {
          return;
        }
        const isOver = monitor.isOver({ shallow: true });
        if (props.data.id === item.id) {
          return;
        }
        if (isOver) {
          const rect = elRef.value!.getBoundingClientRect();
          const offset = monitor.getClientOffset()!;
          let difference: number = 0;
          if (props.direction === 'vertical') {
            const { top, height } = rect;
            const { y } = offset;
            const half = height / 2;
            difference = y - top - half;
            if (difference < 0) {
              isBeforeHover.value = true;
            } else {
              isBeforeHover.value = false;
            }
          }
          if (props.direction === 'horizontal') {
            const { left, width } = rect;
            const { x } = offset;
            const half = width / 2;
            difference = x - left - half;
            if (difference < 0) {
              isBeforeHover.value = true;
            } else {
              isBeforeHover.value = false;
            }
          }
        }
      },
      canDrop(item: IDragDataItem, _monitor) {
        if (dragCollect.value.isDragging === true) {
          return false;
        }
        return isCanCrop(props.parent!, store, item);
      },
      drop(item, monitor) {
        if (
          monitor.canDrop() === false ||
          monitor.isOver({ shallow: true }) === false ||
          dragCollect.value.isDragging === true
        ) {
          return;
        }
        const asyncDrop = async (): Promise<IDropResultData> => {
          let _data = item.data;
          const p = NodeRegister.get(_data.type, store.prefix)!;
          if (p.beforeDrop) {
            const data = await p.beforeDrop(c, item);
            if (!data) {
              return { group: props.group, success: false };
            }
            _data = data;
          }
          const success = store.insertNode(
            isBeforeHover.value ? InsertNodeMode.BEFORE : InsertNodeMode.AFTER,
            props.data,
            _data,
          );
          if (success) {
            if (p.afterDrop) {
              const flag = await p.afterDrop(c, item);
              if (!flag) {
                return { group: props.group, success: false };
              }
            }
            const data = store.getNode(item.id);
            if (data) {
              nextTick(() => {
                store.setActive(data);
              });
            }
            return { group: props.group, success: true };
          }
          return { group: props.group, success: false };
        };
        return { asyncDrop: asyncDrop() };
      },
    });

    drag(elRef);
    drop(elRef);

    onMounted(() => {
      if (preview) {
        preview(getEmptyImage(), { captureDraggingState: true });
      }
    });

    const onActive = (e: MouseEvent) => {
      e.stopPropagation();
      store.setActive(props.data);
    };

    watch(dropCollect, (_) => {
      if (_.canDrop && _.isShallowOver) {
        store.dropContainer = props.parent || null;
        c.setExpansion([props.data.id]);
      }
    });

    return {
      ns,
      elRef,
      provider,
      isActive,
      isHover,
      isExpansion,
      style,
      dragCollect,
      dropCollect,
      isBeforeHover,
      onActive,
    };
  },
  render() {
    return (
      <div
        ref="elRef"
        id={this.data.id}
        {...{
          [DesignItemAttribute.NODE_ID_TAG]: this.data.id,
          [DesignItemAttribute.ACTIVE_TAG]: true,
          [DesignItemAttribute.DESIGN_NAME]: this.data.label,
          [DesignItemAttribute.DRAG_GROUP_TYPE]: this.provider.type,
          [DesignItemAttribute.GROUP_TAG]: this.group,
          [DesignItemAttribute.INDEX_TAG]: this.index,
          [DesignItemAttribute.SELECTOR_INDEX]: this.provider.selectorIndex ?? 0,
        }}
        class={[
          this.ns.b(),
          this.ns.is('dragging', this.dragCollect.isDragging),
          this.ns.is('can-drop', this.dropCollect.canDrop),
          this.ns.is('shallow-over', this.dropCollect.isShallowOver),
          this.ns.is('active', this.isActive),
          this.ns.is('hover', this.isHover),
          this.ns.is('expansion', this.isExpansion),
        ]}
        style={this.style}
        onClick={this.onActive}
      >
        {this.$slots.default?.()}
        {this.provider.isDrag ? <div class={this.ns.e('dragging-mask')}></div> : null}
        {/* 项遮罩，当没有子的情况下遮住交互，避免出现异常操作 */}
        {/* {this.provider.mode === DesignNodeMode.ITEM ? (
          <div class={this.ns.e('item-mask')}></div>
        ) : null} */}
        {this.provider.isDrop && this.isExpansion !== true ? (
          <div
            class={[
              this.ns.b('indicator'),
              this.ns.be('indicator', this.direction),
              this.ns.is(
                'shallow-over',
                !this.dragCollect?.isDragging &&
                  this.dropCollect.isShallowOver &&
                  this.dropCollect.canDrop,
              ),
              this.ns.is('before', this.dropCollect.isShallowOver && this.isBeforeHover),
              this.ns.is('after', this.dropCollect.isShallowOver && !this.isBeforeHover),
            ]}
          >
            <div class={[this.ns.bem('indicator', this.direction, 'start-line')]}></div>
            <div class={[this.ns.bem('indicator', this.direction, 'line')]}></div>
            <div class={[this.ns.bem('indicator', this.direction, 'end-line')]}></div>
          </div>
        ) : null}
      </div>
    );
  },
});
