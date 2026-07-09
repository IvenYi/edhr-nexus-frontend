import request from '@mobile/utils/request';
import type { PrintLogSearchRequest, ResponseEntityPageBasePrintLogResponse, PrintAdapterDTO, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 分页列表
 * import { postPrintLogPageList } from "/@/apis/gct-apaas/PrintLogController"
 */
export async function postPrintLogPageList(data: PrintLogSearchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePrintLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/print-log/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 补打
 * import { postPrintLogPatchwork } from "/@/apis/gct-apaas/PrintLogController"
 */
export async function postPrintLogPatchwork(data: PrintAdapterDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/print-log/patchwork`,
      method: 'post',
      data,
      ...config,
    },
  );
}