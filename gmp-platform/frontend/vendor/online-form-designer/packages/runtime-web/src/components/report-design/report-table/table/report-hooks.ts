import { ref, onMounted, inject, provide } from 'vue';
import { debounce } from 'lodash-es';
import { ReportTable } from '../../schema/index';
/**冻结列边界情况处理 */
export function useWatchReportFixed(widget: ReportTable, { vxeTable }) {
  const { leftFixed, rightFixed } = widget;
  const reportFixed = ref(false);
  // 创建观察器实例
  const resizeObserver = new ResizeObserver((entries) => {
    debounceTransform(entries);
  });
  const debounceTransform = debounce((entries) => {
    for (const entry of entries) {
      const { width } = entry.contentRect;
      // 在此添加你的业务逻辑
      const leftWidth =
        document.getElementsByClassName('vxe-table--fixed-left-wrapper')?.[0]?.clientWidth || 0;
      const rightWidth =
        document.getElementsByClassName('vxe-table--fixed-right-wrapper')?.[0]?.clientWidth || 0;
      reportFixed.value = width < leftWidth + rightWidth;
    }
  }, 300);
  onMounted(() => {
    if (leftFixed + rightFixed > 5) {
      resizeObserver.observe(vxeTable.value.$el);
    }
  });
  return { reportFixed };
}

const REPORT_TABLE_HEADER = 'gct-report-table-header';

export const initReportHeaderByAppId = (appid: string) => {
  if (!appid) return {};
  const transferToConfig = {
    headers: {
      'App-Tag': appid,
    },
  };
  provide(REPORT_TABLE_HEADER, { transferToConfig, appId: appid });
  return { transferToConfig };
};
export const getReportHeader = () => <ReportHeader>inject(REPORT_TABLE_HEADER, {});
interface ReportHeader {
  transferToConfig?: {
    headers: {
      'App-Tag': string;
    };
  };
  appId?: string;
}
