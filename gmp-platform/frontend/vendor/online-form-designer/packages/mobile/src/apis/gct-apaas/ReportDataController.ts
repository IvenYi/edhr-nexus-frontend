import request from '@mobile/utils/request';
import type { ReportConditionDTO, ResponseEntityModelPageableRow, CrossReportConditionDTO, ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 列表
 * import { postReportDataListByPage } from "/@/apis/gct-apaas/ReportDataController"
 */
export async function postReportDataListByPage(data: ReportConditionDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data/listByPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 交叉表分页列表
 * import { postReportDataListByPage4Cross } from "/@/apis/gct-apaas/ReportDataController"
 */
export async function postReportDataListByPage4Cross(data: CrossReportConditionDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data/listByPage4Cross`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 统计行
 * import { postReportDataListStatistic } from "/@/apis/gct-apaas/ReportDataController"
 */
export async function postReportDataListStatistic(data: ReportConditionDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data/listStatistic`,
      method: 'post',
      data,
      ...config,
    },
  );
}