import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityListModelMetaResponse, ResponseEntityListCategoryCompleteResponse, UpdateConstantRequest, ResponseEntityModelMetaDTO, ResponseEntityTableMetaER, ResponseEntityModelMetaResponse, ResponseEntityListModelField, ResponseEntityListModelMetaDTO, ResponseEntityPageBaseModelMetaResponse, ResponseEntityListModelBriefInfo, ModelMetaVO } from './model/index';

/**
 * 删除实体模型
 * import { deleteModelMeta } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface deleteModelMetaQueryInterface {
  ids: string; // 删除的id
}
export async function deleteModelMeta(params: deleteModelMetaQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/model-meta`,
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
 * 获取汇总模型列表
 * import { getModelMetaAggList } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaAggListQueryInterface {
  modelKey: string; // 模型key
}
export async function getModelMetaAggList(params: getModelMetaAggListQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/agg/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取汇总模型列表
 * import { getModelMetaAggModel } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaAggModelQueryInterface {
  modelKey: string; // 模型key
}
export async function getModelMetaAggModel(params: getModelMetaAggModelQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/agg/model`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据模型key批量查询模型列表
 * import { getModelMetaByKeys } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaByKeysQueryInterface {
  modelKeys: string; // 多个模型key 逗号拼接
}
export async function getModelMetaByKeys(params: getModelMetaByKeysQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/by/keys`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 更新模型约束
 * import { putModelMetaConstantByModelKey } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface putModelMetaConstantByModelKeyPathInterface {
  modelKey: string; // 模型key
}
export async function putModelMetaConstantByModelKey(path: putModelMetaConstantByModelKeyPathInterface, data: UpdateConstantRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/model-meta/constant/${path?.modelKey}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询启用数据权限模型列表
 * import { getModelMetaDataPermissionList } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaDataPermissionListQueryInterface {
  keyword?: string; // 根据名称搜索
}
export async function getModelMetaDataPermissionList(params: getModelMetaDataPermissionListQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/data-permission/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据模型key查询模型和字段详情
 * import { getModelMetaDetail } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaDetailQueryInterface {
  modelKey: string; // 模型key
  types?: string; // 需要去除的类型type，多个按','分割
}
export async function getModelMetaDetail(params: getModelMetaDetailQueryInterface = {}, config = {}): Promise<ResponseEntityModelMetaDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/detail`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 实体模型默认显示字段配置
 * import { putModelMetaDisplayByModelKeyByFieldKey } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface putModelMetaDisplayByModelKeyByFieldKeyPathInterface {
  fieldKey: string; // 显示字段 fieldKey
  modelKey: string; // 模型key
}
export async function putModelMetaDisplayByModelKeyByFieldKey(path: putModelMetaDisplayByModelKeyByFieldKeyPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/model-meta/display/${path?.modelKey}/${path?.fieldKey}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 实体模型ER图查询
 * import { getModelMetaEr } from "/@/apis/gct-apaas/ModelMetaController"
 */
export async function getModelMetaEr(config = {}): Promise<ResponseEntityTableMetaER['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/er`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据类型查询所有模型
 * import { getModelMetaFindAllByTypeIn } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaFindAllByTypeInQueryInterface {
  type: string; // 类型根据逗号分割：BASE,NDO,RDO
}
export async function getModelMetaFindAllByTypeIn(params: getModelMetaFindAllByTypeInQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/findAllByTypeIn`,
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
 * import { getModelMetaInfo } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaInfoQueryInterface {
  id: string; // id
}
export async function getModelMetaInfo(params: getModelMetaInfoQueryInterface = {}, config = {}): Promise<ResponseEntityModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 模型列表查询
 * import { getModelMetaList } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaListQueryInterface {
  categoryId?: string; // 分类id
  type?: string; // 模型标志:(NDO/RDO)
}
export async function getModelMetaList(params: getModelMetaListQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取所有模型
 * import { getModelMetaListAll } from "/@/apis/gct-apaas/ModelMetaController"
 */
export async function getModelMetaListAll(config = {}): Promise<ResponseEntityListModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/list-all`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 通过名称筛选模型和字段
 * import { getModelMetaListAllModelAndFieldByName } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaListAllModelAndFieldByNameQueryInterface {
  name: string; // 名称
}
export async function getModelMetaListAllModelAndFieldByName(params: getModelMetaListAllModelAndFieldByNameQueryInterface = {}, config = {}): Promise<ResponseEntityListModelField['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/listAllModelAndFieldByName`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取主模型列表
 * import { getModelMetaListMasterModel } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaListMasterModelQueryInterface {
  subModelKey: string; // subModelKey
}
export async function getModelMetaListMasterModel(params: getModelMetaListMasterModelQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/listMasterModel`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取引用自己的模型
 * import { getModelMetaListModelReferencedBy } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaListModelReferencedByQueryInterface {
  modelKey: string; // 模型key
  type?: string; // 关联字段类型: 多个类型逗号分隔，例如 ref,rdo_ref
}
export async function getModelMetaListModelReferencedBy(params: getModelMetaListModelReferencedByQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMetaDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/listModelReferencedBy`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取自己的子模型
 * import { getModelMetaListSlaveModel } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaListSlaveModelQueryInterface {
  modelKey: string; // 模型key
}
export async function getModelMetaListSlaveModel(params: getModelMetaListSlaveModelQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMetaDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/listSlaveModel`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 回收站模型分页列表
 * import { getModelMetaPageGetRecycledList } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaPageGetRecycledListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getModelMetaPageGetRecycledList(params: getModelMetaPageGetRecycledListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/page/getRecycledList`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 从回收站恢复模型
 * import { putModelMetaPageRecycledRestoreByModelKey } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface putModelMetaPageRecycledRestoreByModelKeyPathInterface {
  modelKey: string; // modelKey
}
export async function putModelMetaPageRecycledRestoreByModelKey(path: putModelMetaPageRecycledRestoreByModelKeyPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/model-meta/page/recycledRestore/${path?.modelKey}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询启用权限模型列表查询
 * import { getModelMetaPermissionEnabledList } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaPermissionEnabledListQueryInterface {
  permissionEnabled?: string; // 是否启用权限 1启用,0未启用
  type?: string; // 模型标志:(NDO/RDO)
}
export async function getModelMetaPermissionEnabledList(params: getModelMetaPermissionEnabledListQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/permission-enabled/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询配置过数据权限的模型列表
 * import { getModelMetaPermissionRelation } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaPermissionRelationQueryInterface {
  keyword?: string; // 搜索关键字
}
export async function getModelMetaPermissionRelation(params: getModelMetaPermissionRelationQueryInterface = {}, config = {}): Promise<ResponseEntityListModelBriefInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/permission/relation`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 实体模型保存
 * import { postModelMetaSave } from "/@/apis/gct-apaas/ModelMetaController"
 */
export async function postModelMetaSave(data: ModelMetaVO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/model-meta/save`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 模型启用禁用支持消息
 * import { putModelMetaSupportMessageByModelKeyByEnabled } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface putModelMetaSupportMessageByModelKeyByEnabledPathInterface {
  enabled: number; // 状态(1:启用 ,0: 禁用)
  modelKey: string; // 模型key
}
export async function putModelMetaSupportMessageByModelKeyByEnabled(path: putModelMetaSupportMessageByModelKeyByEnabledPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/model-meta/support-message/${path?.modelKey}/${path?.enabled}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取支持流程的模型树
 * import { getModelMetaSupportProcess } from "/@/apis/gct-apaas/ModelMetaController"
 */
export async function getModelMetaSupportProcess(config = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/support-process`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 翻译模型字段表达式
 * import { getModelMetaTranslateModelFieldExp } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaTranslateModelFieldExpQueryInterface {
  exp: string; // 表达式（modelKey.f1.f2）
}
export async function getModelMetaTranslateModelFieldExp(params: getModelMetaTranslateModelFieldExpQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/translateModelFieldExp`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询模型列表过滤已添加过数据权限的模型
 * import { getModelMetaUnrelatedList } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface getModelMetaUnrelatedListQueryInterface {
  keyword?: string; // 模型key
}
export async function getModelMetaUnrelatedList(params: getModelMetaUnrelatedListQueryInterface = {}, config = {}): Promise<ResponseEntityListModelBriefInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-meta/unrelated/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 实体模型编辑
 * import { putModelMetaById } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface putModelMetaByIdPathInterface {
  id: string; // id
}
export async function putModelMetaById(path: putModelMetaByIdPathInterface, data: ModelMetaVO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/model-meta/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 实体模型编辑 启用禁用权限
 * import { putModelMetaByModelKeyByEnabled } from "/@/apis/gct-apaas/ModelMetaController"
 */
export interface putModelMetaByModelKeyByEnabledPathInterface {
  enabled: number; // 状态(1:启用 ,0: 禁用)
  modelKey: string; // 模型key
}
export async function putModelMetaByModelKeyByEnabled(path: putModelMetaByModelKeyByEnabledPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/model-meta/${path?.modelKey}/${path?.enabled}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}