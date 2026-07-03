import { computed, defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import WidgetRender from '/@web-render/render/widget/widget-pad-async.vue';
import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
import CollapsableButton from '/@page-designer/components/widgets/pad/__components__/collapsable-button.vue';
import './render-table-buttons.scss';

export const RenderTableButtons = defineComponent({
  name: 'RenderTableButtons',
  props: {
    buttons: {
      type: Array<any>,
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
      return buttons.value.slice(0, props.visibleButtons - 1);
    });

    const dropdownButtons = computed(() => {
      if (props.visibleButtons === -1) {
        return [];
      }
      if (props.visibleButtons === 0) {
        return buttons.value;
      }
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
            default: ({ widget, isMoreMenu }) => {
              return <WidgetRender widget={widget} isMoreMenu={isMoreMenu} />;
            },
          }}
        </CollapsableButton>
      );
    };

    return () => {
      return (
        <div class={[ns.b(), props.reverse ? 'ks-row-right' : '']}>
          {props.reverse ? renderDropdown() : null}
          {showButtons.value.map((i) => (
            <WidgetRender widget={i} key={i.id} />
          ))}
          {props.reverse ? null : renderDropdown()}
        </div>
      );
    };
  },
});
