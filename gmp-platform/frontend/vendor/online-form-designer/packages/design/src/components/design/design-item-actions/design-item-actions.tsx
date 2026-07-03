import { computed, defineComponent, ref, toRefs, watch } from 'vue';
import { stopEvent, useNamespace } from '@gct/runtime';
import { useElementBounding } from '@vueuse/core';
import { useDrag } from 'vue3-dnd';
import { IDragDataItem } from '@gct/base';
import { clone } from 'lodash-es';
import { useDesignViewController } from '../../../hooks';
import { IDesignItemAction, IDragCollect, IDropResult, INodeProvider } from '../../../interface';
import { NodeRegister } from '../../../register';
import { DesignItemActionTag, DesignItemAttribute, DesignViewPrefix } from '../../../constant';
import './design-item-actions.scss';

export const DesignItemActions = defineComponent({
  name: 'DesignItemActions',
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
  },
  setup(props) {
    const ns = useNamespace('design-item-actions');

    const c = useDesignViewController();

    const elRef = ref<HTMLElement | null>(null);

    const dragRef = ref<HTMLElement | null>(null);

    const { width, height } = useElementBounding(elRef);

    const { selectEl } = toRefs(props);

    const selectRef = computed(() => {
      return props.selectEl;
    });

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

    const style = computed(() => {
      return {
        opacity: c.store.isDragging || isShow.value !== true ? 0 : 1,
        top: `${props.top - height.value}px`,
        left: `${props.left - width.value}px`,
      };
    });

    const provider = ref<INodeProvider | null>(null);

    watch(
      () => c.store.selected,
      () => {
        if (c.store.selected) {
          provider.value = NodeRegister.get(c.store.selected.type, c.store.prefix) as any;
        } else {
          provider.value = null;
        }
      },
    );

    const isDrag = computed(() => {
      if (provider.value) {
        return provider.value.isDrag;
      }
      return true;
    });

    const actions = computed<IDesignItemAction[]>(() => {
      if (provider.value) {
        return provider.value.actions || [];
      }
      return [];
    });

    const onAction = (e: MouseEvent, action: IDesignItemAction) => {
      if (c.store.selected) {
        e.stopPropagation();
        if (provider.value && provider.value.onClick) {
          if (provider.value.onClick(c, c.store.selected, action)) {
            return;
          }
        }
        const pKey = c.store.getParentKey(c.store.selected.id);
        switch (action.tag) {
          case DesignItemActionTag.DELETE:
            c.store.deleteNode(c.store.selected);
            if (pKey) {
              c.store.setActive(c.store.getNode(pKey));
            } else {
              c.store.setActive(c.store.pageNode);
            }
            break;
          case DesignItemActionTag.SELECT_PARENT:
            if (pKey) {
              c.store.setActive(c.store.getNode(pKey));
            } else {
              c.store.setActive(c.store.pageNode);
            }
            break;
          default:
            break;
        }
      }
    };

    const [_collect, drag, preview] = useDrag<IDragDataItem, IDropResult, IDragCollect>({
      type: DesignViewPrefix.CUSTOM_HOME,
      item: () => {
        // 开启正在拖拽状态
        c.store.setDragging(true);
        const el = document.getElementById(c.store.selected!.id)!;
        const data: any = {
          data: clone(c.store.selected!),
          group: el.getAttribute(DesignItemAttribute.GROUP_TAG)!,
          id: c.store.selected!.id,
          index: Number(el.getAttribute(DesignItemAttribute.INDEX_TAG)!),
          mode: 'move',
          types: c.types(c.store.selected!),
        };
        return data;
      },
      collect: (monitor) => {
        const isDragging = monitor.isDragging();
        if (selectRef.value) {
          if (isDragging) {
            selectRef.value.setAttribute('is-action-dragging', 'true');
          }
        }
        return {
          canDrag: monitor.canDrag(),
          isDragging,
        };
      },
      end: async (_, monitor) => {
        c.store.setDragging(false);
        const r = monitor.getDropResult();
        if (r && r.asyncDrop) {
          const result = await r.asyncDrop;
          if (result && result.success) {
            // 执行成功
          }
        }
        selectRef.value!.removeAttribute('is-action-dragging');
        c.dropEnd();
      },
      options: {
        dropEffect: 'move',
      },
    });

    drag(dragRef);

    return { ns, c, elRef, dragRef, provider, style, isDrag, actions, onAction, preview };
  },
  render() {
    return (
      <div ref="elRef" class={this.ns.b()} style={this.style} onClick={stopEvent}>
        <div class={this.ns.e('mask')}></div>
        <span
          v-show={this.provider?.isDrag === true}
          ref="dragRef"
          class={[this.ns.e('item'), this.ns.em('item', 'drag')]}
        >
          <i class="iconfont icon-yidong" />
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
