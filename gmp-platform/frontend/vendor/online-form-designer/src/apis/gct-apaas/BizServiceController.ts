import { defHttp } from '@/utils/http/axios';
import { BizServiceRequest, ResponseEntitystring, ResponseEntityListBizServiceMeta, BizServiceDragRequest, ResponseEntityBizServiceResponse, ResponseEntityPageBaseBizServiceResponse } from './model/index';

/**
 * 保存
 * import { postBizServiceCrud } from "/@/apis/gct-apaas/BizServiceController"
 */
export async function postBizServiceCrud(data: BizServiceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-service-crud`,
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
 * import { deleteBizServiceCrud } from "/@/apis/gct-apaas/BizServiceController"
 */
export interface deleteBizServiceCrudQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBizServiceCrud(params: deleteBizServiceCrudQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/biz-service-crud`,
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
 * 数据模型业务服务列表
 * import { getBizServiceCrudDataModelList } from "/@/apis/gct-apaas/BizServiceController"
 */
export async function getBizServiceCrudDataModelList(config = {}): Promise<ResponseEntityListBizServiceMeta['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-service-crud/data-model/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 拖拽
 * import { postBizServiceCrudDrag } from "/@/apis/gct-apaas/BizServiceController"
 */
export async function postBizServiceCrudDrag(data: BizServiceDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-service-crud/drag`,
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
 * import { getBizServiceCrudInfo } from "/@/apis/gct-apaas/BizServiceController"
 */
export interface getBizServiceCrudInfoQueryInterface {
  id: string; // id
}
export async function getBizServiceCrudInfo(params: getBizServiceCrudInfoQueryInterface = {}, config = {}): Promise<ResponseEntityBizServiceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-service-crud/info`,
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
 * import { getBizServiceCrudList } from "/@/apis/gct-apaas/BizServiceController"
 */
export interface getBizServiceCrudListQueryInterface {
  endTime?: string; // 结束时间
  key?: string; // 服务key
  method?: string; // 服务方式
  modelKey?: string; // 模型key
  name?: string; // 服务name
  searchKey?: string; // 模糊匹配key、name
  sortNum?: number; // 排序
  startTime?: string; // 开始时间
  type?: string; // 服务类型
}
export async function getBizServiceCrudList(params: getBizServiceCrudListQueryInterface = {}, config = {}): Promise<ResponseEntityListBizServiceMeta['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-service-crud/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getBizServiceCrudPageList } from "/@/apis/gct-apaas/BizServiceController"
 */
export interface getBizServiceCrudPageListQueryInterface {
  endTime?: string; // 结束时间
  key?: string; // 服务key
  method?: string; // 服务方式
  modelKey?: string; // 模型key
  name?: string; // 服务name
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortNum?: number; // 排序
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  type?: string; // 服务类型
}
export async function getBizServiceCrudPageList(params: getBizServiceCrudPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseBizServiceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-service-crud/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 视图模型业务服务列表
 * import { getBizServiceCrudViewModelList } from "/@/apis/gct-apaas/BizServiceController"
 */
export interface getBizServiceCrudViewModelListQueryInterface {
  modelKey?: string; // modelKey
}
export async function getBizServiceCrudViewModelList(params: getBizServiceCrudViewModelListQueryInterface = {}, config = {}): Promise<ResponseEntityListBizServiceMeta['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-service-crud/view-model/list`,
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
 * import { putBizServiceCrudById } from "/@/apis/gct-apaas/BizServiceController"
 */
export interface putBizServiceCrudByIdPathInterface {
  id: string; // id
}
export async function putBizServiceCrudById(path: putBizServiceCrudByIdPathInterface, data: BizServiceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/biz-service-crud/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}