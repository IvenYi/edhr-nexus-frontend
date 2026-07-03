import { defineComponent, onUnmounted, PropType, ref, nextTick, watch, computed } from 'vue';
import { useNamespace } from '@gct/runtime';
import WidgetAsync from '/@web-render/render/widget/widget-async.vue';
import WidgetEntry from '/@web-render/render/widget/widget-entry.vue';
import { IBusinessTable } from './schema';
import { LinkColumn, RoutingOperation } from './column-render';
import { getDataTableWidget } from './logic';

export const BusinessTableRender = defineComponent({
  name: 'BusinessTableRender',
  inheritAttrs: false,
  props: {
    widget: {
      type: Object as PropType<IBusinessTable>,
      required: true,
    },
    formData: {
      type: Object,
    },
  },
  setup(props, { emit }) {
    const t = (window as any).$t;
    const ns = useNamespace('business-table-render');

    const renderColumn = (field, row, rowIndex) => {
      const commonParams = { widget: props.widget, column: field, row, rowIndex };
      // 绘制工序节点字段
      if (props.widget.props.routingOpCols.includes(field.id)) {
        return <RoutingOperation {...commonParams} />;
      }
      // 绘制可点击节点字段
      if (props.widget.props.linkCols.includes(field.id)) {
        return <LinkColumn {...commonParams} />;
      }
      return null;
    };

    return {
      t,
      ns,
      renderColumn,
    };
  },
  render() {
    const formState = this.formData ?? {};
    const tableWidget = getDataTableWidget(this.widget);
    return (
      <div class={this.ns.b()}>
        <WidgetEntry widget={tableWidget} formData={formState}>
          {{
            default: (slotData) => {
              return (
                <WidgetAsync widget={tableWidget} formData={formState} {...slotData}>
                  {{
                    // 绘制自定义的字段插槽
                    field: ({ widget, row, rowIndex }) => {
                      return this.renderColumn(widget, row, rowIndex);
                    },
                  }}
                </WidgetAsync>
              );
            },
          }}
        </WidgetEntry>
      </div>
    );
  },
});

export default BusinessTableRender;
