import request from '@mobile/utils/request';
import type { ProcessApproveRequest, ResponseEntitystring, ProcessReassign4InterfereRequest, ProcessReturn4InterfereRequest, DhrProcessJumpRequest, ProcessReassignRequest, ProcessReturnRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 审核
 * import { postApproveProcessApprove } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessApprove(data: ProcessApproveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/approve/process/approve`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预转办
 * import { postApproveProcessInterfereReassign } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessInterfereReassign(data: ProcessReassign4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/approve/process/interfere/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预退回
 * import { postApproveProcessInterfereReturn } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessInterfereReturn(data: ProcessReturn4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/approve/process/interfere/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据按钮key跳转流程节点
 * import { postApproveProcessJump } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessJump(data: DhrProcessJumpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/approve/process/jump`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postApproveProcessReassign } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessReassign(data: ProcessReassignRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/approve/process/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 退回
 * import { postApproveProcessReturn } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessReturn(data: ProcessReturnRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/approve/process/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}