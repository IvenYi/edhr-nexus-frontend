import { defineComponent, PropType, provide, reactive, ref, watch } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { useDrop } from 'vue3-dnd';
import {
  GCT_DND_INSERT_POS,
  IGctDndConfig,
  IGctDndData,
  IGctDragDndData,
  IGctDropCollect,
  IGctDropResult,
} from '@gct/runtime';
import GctDndItem from '../gct-dnd-item/gct-dnd-item';
import { GctDndDropLine } from '../gct-dnd-drop-line/gct-dnd-drop-line';
import { cloneDeep } from 'lodash-es';
import './gct-dnd-container.scss';

export const GctDndContainer = defineComponent({
  name: 'GctDndContainer',
  props: {
    config: {
      type: Object as PropType<IGctDndConfig>,
      default: () => {
        return { group: 'GctDnd', insertPos: GCT_DND_INSERT_POS.LAST } as IGctDndConfig;
      },
    },
    items: {
      type: Array as PropType<IGctDndData[]>,
      default: () => [],
    },
  },
  emits: ['update:items'],
  setup(props, { emit }) {
    const { config } = props;
    const ns = useNamespace('dnd-container');
    const rootRef = ref<HTMLDivElement | null>(null);
    // 拖拽线状态
    const dropLineState = reactive({ activeKey: '', isBeforeHover: false });
    provide('vue3-dnd-drop-line-state', dropLineState);

    const [collect, drop] = useDrop<IGctDragDndData, IGctDropResult, IGctDropCollect>({
      accept: config.group,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId() as string,
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
          isShallowOver: monitor.isOver({ shallow: true }),
        };
      },
      canDrop(item) {
        if (config.isDrop === false) {
          return false;
        }
        if (config.canDrop) {
          return config.canDrop(item);
        }
        return true;
      },
      drop: (item, monitor) => {
        if (collect.value.isShallowOver !== true || monitor.canDrop() === false) {
          return;
        }
        const callback = async () => {
          let data: IGctDndData | null = item.data;
          if (config.drop) {
            data = await config.drop(item);
            if (!data) {
              return {
                group: config.group,
                success: false,
                cfg: cloneDeep(props.config),
              };
            }
          }
          const i = props.items.findIndex((_) => _.id === item.data.id);
          // 数据不存在才可以从容器拖入
          if (i === -1) {
            onDrop(props.config.insertPos as GCT_DND_INSERT_POS, data);
          }
          emit('update:items', props.items);
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
    if (config.isDrop !== false) {
      drop(rootRef);
    }

    watch(collect, () => {
      if (collect.value.isOver !== true) {
        dropLineState.activeKey = '';
      }
    });

    /**
     * 拖拽结束放置逻辑
     *
     * @param {GCT_DND_INSERT_POS} insertPos
     * @param {IGctDndData} data
     * @param {number} [insertIndex=-1] 指定放置前后时，需要指定插入谁的前后
     */
    function onDrop(
      insertPos: GCT_DND_INSERT_POS,
      data: IGctDndData,
      insertIndex: number = -1,
    ): void {
      if (!data) {
        console.error('data is required');
        return;
      }
      if (insertPos === GCT_DND_INSERT_POS.FIRST) {
        props.items.unshift(data);
      } else if (insertPos === GCT_DND_INSERT_POS.LAST) {
        props.items.push(data);
      } else {
        if (insertIndex === -1) {
          console.error('insertIndex is required');
          return;
        }
        const i = props.items.findIndex((item) => item.id === data.id);
        // 在原本位置不做任何操作
        if (i === insertIndex) {
          return;
        }
        // 新位置在前，先删除，再插入
        if (i !== -1 && insertIndex < i) {
          props.items.splice(i, 1);
        }
        if (insertPos === GCT_DND_INSERT_POS.AFTER) {
          // 插入后，在指定位置 + 1
          props.items.splice(insertIndex + 1, 0, data);
        } else {
          // 插入前，在指定位置
          props.items.splice(insertIndex, 0, data);
        }
        // 新位置在后，先插入，再删除
        if (i !== -1 && insertIndex > i) {
          props.items.splice(i, 1);
        }
      }
      emit('update:items', props.items);
    }

    return { ns, rootRef, dropLineState, collect, onDrop };
  },
  render() {
    const last = this.items[this.items.length - 1];
    return (
      <div
        ref="rootRef"
        class={[
          this.collect.handlerId,
          this.ns.b(),
          this.ns.is('over', this.collect.isOver && this.collect.canDrop),
          this.ns.is('not-drop', this.collect.canDrop === false && this.collect.isOver),
          this.ns.is('shallow-over', this.collect.isShallowOver && this.collect.canDrop),
        ]}
      >
        {this.$slots.before?.()}
        {this.items.map((item, i) => {
          const before = this.items[i - 1];
          const contents: unknown[] = [];
          if (this.config.isDrop !== false) {
            contents.push(
              <GctDndDropLine
                key={item.id + '___line'}
                config={this.config}
                active={
                  (this.dropLineState.isBeforeHover === true &&
                    this.dropLineState.activeKey === item.id) ||
                  (before &&
                    this.dropLineState.activeKey === before.id &&
                    this.dropLineState.isBeforeHover === false)
                }
                onDrop={(data) => this.onDrop(GCT_DND_INSERT_POS.BEFORE, data, i)}
              />,
            );
          }
          contents.push(
            <GctDndItem
              key={item.id}
              config={this.config}
              index={i}
              data={item}
              last={i === this.items.length - 1}
              onDrop={(pos, data) => this.onDrop(pos, data, i)}
            >
              {{ default: this.$slots.default }}
            </GctDndItem>,
          );
          return contents;
        })}
        {last ? (
          <GctDndDropLine
            key={last.id + '___last-line'}
            config={this.config}
            active={
              this.dropLineState.activeKey === last.id && this.dropLineState.isBeforeHover === false
            }
            onDrop={(data) => this.onDrop(GCT_DND_INSERT_POS.AFTER, data, this.items.length - 1)}
          />
        ) : null}
        {this.$slots.after?.()}
      </div>
    );
  },
});

export default GctDndContainer;
