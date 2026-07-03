import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import WidgetRender from '/@page-designer/components/widgets/pad/index.vue';
import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
import './render-table-buttons.scss';
import { cloneDeep } from 'lodash-es';
import CollapsableButton from '/@page-designer/components/widgets/pad/__components__/collapsable-button.vue';

export const RenderTableColunmButtons = defineComponent({
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
    tableForm: {
      type: Object,
    },
    rowIndex: {
      type: Number,
    },
  },
  setup(props) {
    const ns = useNamespace('render-table-buttons');
    const buns = ref(cloneDeep(props.buttons));
    const buttons = useDependencyToShowList(buns.value, props.tableForm);
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
        return (
          <WidgetRender widget={widget} formData={props.tableForm} rowIndex={props.rowIndex} />
        );
      }
      return (
        <CollapsableButton
          rowIndex={props.rowIndex}
          collapseAll={props.visibleButtons === 0}
          buttons={dropdownButtons.value}
        >
          {{
            default: ({ widget }) => {
              return (
                <WidgetRender
                  widget={widget}
                  formData={props.tableForm}
                  rowIndex={props.rowIndex}
                />
              );
            },
          }}
        </CollapsableButton>
      );

      // return (
      // <a-dropdown
      //   overlayClassName={ns.e('dropdown-overlay')}
      //   placement="bottomRight"
      //   zIndex="1000"
      // >
      //   {{
      //     default: () => (
      //       <a class="ant-dropdown-link">
      //         <MoreOutlined />
      //       </a>
      //     ),
      //     overlay: () => {
      //       const menus = dropdownButtons.value.map((i) => (
      //         <WidgetRender
      //           widget={i}
      //           formData={props.tableForm}
      //           block
      //           rowIndex={props.rowIndex}
      //         />
      //       ));
      //       return <a-menu>{menus}</a-menu>;
      //     },
      //   }}
      // </a-dropdown>
      // );
    };

    return { ns, showButtons, dropdownButtons, renderDropdown };
  },
  render(props) {
    return (
      <div class="gct-table-actionItem">
        {this.showButtons.map((i, index) => [
          <WidgetRender key={i.id} widget={i} formData={this.tableForm} rowIndex={this.rowIndex} />,
        ])}
        {this.renderDropdown()}
      </div>
    );
  },
});
