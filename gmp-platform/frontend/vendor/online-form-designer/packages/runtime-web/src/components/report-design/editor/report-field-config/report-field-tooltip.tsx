import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IReportField } from '../../interface';
import './report-field-tooltip.scss';

export const ReportFieldTooltip = defineComponent({
  name: 'ReportFieldTooltip',
  props: {
    data: {
      type: Object as PropType<IReportField>,
      default: () => ({}),
    },
  },
  setup() {
    const ns = useNamespace('report-field-tooltip');
    return { ns };
  },
  render() {
    return <div class={this.ns.b()}>
      <div class={this.ns.e('item')}>
        <div class={this.ns.e('item-label')}>
          字段原名：
        </div>
        <div class={this.ns.e('item-info')}>
          {this.data.fieldName}
        </div>
      </div>
      <div class={this.ns.e('item')}>
      <div class={this.ns.e('item-label')}>
          显示名称：
        </div>
        <div class={this.ns.e('item-info')}>
          {this.data.alias ?? this.data.fieldName}
        </div>
      </div>
    </div>;
  },
});
