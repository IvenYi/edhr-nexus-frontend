import { defHttp } from '@/utils/http/axios';
import { PnDatasetRequest, ResponseEntitystring, ResponseEntitySqlResult, ResponseEntityListMapstringobject, APIDatasetConfigDTO, ExprDTO, ResponseEntityPnDatasetResponse, ResponseEntityListPnDatasetResponse, ResponseEntityobject, ResponseEntityPageBasePnDatasetResponse, PnDataset } from './model/index';

/**
 * 保存
 * import { postDataset } from "/@/apis/gct-platform/PnDatasetController"
 */
export async function postDataset(data: PnDatasetRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/dataset`,
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
 * import { deleteDataset } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface deleteDatasetQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDataset(params: deleteDatasetQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/dataset`,
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
 * 更换数据集分类
 * import { getDatasetChangeCategory } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetChangeCategoryQueryInterface {
  datasetId?: string; // 数据集Id
  destId?: string; // 目的地category id
}
export async function getDatasetChangeCategory(params: getDatasetChangeCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset/change-category`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatasetColumnValue(params: getDatasetColumnValueQueryInterface = {}, config = {}): Promise<ResponseEntitySqlResult['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset/column-value`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postDatasetCreateRequest(data: any, params: postDatasetCreateRequestQueryInterface = {}, config = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/dataset/create-request`,
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
 * 编辑/浏览数据集时调用api
 * import { postDatasetEditRequest } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface postDatasetEditRequestQueryInterface {
  datasetId: string; // 数据集id
}
export async function postDatasetEditRequest(data: APIDatasetConfigDTO, params: postDatasetEditRequestQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/dataset/edit-request`,
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
 * 历史数据encode
 * import { putDatasetEncode } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface putDatasetEncodeQueryInterface {
  sql: string; // encode的id，多个按','分割
}
export async function putDatasetEncode(params: putDatasetEncodeQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/dataset/encode`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postDatasetGenColumn(data: ExprDTO, params: postDatasetGenColumnQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/dataset/gen-column`,
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
 * import { getDatasetInfo } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetInfoQueryInterface {
  id?: string; // id
  key?: string; // key
}
export async function getDatasetInfo(params: getDatasetInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPnDatasetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatasetInfoNoHeader(params: getDatasetInfoNoHeaderQueryInterface = {}, config = {}): Promise<ResponseEntityPnDatasetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset/infoNoHeader`,
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
 * import { getDatasetList } from "/@/apis/gct-platform/PnDatasetController"
 */
export async function getDatasetList(config = {}): Promise<ResponseEntityListPnDatasetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatasetListCategoryDataset(params: getDatasetListCategoryDatasetQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset/list-category-dataset`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatasetListIds(params: getDatasetListIdsQueryInterface = {}, config = {}): Promise<ResponseEntityListPnDatasetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset/list/ids`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatasetListKeys(params: getDatasetListKeysQueryInterface = {}, config = {}): Promise<ResponseEntityListPnDatasetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset/list/keys`,
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
 * import { getDatasetPageList } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface getDatasetPageListQueryInterface {
  categoryId?: string; // categoryId
  name?: string; // name
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDatasetPageList(params: getDatasetPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePnDatasetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 运行sql
 * import { postDatasetRunScript } from "/@/apis/gct-platform/PnDatasetController"
 */
export async function postDatasetRunScript(data: PnDataset, config = {}): Promise<ResponseEntitySqlResult['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/dataset/runScript`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 运行sql(裸奔接口)
 * import { postDatasetRunScriptNoHeader } from "/@/apis/gct-platform/PnDatasetController"
 */
export async function postDatasetRunScriptNoHeader(data: PnDataset, config = {}): Promise<ResponseEntitySqlResult['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/dataset/runScriptNoHeader`,
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
 * import { putDatasetById } from "/@/apis/gct-platform/PnDatasetController"
 */
export interface putDatasetByIdPathInterface {
  id: string; // id
}
export async function putDatasetById(path: putDatasetByIdPathInterface, data: PnDatasetRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/dataset/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}