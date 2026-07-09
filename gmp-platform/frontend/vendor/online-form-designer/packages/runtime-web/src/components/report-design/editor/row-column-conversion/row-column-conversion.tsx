import { defineComponent, PropType } from 'vue';
import { IEditorBasic, useNamespace } from '@gct-paas/core';
import { useReportViewController } from '../../hooks';
import { ITableReportSchema } from '../../interface';
import './row-column-conversion.scss';

export const RowColumnConversion = defineComponent({
  name: 'RowColumnConversion',
  props: {
    model: {
      type: Object as PropType<IEditorBasic>,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('row-column-conversion');

    const reportView = useReportViewController();

    function onChangeConversion() {
      const schema = reportView.state.schema as ITableReportSchema;
      const row_subtotals =
        schema.row_subtotals?.map((item) => {
          item.summaryFields = [];
          return item;
        }) ?? [];
      const column_subtotals =
        schema.column_subtotals?.map((item) => {
          item.summaryFields = [];
          return item;
        }) ?? [];
      const rows = schema.rowDimension;
      const cols = schema.columnDimension;
      reportView.updateSchema({
        rowDimension: cols,
        columnDimension: rows,
        row_subtotals,
        column_subtotals,
      });
    }

    return { ns, onChangeConversion };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('line')}></div>
        {this.model.notAction == true ? null : (
          <div class={this.ns.e('action')} onClick={this.onChangeConversion}>
            <i class="iconfont icon-qiehuan1" />
          </div>
        )}
      </div>
    );
  },
});
