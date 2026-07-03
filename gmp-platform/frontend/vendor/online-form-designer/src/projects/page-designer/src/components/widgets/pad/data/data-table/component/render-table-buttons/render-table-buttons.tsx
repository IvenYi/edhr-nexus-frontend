import { computed, defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import WidgetRender from '/@web-render/render/widget/widget-pad-async.vue';
import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
import './render-table-buttons.scss';
import CollapsableButton from '/@page-designer/components/widgets/pad/__components__/collapsable-button.vue';

export const RenderTableButtons = defineComponent({
  name: 'RenderTableButtons',
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
    isRef: {
      /**按钮组件实例化  可以用脚本修改状态属性 */
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const Event = getPageEvent();
    const ns = useNamespace('render-table-buttons');
    /**组件初始化 */
    if (props.isRef) {
      props.buttons.forEach((i) => {
        Event.runContext(i.id, i);
      });
    }
    const buttons = useDependencyToShowList(props.buttons);
    const showButtons = computed(() => {
      if (props.visibleButtons === -1) {
        return buttons.value;
      }
      if (props.visibleButtons === 0) {
        return [];
      }
      // if (props.reverse) {
      //   if (buttons.value.length <= props.visibleButtons) {
      //     return buttons.value;
      //   }
      //   return buttons.value.slice(
      //     buttons.value.length - props.visibleButtons,
      //     buttons.value.length,
      //   );
      // }
      return buttons.value.slice(0, props.visibleButtons - 1);
    });

    const dropdownButtons = computed(() => {
      if (props.visibleButtons === -1) {
        return [];
      }
      if (props.visibleButtons === 0) {
        return buttons.value;
      }
      // if (props.reverse) {
      //   if (buttons.value.length <= props.visibleButtons) {
      //     return [];
      //   }
      //   return buttons.value.slice(0, buttons.value.length - props.visibleButtons).reverse();
      // }
      return buttons.value.slice(props.visibleButtons - 1, buttons.value.length);
    });

    const renderDropdown = () => {
      if (dropdownButtons.value.length === 0) {
        return;
      }
      if (dropdownButtons.value.length === 1) {
        const widget = dropdownButtons.value[0];
        return <WidgetRender widget={widget} />;
      }
      return (
        <CollapsableButton collapseAll={props.visibleButtons === 0} buttons={dropdownButtons.value}>
          {{
            default: ({ widget }) => {
              return <WidgetRender widget={widget} />;
            },
          }}
        </CollapsableButton>
      );
      // return (
      //   <a-dropdown overlayClassName={ns.e('dropdown-overlay')}>
      //     {{
      //       default: () => (
      //         <span>
      //           <i class="iconfont icon-gengduo"></i>
      //         </span>
      //       ),
      //       overlay: () => {
      //         const menus = dropdownButtons.value.map((i) => <WidgetRender widget={i} block />);
      //         return <a-menu>{menus}</a-menu>;
      //       },
      //     }}
      //   </a-dropdown>
      // );
    };

    return { ns, showButtons, dropdownButtons, renderDropdown };
  },
  render(props) {
    return (
      <div class={[this.ns.b(), this.reverse ? 'ks-row-right' : '']}>
        {this.reverse ? this.renderDropdown() : null}
        {this.showButtons.map((i) => (
          <WidgetRender widget={i} key={i.id} />
        ))}
        {this.reverse ? null : this.renderDropdown()}
      </div>
    );
  },
});
