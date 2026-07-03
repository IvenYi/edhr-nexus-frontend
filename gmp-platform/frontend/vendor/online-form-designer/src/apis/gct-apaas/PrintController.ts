import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListPrintServiceBtwTreeVO, FrontendPrintRequest, ResponseEntityPrintCode, BackEndPrintRequest, ResponseEntityboolean, ResponseEntityListPrintServiceTreeVO, PrintAdapterDTO } from './model/index';

/**
 * 打印客户端关联bartender模板目录树下拉
 * import { getPrintBtwFileTree } from "/@/apis/gct-apaas/PrintController"
 */
export async function getPrintBtwFileTree(config = {}): Promise<ResponseEntityListPrintServiceBtwTreeVO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/print/btwFileTree`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 生成 zpl 编码
 * import { postPrintGenerateZplCode } from "/@/apis/gct-apaas/PrintController"
 */
export async function postPrintGenerateZplCode(data: FrontendPrintRequest, config = {}): Promise<ResponseEntityPrintCode['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/print/generateZplCode`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 标签后端打印
 * import { postPrintLabelBackEndPrint } from "/@/apis/gct-apaas/PrintController"
 */
export async function postPrintLabelBackEndPrint(data: BackEndPrintRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/print/labelBackEndPrint`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取打印机下拉集合
 * import { getPrintPrintDropdownList } from "/@/apis/gct-apaas/PrintController"
 */
export async function getPrintPrintDropdownList(config = {}): Promise<ResponseEntityListPrintServiceTreeVO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/print/printDropdownList`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 执行打印 
 * import { postPrintSendPrintData } from "/@/apis/gct-apaas/PrintController"
 */
export async function postPrintSendPrintData(data: PrintAdapterDTO, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/print/sendPrintData`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}