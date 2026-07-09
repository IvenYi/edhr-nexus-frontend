import { defineComponent, nextTick, PropType, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useDrop } from 'vue3-dnd';
import { IDesignNode, IDragDataItem } from '@gct/base';
import { IDropCollect, IDropResult, IDropResultData } from '../../../interface';
import { DesignViewPrefix, InsertNodeMode } from '../../../constant';
import { useDesignViewController } from '../../../hooks';
import { NodeRegister } from '../../../register';
import { isCanCrop } from '../../../utils';
import './design-drop-line.scss';

export const DesignDropLine = defineComponent({
  name: 'DesignDropLine',
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
    parent: {
      type: Object as PropType<IDesignNode>,
      required: true,
    },
    // 当前项数据
    item: {
      type: Object as PropType<IDesignNode>,
      required: true,
    },
    // 当前项前一项数据
    beforeItem: {
      type: Object as PropType<IDesignNode>,
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
  setup(props) {
    const ns = useNamespace('design-drop-line');

    const elRef = ref<HTMLDivElement | null>(null);

    const c = useDesignViewController();

    const getStyleObj = () => {
      if (isExpansion.value === false && props.direction === 'vertical') {
        return {
          height: 'auto',
        };
      }
      return {};
    };

    const isExpansion = ref<boolean>(false);

    if (props.parent) {
      watch(
        () => c.store.count,
        () => {
          // 父展开时子项也需同步 UI 展开模式呈现
          isExpansion.value = c.store.isDragging && c.store.expansions.has(props.parent!.id);
        },
      );
    }

    const [collect, drop] = useDrop<IDragDataItem, IDropResult, IDropCollect>({
      accept: DesignViewPrefix.CUSTOM_HOME,
      collect(monitor) {
        const isShallowOver = monitor.isOver({ shallow: true });
        return {
          handlerId: monitor.getHandlerId() as string,
          canDrop: monitor.canDrop(),
          isShallowOver,
          isOver: monitor.isOver(),
        };
      },
      canDrop(item) {
        return isCanCrop(props.parent, c.store, item);
      },
      drop(item, monitor) {
        if (!monitor.isOver({ shallow: true })) {
          return;
        }
        const asyncDrop = async (): Promise<IDropResultData> => {
          let _data = item.data;
          const p = NodeRegister.get(_data.type, c.store.prefix)!;
          if (p.beforeDrop) {
            const data = await p.beforeDrop(c, item);
            if (!data) {
              return { group: props.group, success: false };
            }
            _data = data;
          }
          const success = c.store.insertNode(
            props.isBefore ? InsertNodeMode.BEFORE : InsertNodeMode.AFTER,
            props.item,
            _data,
          );
          if (success) {
            if (p.afterDrop) {
              const flag = await p.afterDrop(c, item);
              if (!flag) {
                return { group: props.group, success: false };
              }
            }
            const data = c.store.getNode(item.id);
            if (data) {
              nextTick(() => {
                c.store.setActive(data);
              });
            }
            return { group: props.group, success: true };
          }
          return { group: props.group, success: false };
        };
        return {
          asyncDrop: asyncDrop(),
        };
      },
    });
    drop(elRef);

    return { ns, getStyleObj, elRef, collect, isExpansion };
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
            this.ns.is('can-drop', this.collect.canDrop && this.collect.isShallowOver),
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
