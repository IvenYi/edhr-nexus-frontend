import request from '@mobile/utils/request';
import type { BICrossReportDTO, ResponseEntityCrossReport, BIChartConditionDTO, ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * BI报表数据
 * import { postReportDetailDetail } from "/@/apis/gct-platform/ReportBIDataController"
 */
export async function postReportDetailDetail(data: BICrossReportDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityCrossReport['data']> {
  return request(
    {
      url: `/gct-platform/external/api/report-detail/detail`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 统计行
 * import { postReportDetailListStatistic } from "/@/apis/gct-platform/ReportBIDataController"
 */
export async function postReportDetailListStatistic(data: BIChartConditionDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/external/api/report-detail/listStatistic`,
      method: 'post',
      data,
      ...config,
    },
  );
}