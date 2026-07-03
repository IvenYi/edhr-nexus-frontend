import request from '@mobile/utils/request';
import type { ResponseEntityListPrintServiceBtwTreeVO, ResponseEntityboolean, ResponseEntityMapstringobject, ResponseEntityListPrintResourceMapping, PrintAdapterDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 打印客户端关联bartender模板目录树下拉
 * import { getPrintBtwFileTree } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export async function getPrintBtwFileTree(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPrintServiceBtwTreeVO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/print/btwFileTree`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 根据printKey解析出这个btw模板文件是否还在原本的btw tree结构中(原来的磁盘路径中)
 * import { getPrintBtwTmplExist } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export interface getPrintBtwTmplExistQueryInterface {
  printKey: string; // printKey
}
export async function getPrintBtwTmplExist(params: getPrintBtwTmplExistQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/external/api/print/btwTmplExist`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据打印机唯一标识key兑换打印机名称
 * import { getPrintExchangePrinterName } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export interface getPrintExchangePrinterNameQueryInterface {
  printKeys: array; // printKeys
}
export async function getPrintExchangePrinterName(params: getPrintExchangePrinterNameQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMapstringobject['data']> {
  return request(
    {
      url: `/gct-platform/external/api/print/exchangePrinterName`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据打印机唯一标识key兑换打印机名称(btw)
 * import { postPrintExchangePrinterName4Btw } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export async function postPrintExchangePrinterName4Btw(data: undefined[], config:AxiosRequestConfig = {}): Promise<ResponseEntityListPrintResourceMapping['data']> {
  return request(
    {
      url: `/gct-platform/external/api/print/exchangePrinterName4Btw`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 执行打印
 * import { postPrintSendPrintData } from "/@/apis/gct-platform/ExternalPrintResourceController"
 */
export async function postPrintSendPrintData(data: PrintAdapterDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/external/api/print/sendPrintData`,
      method: 'post',
      data,
      ...config,
    },
  );
}