import request from '@mobile/utils/request';
import type { OfProcessAbandonRequest, ResponseEntitystring, OfProcessApproveRequest, OfProcessQualifiedRequest, OfProcessChangeRequest, OfProcessControlRequest, OfProcessReassign4InterfereRequest, OfProcessReturn4InterfereRequest, OfProcessJumpRequest, OfProcessSaveRequest, OfProcessReassignRequest, OfProcessResubmitRequest, OfProcessReturnRequest, OfProcessSubmitRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 表单作废
 * import { postOnlineFormProcessAbandon } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessAbandon(data: OfProcessAbandonRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/abandon`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 审核
 * import { postOnlineFormProcessApprove } from "/@/apis/gct-apaas/OnlineFormProcessController"
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
 * import { postOnlineFormProcessApproveQualification } from "/@/apis/gct-apaas/OnlineFormProcessController"
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
 * 表单变更
 * import { postOnlineFormProcessChange } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessChange(data: OfProcessChangeRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/change`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 表单发起受控
 * import { postOnlineFormProcessControl } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessControl(data: OfProcessControlRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/control`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预转办
 * import { postOnlineFormProcessInterfereReassign } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessInterfereReassign(data: OfProcessReassign4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/interfere/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预退回
 * import { postOnlineFormProcessInterfereReturn } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessInterfereReturn(data: OfProcessReturn4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/interfere/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据按钮key跳转流程节点
 * import { postOnlineFormProcessJump } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessJump(data: OfProcessJumpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/jump`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 部分提交（Medpro用）
 * import { postOnlineFormProcessPartialSubmit } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessPartialSubmit(data: OfProcessSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/partialSubmit`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postOnlineFormProcessReassign } from "/@/apis/gct-apaas/OnlineFormProcessController"
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
 * 在线表单重新提报
 * import { postOnlineFormProcessResubmitOf } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessResubmitOf(data: OfProcessResubmitRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/process/resubmitOf`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 退回
 * import { postOnlineFormProcessReturn } from "/@/apis/gct-apaas/OnlineFormProcessController"
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
 * import { postOnlineFormProcessSave } from "/@/apis/gct-apaas/OnlineFormProcessController"
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
 * import { postOnlineFormProcessSubmit } from "/@/apis/gct-apaas/OnlineFormProcessController"
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