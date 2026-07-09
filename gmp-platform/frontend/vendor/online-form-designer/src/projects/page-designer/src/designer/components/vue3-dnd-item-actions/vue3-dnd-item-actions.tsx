import { computed, defineComponent, inject, nextTick, onMounted, ref, toRefs } from 'vue';
import {
  FormComponents,
  LowCodeWidget,
  MaterialEnum,
  PanelEnum,
  Platform,
  SCOPE,
  stopEvent,
  t,
  useNamespace,
} from '@gct/runtime';
import { useElementBounding } from '@vueuse/core';
import { useDrag } from 'vue3-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DesignItemActionTag, IDesignItemAction } from '@gct/runtime-design';
import { isEmpty } from 'lodash-es';
import { IDragCollect, IDragDataItem, IDropResult } from '../../interface';
import { DESIGN_DATA_KEY_TAG, DESIGN_TYPE, DesignItemAttribute } from '../../../constant';
import { useSelectedWidget } from '../../../hooks/useSelectedWidget';
import { platform, togglePanel } from '../../../hooks/usePage';
import { useDesigner, useDesignerController } from '../../../hooks/useDesigner';
import { useAsyncOperateField } from '../../../components/widgets/hooks/useAsyncFields';
import { eachTree } from 'xe-utils';
import allWidgetInfo from '../../../schema';
import { findAllChildrenTypes } from '../../../utils';
import './vue3-dnd-item-actions.scss';

export const Vue3DndItemActions = defineComponent({
  name: 'Vue3DndItemActions',
  props: {
    top: {
      type: Number,
      default: 0,
    },
    left: {
      type: Number,
      default: 0,
    },
    selectEl: {
      type: HTMLDivElement,
    },
    halfRect: {
      type: Object,
      required: true,
    },
    rootTag: {
      type: String,
      required: true,
    },
    selectParent: {
      type: Function,
    }
  },
  setup(props) {
    const ns = useNamespace('vue3-dnd-item-actions');

    const elRef = ref<HTMLElement | null>(null);

    const dragRef = ref<HTMLElement | null>(null);

    const { selectEl } = toRefs(props);

    const c = useDesignerController();

    const { width, height } = useElementBounding(elRef);

    const { emitCache, pageJson, subTableModalState, subTableModalId, unbindLoByWidgetId } =
      useDesigner();

    const {
      selectedRef,
      selectedParentRef,
      selectedParentChildrenRef,
      selectedConfigRef,
      setHoverWidget,
      resetSelectedWidget,
    } = useSelectedWidget();

    const { unBindAsyncStatus } = useAsyncOperateField();

    const isShow = computed(() => {
      if (!selectEl.value) {
        return true;
      }
      const { top, right, bottom, left } = props.halfRect;
      return !(
        top > 0 ||
        right > 0 ||
        bottom - selectEl.value.clientHeight > 0 ||
        left - selectEl.value.clientWidth > 0
      );
    });

    const scope: SCOPE = inject('scope') || SCOPE.PAGE;

    const style = computed(() => {
      return {
        opacity: isShow.value ? 1 : 0,
        top: `${props.top - height.value}px`,
        left: `${props.left - width.value}px`,
      };
    });

    const actions = computed<IDesignItemAction[]>(() => {
      const arr = [
        {
          tag: DesignItemActionTag.SELECT_PARENT,
          icon: 'icon-fuzujian',
          tooltip: window.$t('sys.designView.tips.selectParent'),
        },
      ];
      if (selectedConfigRef.value.isDelete !== false) {
        arr.push({
          tag: DesignItemActionTag.DELETE,
          icon: 'icon-shanchu1',
          tooltip: window.$t('sys.designView.tips.delete'),
        });
      }
      return arr;
    });

    const selectParentWidget = () => {
      if (isEmpty(selectedParentRef.value) || selectedParentRef.value.id === props.rootTag) {
        if (props.selectParent) {
          props.selectParent();
          return;
        }
        togglePanel(PanelEnum.PAGE);
        resetSelectedWidget(scope);
      } else {
        c.hooks.setSelect.callSync(null, selectedParentRef.value.id);
      }
    };

    const deleteWidget = () => {
      const parentChildren = selectedParentChildrenRef.value;
      if (parentChildren && parentChildren.length > 0) {
        const parent = selectedParentRef.value;
        const indexOfParentList: number = parentChildren.findIndex((_) => {
          return _.id === selectedRef.value!.id;
        });
        let nextSelected: LowCodeWidget.BasicSchema;
        if (parentChildren.length === 1) {
          if (parent) {
            nextSelected = parent;
          }
        } else if (parentChildren.length === 1 + indexOfParentList) {
          nextSelected = parentChildren[indexOfParentList - 1];
        } else {
          // 找当前节点后的第一个非自读组件，若没有，则找当前节点前的第一个非自读组件，若没有，则选中父节点
          const eIdx = parentChildren.findIndex(
            (e, i) => i > indexOfParentList && !e.isReadonlyWidget,
          );
          if (eIdx > -1) {
            nextSelected = parentChildren[eIdx];
          } else {
            const fIdx = parentChildren.findLastIndex(
              (e, i) => i < indexOfParentList && !e.isReadonlyWidget,
            );
            if (fIdx > -1) nextSelected = parentChildren[fIdx];
            else if (parent) nextSelected = parent;
          }
        }

        nextTick(() => {
          const widget = selectedRef.value;
          if (!widget) {
            return;
          }
          if (
            subTableModalState.value &&
            widget.isField &&
            (widget as any).materialType === MaterialEnum.MaterialSubTableModalField
          ) {
            unBindAsyncStatus(subTableModalId.value);
          }
          const i = parentChildren.findIndex((_) => {
            return _.id === selectedRef.value!.id;
          });
          // eslint-disable-next-line vue/no-mutating-props
          parentChildren.splice(i, 1);
          c.force();
          // 当操作按钮是关闭的情况不能选中
          if (
            isEmpty(nextSelected) ||
            (!isEmpty(nextSelected) &&
              nextSelected.type === FormComponents.BottomButtonContainer &&
              !pageJson.pageConfig.hasFooter)
          ) {
            togglePanel(PanelEnum.PAGE);
            resetSelectedWidget(scope);
          } else {
            nextTick(() => {
              c.hooks.setSelect.callSync(null, nextSelected.id);
            });
          }
          //删除组件的时候 要删除permissions的映射
          if (pageJson.permissions[widget.id!]) {
            delete pageJson.permissions[widget.id!];
          }
          unbindLoByWidgetId(widget.id);
          eachTree(widget.children! ?? [], (node: LowCodeWidget.BasicSchema) => {
            unbindLoByWidgetId(node.id);
            if (platform.value === Platform.WEB) {
              allWidgetInfo.webWidgetLoopCallback[node.type]?.(node, unbindLoByWidgetId);
            } else {
              allWidgetInfo.mobileWidgetLoopCallback[node.type]?.(node, unbindLoByWidgetId);
            }
          });
          emitCache();
        });
      }
    };

    const onAction = (e: MouseEvent, action: IDesignItemAction) => {
      e.stopPropagation();
      if (action.tag === DesignItemActionTag.SELECT_PARENT) {
        selectParentWidget();
      } else if (action.tag === DesignItemActionTag.DELETE) {
        deleteWidget();
      }
    };

    const key = computed(() => {
      return DESIGN_DATA_KEY_TAG;
    });

    const keyVal = computed<string>(() => {
      return selectedRef.value[key.value] || '';
    });

    const [collect, drag, preview] = useDrag<
      IDragDataItem<LowCodeWidget.BasicSchema>,
      IDropResult,
      IDragCollect
    >({
      type: DESIGN_TYPE,
      item: () => {
        c.state.isDragging = true;
        const types = findAllChildrenTypes(selectedRef.value as LowCodeWidget.BasicSchema);
        return {
          dragType:
            selectEl.value?.getAttribute(DesignItemAttribute.DRAG_GROUP_TYPE) || DESIGN_TYPE,
          id: keyVal.value,
          group: selectEl.value?.getAttribute(DesignItemAttribute.GROUP_TAG) || 'default',
          data: selectedRef.value,
          mode: 'move',
          index: Number(selectEl.value?.getAttribute(DesignItemAttribute.INDEX_TAG) || -1),
          types,
        } as IDragDataItem<LowCodeWidget.BasicSchema>;
      },
      collect: (monitor) => {
        const isDragging = monitor.isDragging();
        if (selectEl.value) {
          if (isDragging) {
            selectEl.value.setAttribute('is-action-dragging', 'true');
          } else {
            selectEl.value.setAttribute('is-action-dragging', 'false');
          }
        }
        return {
          canDrag: monitor.canDrag(),
          isDragging,
        };
      },
      canDrag(_monitor) {
        return true;
      },
      end: async (item, monitor) => {
        c.state.isDragging = false;
        selectEl.value?.removeAttribute('is-action-dragging');
        const children = selectedParentChildrenRef.value;
        const r = monitor.getDropResult();
        const group = selectEl.value?.getAttribute(DesignItemAttribute.GROUP_TAG) || 'default';
        if (r && r.asyncDrop) {
          const result = await r.asyncDrop;
          if (result && result.success && result.group !== group) {
            const i = children.findIndex((e) => e.id === item.id);
            if (i !== -1) {
              children.splice(i, 1);
              c.force();
              nextTick(() => {
                c.changeSelectHighlight();
              });
            }
          }
        }
        setHoverWidget();
        c.cancelExpansion();
      },
      options: {
        dropEffect: 'move',
      },
    });

    drag(dragRef);

    onMounted(() => {
      preview(getEmptyImage(), { captureDraggingState: true });
    });

    return { ns, elRef, dragRef, style, actions, isShow, selectedConfigRef, onAction, collect };
  },
  render() {
    return (
      <div ref="elRef" class={this.ns.b()} style={this.style} onClick={stopEvent}>
        <div class={this.ns.e('mask')}></div>
        <span
          v-show={this.selectedConfigRef.isDrag === true}
          ref="dragRef"
          class={[this.ns.e('item'), this.ns.em('item', 'drag')]}
        >
          <a-tooltip placement="top" visible={this.collect.isDragging ? false : undefined}>
            {{
              title: () => t('sys.pageDesigner.move'),
              default: () => <i class="iconfont icon-yidong" />,
            }}
          </a-tooltip>
        </span>
        {this.actions.map((action) => {
          const content = (
            <i
              title={action.tooltip}
              class={`iconfont ${action.icon}`}
              onClick={(e) => this.onAction(e, action)}
            />
          );
          return (
            <span class={this.ns.e('item')}>
              {action.tooltip ? (
                <a-tooltip placement="top">
                  {{
                    title: () => action.tooltip,
                    default: () => content,
                  }}
                </a-tooltip>
              ) : (
                content
              )}
            </span>
          );
        })}
      </div>
    );
  },
});
