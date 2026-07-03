import { defHttp } from '@/utils/http/axios';
import { InstanceRelationRequest, ResponseEntitystring, ResponseEntityInstanceRelationResponse, ResponseEntityListInstanceRelationResponse, ResponseEntityPageBaseInstanceRelationResponse, ResponseEntityboolean } from './model/index';

/**
 * 绑定表单任务实例
 * import { postInstanceRelationBind } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export async function postInstanceRelationBind(data: InstanceRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/instance-relation/bind`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getInstanceRelationInfo } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export interface getInstanceRelationInfoQueryInterface {
  id: string; // id
}
export async function getInstanceRelationInfo(params: getInstanceRelationInfoQueryInterface = {}, config = {}): Promise<ResponseEntityInstanceRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/instance-relation/info`,
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
 * import { getInstanceRelationList } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export async function getInstanceRelationList(config = {}): Promise<ResponseEntityListInstanceRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/instance-relation/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getInstanceRelationPageList } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export interface getInstanceRelationPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getInstanceRelationPageList(params: getInstanceRelationPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseInstanceRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/instance-relation/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 解绑表单任务实例
 * import { deleteInstanceRelationUnbind } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export interface deleteInstanceRelationUnbindQueryInterface {
  instId: string; // 关联实例id
  materialNo: string; // 批次号
}
export async function deleteInstanceRelationUnbind(params: deleteInstanceRelationUnbindQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/instance-relation/unbind`,
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
 * 修改标题-附录
 * import { putInstanceRelationUpdateTitle } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export interface putInstanceRelationUpdateTitleQueryInterface {
  materialNo: string; // materialNo
  ofInstId: string; // ofInstId
  title: string; // title
}
export async function putInstanceRelationUpdateTitle(params: putInstanceRelationUpdateTitleQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/instance-relation/updateTitle`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}