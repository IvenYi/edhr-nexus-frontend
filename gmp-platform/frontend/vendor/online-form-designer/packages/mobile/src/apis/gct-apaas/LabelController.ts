import request from '@mobile/utils/request';
import type { LabelRequest, ResponseEntitystring, ResponseEntityPageBaseLabelResponse, LabelBtwDesigner, ResponseEntityLabelResponse, ResponseEntityListCategoryRdoRelationResponse, LabelNameCheckRequest, ResponseEntityboolean, ResponseEntityListLabelResponse, ResponseEntityListFontConfig, ResponseEntityobject, LabelDesigner, XmlSetting } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postLabel } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabel(data: LabelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除父
 * import { deleteLabel } from "/@/apis/gct-apaas/LabelController"
 */
export interface deleteLabelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteLabel(params: deleteLabelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * btw保存
 * import { postLabelBtw } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelBtw(data: LabelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/btw`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * btw复制
 * import { postLabelBtwCopy } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelBtwCopy(data: LabelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/btw/copy`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * btw模板分页列表
 * import { getLabelBtwPageList } from "/@/apis/gct-apaas/LabelController"
 */
export interface getLabelBtwPageListQueryInterface {
  modelKey?: string; // 模型key
  name?: string; // 标签名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}
export async function getLabelBtwPageList(params: getLabelBtwPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseLabelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/btw/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 删除版本
 * import { deleteLabelBtwRemoveVersionById } from "/@/apis/gct-apaas/LabelController"
 */
export interface deleteLabelBtwRemoveVersionByIdQueryInterface {
  id: string; // 删除的id
}
export async function deleteLabelBtwRemoveVersionById(params: deleteLabelBtwRemoveVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/btw/removeVersionById`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * btw标签修改
 * import { putLabelBtwUpdate } from "/@/apis/gct-apaas/LabelController"
 */
export async function putLabelBtwUpdate(data: LabelBtwDesigner, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/btw/update`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 复制
 * import { postLabelCopy } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelCopy(data: LabelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/copy`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 复制版本
 * import { postLabelCopyVersionById } from "/@/apis/gct-apaas/LabelController"
 */
export interface postLabelCopyVersionByIdPathInterface {
  id: string; // id
}
export async function postLabelCopyVersionById(path: postLabelCopyVersionByIdPathInterface, data: LabelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/copyVersion/${path?.id}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 下载实体列表
 * import { getLabelEntityInfo } from "/@/apis/gct-apaas/LabelController"
 */
export interface getLabelEntityInfoQueryInterface {
  tableNamePattern?: string; // tableNamePattern
}
export async function getLabelEntityInfo(params: getLabelEntityInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/api/label/entity/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 下载实体列表
 * import { getLabelEntityUpdateDatetimeSql } from "/@/apis/gct-apaas/LabelController"
 */
export async function getLabelEntityUpdateDatetimeSql(config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/api/label/entity/update/datetime/sql`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 列表
 * import { getLabelExecute } from "/@/apis/gct-apaas/LabelController"
 */
export async function getLabelExecute(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/execute`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 导出
 * import { getLabelExport } from "/@/apis/gct-apaas/LabelController"
 */
export interface getLabelExportQueryInterface {
  id: string; // id
}
export async function getLabelExport(params: getLabelExportQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/api/label/export`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据id查子
 * import { getLabelGetVersionById } from "/@/apis/gct-apaas/LabelController"
 */
export interface getLabelGetVersionByIdQueryInterface {
  id: string; // id
}
export async function getLabelGetVersionById(params: getLabelGetVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityLabelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/getVersionById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 导入
 * import { postLabelImport } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelImport(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntityLabelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/import`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 标签和分类树
 * import { getLabelLabelCategoryTree } from "/@/apis/gct-apaas/LabelController"
 */
export interface getLabelLabelCategoryTreeQueryInterface {
  moduleVal: string; // 分类模板
}
export async function getLabelLabelCategoryTree(params: getLabelLabelCategoryTreeQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryRdoRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/labelCategoryTree`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 名称重复校验
 * import { postLabelLabelDuplicateNameCheck } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelLabelDuplicateNameCheck(data: LabelNameCheckRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/labelDuplicateNameCheck`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 父节点数据清洗
 * import { getLabelLabelParentDataClean } from "/@/apis/gct-apaas/LabelController"
 */
export async function getLabelLabelParentDataClean(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/labelParentDataClean`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 列表
 * import { getLabelList } from "/@/apis/gct-apaas/LabelController"
 */
export interface getLabelListQueryInterface {
  key?: string; // 标签key
  modelKey?: string; // 模型key
}
export async function getLabelList(params: getLabelListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListLabelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 自定义字体查询
 * import { getLabelListFont } from "/@/apis/gct-apaas/LabelController"
 */
export async function getLabelListFont(config:AxiosRequestConfig = {}): Promise<ResponseEntityListFontConfig['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/listFont`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 根据父baseId 查所有版本
 * import { getLabelListVersionById } from "/@/apis/gct-apaas/LabelController"
 */
export interface getLabelListVersionByIdQueryInterface {
  baseId: string; // baseId
  name?: string; // 根据名称搜索
}
export async function getLabelListVersionById(params: getLabelListVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListLabelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/listVersionById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getLabelPageList } from "/@/apis/gct-apaas/LabelController"
 */
export interface getLabelPageListQueryInterface {
  description?: string; // 页面描述
  endTime?: string; // 结束时间
  id?: string; // 主键id
  key?: string; // 标签key
  modelKey?: string; // 模型key
  name?: string; // 标签名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getLabelPageList(params: getLabelPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseLabelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 删除版本
 * import { deleteLabelRemoveVersionById } from "/@/apis/gct-apaas/LabelController"
 */
export interface deleteLabelRemoveVersionByIdQueryInterface {
  id: string; // 删除的id
}
export async function deleteLabelRemoveVersionById(params: deleteLabelRemoveVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/removeVersionById`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 保存版本
 * import { postLabelSaveVersion } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelSaveVersion(data: LabelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/saveVersion`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 测试公式
 * import { getLabelTest } from "/@/apis/gct-apaas/LabelController"
 */
export interface getLabelTestQueryInterface {
  exp?: string; // exp
}
export async function getLabelTest(params: getLabelTestQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/test`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改设计Json
 * import { putLabelUpdateDesigner } from "/@/apis/gct-apaas/LabelController"
 */
export async function putLabelUpdateDesigner(data: LabelDesigner, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/updateDesigner`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改版本
 * import { putLabelUpdateVersionByIdById } from "/@/apis/gct-apaas/LabelController"
 */
export interface putLabelUpdateVersionByIdByIdPathInterface {
  id: string; // id
}
export async function putLabelUpdateVersionByIdById(path: putLabelUpdateVersionByIdByIdPathInterface, data: LabelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/updateVersionById/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * xml生成
 * import { postLabelXmlSetting } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelXmlSetting(data: XmlSetting, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/api/label/xmlSetting`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putLabelById } from "/@/apis/gct-apaas/LabelController"
 */
export interface putLabelByIdPathInterface {
  id: string; // id
}
export async function putLabelById(path: putLabelByIdPathInterface, data: LabelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}