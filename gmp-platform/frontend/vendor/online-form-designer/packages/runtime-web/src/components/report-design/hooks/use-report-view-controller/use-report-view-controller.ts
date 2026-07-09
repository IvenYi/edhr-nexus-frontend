import { inject, provide } from "vue";
import { ReportViewController } from "../../controller";
import { CONTROLLER_TYPE } from "../../constants";

/**
 * 获取报表控制器
 *
 * @export
 * @returns {*}  {ReportViewController}
 */
export function useReportViewController(): ReportViewController {
  let c = inject(CONTROLLER_TYPE.REPORT_VIEW) as ReportViewController;
  if (!c) {
    c = new ReportViewController();
    provide(CONTROLLER_TYPE.REPORT_VIEW, c);
  }
  return c;
}
