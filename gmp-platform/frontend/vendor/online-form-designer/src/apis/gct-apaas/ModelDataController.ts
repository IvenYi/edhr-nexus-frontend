import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityboolean, QueryRefDataRequest, ResponseEntityModelPageableRow } from './model/index';

/**
 * 软删改造，liquibase模型数据清洗
 * import { postModelDataAllModelLiquibaseSoftDeleteDataClean } from "/@/apis/gct-apaas/ModelDataController"
 */
export async function postModelDataAllModelLiquibaseSoftDeleteDataClean(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/model-data/allModelLiquibaseSoftDeleteDataClean`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 软删改造，应用下所有模型数据清洗
 * import { postModelDataAllModelSoftDeleteDataClean } from "/@/apis/gct-apaas/ModelDataController"
 */
export async function postModelDataAllModelSoftDeleteDataClean(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/model-data/allModelSoftDeleteDataClean`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getModelDataCheckFieldValueExist(params: getModelDataCheckFieldValueExistQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-data/checkFieldValueExist`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询引用数据
 * import { postModelDataQueryRefData } from "/@/apis/gct-apaas/ModelDataController"
 */
export async function postModelDataQueryRefData(data: QueryRefDataRequest, config = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/model-data/queryRefData`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postModelDataSingleModelSoftDeleteDataClean(params: postModelDataSingleModelSoftDeleteDataCleanQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/model-data/singleModelSoftDeleteDataClean`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}