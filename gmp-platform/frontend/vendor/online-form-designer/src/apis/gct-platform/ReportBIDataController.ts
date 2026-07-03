import { defHttp } from '@/utils/http/axios';
import { BICrossReportDTO, ResponseEntityCrossReport, BIChartConditionDTO, ResponseEntityobject } from './model/index';

/**
 * BI报表数据
 * import { postReportDetailDetailExternal } from "/@/apis/gct-platform/ReportBIDataController"
 */
export async function postReportDetailDetailExternal(data: BICrossReportDTO, config = {}): Promise<ResponseEntityCrossReport['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/report-detail/detail`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 统计行
 * import { postReportDetailListStatisticExternal } from "/@/apis/gct-platform/ReportBIDataController"
 */
export async function postReportDetailListStatisticExternal(data: BIChartConditionDTO, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/report-detail/listStatistic`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}