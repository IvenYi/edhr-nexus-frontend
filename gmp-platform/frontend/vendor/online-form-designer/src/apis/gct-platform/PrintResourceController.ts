import { defHttp } from '@/utils/http/axios';
import { PrintResourceRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityPrintResourceCount, ResponseEntityPrintResourceResponse, ResponseEntityListPrintResourceResponse, ResponseEntityListPrintListDto, PrintLogDto, PrintResourceRemarkRequest } from './model/index';

/**
 * 保存
 * import { postPrintResource } from "/@/apis/gct-platform/PrintResourceController"
 */
export async function postPrintResource(data: PrintResourceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/print-resource`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePrintResource } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface deletePrintResourceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePrintResource(params: deletePrintResourceQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/print-resource`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 查询打印机状态
 * import { getPrintResourceGetIpAddressStatus } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface getPrintResourceGetIpAddressStatusQueryInterface {
  address: string; // address
  type: string; // type
}
export async function getPrintResourceGetIpAddressStatus(params: getPrintResourceGetIpAddressStatusQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/print-resource/getIpAddressStatus`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取打印服务和网络打印机的数量
 * import { getPrintResourceGetPrintCount } from "/@/apis/gct-platform/PrintResourceController"
 */
export async function getPrintResourceGetPrintCount(config = {}): Promise<ResponseEntityPrintResourceCount['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/print-resource/getPrintCount`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getPrintResourceInfo } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface getPrintResourceInfoQueryInterface {
  id: string; // id
}
export async function getPrintResourceInfo(params: getPrintResourceInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPrintResourceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/print-resource/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPrintResourceList } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface getPrintResourceListQueryInterface {
  queryState: number; // queryState
  type: string; // type
}
export async function getPrintResourceList(params: getPrintResourceListQueryInterface = {}, config = {}): Promise<ResponseEntityListPrintResourceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/print-resource/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据mac地址查询打印机列表
 * import { getPrintResourceListByMacAddress } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface getPrintResourceListByMacAddressQueryInterface {
  macAddress?: string; // macAddress
}
export async function getPrintResourceListByMacAddress(params: getPrintResourceListByMacAddressQueryInterface = {}, config = {}): Promise<ResponseEntityListPrintListDto['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/print-resource/listByMacAddress`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * printTest
 * import { postPrintResourcePrintTest } from "/@/apis/gct-platform/PrintResourceController"
 */
export async function postPrintResourcePrintTest(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/print-resource/printTest`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 给打印机推送打印消息
 * import { postPrintResourceSendPrintData } from "/@/apis/gct-platform/PrintResourceController"
 */
export async function postPrintResourceSendPrintData(data: PrintLogDto, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/print-resource/sendPrintData`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改备注
 * import { putPrintResourceUpdateRemarkById } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface putPrintResourceUpdateRemarkByIdPathInterface {
  id: string; // id
}
export async function putPrintResourceUpdateRemarkById(path: putPrintResourceUpdateRemarkByIdPathInterface, data: PrintResourceRemarkRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/print-resource/updateRemark/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPrintResourceById } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface putPrintResourceByIdPathInterface {
  id: string; // id
}
export async function putPrintResourceById(path: putPrintResourceByIdPathInterface, data: PrintResourceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/print-resource/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}