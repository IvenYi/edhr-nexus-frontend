import { defHttp } from '@/utils/http/axios';
import { PnProjectRequest, ResponseEntitystring, PnPageSaveRequest, ResponseEntityPnProjectResponse, ResponseEntityListPnProjectResponse, ResponseEntityPageBasePnProjectResponse, 发布 } from './model/index';

/**
 * 保存
 * import { postPnProject } from "/@/apis/gct-platform/PnProjectController"
 */
export async function postPnProject(data: PnProjectRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pn-project`,
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
 * import { deletePnProject } from "/@/apis/gct-platform/PnProjectController"
 */
export interface deletePnProjectQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePnProject(params: deletePnProjectQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/pn-project`,
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
 * 更换project分类
 * import { getPnProjectChangeCategory } from "/@/apis/gct-platform/PnProjectController"
 */
export interface getPnProjectChangeCategoryQueryInterface {
  destId?: string; // 目的地category id
  projectId?: string; // 数据集Id
}
export async function getPnProjectChangeCategory(params: getPnProjectChangeCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pn-project/change-category`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 复制
 * import { postPnProjectCopy } from "/@/apis/gct-platform/PnProjectController"
 */
export async function postPnProjectCopy(data: PnPageSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pn-project/copy`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 工程导出
 * import { getPnProjectExport } from "/@/apis/gct-platform/PnProjectController"
 */
export interface getPnProjectExportQueryInterface {
  appId: string; // appId
  projectId: string; // projectId
}
export async function getPnProjectExport(params: getPnProjectExportQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pn-project/export`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 工程导入
 * import { postPnProjectImport } from "/@/apis/gct-platform/PnProjectController"
 */
export interface postPnProjectImportQueryInterface {
  appId: string; // appId
}
export async function postPnProjectImport(data: any, params: postPnProjectImportQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pn-project/import`,
      params,
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
 * import { getPnProjectInfo } from "/@/apis/gct-platform/PnProjectController"
 */
export interface getPnProjectInfoQueryInterface {
  id: string; // id
}
export async function getPnProjectInfo(params: getPnProjectInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPnProjectResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pn-project/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情(裸奔接口)
 * import { getPnProjectInfoNoHeader } from "/@/apis/gct-platform/PnProjectController"
 */
export interface getPnProjectInfoNoHeaderQueryInterface {
  id: string; // id
}
export async function getPnProjectInfoNoHeader(params: getPnProjectInfoNoHeaderQueryInterface = {}, config = {}): Promise<ResponseEntityPnProjectResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pn-project/infoNoHeader`,
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
 * import { getPnProjectList } from "/@/apis/gct-platform/PnProjectController"
 */
export async function getPnProjectList(config = {}): Promise<ResponseEntityListPnProjectResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pn-project/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPnProjectPageList } from "/@/apis/gct-platform/PnProjectController"
 */
export interface getPnProjectPageListQueryInterface {
  appId?: string; // 应用Id
  categoryId?: string; // 分类Id
  developCanvas?: string; // 绑定设计器组件名
  name?: string; // 查询条件
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPnProjectPageList(params: getPnProjectPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePnProjectResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pn-project/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 发布/取消发布
 * import { postPnProjectRelease } from "/@/apis/gct-platform/PnProjectController"
 */
export async function postPnProjectRelease(data: 发布, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pn-project/release`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存页面
 * import { postPnProjectSavePage } from "/@/apis/gct-platform/PnProjectController"
 */
export async function postPnProjectSavePage(data: PnPageSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pn-project/savePage`,
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
 * import { putPnProjectById } from "/@/apis/gct-platform/PnProjectController"
 */
export interface putPnProjectByIdPathInterface {
  id: string; // id
}
export async function putPnProjectById(path: putPnProjectByIdPathInterface, data: PnProjectRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/pn-project/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}