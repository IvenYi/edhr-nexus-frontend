import { computed, defineComponent, ref, Ref, toRefs } from 'vue';
import { DisplayEnums, LowCodeWidget, useNamespace } from '@gct/runtime';
import { useDrop } from 'vue3-dnd';
import {
  IDragDataItem,
  IDropCollect,
  IDropResult,
  IDropResultData,
  IVue3DndItemOptions,
} from '../../interface';
import { DESIGN_TYPE } from '../../../constant';
import { intersection, last, union } from 'lodash-es';
import { useDesigner, useDesignerController } from '../../../hooks/useDesigner';
import { canDrop } from '../../utils';
import './vue3-dnd-drop-line.scss';

export const Vue3DndDropLine = defineComponent({
  name: 'Vue3DndDropLine',
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
    // 当前项数据
    beforeItem: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
    },
    // 父部件
    parentWidgets: {
      type: Array<LowCodeWidget.BasicSchema>,
      default: () => {
        return [];
      },
    },
    // 绘制的部件清单
    parentChildren: {
      type: Array<LowCodeWidget.BasicSchema>,
      required: true,
    },
    config: {
      type: Object as PropType<IVue3DndItemOptions>,
      required: true,
    },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'horizontal',
    },
    // 放置位置是否在数据之前，true 为之前 false 为之后
    isBefore: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['move'],
  setup(props, { emit }) {
    const ns = useNamespace('vue3-dnd-drop-line');

    const elRef = ref<HTMLDivElement | null>(null);

    // 竖线前元素
    const beforeEl = computed(() => {
      return elRef.value?.previousElementSibling;
    });

    // 竖线后元素
    const afterEl = computed(() => {
      return elRef.value?.nextElementSibling;
    });

    const isInlineBlock = computed(() => {
      return props.item.display === DisplayEnums.INLINE_BLOCK;
    });

    const getStyleObj = () => {
      if (isExpansion.value === false && props.direction === 'vertical') {
        return {
          height: 'auto',
        };
      }
      // 是否为内联块
      // 如果是内联，并且前后都是内联的情况下取更高的块
      // 如果前后，只有一个是内联，则取内联
      if (props.direction === 'vertical') {
        if (isInlineBlock.value) {
          if (props.isBefore === false && beforeEl.value) {
            return {
              height: `${beforeEl.value.clientHeight}px`,
            };
          }
          // 存在前置节点
          if (props.beforeItem && beforeEl.value && afterEl.value) {
            // 前置也是内联
            if (props.beforeItem.display === DisplayEnums.INLINE_BLOCK) {
              // 哪个元素大，和哪个元素等高
              if (beforeEl.value.clientHeight > afterEl.value.clientHeight) {
                return {
                  height: `${beforeEl.value.clientHeight}px`,
                };
              } else {
                return {
                  height: `${afterEl.value.clientHeight}px`,
                };
              }
            }
          }
          if (afterEl.value) {
            return {
              height: `${afterEl.value.clientHeight}px`,
            };
          }
        }
        if (props.beforeItem && beforeEl.value) {
          return {
            height: `${beforeEl.value.clientHeight}px`,
          };
        }
      }
      return {};
    };

    const c = useDesignerController();

    const { config } = toRefs(props);

    const { getWidgetHooks, getWhiteList, getBlackList } = useDesigner();

    const isExpansion = computed<boolean>(() => {
      // 容器展开状态数量
      const size = c.state.expansionContainerList.length;
      // 当前子项父
      const parentWidget = last(props.parentWidgets);
      // 判断当前父容器是否展开
      const isContainerExpansion =
        c.state.expansionContainerList.findIndex((item) => item.id === parentWidget?.id) !== -1;
      return size > 0 && config.value.isDrop !== false && (!parentWidget || isContainerExpansion);
    });

    // 包含父后过滤的可放置白名单
    const whiteList = computed(() => {
      return intersection(
        ...props.parentWidgets
          .filter((_) => {
            const arr = getWhiteList(_.type);
            return arr.length > 0;
          })
          .map((_) => getWhiteList(_.type)),
      );
    });

    // 包含父后过滤的不能放置黑名单
    const blackList = computed(() => {
      return union(
        ...props.parentWidgets
          .filter((_) => {
            const arr = getBlackList(_.type);
            return arr.length > 0;
          })
          .map((_) => getBlackList(_.type)),
      );
    });

    let dropCollect!: Ref<IDropCollect>;

    if (config.value.isDrop !== false) {
      const [collect, drop] = useDrop<
        IDragDataItem<LowCodeWidget.BasicSchema>,
        IDropResult,
        IDropCollect
      >({
        accept: DESIGN_TYPE,
        collect(monitor) {
          const isShallowOver = monitor.isOver({ shallow: true });
          return {
            handlerId: monitor.getHandlerId() as string,
            canDrop: monitor.canDrop(),
            isShallowOver,
            isOver: monitor.isOver(),
          };
        },
        hover(item, monitor) {
          if (!monitor.isOver({ shallow: true }) || !monitor.canDrop()) {
            return;
          }
          c.state.dropContainer = last(props.parentWidgets)!;
        },
        canDrop(item, monitor) {
          const isShallowOver = monitor.isOver({ shallow: true });
          if (isShallowOver !== true) {
            return false;
          }
          return canDrop(props.config, props.parentWidgets, item, whiteList.value, blackList.value);
        },
        drop(item, monitor) {
          if (!monitor.isOver({ shallow: true })) {
            return;
          }
          const asyncDrop = async (): Promise<IDropResultData> => {
            const hooks = getWidgetHooks(item.data.type);
            if (hooks.drop) {
              const result = await hooks.drop(
                c,
                item.mode,
                props.parentWidgets,
                props.parentChildren,
                item.data,
              );
              if (result == null) {
                return {
                  group: props.group,
                  success: false,
                };
              }
            }
            emit('move', props.isBefore, props.item, item);
            return {
              group: props.group,
              success: true,
            };
          };
          return {
            asyncDrop: asyncDrop(),
          };
        },
        options: config.value.dropOptions,
      });
      dropCollect = collect;
      drop(elRef);
    }

    return { ns, getStyleObj, elRef, dropCollect, isExpansion };
  },
  render() {
    return (
      <div
        ref="elRef"
        style={this.getStyleObj()}
        class={[this.ns.b(), this.ns.e(this.direction), this.ns.is('show', this.isExpansion)]}
      >
        <div
          class={[
            this.ns.b('drop-container'),
            this.ns.be('drop-container', this.direction),
            this.ns.is('show', this.isExpansion),
            this.ns.is('can-drop', this.dropCollect.canDrop && this.dropCollect.isShallowOver),
            this.ns.is('not-drop', !this.dropCollect.canDrop && this.dropCollect.isShallowOver),
          ]}
        >
          <div class={this.ns.bem('drop-container', this.direction, 'start-line')}></div>
          <div class={[this.ns.bem('drop-container', this.direction, 'line')]}></div>
          <div class={this.ns.bem('drop-container', this.direction, 'end-line')}></div>
        </div>
      </div>
    );
  },
});
