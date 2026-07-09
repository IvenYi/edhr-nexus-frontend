import request from '@mobile/utils/request';
import type { ResponseEntityOnlineFormInstanceResponse, ResponseEntitystring, AppendRelatedInstRequest, BindRelatedIndstRequest, OnlineFormInsTaskRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 查询表单实例-附录追加表单使用
 * import { getOnlineFormInstanceGetOne } from "/@/apis/gct-apaas/FormInstanceController"
 */
export interface getOnlineFormInstanceGetOneQueryInterface {
  materialStatus?: string; // 单据实例类型(单据任务:FORM ,放行单:PRODUCT_RELEASE 批次:LOT)多个值逗号拼接
  recordNo?: string; // 记录单号
  serialNo?: string; // 序列号
}
export async function getOnlineFormInstanceGetOne(params: getOnlineFormInstanceGetOneQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOnlineFormInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/getOne`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 表单内容加密校验测试
 * import { getOnlineFormInstanceInstEncodeCheck } from "/@/apis/gct-apaas/FormInstanceController"
 */
export interface getOnlineFormInstanceInstEncodeCheckQueryInterface {
  instId: string; // instId
}
export async function getOnlineFormInstanceInstEncodeCheck(params: getOnlineFormInstanceInstEncodeCheckQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/inst/encode/check`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 追加关联实例
 * import { postOnlineFormInstanceRelatedInstAppend } from "/@/apis/gct-apaas/FormInstanceController"
 */
export async function postOnlineFormInstanceRelatedInstAppend(data: AppendRelatedInstRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/related/inst/append`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 绑定已有实例
 * import { postOnlineFormInstanceRelatedInstBind } from "/@/apis/gct-apaas/FormInstanceController"
 */
export async function postOnlineFormInstanceRelatedInstBind(data: BindRelatedIndstRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/related/inst/bind`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 创建单据填报任务
 * import { postOnlineFormInstanceTaskForm } from "/@/apis/gct-apaas/FormInstanceController"
 */
export async function postOnlineFormInstanceTaskForm(data: OnlineFormInsTaskRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityOnlineFormInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/taskForm`,
      method: 'post',
      data,
      ...config,
    },
  );
}