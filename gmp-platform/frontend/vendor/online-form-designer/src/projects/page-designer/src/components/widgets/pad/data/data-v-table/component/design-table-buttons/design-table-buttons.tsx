import { computed, defineComponent, h, ref, watch } from 'vue';
import { LowCodeWidget, useNamespace } from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
import { useSelectedWidget } from '/@/projects/page-designer/src/hooks/useSelectedWidget';
import { IRenderContainerOptions } from '/@/projects/page-designer/src/designer/interface';
import CollapsableButton from '/@page-designer/components/widgets/pad/__components__/collapsable-button.vue';
import './design-table-buttons.scss';

export const DesignTableButtons = defineComponent({
  name: 'DesignTableButtons',
  props: {
    buttons: {
      type: Array<IData>,
      default: () => [],
    },
    visibleButtons: {
      type: Number,
      default: -1,
    },
    // 是否为反向绘制
    reverse: {
      type: Boolean,
      default: false,
    },
    parentWidget: {
      type: Object,
    },
  },
  setup(props) {
    const { selectedWidget } = useSelectedWidget();
    const ns = useNamespace('design-table-buttons');
    const { getAsyncWidget, isNewDesigner } = useDesigner();
    const buttons = computed(() => props.buttons);
    const visible = ref(false);

    const showButtons = computed(() => {
      if (props.visibleButtons === -1) {
        return buttons.value;
      }
      if (props.visibleButtons === 0) {
        return [];
      }
      return buttons.value.slice(0, props.visibleButtons - 1);
    });

    const dropdownButtons = computed(() => {
      if (props.visibleButtons === -1) {
        return [];
      }
      if (props.visibleButtons === 0) {
        return buttons.value;
      }
      return buttons.value.slice(props.visibleButtons - 1);
    });
    watch(selectedWidget, (w) => {
      visible.value = dropdownButtons.value.some((i) => i.id === w?.id);
    });
    const renderDropdown = () => {
      if (dropdownButtons.value.length === 0) {
        return;
      }
      if (dropdownButtons.value.length === 1) {
        const widget = dropdownButtons.value[0];
        return (
          <WidgetWrapper
            actionTypes={['parent', 'delete']}
            widget={widget}
            parentWidget={props.parentWidget}
            indexOfParentList={props.buttons.findIndex((i) => i.id === widget.id)}
            parentList={props.buttons}
          >
            {h(getAsyncWidget(widget), { widget: widget })}
          </WidgetWrapper>
        );
      }
      return (
        <CollapsableButton collapseAll={props.visibleButtons === 0} buttons={dropdownButtons.value}>
          {{
            default: ({ widget, isMoreMenu }) => {
              return (
                <WidgetWrapper
                  actionTypes={['parent', 'delete']}
                  widget={widget}
                  parentWidget={props.parentWidget}
                  indexOfParentList={props.buttons.findIndex((i) => i.id === widget.id)}
                  parentList={props.buttons}
                >
                  {h(getAsyncWidget(widget), { widget: widget, isMoreMenu })}
                </WidgetWrapper>
              );
            },
          }}
        </CollapsableButton>
      );
    };
    return { ns, getAsyncWidget, isNewDesigner, showButtons, dropdownButtons, renderDropdown };
  },
  render() {
    if (!this.buttons || this.buttons.length === 0) {
      return;
    }
    return (
      <div class={[this.ns.b(), this.reverse ? 'ks-row-right' : '']}>
        {this.reverse ? this.renderDropdown() : null}
        {this.isNewDesigner
          ? this.$slots.renderActions?.({
              props: { class: this.ns.b() },
              children: this.buttons,
              renderChildren: this.showButtons,
              parentWidget: this.parentWidget,
              config: { mode: 'move', isDrag: false, isDrop: false },
              itemContent: ({ element, index }) => {
                const com = this.getAsyncWidget(element);
                return h(com, { key: index, widget: element });
              },
            } as IRenderContainerOptions<LowCodeWidget.BasicSchema>)
          : this.showButtons.map((item, i) => {
              const com = this.getAsyncWidget(item);
              return this.parentWidget
                ? h(
                    WidgetWrapper,
                    {
                      key: item.id,
                      widget: item,
                      parentWidget: this.parentWidget,
                      actionTypes: ['parent', 'delete'],
                      indexOfParentList: this.buttons.findIndex((i) => i.id === item.id),
                      parentList: this.buttons,
                    },
                    { default: () => h(com, { key: i, widget: item }) },
                  )
                : h(com, { key: i, widget: item });
            })}
        {this.reverse ? null : this.renderDropdown()}
      </div>
    );
  },
});
