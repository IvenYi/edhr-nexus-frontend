import { defHttp } from '@/utils/http/axios';
import { ResponseEntityProcessPathDefRelationResponse } from './model/index';

/**
 * 根据表单实例id查询已完成的审批节点
 * import { getProcessPathFindAllByOfInstanceId } from "/@/apis/gct-apaas/ProcessPathController"
 */
export interface getProcessPathFindAllByOfInstanceIdQueryInterface {
  ofInstanceId: string; // ofInstanceId
}
export async function getProcessPathFindAllByOfInstanceId(params: getProcessPathFindAllByOfInstanceIdQueryInterface = {}, config = {}): Promise<ResponseEntityProcessPathDefRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-path/findAllByOfInstanceId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessPathFindAllByProcessInstanceId(params: getProcessPathFindAllByProcessInstanceIdQueryInterface = {}, config = {}): Promise<ResponseEntityProcessPathDefRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-path/findAllByProcessInstanceId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessPathFindAllByTmplId(params: getProcessPathFindAllByTmplIdQueryInterface = {}, config = {}): Promise<ResponseEntityProcessPathDefRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-path/findAllByTmplId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}