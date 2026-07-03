import request from '@mobile/utils/request';
import type { DhrProcessApproveRequest, ResponseEntitystring, DhrProcessReassign4InterfereRequest, DhrProcessReturn4InterfereRequest, DhrProcessJumpRequest, DhrProcessReassignRequest, DhrProcessReturnRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 审核
 * import { postDhrProcessApprove } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessApprove(data: DhrProcessApproveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dhr/process/approve`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预转办
 * import { postDhrProcessInterfereReassign } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessInterfereReassign(data: DhrProcessReassign4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dhr/process/interfere/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程干预退回
 * import { postDhrProcessInterfereReturn } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessInterfereReturn(data: DhrProcessReturn4InterfereRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dhr/process/interfere/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据按钮key跳转流程节点
 * import { postDhrProcessJump } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessJump(data: DhrProcessJumpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dhr/process/jump`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postDhrProcessReassign } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessReassign(data: DhrProcessReassignRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dhr/process/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 退回
 * import { postDhrProcessReturn } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessReturn(data: DhrProcessReturnRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dhr/process/return`,
      method: 'post',
      data,
      ...config,
    },
  );
}