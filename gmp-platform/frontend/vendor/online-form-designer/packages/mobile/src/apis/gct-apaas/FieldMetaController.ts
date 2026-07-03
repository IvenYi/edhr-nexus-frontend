import request from '@mobile/utils/request';
import type { ResponseEntitystring, FieldMeta4Check, ResponseEntityobject, ResponseEntityFieldMetaDTO, ResponseEntityListFieldMetaDTO, FieldSortRequest, ResponseEntityPageBaseFieldMetaDTO, SequencePreviewRequest, ResponseEntityListstring, FieldMetaVO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除字段
 * import { deleteFieldMeta } from "/@/apis/gct-apaas/FieldMetaController"
 */
export interface deleteFieldMetaQueryInterface {
  id: string; // 删除的id
}
export async function deleteFieldMeta(params: deleteFieldMetaQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 补充 data_version_ 字段（后门接口，谨慎使用！）
 * import { postFieldMetaCompleteDataVersion } from "/@/apis/gct-apaas/FieldMetaController"
 */
export async function postFieldMetaCompleteDataVersion(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/complete/dataVersion`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 更新所有精度小数字段的小数位数（后门接口，谨慎使用！）
 * import { putFieldMetaDecimalDigitsAllByDigits } from "/@/apis/gct-apaas/FieldMetaController"
 */
export interface putFieldMetaDecimalDigitsAllByDigitsPathInterface {
  digits: number; // digits
}
export async function putFieldMetaDecimalDigitsAllByDigits(path: putFieldMetaDecimalDigitsAllByDigitsPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/decimal/digits/all/${path?.digits}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 公式字段校验
 * import { postFieldMetaFuncCheck } from "/@/apis/gct-apaas/FieldMetaController"
 */
export async function postFieldMetaFuncCheck(data: FieldMeta4Check, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/func/check`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getFieldMetaInfo } from "/@/apis/gct-apaas/FieldMetaController"
 */
export interface getFieldMetaInfoQueryInterface {
  id: string; // id
}
export async function getFieldMetaInfo(params: getFieldMetaInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityFieldMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 实体模型数据字段列表
 * import { getFieldMetaList } from "/@/apis/gct-apaas/FieldMetaController"
 */
export interface getFieldMetaListQueryInterface {
  includeBuiltin?: boolean; // 是否包含内置字段
  includeProcess?: boolean; // 是否包含流程字段字段
  keyword?: string; // 搜索关键字
  modelKey: string; // 模型key
  sys?: boolean; // 是否包含系统字段
}
export async function getFieldMetaList(params: getFieldMetaListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListFieldMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取条件字段
 * import { getFieldMetaListConditionField } from "/@/apis/gct-apaas/FieldMetaController"
 */
export interface getFieldMetaListConditionFieldQueryInterface {
  includeProcess?: boolean; // 是否包含流程字段字段
  modelKey: string; // 模型key
}
export async function getFieldMetaListConditionField(params: getFieldMetaListConditionFieldQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListFieldMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/listConditionField`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 字段移动位置
 * import { postFieldMetaMove } from "/@/apis/gct-apaas/FieldMetaController"
 */
export async function postFieldMetaMove(data: FieldSortRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/move`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 回收站模型字段分页列表
 * import { getFieldMetaPageGetRecycledList } from "/@/apis/gct-apaas/FieldMetaController"
 */
export interface getFieldMetaPageGetRecycledListQueryInterface {
  modelKey?: string; // modelKey
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getFieldMetaPageGetRecycledList(params: getFieldMetaPageGetRecycledListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseFieldMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/page/getRecycledList`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 从回收站恢复模型
 * import { putFieldMetaPageRecycledRestoreByFieldId } from "/@/apis/gct-apaas/FieldMetaController"
 */
export interface putFieldMetaPageRecycledRestoreByFieldIdPathInterface {
  fieldId: string; // fieldId
}
export async function putFieldMetaPageRecycledRestoreByFieldId(path: putFieldMetaPageRecycledRestoreByFieldIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/page/recycledRestore/${path?.fieldId}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 序列号预览
 * import { postFieldMetaPreview } from "/@/apis/gct-apaas/FieldMetaController"
 */
export async function postFieldMetaPreview(data: SequencePreviewRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/preview`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 字段保存
 * import { postFieldMetaSave } from "/@/apis/gct-apaas/FieldMetaController"
 */
export async function postFieldMetaSave(data: FieldMetaVO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 添加唯一约束（后门接口，谨慎使用！）
 * import { putFieldMetaUniqueConstraintAddByModelKeyByFieldKeyByType } from "/@/apis/gct-apaas/FieldMetaController"
 */
export interface putFieldMetaUniqueConstraintAddByModelKeyByFieldKeyByTypePathInterface {
  fieldKey: string; // fieldKey
  modelKey: string; // modelKey
  type: string; // type
}
export async function putFieldMetaUniqueConstraintAddByModelKeyByFieldKeyByType(path: putFieldMetaUniqueConstraintAddByModelKeyByFieldKeyByTypePathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/unique/constraint/add/${path?.modelKey}/${path?.fieldKey}/${path?.type}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 字段编辑
 * import { putFieldMetaById } from "/@/apis/gct-apaas/FieldMetaController"
 */
export interface putFieldMetaByIdPathInterface {
  id: string; // id
}
export async function putFieldMetaById(path: putFieldMetaByIdPathInterface, data: FieldMetaVO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}