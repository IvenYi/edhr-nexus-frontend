import { computed, defineComponent, h, ref, watch } from 'vue';
import { LowCodeWidget, useNamespace } from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
import { useSelectedWidget } from '/@/projects/page-designer/src/hooks/useSelectedWidget';
import { MoreOutlined } from '@ant-design/icons-vue';
import { IRenderContainerOptions } from '/@/projects/page-designer/src/designer/interface';
import './design-table-buttons.scss';
import CollapsableButton from '/@page-designer/components/widgets/pad/__components__/collapsable-button.vue';

export const DesignTableColumnButtons = defineComponent({
  name: 'DesignTableColumnButtons',
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
    const ns = useNamespace('design-table-column-buttons');
    const { getAsyncWidget, isNewDesigner } = useDesigner();
    props.buttons.forEach((i) => {
      i.props.pos = 0;
      if (props.parentWidget) {
        i.preLocation = props.parentWidget.id;
      }
    });
    const buttons = computed(() => props.buttons?.filter((i) => !i.props.hidden));
    const visible = ref(false);
    const refDom = ref(null);
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
      const show = dropdownButtons.value.some((i) => i.id === w?.id);
      if (show) {
        visible.value = getMainParent(refDom.value);
      } else {
        visible.value = false;
      }
    });
    const renderDropdown = () => {
      if (dropdownButtons.value.length === 0) {
        return;
      }
      if (dropdownButtons.value.length === 1) {
        const widget = dropdownButtons.value[0];
        return renderItem(widget, Symbol());
      }
      return (
        <CollapsableButton collapseAll={props.visibleButtons === 0} buttons={dropdownButtons.value}>
          {{
            default: ({ widget }) => {
              return renderItem(widget, Symbol());
            },
          }}
        </CollapsableButton>
      );
      // return (
      // <a-dropdown
      //   overlayClassName={ns.e('dropdown-overlay')}
      //   visible={visible.value}
      //   overlayStyle={{ zIndex: 1000 }}
      // >
      //   {{
      //     default: () => (
      //       <a class="ant-dropdown-link" onClick={() => (visible.value = !!props.parentWidget)}>
      //         <MoreOutlined />
      //       </a>
      //     ),
      //     overlay: () => {
      //       if (!props.parentWidget) return null;
      //       return (
      //         <a-menu>
      //           {dropdownButtons.value.map((item, _i) => {
      //             return (
      //               <div key={item.id} class="pl-6px pr-6px cursor-pointer">
      //                 <WidgetWrapper
      //                   actionTypes={['parent', 'delete']}
      //                   widget={item}
      //                   parentWidget={props.parentWidget}
      //                   indexOfParentList={props.buttons.findIndex((i) => i.id === item.id)}
      //                   parentList={props.buttons}
      //                   showHoverLine={true}
      //                 >
      //                   <div class="p-4px">
      //                     {item.props.title || $t(item.displayName || item.name || '')}
      //                   </div>
      //                 </WidgetWrapper>
      //               </div>
      //             );
      //           })}
      //         </a-menu>
      //       );
      //     },
      //   }}
      // </a-dropdown>
      // );
    };
    const getOptions = (item, com, index) => {
      return props.parentWidget
        ? h(
            WidgetWrapper,
            {
              style: { overflow: 'initial' },
              key: item.id,
              widget: item,
              parentWidget: props.parentWidget,
              actionTypes: ['parent', 'delete'],
              indexOfParentList: props.buttons.findIndex((i) => i.id === item.id),
              parentList: props.buttons,
            },
            { default: () => h(com, { key: index, widget: item }) },
          )
        : h(com, { key: index, widget: item });
    };
    const renderItem = (item, i) => {
      const com = getAsyncWidget(item);
      return [getOptions(item, com, i)];
    };

    return {
      ns,
      getAsyncWidget,
      showButtons,
      dropdownButtons,
      renderDropdown,
      refDom,
      getOptions,
      renderItem,
      isNewDesigner,
    };
  },
  render() {
    if (!this.buttons || this.buttons.length === 0) {
      return;
    }
    return (
      <div class="gct-table-actionItem" ref="refDom">
        {this.showButtons.map((item, i) => {
          return this.renderItem(item, i);
        })}
        {this.renderDropdown()}
      </div>
    );
  },
});

function getMainParent(element) {
  while (element) {
    if (element.classList.contains('fixed--hidden')) {
      return false;
    }
    if (
      element.classList.contains('vxe-table--fixed-right-wrapper') ||
      element.classList.contains('vxe-table--main-wrapper')
    ) {
      return true;
    }
    element = element.parentNode;
  }
  return false;
}
