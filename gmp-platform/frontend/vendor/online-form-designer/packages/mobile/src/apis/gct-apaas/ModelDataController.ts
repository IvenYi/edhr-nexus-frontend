import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityboolean, QueryRefDataRequest, ResponseEntityModelPageableRow } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 软删改造，liquibase模型数据清洗
 * import { postModelDataAllModelLiquibaseSoftDeleteDataClean } from "/@/apis/gct-apaas/ModelDataController"
 */
export async function postModelDataAllModelLiquibaseSoftDeleteDataClean(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-data/allModelLiquibaseSoftDeleteDataClean`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 软删改造，应用下所有模型数据清洗
 * import { postModelDataAllModelSoftDeleteDataClean } from "/@/apis/gct-apaas/ModelDataController"
 */
export async function postModelDataAllModelSoftDeleteDataClean(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-data/allModelSoftDeleteDataClean`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 检查字段值是否存在
 * import { getModelDataCheckFieldValueExist } from "/@/apis/gct-apaas/ModelDataController"
 */
export interface getModelDataCheckFieldValueExistQueryInterface {
  excludeId?: string; // 需要排除的数据id
  fieldKey: string; // 字段key
  fieldValue: object; // 字段值
  modelKey: string; // 模型key
  refFieldKey?: string; // 主数据字段key，子表数据需要
  refMasterId?: string; // 主数据id，子表数据需要
}
export async function getModelDataCheckFieldValueExist(params: getModelDataCheckFieldValueExistQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-data/checkFieldValueExist`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询引用数据
 * import { postModelDataQueryRefData } from "/@/apis/gct-apaas/ModelDataController"
 */
export async function postModelDataQueryRefData(data: QueryRefDataRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-data/queryRefData`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 软删改造，单模型数据清洗
 * import { postModelDataSingleModelSoftDeleteDataClean } from "/@/apis/gct-apaas/ModelDataController"
 */
export interface postModelDataSingleModelSoftDeleteDataCleanQueryInterface {
  modelKey: string; // modelKey
}
export async function postModelDataSingleModelSoftDeleteDataClean(params: postModelDataSingleModelSoftDeleteDataCleanQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-data/singleModelSoftDeleteDataClean`,
      method: 'post',
      params,
      ...config,
    },
  );
}