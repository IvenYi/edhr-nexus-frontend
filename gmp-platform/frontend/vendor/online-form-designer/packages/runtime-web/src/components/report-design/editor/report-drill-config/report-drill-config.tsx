import { computed, defineComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ReportDrillItemConfig } from './report-drill-item-config';
import { useReportViewController } from '../../hooks';
import { ReportEnum } from '../../schema';
import { IReportField, ITableReportSchema } from '../../interface';
import { filterType } from './util';
import { getReportListModelReport } from '/@/apis/gct-apaas/ReportController';
import './report-drill-config.scss';

export const ReportDrillConfig = defineComponent({
  name: 'ReportDrillConfig',
  setup() {
    const ns = useNamespace('report-drill-config');

    const reportView = useReportViewController();

    const items = computed<IReportField[]>(() => {
      const type = reportView.state.data.reportType;
      const schema = reportView.state.schema as ITableReportSchema;
      let keys: string[] = [];
      if (type === ReportEnum.SCHEDULE_TABLE) {
        keys = schema.dataColumn;
      }
      if (type === ReportEnum.CROSS_TABLE) {
        keys = schema.rowDimension;
      }
      return keys
        .map((item) => {
          return reportView.state.schema.fieldMap[item];
        })
        .filter((item) => {
          if (!item) {
            return false;
          }
          // 交互钻取暂只支持主模型，不支持关联模型
          if (item.id.includes('.')) {
            return false;
          }
          return filterType(item.fieldType, item.mappingType);
        });
    });

    async function onUpdateReportName() {
      const data = await getReportListModelReport({ modelKey: reportView.state.schema.modelKey });
      if (data && data.length > 0) {
        const arr: IObject[] = data[0].reports || [];
        items.value.forEach((item) => {
          const report = arr.find((report) => report.id === item.drillReport);
          if (report) {
            item.drillReportName = report.name;
          }
        });
      }
    }

    onUpdateReportName();

    return { ns, items };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('label')}>钻取</div>
        <div class={this.ns.e('info')}>
          点击当前报表数据，按照特定层级向下钻取，获取更详细的数据
        </div>
        <div class={this.ns.e('body')}>
          {this.items.map((item) => {
            return <ReportDrillItemConfig key={item.id} field={item} />;
          })}
        </div>
      </div>
    );
  },
});
