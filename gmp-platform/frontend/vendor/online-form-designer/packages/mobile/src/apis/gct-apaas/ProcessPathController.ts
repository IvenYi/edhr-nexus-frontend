import request from '@mobile/utils/request';
import type { ResponseEntityProcessPathDefRelationResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 根据表单实例id查询已完成的审批节点
 * import { getProcessPathFindAllByOfInstanceId } from "/@/apis/gct-apaas/ProcessPathController"
 */
export interface getProcessPathFindAllByOfInstanceIdQueryInterface {
  ofInstanceId: string; // ofInstanceId
}
export async function getProcessPathFindAllByOfInstanceId(params: getProcessPathFindAllByOfInstanceIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessPathDefRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-path/findAllByOfInstanceId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据表单实例id查询已完成的审批节点
 * import { getProcessPathFindAllByProcessInstanceId } from "/@/apis/gct-apaas/ProcessPathController"
 */
export interface getProcessPathFindAllByProcessInstanceIdQueryInterface {
  processInstanceId: string; // processInstanceId
}
export async function getProcessPathFindAllByProcessInstanceId(params: getProcessPathFindAllByProcessInstanceIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessPathDefRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-path/findAllByProcessInstanceId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据文控模板版本id查询已完成的审批节点
 * import { getProcessPathFindAllByTmplId } from "/@/apis/gct-apaas/ProcessPathController"
 */
export interface getProcessPathFindAllByTmplIdQueryInterface {
  tmplId: string; // 文控模板版本id,格式：baseId:id
}
export async function getProcessPathFindAllByTmplId(params: getProcessPathFindAllByTmplIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessPathDefRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-path/findAllByTmplId`,
      method: 'get',
      params,
      ...config,
    },
  );
}