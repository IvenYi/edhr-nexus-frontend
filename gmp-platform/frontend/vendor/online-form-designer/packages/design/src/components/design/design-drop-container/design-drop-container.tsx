import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { IDesignNode, IDragDataItem } from '@gct/base';
import { useDrop } from 'vue3-dnd';
import { clone } from 'lodash-es';
import { useResizeObserver } from '@vueuse/core';
import { IDropCollect, IDropResult, IDropResultData } from '../../../interface';
import { DesignViewPrefix } from '../../../constant';
import { useDesignViewController } from '../../../hooks';
import { NodeRegister } from '../../../register';
import { isCanCrop } from '../../../utils';
import './design-drop-container.scss';

export const DesignDropContainer = defineComponent({
  name: 'DesignDropContainer',
  props: {
    node: {
      type: Object as PropType<IDesignNode>,
      required: true,
    },
    items: {
      type: Array<IDesignNode>,
      required: true,
    },
    parent: {
      type: Object as PropType<IDesignNode>,
    },
    showInfo: {
      type: Boolean,
      default: true,
    },
    infoMsg: {
      type: String,
      default: 'sys.designView.drop.info',
    },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('design-drop-container');

    const rootRef = ref<HTMLElement | null>(null);

    const c = useDesignViewController();

    const group = computed(() => {
      return props.node.id;
    });

    const store = c.store;

    const provider = NodeRegister.get(props.node.type, store.prefix)!;

    // 容器展开钩子实现
    {
      // eslint-disable-next-line no-inner-declarations
      function onTapExpansion(keys: string[]): void {
        if (collect.value.isOver) {
          keys.push(props.node.id);
        }
      }
      c.hooks.expansion.tap(onTapExpansion);
      onUnmounted(() => {
        c.hooks.expansion.removeTap(onTapExpansion);
      });
    }

    const isExpansion = ref<boolean>(false);

    watch(
      () => store.count,
      () => {
        isExpansion.value = store.isDragging && store.expansions.has(props.node.id);
      },
    );

    const isDropMask = computed(() => {
      return (
        provider.isDrop &&
        collect.value &&
        ((collect.value.isShallowOver && collect.value.canDrop) ||
          (collect.value.isOver && store.dropContainer && props.node.id === store.dropContainer.id))
      );
    });

    const [collect, drop] = useDrop<IDragDataItem, IDropResult, IDropCollect>({
      accept: DesignViewPrefix.CUSTOM_HOME,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId() as string,
          canDrop: monitor.canDrop(),
          isShallowOver: monitor.isOver({ shallow: true }),
          isOver: monitor.isOver(),
        };
      },
      canDrop(item) {
        return isCanCrop(props.node, store, item);
      },
      drop(item, monitor) {
        if (monitor.canDrop() === false || monitor.isOver({ shallow: true }) === false) {
          return;
        }
        const asyncDrop = async (): Promise<IDropResultData> => {
          let data = clone(item.data);
          const p = NodeRegister.get(data.type, c.store.prefix)!;
          if (p.beforeDrop) {
            const _data = await p.beforeDrop(c, item);
            if (!data) {
              return { group: group.value, success: false };
            }
            data = _data!;
          }
          const oldPKey = c.store.getParentKey(data.id, null);
          const newPKey = props.node ? props.node.id : null;
          c.store.disableCache();
          const isNew = !c.store.map.has(data.id);
          const node = c.store.setNode(newPKey, data);
          if (node) {
            if (isNew === false) {
              c.store.moveTreeItem(oldPKey!, newPKey!, node.id);
            }
            c.store.enableCache();
            c.store.cacheHistory();
            if (p.afterDrop) {
              const bol = await p.afterDrop(c, item);
              if (bol === false) {
                return { group: group.value, success: false };
              }
            }
            nextTick(() => {
              c.store.setActive(node);
            });
          }
          return { group: group.value, success: true };
        };
        return { asyncDrop: asyncDrop() };
      },
    });
    drop(rootRef);

    watch(collect, (_) => {
      if (_.canDrop && _.isShallowOver) {
        store.dropContainer = props.node;
        c.setExpansion([props.node.id]);
      }
    });

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
      () => store.expansions.size,
      () => {
        if (rootRef.value) {
          if (store.expansions.size === 0) {
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

    return { ns, isExpansion, rootRef, collect, isDropMask, getMaskStyle };
  },
  render() {
    return (
      <div
        ref="rootRef"
        class={[
          this.ns.b(),
          this.ns.m(this.direction),
          this.ns.is('over', this.collect.isShallowOver && this.collect.canDrop),
          this.ns.is('expansion', this.isExpansion),
          this.ns.is('not-children', this.items.length === 0),
        ]}
      >
        {this.items.length === 0 && this.showInfo !== false ? (
          <div class={this.ns.e('drag-info')}>
            <span>{window.$t(this.infoMsg)}</span>
          </div>
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
