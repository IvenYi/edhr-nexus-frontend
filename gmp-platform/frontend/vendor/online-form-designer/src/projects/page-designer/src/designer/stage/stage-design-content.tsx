import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  watch,
  PropType,
} from 'vue';
import { DisplayEnums, FormComponents, LowCodeWidget, Platform, useNamespace } from '@gct/runtime';
import { isNewDesigner } from '/@page-designer/hooks/useDesigner';
import { Vue3DndContainer } from '../components/vue3-dnd-container/vue3-dnd-container';
import {
  Vue3DndHighlighter,
  Vue3DndHighlighterBinding,
} from '../components/vue3-dnd-highlighter/vue3-dnd-highlighter';
import { useDesigner, useDesignerController } from '../../hooks/useDesigner';
import {
  IDragDataItem,
  IRenderContainerOptions,
  IRenderContentItemOptions,
  IVue3DndItemOptions,
} from '../interface';
import { useSelectedWidget } from '../../hooks/useSelectedWidget';
import { DESIGN_DATA_KEY_TAG, DesignItemAttribute } from '../../constant';
import { Vue3DndItem } from '../components/vue3-dnd-item/vue3-dnd-item';
import { Vue3DndNotDragItem } from '../components/vue3-dnd-not-drag-item/vue3-dnd-not-drag-item';
import WidgetEntry from '/@page-designer/components/widgets/widget-entry.vue';
import WidgetMobileEntry from '/@page-designer/components/widgets/widget-mobile-entry.vue';
import WidgetPadEntry from '/@page-designer/components/widgets/widget-pad-entry.vue';
import { clone, last, merge } from 'lodash-es';
import { Vue3DndDropLine } from '../components/vue3-dnd-drop-line/vue3-dnd-drop-line';
import { platform } from '/@page-designer/hooks/usePage';
import './stage-design-content.scss';

export const StageDesignContent = defineComponent({
  name: 'StageDesignContent',
  props: {
    pageStyle: {
      type: Object,
      default: () => {
        return {};
      },
    },
    widgets: {
      type: Array<LowCodeWidget.BasicSchema>,
      default: () => [],
    },
    parentWidget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
    },
    config: {
      type: Object as PropType<IVue3DndItemOptions>,
      default: () => ({}),
    },
    rootTag: {
      type: String,
      default: 'root',
    },
    selectParent: {
      type: Function as PropType<() => void>,
    }
  },
  setup(props) {
    const ns = useNamespace('stage-design-content');

    const rootRef = ref<HTMLDivElement>();

    const key = computed(() => {
      return DESIGN_DATA_KEY_TAG;
    });

    const c = useDesignerController();

    const highlightRef = ref<Vue3DndHighlighterBinding>();

    const { emitCache } = useDesigner();

    const { selectedRef, hoverRef, setSelectedParentChildrenRef } = useSelectedWidget();

    const config: IVue3DndItemOptions = {
      mode: 'move',
      direction: 'vertical',
      isDrag: true,
      isDrop: true,
    };

    // 虚拟根节点，用于界面结构计算
    const verticalRoot: LowCodeWidget.BasicSchema = {
      id: props.rootTag,
      type: props.rootTag,
      platform: platform.value,
      alias: '',
      name: props.rootTag,
      icon: '',
      style: {},
      props: {} as any,
      events: {},
    };

    const rootConfig: IVue3DndItemOptions = merge(clone(config), {
      direction: 'horizontal',
      ...props.config,
    });

    /**
     * 根据 id 查找设计元素项元素
     *
     * @param {string} id
     * @returns {*}  {(HTMLDivElement | null)}
     */
    function getDesignItemEl(id: string): HTMLDivElement | null {
      const els = rootRef.value!.querySelectorAll(`[${DesignItemAttribute.NODE_ID_TAG}="${id}"]`);
      if (els.length > 0) {
        let index = Number(els[0].getAttribute(DesignItemAttribute.SELECTOR_INDEX));
        if (Number.isNaN(index)) {
          index = 0;
        }
        return els[index] as HTMLDivElement;
      }
      return null;
    }

    /**
     * 变更选中渲染呈现
     *
     * @returns {*}  {void}
     */
    function changeSelected(): void {
      if (!highlightRef.value) {
        return;
      }
      if (selectedRef.value.id) {
        const el = getDesignItemEl(selectedRef.value.id);
        if (el) {
          highlightRef.value.setSelect(el as HTMLElement);
          return;
        }
      }
      highlightRef.value.setSelect();
    }

    // 给控制器中的钩子用
    function tapChangeSelected(): void {
      changeSelected();
    }

    function changeHover(): void {
      if (!highlightRef.value) {
        return;
      }
      if (hoverRef.value) {
        const el = getDesignItemEl(hoverRef.value.id!);
        if (el) {
          highlightRef.value.setHover(el as HTMLElement);
          return;
        }
      }
      highlightRef.value.setHover();
    }

    // 给控制器的钩子用
    function tapChangeHover(): void {
      changeHover();
    }

    watch(selectedRef, () => {
      changeSelected();
    });

    watch(hoverRef, () => {
      changeHover();
    });

    // 扩展容器数量发生变化时，选中和悬浮效果重新计算
    watch(c.state.expansionContainerList, () => {
      if (selectedRef.value) {
        nextTick(() => {
          setTimeout(() => {
            changeSelected();
          }, 300);
        });
      }
      if (hoverRef) {
        nextTick(() => {
          setTimeout(() => {
            changeHover();
          }, 300);
        });
      }
    });

    const onMouseHover = (e: MouseEvent) => {
      if (!highlightRef.value) {
        return;
      }
      const pathList = e.composedPath().filter((_) => {
        if (_ instanceof HTMLElement) {
          const el = _ as HTMLElement;
          const canDrop = el.getAttribute(DesignItemAttribute.ACTIVE_TAG);
          return canDrop == 'true';
        }
        return false;
      });
      if (pathList.length && pathList.length > 0) {
        const el = pathList[0] as HTMLElement;
        highlightRef.value.setHover(el);
      } else {
        if (highlightRef.value.isHover) {
          highlightRef.value.setHover();
        }
      }
    };

    const onMouseenter = (e: MouseEvent) => {
      e.stopPropagation();
      onMouseHover(e);
    };

    const onMouseleave = (e: MouseEvent) => {
      e.stopPropagation();
      onMouseHover(e);
    };

    onMounted(() => {
      rootRef.value!.addEventListener('mouseenter', onMouseenter);
      rootRef.value!.addEventListener('mouseleave', onMouseleave);
      rootRef.value!.addEventListener('mouseover', onMouseenter);
      rootRef.value!.addEventListener('mouseout', onMouseleave);
      c.hooks.selectHighlightChange.tap(tapChangeSelected);
      c.hooks.hoverHighlightChange.tap(tapChangeHover);
    });

    onBeforeUnmount(() => {
      rootRef.value!.removeEventListener('mouseenter', onMouseenter);
      rootRef.value!.removeEventListener('mouseleave', onMouseleave);
      rootRef.value!.removeEventListener('mouseover', onMouseenter);
      rootRef.value!.removeEventListener('mouseout', onMouseleave);
      c.hooks.selectHighlightChange.removeTap(tapChangeSelected);
      c.hooks.hoverHighlightChange.removeTap(tapChangeHover);
    });

    /**
     * 设置选中项
     *
     * @param {string} key
     */
    function setSelect(key: string): void {
      nextTick(() => {
        if (props.parentWidget && props.parentWidget.id === key) {
          props.selectParent && props.selectParent();
          return;
        }
        const el = rootRef.value!.querySelector(
          `[${DesignItemAttribute.NODE_ID_TAG}="${key}"]`,
        ) as HTMLDivElement;
        if (el) {
          el.click();
        }
      });
    }

    function onSetSelect(_, key) {
      setSelect(key);
    }

    c.hooks.setSelect.tap(onSetSelect);
    onUnmounted(() => {
      c.hooks.setSelect.removeTap(onSetSelect);
    });

    function onContainerMove(
      groupId: string,
      widgets: LowCodeWidget.BasicSchema[],
      item: IDragDataItem<LowCodeWidget.BasicSchema>,
    ): void {
      const { mode } = item;
      if (mode === 'create') {
        // 新建直接放到数组最后
        widgets.push(item.data);
        setSelect(item.data[key.value]);
      } else if (mode === 'move') {
        // 移动如果是同一个组下的，先删除再放到最后
        if (item.group === groupId) {
          const index = widgets.findIndex((_) => _[key.value] === item.id);
          widgets.splice(index, 1);
        }
        widgets.push(item.data);
      }
      emitCache();
      c.force();
      nextTick(() => {
        changeSelected();
      });
    }

    /**
     * 移动子数据
     */
    function onMove(
      config: IVue3DndItemOptions,
      widgets: LowCodeWidget.BasicSchema[],
      isBefore: boolean,
      data: LowCodeWidget.BasicSchema,
      dragData: IDragDataItem<LowCodeWidget.BasicSchema>,
    ): void {
      // 放置位置下标
      let index = widgets.findIndex((_) => _[key.value] === data[key.value]);
      if (isBefore === false) {
        // 放在当前元素之后，放置位置需加一
        index += 1;
      } else {
        // 放在当前元素之前，相当于把放置元素往后挤，所以下标不用动
      }
      // 新建模式直接放入数据不需要额外操作
      if (dragData.mode === 'create') {
        widgets.splice(index, 0, dragData.data);
        if (config.onDrop) {
          config.onDrop({ mode: 'create', index, oldIndex: -1, data: dragData.data }, widgets);
        }
        emitCache();
        c.force();
        setSelect(dragData.data[key.value]);
        return;
      }
      // move 模式需要查找旧数据位置再操作
      const oldIndex = widgets.findIndex((_) => _[key.value] === dragData.data[key.value]);
      // 原本不在列表中，直接放入
      if (oldIndex === -1) {
        widgets.splice(index, 0, dragData.data);
      } else {
        // 放入新位置
        widgets.splice(index, 0, widgets[oldIndex]);
        // 删除老位置数据
        if (index > oldIndex) {
          // 新位置在老位置之后，因为先插入位置无变动直接删除即可
          widgets.splice(oldIndex, 1);
        } else {
          // 新位置在老位置之前，因为先插入所以需要+1位置删除
          widgets.splice(oldIndex + 1, 1);
        }
      }
      if (config.onDrop) {
        config.onDrop({ mode: 'move', index, oldIndex, data: widgets[oldIndex] }, widgets);
      }
      emitCache();
      c.force();
      nextTick(() => {
        changeSelected();
      });
    }

    /**
     * 删除子数据
     */
    function onRemove(widgets: LowCodeWidget.BasicSchema[], data: LowCodeWidget.BasicSchema): void {
      const index = widgets.findIndex((_) => _[key.value] === data[key.value]);
      if (index !== -1) {
        widgets.splice(index, 1);
        c.force();
        nextTick(() => {
          c.changeSelectHighlight();
        });
      }
    }

    /**
     * 选中时的一些额外操作
     *
     * @param {LowCodeWidget.BasicSchema[]} children
     */
    function onSelect(children: LowCodeWidget.BasicSchema[]): void {
      setSelectedParentChildrenRef(children);
    }

    const { getAsyncWidget } = useDesigner();

    /**
     * 绘制部件项
     */
    const renderContentItem = (
      parentWidgets: LowCodeWidget.BasicSchema[],
      children: LowCodeWidget.BasicSchema[],
      args: IRenderContentItemOptions<LowCodeWidget.BasicSchema>,
    ) => {
      const parent = last(parentWidgets);
      const groupId = parent?.id || props.rootTag;
      const { widget, index: i } = args;

      let content: any = null;
      if (args.itemContent) {
        content = args.itemContent({ element: widget, index: i });
      } else if (args.content) {
        content = args.content;
      } else {
        content = renderItem(parentWidgets, widget, i);
        if (widget.formItem === true) {
          if (platform.value === Platform.WEB) {
            content = (
              <WidgetEntry widget={widget} onRemove={() => onRemove(children, widget)}>
                {content}
              </WidgetEntry>
            );
          } else if (platform.value === Platform.PAD) {
            content = (
              <WidgetPadEntry widget={widget} onRemove={() => onRemove(children, widget)}>
                {content}
              </WidgetPadEntry>
            );
          } else {
            content = (
              <WidgetMobileEntry widget={widget} onRemove={() => onRemove(children, widget)}>
                {content}
              </WidgetMobileEntry>
            );
          }
        }
      }

      const _props = args.props || {};

      let cfg = config;
      if (args.config) {
        cfg = merge(clone(cfg), args.config);
      }

      if (cfg.isDrop === false) {
        return (
          <Vue3DndNotDragItem
            key={widget.id}
            group={groupId}
            index={i}
            parentWidgets={parentWidgets}
            parentChildren={children}
            item={widget}
            config={cfg}
            onRemove={(data) => onRemove(children, data)}
            onSelect={() => onSelect(children)}
            {..._props}
          >
            {content}
          </Vue3DndNotDragItem>
        );
      }
      return [
        <Vue3DndItem
          key={widget.id}
          group={groupId}
          index={i}
          parentWidgets={parentWidgets}
          parentChildren={children}
          item={widget}
          config={cfg}
          direction={cfg.direction}
          onRemove={(data) => onRemove(children, data)}
          onMove={(...args) => onMove(cfg, children, args[0], args[1], args[2])}
          onSelect={() => onSelect(children)}
          {..._props}
        >
          {content}
        </Vue3DndItem>,
      ];
    };

    /**
     * 绘制子部件
     */
    const renderWidgets = (
      parentWidgets: LowCodeWidget.BasicSchema[],
      children: LowCodeWidget.BasicSchema[],
      config: IVue3DndItemOptions,
      renderItems: LowCodeWidget.BasicSchema[],
      itemContent?: IRenderContainerOptions<LowCodeWidget.BasicSchema>['itemContent'],
      renderItemBefore?: IRenderContainerOptions<LowCodeWidget.BasicSchema>['renderItemBefore'],
      renderItemAfter?: IRenderContainerOptions<LowCodeWidget.BasicSchema>['renderItemAfter'],
    ) => {
      const parent = last(parentWidgets);
      const groupId = parent?.id || props.rootTag;
      const content: any[] = [];

      renderItems.forEach((widget, i) => {
        const beforeWidget = renderItems[i - 1];
        const isInlineBlock = widget.display === DisplayEnums.INLINE_BLOCK;
        const direction = isInlineBlock ? 'vertical' : config.direction;

        if (renderItemBefore) {
          content.push(renderItemBefore({ element: widget, index: i }));
        }
        if (config.isDrop) {
          if (beforeWidget && beforeWidget.display !== widget.display) {
            content.push(
              <Vue3DndDropLine
                key={`before_drop_line1_${widget.id}`}
                group={groupId}
                index={i}
                parentWidgets={parentWidgets}
                parentChildren={children}
                item={widget}
                beforeItem={beforeWidget}
                config={config}
                direction={
                  beforeWidget.display === DisplayEnums.INLINE_BLOCK ? 'vertical' : 'horizontal'
                }
                onMove={(...args) => onMove(config, children, args[0], args[1], args[2])}
              />,
            );
          }
          content.push(
            <Vue3DndDropLine
              key={`before_drop_line_${widget.id}`}
              group={groupId}
              index={i}
              parentWidgets={parentWidgets}
              parentChildren={children}
              item={widget}
              beforeItem={beforeWidget}
              config={config}
              direction={direction}
              onMove={(...args) => onMove(config, children, args[0], args[1], args[2])}
            />,
          );
        }
        content.push(
          renderContentItem(parentWidgets, children, {
            children,
            index: i,
            widget,
            config,
            itemContent,
          }),
        );
        if (config.isDrop && renderItems.length === i + 1) {
          content.push(
            <Vue3DndDropLine
              key={`after_drop_line_${widget.id}`}
              group={groupId}
              index={i}
              parentWidgets={parentWidgets}
              parentChildren={children}
              item={widget}
              config={config}
              direction={direction}
              isBefore={false}
              onMove={(...args) => onMove(config, children, args[0], args[1], args[2])}
            />,
          );
        }
        if (renderItemAfter) {
          content.push(renderItemAfter({ element: widget, index: i }));
        }
      });
      return content;
    };

    const renderRootContainer = (children: LowCodeWidget.BasicSchema[]) => {
      if (!children || !Array.isArray(children)) {
        return null;
      }
      const parentWidgets: LowCodeWidget.BasicSchema[] = [props.parentWidget ?? verticalRoot];

      // 过滤掉底部按钮再绘制
      const renderItems = children.filter((_) => _.type !== 'bottom-button-container');

      const content: any[] = renderWidgets(parentWidgets, children, rootConfig, renderItems);

      return (
        <Vue3DndContainer
          isRoot={true}
          key={props.rootTag || 'root'}
          groupId={props.rootTag || 'root'}
          style={props.pageStyle}
          parentWidgets={parentWidgets}
          widgets={renderItems}
          widget={parentWidgets[0]}
          opts={rootConfig}
          onDrop={(item) => onContainerMove(props.rootTag, children, item)}
        >
          {content}
        </Vue3DndContainer>
      );
    };

    const renderContainer = (
      parentWidgets: LowCodeWidget.BasicSchema[],
      children: LowCodeWidget.BasicSchema[],
      args: IRenderContainerOptions<LowCodeWidget.BasicSchema>,
    ) => {
      if (!children || !Array.isArray(children)) {
        return null;
      }

      const widget = parentWidgets[parentWidgets.length - 1];

      const _props = args.props || {};

      let cfg = config;
      if (args.config) {
        cfg = merge(clone(cfg), args.config);
      }

      const key = args.groupId || widget?.id || props.rootTag;

      const content: any[] = renderWidgets(
        parentWidgets,
        children,
        cfg,
        args.renderChildren ?? children,
        args.itemContent,
        args.renderItemBefore,
        args.renderItemAfter,
      );

      return (
        <Vue3DndContainer
          key={key}
          groupId={key}
          parentWidgets={parentWidgets}
          widgets={children}
          widget={widget}
          opts={cfg}
          onDrop={(item) => onContainerMove(key, children, item)}
          {..._props}
        >
          {content}
        </Vue3DndContainer>
      );
    };

    const renderItem = (
      parentWidgets: LowCodeWidget.BasicSchema[],
      widget: LowCodeWidget.BasicSchema,
      index: number,
    ) => {
      const com = getAsyncWidget(widget);
      const formWidget = parentWidgets.find((widget) => {
        return widget.type === FormComponents.Form || widget.type === FormComponents.RdoForm;
      });
      return h(
        com,
        {
          key: widget.id,
          widget,
          parentWidget: parent,
          parentList: parentWidgets,
          rowReadonly: formWidget && formWidget.props.readonly === true,
          indexOfParentList: index,
          isNewDesigner: isNewDesigner.value,
        },
        {
          default: (args: IRenderContainerOptions<LowCodeWidget.BasicSchema>) => {
            const { parentWidget, children } = args;
            const items = [...parentWidgets, parentWidget ? parentWidget : widget];
            return renderContainer(items, children, args);
          },
          container: (args: IRenderContainerOptions<LowCodeWidget.BasicSchema>) => {
            const { parentWidget, children, content, renderChildren } = args;
            const p = parentWidget ? parentWidget : widget;
            const key = args.groupId || p.id;
            const items = [...parentWidgets, p];
            let cfg = config;
            if (args.config) {
              cfg = merge(clone(cfg), args.config);
            }
            return (
              <Vue3DndContainer
                key={key}
                groupId={key}
                parentWidgets={items}
                widgets={renderChildren ?? children}
                widget={p}
                opts={cfg}
                onDrop={(item) => onContainerMove(key, children, item)}
                {...args.props}
              >
                {content}
              </Vue3DndContainer>
            );
          },
          item: (args: IRenderContentItemOptions<LowCodeWidget.BasicSchema>) => {
            const { parentWidget, children } = args;
            const items = [...parentWidgets, parentWidget ? parentWidget : widget];
            return renderContentItem(items, children, args);
          },
          widgets: (args: IRenderContainerOptions<LowCodeWidget.BasicSchema>) => {
            const { parentWidget, children, renderChildren } = args;
            const items = [...parentWidgets, parentWidget ? parentWidget : widget];
            let cfg = config;
            if (args.config) {
              cfg = merge(clone(cfg), args.config);
            }
            return renderWidgets(
              items,
              children,
              cfg,
              renderChildren ?? children,
              args.itemContent,
              args.renderItemBefore,
              args.renderItemAfter,
            );
          },
        },
      );
    };

    return {
      ns,
      rootRef,
      c,
      highlightRef,
      renderContentItem,
      renderRootContainer,
      setSelect,
    };
  },
  render() {
    return (
      <div ref="rootRef" change-count={this.c.state.count} class={[this.ns.b()]}>
        <Vue3DndHighlighter ref="highlightRef" rootTag={this.rootTag} selectParent={this.selectParent} />
        {this.parentWidget
          ? this.renderContentItem([], this.widgets, {
              index: 0,
              widget: this.parentWidget,
              children: this.widgets,
              config: this.config,
            })
          : this.renderRootContainer(this.widgets)}
      </div>
    );
  },
});
