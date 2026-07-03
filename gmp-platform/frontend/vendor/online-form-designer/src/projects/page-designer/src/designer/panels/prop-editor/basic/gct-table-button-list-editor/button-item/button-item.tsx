import { computed, defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useDrag, useDrop } from 'vue3-dnd';
import { useI18n } from 'vue-i18n';
import './button-item.scss';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const ButtonItem = defineComponent({
  name: 'ButtonItem',
  props: {
    type: {
      type: String,
      default: 'button-item',
    },
    index: {
      type: Number,
      required: true,
    },
    data: {
      type: Object as PropType<IData>,
      required: true,
    },
    moveCard: {
      type: Function,
      required: true,
    },
  },
  emits: ['edit', 'delete'],
  setup(props, { emit }) {
    const { t } = useI18n() as any;

    const ns = useNamespace('button-item');

    const elRef = ref<HTMLDivElement>();

    const isBeforeHover = ref<boolean>(false);

    const [dropCollect, drop] = useDrop<
      DragItem,
      void,
      { handlerId: any | null; isShallowOver: boolean }
    >({
      accept: props.type,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
          isShallowOver: monitor.isOver({ shallow: true }),
        };
      },
      hover(item, monitor) {
        if (monitor.canDrop() === false || collect.value.isDragging === true) {
          return;
        }
        const isOver = monitor.isOver({ shallow: true });
        if (props.index === item.index) {
          return;
        }
        if (isOver) {
          const rect = elRef.value!.getBoundingClientRect();
          const offset = monitor.getClientOffset()!;
          let difference: number = 0;
          {
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
        }
      },
      drop(item: DragItem, _monitor) {
        if (props.index === item.index) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = props.index;

        props.moveCard(dragIndex, hoverIndex, isBeforeHover.value ? 'before' : 'after');
      },
    }) as any;

    const [collect, drag, preview] = useDrag({
      type: props.type,
      item: () => {
        return { id: props.data.id, index: props.index };
      },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    }) as any;

    const opacity = computed(() => (collect.value.isDragging ? 0.3 : 1));

    const setRef = (el: HTMLDivElement) => {
      drag(el) as HTMLDivElement;
    };

    const setPreview = (el: HTMLDivElement) => {
      preview(drop(el));
    };

    const edit = () => {
      emit('edit', props.data);
    };

    const del = () => {
      emit('delete', props.data);
    };

    return {
      t,
      ns,
      elRef,
      isBeforeHover,
      dropCollect,
      collect,
      opacity,
      setRef,
      setPreview,
      edit,
      del,
    };
  },
  render() {
    return (
      <div ref="elRef" class={this.ns.b()}>
        <div
          class={this.ns.b('drag')}
          ref={this.setPreview as any}
          style={{ opacity: this.opacity }}
        >
          <div
            class={this.ns.be('drag', 'icon')}
            ref={this.setRef as any}
            data-handler-id={this.dropCollect.handlerId}
          >
            <i class="iconfont icon-drag mover cursor-pointer mr8px text-[#C3C3C3]"></i>
          </div>
          <div class={this.ns.be('drag', 'label')}>{this.data.title || this.data.label}</div>
          <div class={this.ns.be('drag', 'actions')}>
            <div class={this.ns.be('drag', 'action-item')}>
              <a-tooltip placement="top">
                {{
                  title: () => this.t('sys.edit'),
                  default: () => {
                    return (
                      <i
                        v-show="!element.props.isEdit"
                        class="iconfont icon-bianji cursor-pointer ml8px primary-gct-hover text-[#797A7D]"
                        onClick={this.edit}
                      ></i>
                    );
                  },
                }}
              </a-tooltip>
            </div>
            <div class={this.ns.be('drag', 'action-item')}>
              <a-popconfirm
                placement="topLeft"
                title={this.t('sys.pageDesigner.areYouSureToDelete')}
                onConfirm={this.del}
              >
                <a-tooltip placement="top">
                  {{
                    title: () => this.t('sys.delete'),
                    default: () => (
                      <i class="iconfont icon-shanchu2 cursor-pointer ml8px error-gct-hover text-[#797A7D]"></i>
                    ),
                  }}
                </a-tooltip>
              </a-popconfirm>
            </div>
          </div>
        </div>
        {this.dropCollect.isShallowOver && !this.collect.isDragging ? (
          <div class={[this.ns.b('indicator'), this.ns.is('before', this.isBeforeHover)]}></div>
        ) : null}
      </div>
    );
  },
});
