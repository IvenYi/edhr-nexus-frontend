import request from '@mobile/utils/request';
import type { ResponseEntityListPrintServiceBtwTreeVO, FrontendPrintRequest, ResponseEntityPrintCode, BackEndPrintRequest, ResponseEntityboolean, ResponseEntityListPrintServiceTreeVO, PrintAdapterDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 打印客户端关联bartender模板目录树下拉
 * import { getPrintBtwFileTree } from "/@/apis/gct-apaas/PrintController"
 */
export async function getPrintBtwFileTree(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPrintServiceBtwTreeVO['data']> {
  return request(
    {
      url: `/gct-apaas/api/print/btwFileTree`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 生成 zpl 编码
 * import { postPrintGenerateZplCode } from "/@/apis/gct-apaas/PrintController"
 */
export async function postPrintGenerateZplCode(data: FrontendPrintRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPrintCode['data']> {
  return request(
    {
      url: `/gct-apaas/api/print/generateZplCode`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 标签后端打印
 * import { postPrintLabelBackEndPrint } from "/@/apis/gct-apaas/PrintController"
 */
export async function postPrintLabelBackEndPrint(data: BackEndPrintRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/print/labelBackEndPrint`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取打印机下拉集合
 * import { getPrintPrintDropdownList } from "/@/apis/gct-apaas/PrintController"
 */
export async function getPrintPrintDropdownList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPrintServiceTreeVO['data']> {
  return request(
    {
      url: `/gct-apaas/api/print/printDropdownList`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 执行打印 
 * import { postPrintSendPrintData } from "/@/apis/gct-apaas/PrintController"
 */
export async function postPrintSendPrintData(data: PrintAdapterDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/print/sendPrintData`,
      method: 'post',
      data,
      ...config,
    },
  );
}