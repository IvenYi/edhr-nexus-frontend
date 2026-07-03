import {
  computed,
  defineComponent,
  inject,
  nextTick,
  onMounted,
  Ref,
  ref,
  toRefs,
  watch,
} from 'vue';
import { DisplayEnums, LowCodeWidget, SCOPE, useNamespace } from '@gct/runtime';
import {
  ConnectDragPreview,
  ConnectDragSource,
  DragPreviewOptions,
  DragSourceOptions,
  useDrag,
  useDrop,
} from 'vue3-dnd';
import {
  IDragCollect,
  IDragDataItem,
  IDropCollect,
  IDropResult,
  IDropResultData,
  IRenderOptions,
  IVue3DndItemOptions,
} from '../../interface';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DESIGN_TYPE, DesignItemAttribute } from '../../../constant';
import { useSelectedWidget } from '../../../hooks/useSelectedWidget';
import { clone, intersection, last, union } from 'lodash-es';
import { useDesigner, useDesignerController } from '../../../hooks/useDesigner';
import { calcStyle, findAllChildrenTypes } from '../../../utils';
import { canDrop } from '../../utils';
import { useWidget } from '../../../hooks/useWidget';
import './vue3-dnd-item.scss';

export const Vue3DndItem = defineComponent({
  name: 'Vue3DndItem',
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
    clone: {
      type: Function,
    },
    select: {
      type: Boolean,
      default: true,
    },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
    },
  },
  emits: ['select', 'remove', 'move'],
  setup(props, { emit }) {
    const ns = useNamespace('vue3-dnd-item');
    const inFormId = inject('inFormId', undefined);
    const elRef = ref<HTMLDivElement | null>(null);
    // 拖入元素放置在前 or 后
    const isBeforeHover = ref<boolean>(false);
    // 是否允许放置在前
    const isDropBefore = ref<boolean>(true);
    // 是否允许放置在后
    const isDropAfter = ref<boolean>(true);

    const { showMask } = useWidget({
      widget: props.item,
      parentWidget: last(props.parentWidgets)!,
      parentList: props.parentChildren,
      indexOfParentList: props.index,
    });

    const isInlineBlock = computed(() => {
      return props.item.display === DisplayEnums.INLINE_BLOCK;
    });

    const direction = computed(() => {
      if (isInlineBlock.value) {
        return 'vertical';
      }
      return props.direction || props.config.direction || 'vertical';
    });

    const scope: SCOPE = inject('scope') || SCOPE.PAGE;

    const c = useDesignerController();

    const styleObj = computed(() => {
      const obj = calcStyle(props.item.style, props.item.ignoringStyle);
      // 按钮类型强制内联
      if (isInlineBlock.value) {
        obj.display = 'inline-block';
      }
      const { ignoringStyle = [] } = props.item || {};
      ignoringStyle.forEach((key) => {
        obj[key] = undefined;
      });
      return obj;
    });

    const parentWidget = computed<LowCodeWidget.BasicSchema>(() => {
      return last(props.parentWidgets)!;
    });

    const { getWidgetHooks, getWhiteList, getBlackList } = useDesigner();

    const {
      selectedRef,
      setSelectedWidget,
      setHoverWidget,
      setSelectedParentWidgets,
      setSelectedConfig,
      setFocusFormContainer,
    } = useSelectedWidget();

    const isExpansion = computed(() => {
      if (parentWidget.value) {
        // 当父撑开时，所有子项也要呈现撑开模式
        return (
          c.state.expansionContainerList.findIndex((item) => item.id === parentWidget.value!.id) !==
          -1
        );
      }
      return false;
    });

    const onActive = (e: MouseEvent) => {
      e.stopPropagation();
      setSelect();
    };

    const setSelect = () => {
      if (props.select === false) {
        return;
      }
      setSelectedWidget(props.item, scope);
      setSelectedParentWidgets(props.parentWidgets);
      setSelectedConfig(clone(props.config));
      emit('select', props.item);
      setFocusFormContainer(inFormId);
    };

    const { config, parentWidgets, item } = toRefs(props);

    // 父数据发生变更时，重设选中设置。避免数据不同步
    watch(
      () => parentWidgets.value.length,
      () => {
        if (selectedRef.value?.id === item.value.id) {
          setSelect();
        }
      },
    );

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

    let dragCollect!: Ref<IDragCollect>;
    let dropCollect!: Ref<IDropCollect>;
    let drag!: ConnectDragSource<DragSourceOptions>;
    let preview!: ConnectDragPreview<DragPreviewOptions>;

    if (config.value.isDrag !== false) {
      const [collect, _drag, _preview] = useDrag<
        IDragDataItem<LowCodeWidget.BasicSchema>,
        IDropResult,
        IDragCollect
      >({
        type: DESIGN_TYPE,
        item: () => {
          c.state.isDragging = true;
          const types = findAllChildrenTypes(props.item);
          const data = props.clone ? props.clone(props.item) : props.item;
          return {
            dragType: config.value.type ?? DESIGN_TYPE,
            id: data.id || '',
            group: props.group,
            data,
            mode: config.value.mode,
            index: props.index,
            types,
          };
        },
        collect: (monitor) => {
          return {
            canDrag: monitor.canDrag(),
            isDragging: monitor.isDragging(),
          };
        },
        end: async (item, monitor) => {
          c.state.isDragging = false;
          const r = monitor.getDropResult();
          if (r && r.asyncDrop) {
            const result = await r.asyncDrop;
            if (result && result.success && result.group !== props.group) {
              emit('remove', props.item);
              c.force();
              nextTick(() => {
                c.changeSelectHighlight();
              });
            }
          }
          setHoverWidget();
          c.cancelExpansion();
        },
        options: config.value.dragOptions,
        previewOptions: config.value.previewOptions,
      });
      dragCollect = collect;
      drag = _drag;
      preview = _preview;
      if (props.config.isCustomDrop !== true) {
        drag(elRef);
      }
    }

    if (config.value.isDrop !== false) {
      const [collect, drop] = useDrop<
        IDragDataItem<LowCodeWidget.BasicSchema>,
        IDropResult,
        IDropCollect
      >({
        accept: DESIGN_TYPE,
        collect(monitor) {
          const isShallowOver = monitor.isOver({ shallow: true });
          if (isShallowOver) {
            setHoverWidget(props.item);
          }
          return {
            handlerId: monitor.getHandlerId() as string,
            canDrop: monitor.canDrop(),
            isShallowOver,
            isOver: monitor.isOver(),
          };
        },
        hover(item: any, monitor) {
          if (
            isExpansion.value ||
            monitor.canDrop() === false ||
            (dragCollect && dragCollect.value.isDragging === true) ||
            props.item === item.item
          ) {
            return;
          }
          const isOver = monitor.isOver({ shallow: true });
          if (isOver) {
            const rect = elRef.value!.getBoundingClientRect();
            const offset = monitor.getClientOffset()!;
            // 放置线计算偏移量
            const dropOffset = config.value.offset ?? 0;
            let difference: number = 0;
            if (direction.value === 'horizontal') {
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
            } else if (direction.value === 'vertical') {
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
            if (isBeforeHover.value) {
              isDropBefore.value = true;
            } else {
              isDropAfter.value = true;
            }
            c.state.dropContainer = parentWidget.value!;
          }
        },
        canDrop(item, monitor) {
          if (isExpansion.value || (dragCollect && dragCollect.value.isDragging === true)) {
            return false;
          }
          const isShallowOver = monitor.isOver({ shallow: true });
          if (isShallowOver !== true) {
            return false;
          }
          return canDrop(props.config, parentWidgets.value, item, whiteList.value, blackList.value);
        },
        drop(item, monitor) {
          isDropBefore.value = false;
          isDropAfter.value = false;
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
            emit('move', isBeforeHover.value, props.item, item);
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

    if (dropCollect && dropCollect.value) {
      watch(dropCollect, (_) => {
        if (_.canDrop && _.isShallowOver) {
          if (parentWidget.value) {
            c.setExpansion([parentWidget.value]);
          }
        }
      });
    }

    onMounted(() => {
      if (preview) {
        preview(getEmptyImage(), { captureDraggingState: true });
      }
      if (selectedRef.value && selectedRef.value.id === props.item.id) {
        setSelect();
      }
    });

    const displayName = computed(() => {
      if (props.item.formItem === true) {
        return window.$t(
          `sys.component.dataConnection.modelField.${props.item.props.fieldType}`,
          $t(props.item.name),
        );
      }
      return props.item.alias;
    });

    return {
      ns,
      elRef,
      styleObj,
      directionStr: direction,
      dragCollect,
      dropCollect,
      isExpansion,
      isBeforeHover,
      isDropBefore,
      isDropAfter,
      showMask,
      displayName,
      onActive,
      drag,
      preview,
    };
  },
  render() {
    const isShallowOver = this.dropCollect?.isShallowOver;
    return (
      <div
        {...{
          [DesignItemAttribute.NODE_ID_TAG]: this.item.id,
          [DesignItemAttribute.ACTIVE_TAG]: true,
          [DesignItemAttribute.DESIGN_NAME]: this.displayName,
          [DesignItemAttribute.DRAG_GROUP_TYPE]: this.config.type ?? DESIGN_TYPE,
          [DesignItemAttribute.GROUP_TAG]: this.group,
          [DesignItemAttribute.INDEX_TAG]: this.index,
          [DesignItemAttribute.SELECTOR_INDEX]: this.config.selectorIndex ?? 0,
        }}
        ref="elRef"
        class={[
          this.ns.b(),
          this.ns.is('dragging', this.dragCollect?.isDragging),
          this.ns.is('shallow-over', isShallowOver),
          this.ns.is('over', this.dropCollect?.isOver),
          this.ns.is(
            'drop-before',
            this.isDropBefore &&
              this.isBeforeHover === true &&
              isShallowOver &&
              this.isExpansion === false,
          ),
          this.ns.is(
            'not-drop-before',
            this.isDropBefore === false &&
              this.isBeforeHover === true &&
              isShallowOver &&
              this.isExpansion === false,
          ),
          this.ns.is(
            'drop-after',
            this.isDropAfter &&
              this.isBeforeHover === false &&
              isShallowOver &&
              this.isExpansion === false,
          ),
          this.ns.is(
            'not-drop-after',
            this.isDropAfter === false &&
              this.isBeforeHover === false &&
              isShallowOver &&
              this.isExpansion === false,
          ),
          this.ns.is('expansion', this.isExpansion),
        ]}
        style={this.styleObj}
        onClick={this.onActive}
      >
        {this.$slots.default?.({
          item: this.item,
          index: this.index,
          isDragging: this.dragCollect?.isDragging,
          isShallowOver: this.dropCollect?.isShallowOver,
          isOver: this.dropCollect?.isOver,
          isBeforeHover: this.isBeforeHover,
          isAfterHover: !this.isBeforeHover,
          direction: this.directionStr,
          drag: this.drag,
          preview: this.preview,
        } as IRenderOptions<any>)}
        {this.config.isDrag ? <div class={this.ns.e('dragging-mask')}></div> : null}
        {/* 项遮罩，当没有子的情况下遮住交互，避免出现异常操作 */}
        {this.showMask ? <div class={this.ns.e('item-mask')}></div> : null}
        {this.config.isDrop ? (
          <div
            class={[
              this.ns.b('indicator'),
              this.ns.be('indicator', this.directionStr),
              this.ns.is(
                'shallow-over',
                !this.dragCollect?.isDragging &&
                  this.dropCollect?.isShallowOver &&
                  this.dropCollect.canDrop,
              ),
              this.ns.is('before', isShallowOver && this.isBeforeHover),
              this.ns.is('after', isShallowOver && !this.isBeforeHover),
            ]}
          >
            <div class={[this.ns.bem('indicator', this.directionStr, 'start-line')]}></div>
            <div class={[this.ns.bem('indicator', this.directionStr, 'line')]}></div>
            <div class={[this.ns.bem('indicator', this.directionStr, 'end-line')]}></div>
          </div>
        ) : null}
      </div>
    );
  },
});
