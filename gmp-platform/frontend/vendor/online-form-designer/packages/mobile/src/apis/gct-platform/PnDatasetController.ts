import request from '@mobile/utils/request';
import type { PnDatasetRequest, ResponseEntitystring, ResponseEntitySqlResult, ResponseEntityListMapstringobject, APIDatasetConfigDTO, ExprDTO, ResponseEntityPnDatasetResponse, ResponseEntityListPnDatasetResponse, ResponseEntityobject, ResponseEntityPageBasePnDatasetResponse, PnDataset } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDataset } from "/@/apis/gct-platform/PnDatasetController"
 */
export async function postDataset(data: PnDatasetRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDataset } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface deleteDatasetQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDataset(params: deleteDatasetQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 更换数据集分类
 * import { getDatasetChangeCategory } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetChangeCategoryQueryInterface {
  datasetId?: string; // 数据集Id
  destId?: string; // 目的地category id
}
export async function getDatasetChangeCategory(params: getDatasetChangeCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/change-category`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列所有值，去重
 * import { getDatasetColumnValue } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetColumnValueQueryInterface {
  column: string; // column
  datasetId: string; // datasetId
}
export async function getDatasetColumnValue(params: getDatasetColumnValueQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySqlResult['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/column-value`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 新建数据集时手动调用api
 * import { postDatasetCreateRequest } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface postDatasetCreateRequestQueryInterface {
  datasourceId: string; // 数据源id
}
export async function postDatasetCreateRequest(data: undefined, params: postDatasetCreateRequestQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/create-request`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 编辑/浏览数据集时调用api
 * import { postDatasetEditRequest } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface postDatasetEditRequestQueryInterface {
  datasetId: string; // 数据集id
}
export async function postDatasetEditRequest(data: APIDatasetConfigDTO, params: postDatasetEditRequestQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/edit-request`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 历史数据encode
 * import { putDatasetEncode } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface putDatasetEncodeQueryInterface {
  sql: string; // encode的id，多个按','分割
}
export async function putDatasetEncode(params: putDatasetEncodeQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/encode`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 函数生成新字段
 * import { postDatasetGenColumn } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface postDatasetGenColumnQueryInterface {
  dbType: string; // 数据集对应的数据库类型（postgres/sqlserver/mysql/oracle），本地上传填postgres
  fileUpload?: boolean; // 数据集是否是本地上传
}
export async function postDatasetGenColumn(data: ExprDTO, params: postDatasetGenColumnQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/gen-column`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getDatasetInfo } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetInfoQueryInterface {
  id?: string; // id
  key?: string; // key
}
export async function getDatasetInfo(params: getDatasetInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPnDatasetResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getDatasetInfoNoHeader } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetInfoNoHeaderQueryInterface {
  id: string; // id
}
export async function getDatasetInfoNoHeader(params: getDatasetInfoNoHeaderQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPnDatasetResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/infoNoHeader`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDatasetList } from "/@/apis/gct-platform/PnDatasetController"
 */
export async function getDatasetList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPnDatasetResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 目录和数据集列表
 * import { getDatasetListCategoryDataset } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetListCategoryDatasetQueryInterface {
  appId?: string; // 应用id
}
export async function getDatasetListCategoryDataset(params: getDatasetListCategoryDatasetQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/list-category-dataset`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表(根据id)
 * import { getDatasetListIds } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetListIdsQueryInterface {
  ids: string; // 多个id，多个按','分割
}
export async function getDatasetListIds(params: getDatasetListIdsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPnDatasetResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/list/ids`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表(根据key)
 * import { getDatasetListKeys } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetListKeysQueryInterface {
  keys: string; // 多个key，多个按','分割
}
export async function getDatasetListKeys(params: getDatasetListKeysQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPnDatasetResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/list/keys`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDatasetPageList } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetPageListQueryInterface {
  categoryId?: string; // categoryId
  name?: string; // name
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDatasetPageList(params: getDatasetPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePnDatasetResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 运行sql
 * import { postDatasetRunScript } from "/@/apis/gct-platform/PnDatasetController"
 */
export async function postDatasetRunScript(data: PnDataset, config:AxiosRequestConfig = {}): Promise<ResponseEntitySqlResult['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/runScript`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 运行sql(裸奔接口)
 * import { postDatasetRunScriptNoHeader } from "/@/apis/gct-platform/PnDatasetController"
 */
export async function postDatasetRunScriptNoHeader(data: PnDataset, config:AxiosRequestConfig = {}): Promise<ResponseEntitySqlResult['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/runScriptNoHeader`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDatasetById } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface putDatasetByIdPathInterface {
  id: string; // id
}
export async function putDatasetById(path: putDatasetByIdPathInterface, data: PnDatasetRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}