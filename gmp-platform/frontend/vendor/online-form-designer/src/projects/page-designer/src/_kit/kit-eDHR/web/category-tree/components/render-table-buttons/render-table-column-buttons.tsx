import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import WidgetRender from '/@page-designer/components/widgets/web/index.vue';
import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
import './render-table-buttons.scss';
import { Divider, Tooltip } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

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
    const btns = ref(cloneDeep(props.buttons));
    const buttons = useDependencyToShowList(btns.value, props.tableForm);
    const showButtons = computed(() => {
      return buttons.value?.length > 1 ? [] : buttons.value;
    });

    const dropdownButtons = computed(() => {
      return buttons.value?.length > 1 ? buttons.value : [];
    });

    const renderDropdown = () => {
      if (dropdownButtons.value.length === 0) {
        return;
      }
      return (
        <a-dropdown
          overlayClassName={ns.e('dropdown-overlay')}
          placement="bottomRight"
          zIndex="1000"
          class="ml8px"
        >
          {{
            default: () => (
              <a class="ant-dropdown-link">
                <i class="iconfont icon-gengduo-shu text-[#1A1D23]"></i>
              </a>
            ),
            overlay: () => {
              const menus = dropdownButtons.value.map((i) => (
                <WidgetRender
                  widget={i}
                  formData={props.tableForm}
                  block
                  rowIndex={props.rowIndex}
                />
              ));
              return <a-menu>{menus}</a-menu>;
            },
          }}
        </a-dropdown>
      );
    };

    return { ns, showButtons, dropdownButtons, renderDropdown };
  },
  render(props) {
    return (
      <div class="gct-table-actionItem">
        {this.showButtons.map((i, index) => [
          <Divider type="vertical" v-show={index} />,
          <Tooltip title={$t(i?.i18n?.title || i?.props.title || i?.displayName || i?.name || '')}>
            <WidgetRender
              key={i.id}
              widget={i}
              formData={this.tableForm}
              rowIndex={this.rowIndex}
            />
          </Tooltip>,
        ])}
        <div>{this.renderDropdown()}</div>
      </div>
    );
  },
});
