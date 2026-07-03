import request from '@mobile/utils/request';
import type { ProcessApproveRequest, ResponseEntitystring, ProcessReassign4InterfereRequest, ProcessReturn4InterfereRequest, DhrProcessJumpRequest, ProcessReassignRequest, ProcessReturnRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 审核
 * import { postMedproApproveProcessApprove } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessApprove(data: ProcessApproveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/approve/process/approve`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预转办
 * import { postMedproApproveProcessInterfereReassign } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessInterfereReassign(data: ProcessReassign4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/approve/process/interfere/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预退回
 * import { postMedproApproveProcessInterfereReturn } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessInterfereReturn(data: ProcessReturn4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/approve/process/interfere/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据按钮key跳转流程节点
 * import { postMedproApproveProcessJump } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessJump(data: DhrProcessJumpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/approve/process/jump`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postMedproApproveProcessReassign } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessReassign(data: ProcessReassignRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/approve/process/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 退回
 * import { postMedproApproveProcessReturn } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessReturn(data: ProcessReturnRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/approve/process/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}