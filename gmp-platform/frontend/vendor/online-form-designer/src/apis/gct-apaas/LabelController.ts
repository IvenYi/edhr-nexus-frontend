import { defHttp } from '@/utils/http/axios';
import { LabelRequest, ResponseEntitystring, ResponseEntityPageBaseLabelResponse, LabelBtwDesigner, ResponseEntityLabelResponse, ResponseEntityListCategoryRdoRelationResponse, LabelNameCheckRequest, ResponseEntityboolean, ResponseEntityListLabelResponse, ResponseEntityListFontConfig, ResponseEntityobject, LabelDesigner, XmlSetting } from './model/index';

/**
 * 保存
 * import { postLabel } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabel(data: LabelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteLabel(params: deleteLabelQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/label`,
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
 * btw保存
 * import { postLabelBtw } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelBtw(data: LabelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label/btw`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * btw复制
 * import { postLabelBtwCopy } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelBtwCopy(data: LabelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label/btw/copy`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLabelBtwPageList(params: getLabelBtwPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseLabelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/btw/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteLabelBtwRemoveVersionById(params: deleteLabelBtwRemoveVersionByIdQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/label/btw/removeVersionById`,
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
 * btw标签修改
 * import { putLabelBtwUpdate } from "/@/apis/gct-apaas/LabelController"
 */
export async function putLabelBtwUpdate(data: LabelBtwDesigner, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/label/btw/update`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 复制
 * import { postLabelCopy } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelCopy(data: LabelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label/copy`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postLabelCopyVersionById(path: postLabelCopyVersionByIdPathInterface, data: LabelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label/copyVersion/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLabelEntityInfo(params: getLabelEntityInfoQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/entity/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 下载实体列表
 * import { getLabelEntityUpdateDatetimeSql } from "/@/apis/gct-apaas/LabelController"
 */
export async function getLabelEntityUpdateDatetimeSql(config = {}): Promise<string> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/entity/update/datetime/sql`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getLabelExecute } from "/@/apis/gct-apaas/LabelController"
 */
export async function getLabelExecute(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/execute`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLabelExport(params: getLabelExportQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/export`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLabelGetVersionById(params: getLabelGetVersionByIdQueryInterface = {}, config = {}): Promise<ResponseEntityLabelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/getVersionById`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 导入
 * import { postLabelImport } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelImport(data: any, config = {}): Promise<ResponseEntityLabelResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label/import`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLabelLabelCategoryTree(params: getLabelLabelCategoryTreeQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryRdoRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/labelCategoryTree`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 名称重复校验
 * import { postLabelLabelDuplicateNameCheck } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelLabelDuplicateNameCheck(data: LabelNameCheckRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label/labelDuplicateNameCheck`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 父节点数据清洗
 * import { getLabelLabelParentDataClean } from "/@/apis/gct-apaas/LabelController"
 */
export async function getLabelLabelParentDataClean(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/labelParentDataClean`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLabelList(params: getLabelListQueryInterface = {}, config = {}): Promise<ResponseEntityListLabelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 自定义字体查询
 * import { getLabelListFont } from "/@/apis/gct-apaas/LabelController"
 */
export async function getLabelListFont(config = {}): Promise<ResponseEntityListFontConfig['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/listFont`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLabelListVersionById(params: getLabelListVersionByIdQueryInterface = {}, config = {}): Promise<ResponseEntityListLabelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/listVersionById`,
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
export async function getLabelPageList(params: getLabelPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseLabelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteLabelRemoveVersionById(params: deleteLabelRemoveVersionByIdQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/label/removeVersionById`,
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
 * 保存版本
 * import { postLabelSaveVersion } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelSaveVersion(data: LabelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label/saveVersion`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLabelTest(params: getLabelTestQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label/test`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改设计Json
 * import { putLabelUpdateDesigner } from "/@/apis/gct-apaas/LabelController"
 */
export async function putLabelUpdateDesigner(data: LabelDesigner, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/label/updateDesigner`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putLabelUpdateVersionByIdById(path: putLabelUpdateVersionByIdByIdPathInterface, data: LabelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/label/updateVersionById/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * xml生成
 * import { postLabelXmlSetting } from "/@/apis/gct-apaas/LabelController"
 */
export async function postLabelXmlSetting(data: XmlSetting, config = {}): Promise<string> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label/xmlSetting`,
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
 * import { putLabelById } from "/@/apis/gct-apaas/LabelController"
 */
export interface putLabelByIdPathInterface {
  id: string; // id
}
export async function putLabelById(path: putLabelByIdPathInterface, data: LabelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/label/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}