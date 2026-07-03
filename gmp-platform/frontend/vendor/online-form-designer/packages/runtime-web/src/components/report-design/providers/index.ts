import type { ReportViewController } from '../controller';
import { IReportDesignProvider } from '../interface';

import { CrossReportDesignProvider } from './cross-report-design-provider/cross-report-design-provider';
import { ScheduleReportDesignProvider } from './schedule-report-design-provider/schedule-report-design-provider';

/**
 * 获取所有报表设计提供者
 *
 * @export
 * @returns {*}  {IReportDesignProvider[]}
 */
export function getAllProviders(c: ReportViewController): IReportDesignProvider[] {
  return [
    new CrossReportDesignProvider(c),
    new ScheduleReportDesignProvider(c)
  ];
}
