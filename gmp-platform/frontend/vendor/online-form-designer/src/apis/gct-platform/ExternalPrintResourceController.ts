import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListPrintServiceBtwTreeVO, ResponseEntityboolean, ResponseEntityMapstringobject, ResponseEntityListPrintResourceMapping, PrintAdapterDTO } from './model/index';

/**
 * 打印客户端关联bartender模板目录树下拉
 * import { getPrintBtwFileTreeExternal } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export async function getPrintBtwFileTreeExternal(config = {}): Promise<ResponseEntityListPrintServiceBtwTreeVO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/print/btwFileTree`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据printKey解析出这个btw模板文件是否还在原本的btw tree结构中(原来的磁盘路径中)
 * import { getPrintBtwTmplExistExternal } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export interface getPrintBtwTmplExistExternalQueryInterface {
  printKey: string; // printKey
}
export async function getPrintBtwTmplExistExternal(params: getPrintBtwTmplExistExternalQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/print/btwTmplExist`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据打印机唯一标识key兑换打印机名称
 * import { getPrintExchangePrinterNameExternal } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export interface getPrintExchangePrinterNameExternalQueryInterface {
  printKeys: array; // printKeys
}
export async function getPrintExchangePrinterNameExternal(params: getPrintExchangePrinterNameExternalQueryInterface = {}, config = {}): Promise<ResponseEntityMapstringobject['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/print/exchangePrinterName`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据打印机唯一标识key兑换打印机名称(btw)
 * import { postPrintExchangePrinterName4BtwExternal } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export async function postPrintExchangePrinterName4BtwExternal(data: string[], config = {}): Promise<ResponseEntityListPrintResourceMapping['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/print/exchangePrinterName4Btw`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 执行打印
 * import { postPrintSendPrintDataExternal } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export async function postPrintSendPrintDataExternal(data: PrintAdapterDTO, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/print/sendPrintData`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}