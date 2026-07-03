import request from '@mobile/utils/request';
import type { OnlineFormTmplRequest, ResponseEntitystring, ResponseEntityListModelBriefInfo, ResponseEntityListMapstringobject, ResponseEntityMapstringobject, ResponseEntityListModelMetaDTO, ResponseEntityOnlineFormTmplResponse, DocumentInfo4Req, ResponseEntityListOnlineFormTmplResponse, ResponseEntityboolean, ResponseEntityListOnlineFormTmplModelResponse, SimpleOnlineFormDesignDTO, OnlineFormFieldMetaVO, OnlineFormTmplOperationConfig, ResponseEntityOnlineFormDesignDTO, OnlineFormDesignDTO, ResponseEntityListstring, OperatingStateRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 自定义复制
 * import { postOnlineFormTmplCopyCustomizeById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface postOnlineFormTmplCopyCustomizeByIdPathInterface {
  id: string; // id
}
export async function postOnlineFormTmplCopyCustomizeById(path: postOnlineFormTmplCopyCustomizeByIdPathInterface, data: OnlineFormTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/copy/customize/${path?.id}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 复制
 * import { postOnlineFormTmplCopyById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface postOnlineFormTmplCopyByIdPathInterface {
  id: string; // id
}
export async function postOnlineFormTmplCopyById(path: postOnlineFormTmplCopyByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/copy/${path?.id}`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 复制版本
 * import { postOnlineFormTmplCopyVersionById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface postOnlineFormTmplCopyVersionByIdPathInterface {
  id: string; // id
}
export async function postOnlineFormTmplCopyVersionById(path: postOnlineFormTmplCopyVersionByIdPathInterface, data: OnlineFormTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/copyVersion/${path?.id}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询基础表单和流程表单中使用的主子模型列表
 * import { getOnlineFormTmplFormModelsById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplFormModelsByIdPathInterface {
  id: string; // 模板baseId
}
export async function getOnlineFormTmplFormModelsById(path: getOnlineFormTmplFormModelsByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelBriefInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/formModels/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 根据ID获取表单BOM
 * import { getOnlineFormTmplGetBomByFormTmplId } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplGetBomByFormTmplIdQueryInterface {
  id: string; // id
}
export async function getOnlineFormTmplGetBomByFormTmplId(params: getOnlineFormTmplGetBomByFormTmplIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/getBomByFormTmplId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据ID获取表单BOM
 * import { getOnlineFormTmplGetBomByFormTmplIdAndTableKey } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplGetBomByFormTmplIdAndTableKeyQueryInterface {
  id: string; // id
  tableKey: string; // tableKey
}
export async function getOnlineFormTmplGetBomByFormTmplIdAndTableKey(params: getOnlineFormTmplGetBomByFormTmplIdAndTableKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMapstringobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/getBomByFormTmplIdAndTableKey`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取通信配置
 * import { getOnlineFormTmplGetCommunicationConfig } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplGetCommunicationConfigQueryInterface {
  id: string; // id
}
export async function getOnlineFormTmplGetCommunicationConfig(params: getOnlineFormTmplGetCommunicationConfigQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/getCommunicationConfig`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取表单中使用的字段
 * import { getOnlineFormTmplGetFormTmplUsedFieldMeta } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplGetFormTmplUsedFieldMetaQueryInterface {
  formTmplId: string; // formTmplId
}
export async function getOnlineFormTmplGetFormTmplUsedFieldMeta(params: getOnlineFormTmplGetFormTmplUsedFieldMetaQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/getFormTmplUsedFieldMeta`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据id查子
 * import { getOnlineFormTmplGetVersionById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplGetVersionByIdQueryInterface {
  id: string; // id
}
export async function getOnlineFormTmplGetVersionById(params: getOnlineFormTmplGetVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOnlineFormTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/getVersionById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 批量查询指定id表单详情
 * import { postOnlineFormTmplInfos } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export async function postOnlineFormTmplInfos(data: DocumentInfo4Req, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/infos`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 是否包含OCR模块权限
 * import { getOnlineFormTmplIsOcrGranted } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export async function getOnlineFormTmplIsOcrGranted(config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/isOcrGranted`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取所有基础表单和流程表单
 * import { getOnlineFormTmplListBaseAndProcessForm } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplListBaseAndProcessFormQueryInterface {
  categoryId?: string; // categoryId
  formType?: string; // formType
  name?: string; // name
}
export async function getOnlineFormTmplListBaseAndProcessForm(params: getOnlineFormTmplListBaseAndProcessFormQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/listBaseAndProcessForm`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取所有基础表单和流程表单及其对应模型
 * import { getOnlineFormTmplListOnlineFormModels } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplListOnlineFormModelsQueryInterface {
  name?: string; // name
}
export async function getOnlineFormTmplListOnlineFormModels(params: getOnlineFormTmplListOnlineFormModelsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormTmplModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/listOnlineFormModels`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据父id查子列表
 * import { getOnlineFormTmplListVersionById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplListVersionByIdQueryInterface {
  id: string; // id
}
export async function getOnlineFormTmplListVersionById(params: getOnlineFormTmplListVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/listVersionById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询表单中使用的主子表列表
 * import { getOnlineFormTmplModelById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplModelByIdPathInterface {
  id: string; // 模板id
}
export async function getOnlineFormTmplModelById(path: getOnlineFormTmplModelByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelBriefInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/model/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 普通表单发布api
 * import { postOnlineFormTmplRelease } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface postOnlineFormTmplReleaseQueryInterface {
  tmplId: string; // 模板id
}
export async function postOnlineFormTmplRelease(data: SimpleOnlineFormDesignDTO, params: postOnlineFormTmplReleaseQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/release`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteOnlineFormTmplRemoveById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface deleteOnlineFormTmplRemoveByIdQueryInterface {
  id: string; // 删除的id
}
export async function deleteOnlineFormTmplRemoveById(params: deleteOnlineFormTmplRemoveByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/removeById`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 删除版本
 * import { deleteOnlineFormTmplRemoveVersionById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface deleteOnlineFormTmplRemoveVersionByIdQueryInterface {
  id: string; // 删除的id
}
export async function deleteOnlineFormTmplRemoveVersionById(params: deleteOnlineFormTmplRemoveVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/removeVersionById`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 保存
 * import { postOnlineFormTmplSave } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export async function postOnlineFormTmplSave(data: OnlineFormTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 新建字段
 * import { postOnlineFormTmplSaveField } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export async function postOnlineFormTmplSaveField(data: OnlineFormFieldMetaVO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/saveField`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 页面设置
 * import { postOnlineFormTmplSaveOperation } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export async function postOnlineFormTmplSaveOperation(data: OnlineFormTmplOperationConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/saveOperation`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存版本
 * import { postOnlineFormTmplSaveVersion } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export async function postOnlineFormTmplSaveVersion(data: OnlineFormTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/saveVersion`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 设为默认版本
 * import { putOnlineFormTmplSetDefaultById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface putOnlineFormTmplSetDefaultByIdPathInterface {
  id: string; // id
}
export async function putOnlineFormTmplSetDefaultById(path: putOnlineFormTmplSetDefaultByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/setDefault/${path?.id}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 获取快捷表单模式暂存设计的Json
 * import { getOnlineFormTmplStash } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface getOnlineFormTmplStashQueryInterface {
  id: string; // 模板id
}
export async function getOnlineFormTmplStash(params: getOnlineFormTmplStashQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOnlineFormDesignDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/stash`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 快捷表单模式暂存设计Json
 * import { putOnlineFormTmplStashById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface putOnlineFormTmplStashByIdPathInterface {
  id: string; // id
}
export async function putOnlineFormTmplStashById(path: putOnlineFormTmplStashByIdPathInterface, data: OnlineFormDesignDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/stash/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * test
 * import { postOnlineFormTmplTest } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export async function postOnlineFormTmplTest(config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/test`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 修改通信配置
 * import { postOnlineFormTmplUpdateCommunicationConfigById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface postOnlineFormTmplUpdateCommunicationConfigByIdPathInterface {
  id: string; // id
}
export async function postOnlineFormTmplUpdateCommunicationConfigById(path: postOnlineFormTmplUpdateCommunicationConfigByIdPathInterface, data: OnlineFormDesignDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/updateCommunicationConfig/${path?.id}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改设计Json
 * import { putOnlineFormTmplUpdateDesignerById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface putOnlineFormTmplUpdateDesignerByIdPathInterface {
  id: string; // id
}
export async function putOnlineFormTmplUpdateDesignerById(path: putOnlineFormTmplUpdateDesignerByIdPathInterface, data: OnlineFormDesignDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/updateDesigner/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改状态
 * import { putOnlineFormTmplUpdateOperatingStateById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface putOnlineFormTmplUpdateOperatingStateByIdPathInterface {
  id: string; // id
}
export async function putOnlineFormTmplUpdateOperatingStateById(path: putOnlineFormTmplUpdateOperatingStateByIdPathInterface, data: OperatingStateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/updateOperatingState/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改版本
 * import { putOnlineFormTmplUpdateVersionByIdById } from "/@/apis/gct-apaas/OnlineFormTmplController"
 */
export interface putOnlineFormTmplUpdateVersionByIdByIdPathInterface {
  id: string; // id
}
export async function putOnlineFormTmplUpdateVersionByIdById(path: putOnlineFormTmplUpdateVersionByIdByIdPathInterface, data: OnlineFormTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl/updateVersionById/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}