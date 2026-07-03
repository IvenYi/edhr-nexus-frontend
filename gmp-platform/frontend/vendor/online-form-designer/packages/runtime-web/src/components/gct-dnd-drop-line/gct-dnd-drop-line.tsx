import { defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  IGctDndConfig,
  IGctDndData,
  IGctDragDndData,
  IGctDropCollect,
  IGctDropResult,
  IGctDropResultData,
} from '@gct/runtime';
import { useDrop } from 'vue3-dnd';
import { cloneDeep } from 'lodash-es';
import './gct-dnd-drop-line.scss';

export const GctDndDropLine = defineComponent({
  name: 'GctDndDropLine',
  props: {
    config: {
      type: Object as PropType<IGctDndConfig>,
      required: true,
    },
    // 特殊指定当前线激活
    active: {
      type: Boolean,
      default: false,
    }
  },
  emits: ['drop'],
  setup(props, { emit }) {
    const { config } = props;
    const ns = useNamespace('dnd-drop-line');
    const rootRef = ref<HTMLDivElement | null>(null);
    const [collect, drop] = useDrop<IGctDragDndData, IGctDropResult, IGctDropCollect>({
      accept: props.config.group,
      collect: (monitor) => {
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
          emit('drop', data);
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
    return { ns, rootRef, collect };
  },
  render() {
    return (
      <div
        ref="rootRef"
        class={[
          this.collect.handlerId,
          this.ns.b(),
          this.ns.is('over', this.collect.isOver && this.collect.canDrop),
          this.ns.is('shallow-over', this.collect.isShallowOver && this.collect.canDrop),
          this.ns.is('not-drop', this.collect.canDrop === false && this.collect.isShallowOver),
          this.ns.is('active', this.active)
        ]}
      >
        <div class={this.ns.e('line')}></div>
      </div>
    );
  },
});
