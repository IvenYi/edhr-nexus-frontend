import { defHttp } from '@/utils/http/axios';
import { ProcessInstanceRelationRequest, ResponseEntitystring, ResponseEntityProcessInstanceRelationResponse, ResponseEntityListProcessInstanceRelationResponse, ResponseEntityPageBaseProcessInstanceRelationResponse } from './model/index';

/**
 * 保存
 * import { postProcessInstanceRelation- } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export async function postProcessInstanceRelation-(data: ProcessInstanceRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-instance-relation-`,
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
 * import { deleteProcessInstanceRelation- } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export interface deleteProcessInstanceRelation-QueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessInstanceRelation-(params: deleteProcessInstanceRelation-QueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-instance-relation-`,
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
 * 详情
 * import { getProcessInstanceRelation-Info } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export interface getProcessInstanceRelation-InfoQueryInterface {
  id: string; // id
}
export async function getProcessInstanceRelation-Info(params: getProcessInstanceRelation-InfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessInstanceRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-instance-relation-/info`,
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
 * import { getProcessInstanceRelation-List } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export async function getProcessInstanceRelation-List(config = {}): Promise<ResponseEntityListProcessInstanceRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-instance-relation-/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessInstanceRelation-PageList } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export interface getProcessInstanceRelation-PageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessInstanceRelation-PageList(params: getProcessInstanceRelation-PageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessInstanceRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-instance-relation-/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessInstanceRelation-ById } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export interface putProcessInstanceRelation-ByIdPathInterface {
  id: string; // id
}
export async function putProcessInstanceRelation-ById(path: putProcessInstanceRelation-ByIdPathInterface, data: ProcessInstanceRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-instance-relation-/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}