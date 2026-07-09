import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IReportField } from '../../interface';
import './datav-field-tooltip.scss';

export const DatavFieldTooltip = defineComponent({
  name: 'DatavFieldTooltip',
  props: {
    data: {
      type: Object as PropType<IReportField>,
      default: () => ({}),
    },
  },
  setup() {
    const ns = useNamespace('datav-field-tooltip');
    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('item')}>
          <div class={this.ns.e('item-label')}>字段原名：</div>
          <div class={this.ns.e('item-info')}>{this.data.fieldName}</div>
        </div>
        <div class={this.ns.e('item')}>
          <div class={this.ns.e('item-label')}>显示名称：</div>
          <div class={this.ns.e('item-info')}>{this.data.colName}</div>
        </div>
      </div>
    );
  },
});
