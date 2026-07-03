import { defHttp } from '@/utils/http/axios';
import { PrintLogSearchRequest, ResponseEntityPageBasePrintLogResponse, PrintAdapterDTO, ResponseEntityboolean } from './model/index';

/**
 * 分页列表
 * import { postPrintLogPageList } from "/@/apis/gct-apaas/PrintLogController"
 */
export async function postPrintLogPageList(data: PrintLogSearchRequest, config = {}): Promise<ResponseEntityPageBasePrintLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/print-log/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 补打
 * import { postPrintLogPatchwork } from "/@/apis/gct-apaas/PrintLogController"
 */
export async function postPrintLogPatchwork(data: PrintAdapterDTO, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/print-log/patchwork`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}