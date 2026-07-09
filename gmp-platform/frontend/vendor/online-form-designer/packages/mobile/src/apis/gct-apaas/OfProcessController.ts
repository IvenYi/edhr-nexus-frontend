import request from '@mobile/utils/request';
import type { OfProcessApproveRequest, ResponseEntitystring, OfProcessQualifiedRequest, OfProcessReassignRequest, OfProcessReturnRequest, OfProcessSaveRequest, OfProcessSubmitRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 审核
 * import { postOnlineFormProcessApprove } from "/@/apis/gct-apaas/OfProcessController"
 */
export async function postOnlineFormProcessApprove(data: OfProcessApproveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/approve`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 合格审批/不合格审批
 * import { postOnlineFormProcessApproveQualification } from "/@/apis/gct-apaas/OfProcessController"
 */
export async function postOnlineFormProcessApproveQualification(data: OfProcessQualifiedRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/approveQualification`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postOnlineFormProcessReassign } from "/@/apis/gct-apaas/OfProcessController"
 */
export async function postOnlineFormProcessReassign(data: OfProcessReassignRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 退回
 * import { postOnlineFormProcessReturn } from "/@/apis/gct-apaas/OfProcessController"
 */
export async function postOnlineFormProcessReturn(data: OfProcessReturnRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postOnlineFormProcessSave } from "/@/apis/gct-apaas/OfProcessController"
 */
export async function postOnlineFormProcessSave(data: OfProcessSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 提交
 * import { postOnlineFormProcessSubmit } from "/@/apis/gct-apaas/OfProcessController"
 */
export async function postOnlineFormProcessSubmit(data: OfProcessSubmitRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/submit`,
      method: 'post',
      data,
      ...config,
    },
  );
}