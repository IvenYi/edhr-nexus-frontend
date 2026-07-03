import request from '@mobile/utils/request';
import type { DhrProcessApproveRequest, ResponseEntitystring, DhrProcessReassign4InterfereRequest, DhrProcessReturn4InterfereRequest, DhrProcessJumpRequest, DhrProcessReassignRequest, DhrProcessReturnRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 审核
 * import { postFormChangeProcessApprove } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessApprove(data: DhrProcessApproveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/form/change/process/approve`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预转办
 * import { postFormChangeProcessInterfereReassign } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessInterfereReassign(data: DhrProcessReassign4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/form/change/process/interfere/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预退回
 * import { postFormChangeProcessInterfereReturn } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessInterfereReturn(data: DhrProcessReturn4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/form/change/process/interfere/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据按钮key跳转流程节点
 * import { postFormChangeProcessJump } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessJump(data: DhrProcessJumpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/form/change/process/jump`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postFormChangeProcessReassign } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessReassign(data: DhrProcessReassignRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/form/change/process/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 退回
 * import { postFormChangeProcessReturn } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessReturn(data: DhrProcessReturnRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/form/change/process/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 审核
 * import { postMedproFormChangeProcessApprove } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessApprove(data: DhrProcessApproveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/form/change/process/approve`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预转办
 * import { postMedproFormChangeProcessInterfereReassign } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessInterfereReassign(data: DhrProcessReassign4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/form/change/process/interfere/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预退回
 * import { postMedproFormChangeProcessInterfereReturn } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessInterfereReturn(data: DhrProcessReturn4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/form/change/process/interfere/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据按钮key跳转流程节点
 * import { postMedproFormChangeProcessJump } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessJump(data: DhrProcessJumpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/form/change/process/jump`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postMedproFormChangeProcessReassign } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessReassign(data: DhrProcessReassignRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/form/change/process/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 退回
 * import { postMedproFormChangeProcessReturn } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessReturn(data: DhrProcessReturnRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/form/change/process/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}