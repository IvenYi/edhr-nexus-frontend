import { computed, defineComponent, ref, toRefs, onUnmounted, Ref, watch, onMounted } from 'vue';
import { LowCodeWidget, useNamespace } from '@gct/runtime';
import { intersection, union } from 'lodash-es';
import { useDrop } from 'vue3-dnd';
import { Vue3DndNotFound } from '../vue3-dnd-not-found/vue3-dnd-not-found';
import {
  IDragDataItem,
  IDropResult,
  IVue3DndItemOptions,
  IDropCollect,
  IDropResultData,
} from '../../interface';
import { DESIGN_TYPE } from '../../../constant';
import { useSelectedWidget } from '../../../hooks/useSelectedWidget';
import { useDesigner, useDesignerController } from '../../../hooks/useDesigner';
import { canDrop } from '../../utils';
import { useResizeObserver } from '@vueuse/core';
import './vue3-dnd-container.scss';

export const Vue3DndContainer = defineComponent({
  name: 'Vue3DndContainer',
  props: {
    isRoot: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: String,
      required: true,
    },
    opts: {
      type: Object as PropType<IVue3DndItemOptions>,
      default: () => {
        return {};
      },
    },
    // 父部件
    parentWidgets: {
      type: Array<LowCodeWidget.BasicSchema>,
      required: true,
    },
    // 绘制的部件清单
    widgets: {
      type: Array<LowCodeWidget.BasicSchema>,
      default: () => [],
    },
    // 绘制的部件清单
    children: {
      type: Array<LowCodeWidget.BasicSchema>,
      default: () => [],
    },
    widget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
      required: true,
    },
    // 是否开启拖拽功能
    isDrag: {
      type: Boolean,
      default: true,
    },
    dragPlaceholder: {
      type: String,
      default: '拖拽组件到这里',
    },
  },
  emits: ['drop'],
  setup(props, { emit }) {
    const ns = useNamespace('vue3-dnd-container');

    const rootRef = ref<HTMLDivElement | null>(null);

    const c = useDesignerController();

    const { getWidgetHooks, getWhiteList, getBlackList } = useDesigner();

    const { setHoverWidget } = useSelectedWidget();

    const { opts: config, widget } = toRefs(props);

    const count = ref(0);

    function force(): void {
      count.value += 1;
    }

    useResizeObserver(rootRef, () => {
      force();
    });

    function onScroll(): void {
      force();
    }

    onMounted(() => {
      if (rootRef.value) {
        rootRef.value.onscrollend = () => {
          force();
        };
      }
    });

    watch(
      () => c.state.expansionContainerList.length,
      () => {
        if (rootRef.value) {
          if (c.state.expansionContainerList.length === 0) {
            rootRef.value.removeEventListener('scroll', onScroll);
          } else {
            rootRef.value.addEventListener('scroll', onScroll);
          }
        }
      },
    );

    const getMaskStyle = () => {
      if (rootRef.value) {
        const s = {
          count: count.value,
          width: rootRef.value.scrollWidth + 'px',
          height: rootRef.value.scrollHeight + 'px',
        };
        return s;
      }
      return {};
    };

    const hookSetExpansion = (widgets: LowCodeWidget.BasicSchema[]) => {
      if (collect.value && collect.value.isOver && widget.value) {
        widgets.push(widget.value);
      }
    };
    c.hooks.expansion.tap(hookSetExpansion);
    onUnmounted(() => {
      c.hooks.expansion.removeTap(hookSetExpansion);
    });

    const isExpansion = computed(() => {
      if (c.state.expansionContainerList.length <= 0) {
        return false;
      }
      return c.state.expansionContainerList.findIndex((_) => _.id === widget.value!.id) !== -1;
    });

    const isDropMask = computed(() => {
      return (
        props.opts.isDrop &&
        collect.value &&
        ((collect.value.isShallowOver && collect.value.canDrop) ||
          (collect.value.isOver &&
            c.state.dropContainer &&
            widget.value.id === c.state.dropContainer.id))
      );
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

    let collect: Ref<IDropCollect | null> = ref(null);

    if (config.value.isDrop) {
      const [_collect, drop] = useDrop<
        IDragDataItem<LowCodeWidget.BasicSchema>,
        IDropResult,
        IDropCollect
      >({
        accept: DESIGN_TYPE,
        collect(monitor) {
          const isShallowOver = monitor.isOver({ shallow: true });
          if (isShallowOver === true) {
            setHoverWidget(widget.value);
          }
          return {
            handlerId: monitor.getHandlerId() as string,
            canDrop: monitor.canDrop(),
            isShallowOver,
            isOver: monitor.isOver(),
          };
        },
        hover(item, monitor) {
          if (monitor.canDrop() !== true || monitor.isOver({ shallow: true }) !== true) {
            return;
          }
          c.state.dropContainer = widget.value!;
        },
        canDrop(item, monitor) {
          if (widget.value && widget.value.id === item.id) {
            return false;
          }
          const isShallowOver = monitor.isOver({ shallow: true });
          if (isShallowOver !== true) {
            return false;
          }
          return canDrop(props.opts, props.parentWidgets, item, whiteList.value, blackList.value);
        },
        drop(item, monitor) {
          if (monitor.canDrop() === false || monitor.isOver({ shallow: true }) === false) {
            return;
          }
          const asyncDrop = async (): Promise<IDropResultData> => {
            const hooks = getWidgetHooks(item.data.type);
            if (hooks.drop) {
              const result = await hooks.drop(
                c,
                item.mode,
                props.parentWidgets,
                props.widgets,
                item.data,
              );
              if (result == null) {
                return {
                  group: props.groupId,
                  success: false,
                };
              }
            }
            emit('drop', item);
            return {
              group: props.groupId,
              success: true,
            };
          };
          return {
            asyncDrop: asyncDrop(),
          };
        },
      });
      // eslint-disable-next-line vue/no-ref-as-operand
      collect = _collect;
      drop(rootRef);
    }

    if (collect.value) {
      watch(collect, (_) => {
        if (_ && _.canDrop && _.isShallowOver) {
          if (widget.value) {
            c.setExpansion([widget.value]);
          }
        }
      });
    }

    return {
      ns,
      rootRef,
      parent,
      config,
      collect,
      isExpansion,
      isDropMask,
      getMaskStyle,
    };
  },
  render() {
    const c: any = this.collect || {};
    return (
      <div
        ref="rootRef"
        data-name={this.widget.alias}
        data-id={this.widget.id}
        class={[
          this.ns.b(),
          this.ns.is('with-root', this.isRoot),
          this.ns.is('shallow-over', c.isShallowOver),
          this.ns.is('over', c.isOver),
          this.ns.is('expansion', this.isExpansion),
          this.ns.is('not-children', this.widgets.length === 0),
        ]}
      >
        {this.widgets.length === 0 && this.config.isDrop ? (
          <Vue3DndNotFound
            showIcon={this.isRoot}
            message={this.widget.dropPlaceholder || this.dragPlaceholder}
          />
        ) : null}
        {this.$slots.default?.()}
        <div
          v-show={this.isDropMask}
          style={this.getMaskStyle()}
          class={this.ns.e('drop-mask')}
        ></div>
      </div>
    );
  },
});
