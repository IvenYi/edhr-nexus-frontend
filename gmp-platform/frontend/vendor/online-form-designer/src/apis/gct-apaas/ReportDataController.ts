import { defHttp } from '@/utils/http/axios';
import { ReportConditionDTO, ResponseEntityModelPageableRow, CrossReportConditionDTO, ResponseEntityobject } from './model/index';

/**
 * 列表
 * import { postReportDataListByPage } from "/@/apis/gct-apaas/ReportDataController"
 */
export async function postReportDataListByPage(data: ReportConditionDTO, config = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report-data/listByPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 交叉表分页列表
 * import { postReportDataListByPage4Cross } from "/@/apis/gct-apaas/ReportDataController"
 */
export async function postReportDataListByPage4Cross(data: CrossReportConditionDTO, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report-data/listByPage4Cross`,
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
 * import { postReportDataListStatistic } from "/@/apis/gct-apaas/ReportDataController"
 */
export async function postReportDataListStatistic(data: ReportConditionDTO, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report-data/listStatistic`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}