import { defineComponent, inject, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { useDrag, useDrop } from 'vue3-dnd';
import {
  IGctDndRenderItemOptions,
  IGctDragCollect,
  IGctDragDndData,
  IGctDropResult,
  IGctDndData,
  IGctDndConfig,
  GCT_DND_INSERT_POS,
  IGctDropResultData,
  IGctDropCollect,
} from '@gct/runtime';
import { cloneDeep } from 'lodash-es';
import './gct-dnd-item.scss';

export const GctDndItem = defineComponent({
  name: 'GctDndItem',
  props: {
    config: {
      type: Object as PropType<IGctDndConfig>,
      required: true,
    },
    // 数据所在位置下标
    index: {
      type: Number,
      required: true,
    },
    // 当前项数据
    data: {
      type: Object as PropType<IGctDndData>,
      required: true,
    },
    last: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['drop'],
  setup(props, { emit }) {
    const { config } = props;
    const ns = useNamespace('dnd-item');
    const rootRef = ref<HTMLDivElement | null>(null);
    const isBeforeHover = ref<boolean>(false);
    const dropLineState = inject<{ activeKey: string; isBeforeHover: boolean }>(
      'vue3-dnd-drop-line-state',
    )!;
    // 通过悬浮时计算，放置的位置
    const posState = ref<0 | 1 | -1>(-1);
    // 拖放配置，暂时无用，主要利用内部机制，避免悬浮时容器触发了放置
    // 拖拽配置
    const [collect, drag, preview] = useDrag<IGctDragDndData, IGctDropResult, IGctDragCollect>({
      type: config.group,
      item: () => {
        return {
          index: props.index,
          id: props.data.id,
          data: props.data,
          group: config.group,
          mode: config.mode ?? 'move',
          tagMap: config.tagMap ?? {},
          types: [],
        };
      },
      collect: (monitor) => {
        return {
          canDrag: monitor.canDrag(),
          isDragging: monitor.isDragging(),
        };
      },
      canDrag() {
        if (config.isDrag === false) {
          return false;
        }
        if (config.canDrag) {
          return config.canDrag(props.data);
        }
        return true;
      },
      end: async (_, monitor) => {
        const result = monitor.getDropResult();
        if (result && result.asyncDrop) {
          const res = await result.asyncDrop();
          if (res.success === true && res.data) {
            if (config.end) {
              config.end(_, res);
            }
            if (config.add) {
              config.add(res.data);
            }
            console.debug('drop success');
          }
        }
      },
    });

    if (props.config.isDrop !== true) {
      const [_, drop] = useDrop({
        accept: config.group,
        canDrop(item, monitor) {
          return false;
        },
      });
      drop(rootRef);
    } else {
      const [dropCollect, drop] = useDrop<IGctDragDndData, IGctDropResult, IGctDropCollect>({
        accept: config.group,
        collect(monitor) {
          return {
            handlerId: monitor.getHandlerId() as string,
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
            isShallowOver: monitor.isOver({ shallow: true }),
          };
        },
        canDrop(item, monitor) {
          if (collect.value.isDragging === true) {
            return false;
          }
          return item.id !== props.data.id && monitor.isOver({ shallow: true });
        },
        hover(item, monitor) {
          if (monitor.canDrop() === false) {
            return;
          }
          const isOver = monitor.isOver({ shallow: true });
          if (isOver) {
            const rect = rootRef.value!.getBoundingClientRect();
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
            dropLineState.activeKey = props.data.id;
            dropLineState.isBeforeHover = isBeforeHover.value;
          } else {
            dropLineState.activeKey = '';
          }
        },
        drop: (item, monitor) => {
          // 一旦放置，操控线的激活项就置空
          dropLineState.activeKey = '';
          if (dropCollect.value.isShallowOver !== true || monitor.canDrop() === false) {
            return;
          }
          const callback = async (): Promise<IGctDropResultData> => {
            let data: IGctDndData | null = item.data;
            if (config.drop) {
              data = await config.drop(item);
              if (!data) {
                return {
                  group: config.group,
                  cfg: cloneDeep(props.config),
                  success: false,
                };
              }
            }
            onDrop(isBeforeHover.value ? GCT_DND_INSERT_POS.BEFORE : GCT_DND_INSERT_POS.AFTER, data);
            return {
              group: config.group,
              success: true,
              cfg: cloneDeep(props.config),
              data,
            };
          };
          return {
            asyncDrop: callback,
          };
        },
      });
      drop(rootRef);
    }

    if (!config.handle && config.isDrag !== false) {
      drag(rootRef);
    }
    preview(rootRef);

    function onDrop(insertPos: GCT_DND_INSERT_POS, data: IGctDndData): void {
      emit('drop', insertPos, data);
    }

    return {
      ns,
      rootRef,
      posState,
      collect,
      onDrop,
      drag,
    };
  },
  render() {
    const itemProps: IGctDndRenderItemOptions<IObject> = {
      index: this.index,
      data: this.data,
      drag: this.drag,
    };
    return (
      <div
        ref="rootRef"
        class={[
          this.ns.b(),
          this.ns.is('dragging', this.collect.isDragging),
          this.ns.is('not-drag', this.collect.canDrag === false),
        ]}
      >
        {this.$slots.default?.(itemProps)}
      </div>
    );
  },
});

export default GctDndItem;
