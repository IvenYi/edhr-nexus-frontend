import { computed, defineComponent, PropType, ref, toRefs } from 'vue';
import { useGctFormValue, useNamespace } from '@gct/runtime';
import { IDesignNode } from '@gct/base';
import { useI18n } from 'vue-i18n';
import { useDrag, useDrop } from 'vue3-dnd';
import { IDragItem } from '../../../interface';
import './child-list-item-editor.scss';

export const ChildListItemEditor = defineComponent({
  name: 'ChildListItemEditor',
  props: {
    // 列表长度
    count: {
      type: Number,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    node: {
      type: Object as PropType<IDesignNode>,
      required: true,
    },
    fieldKey: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    showLabel: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    drag: {
      type: Boolean,
    },
    check: {
      type: Boolean,
    },
    delete: {
      type: Boolean,
    },
    editorType: {
      type: String,
    },
    editorProps: {
      type: Object,
      default: () => ({}),
    },
    moveCard: {
      type: Function,
      required: true,
    },
  },
  emits: ['check', 'delete', 'update:title', 'update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('child-list-item-editor');

    const isBeforeHover = ref<boolean>(false);

    const elRef = ref<HTMLDivElement>();

    const dragRef = ref<HTMLDivElement>();

    const { t } = useI18n() as any;

    const { checked, node } = toRefs(props);

    const radio = computed({
      get() {
        return checked.value;
      },
      set() {
        emit('check');
      },
    });

    const [dropCollect, drop] = useDrop<
      IDragItem,
      void,
      { handlerId: any | null; isShallowOver: boolean }
    >({
      accept: 'child-list-item-editor',
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
        if (props.node.id === item.id) {
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
      drop(item: IDragItem, _monitor) {
        if (props.node.id === item.id) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = props.index;

        props.moveCard(dragIndex, isBeforeHover.value ? hoverIndex : hoverIndex + 1);
      },
    }) as any;

    const [collect, drag, preview] = useDrag({
      type: 'child-list-item-editor',
      item: () => {
        return { id: props.node.id, index: props.index };
      },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    }) as any;

    drag(dragRef);
    drop(elRef);
    preview(elRef);

    const val = useGctFormValue();

    const i18nConfigValue = computed({
      get: () => {
        if (node.value.data.i18nConfig) {
          return node.value.data.i18nConfig;
        }
        return '';
      },
      set: (val) => {
        node.value.data.i18nConfig = val;
      },
    });

    const onDelete = () => {
      emit('delete');
    };

    const renderEditor = () => {
      if (props.editorType === 'i18n') {
        return (
          <i18n-select-input
            {...props.editorProps}
            v-model:i18nText={val.value}
            v-model:i18nConfig={i18nConfigValue.value}
            inputExtraProps={{ showCount: true, allowClear: false, maxlength: 32, size: 'small' }}
            forceUpdate
            attr={props.fieldKey}
          />
        );
      }
      if (props.editorType === 'number') {
        return (
          <a-input-number
            {...props.editorProps}
            v-model:value={val.value}
            size="small"
          ></a-input-number>
        );
      }
      return <a-input {...props.editorProps} v-model:value={val.value} size="small"></a-input>;
    };

    return {
      ns,
      t,
      radio,
      elRef,
      dragRef,
      dropCollect,
      collect,
      isBeforeHover,
      onDelete,
      renderEditor,
    };
  },
  render() {
    return (
      <div ref="elRef" class={this.ns.b()}>
        {this.drag ? (
          <span ref="dragRef" class={this.ns.e('drag')}>
            <i class="iconfont icon-drag" />
          </span>
        ) : null}
        {this.showLabel === true ? <span class={this.ns.e('label')}>{this.node.label}</span> : null}
        {this.check ? (
          <span class={this.ns.e('check')}>
            <a-radio v-model:checked={this.radio} />
          </span>
        ) : null}
        <span class={this.ns.e('editor')}>{this.renderEditor()}</span>
        <span v-show={this.count > 1} class={this.ns.e('delete')}>
          {this.delete !== false ? (
            <a-popconfirm
              placement="topRight"
              title={this.t('sys.appDesigner.customAppHome.deleteConfirm')}
              onConfirm={this.onDelete}
            >
              {{
                default: () => {
                  return <i class="iconfont icon-shanchu" />;
                },
              }}
            </a-popconfirm>
          ) : null}
        </span>
        {this.dropCollect.isShallowOver && !this.collect.isDragging ? (
          <div class={[this.ns.b('indicator'), this.ns.is('before', this.isBeforeHover)]}></div>
        ) : null}
      </div>
    );
  },
});
