import request from '@mobile/utils/request';
import type { PnProjectRequest, ResponseEntitystring, PnPageSaveRequest, ResponseEntityPnProjectResponse, ResponseEntityListPnProjectResponse, ResponseEntityPageBasePnProjectResponse, 发布 } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPnProject } from "/@/apis/gct-platform/PnProjectController"
 */
export async function postPnProject(data: PnProjectRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project`,
      method: 'post',
      data,
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
export async function deletePnProject(params: deletePnProjectQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project`,
      method: 'delete',
      params,
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
export async function getPnProjectChangeCategory(params: getPnProjectChangeCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/change-category`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 复制
 * import { postPnProjectCopy } from "/@/apis/gct-platform/PnProjectController"
 */
export async function postPnProjectCopy(data: PnPageSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/copy`,
      method: 'post',
      data,
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
export async function getPnProjectExport(params: getPnProjectExportQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/pn-project/export`,
      method: 'get',
      params,
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
export async function postPnProjectImport(data: undefined, params: postPnProjectImportQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/import`,
      method: 'post',
      params,
      data,
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
export async function getPnProjectInfo(params: getPnProjectInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPnProjectResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/info`,
      method: 'get',
      params,
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
export async function getPnProjectInfoNoHeader(params: getPnProjectInfoNoHeaderQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPnProjectResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/infoNoHeader`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPnProjectList } from "/@/apis/gct-platform/PnProjectController"
 */
export async function getPnProjectList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPnProjectResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/list`,
      method: 'get',
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
export async function getPnProjectPageList(params: getPnProjectPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePnProjectResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 发布/取消发布
 * import { postPnProjectRelease } from "/@/apis/gct-platform/PnProjectController"
 */
export async function postPnProjectRelease(data: 发布, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/release`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存页面
 * import { postPnProjectSavePage } from "/@/apis/gct-platform/PnProjectController"
 */
export async function postPnProjectSavePage(data: PnPageSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/savePage`,
      method: 'post',
      data,
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
export async function putPnProjectById(path: putPnProjectByIdPathInterface, data: PnProjectRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-project/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}