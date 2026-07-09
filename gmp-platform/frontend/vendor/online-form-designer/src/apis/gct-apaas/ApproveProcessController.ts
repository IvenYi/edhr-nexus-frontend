import { defHttp } from '@/utils/http/axios';
import { ProcessApproveRequest, ResponseEntitystring, ProcessReassign4InterfereRequest, ProcessReturn4InterfereRequest, DhrProcessJumpRequest, ProcessReassignRequest, ProcessReturnRequest } from './model/index';

/**
 * 审核
 * import { postApproveProcessApprove } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessApprove(data: ProcessApproveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/approve/process/approve`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 流程干预转办
 * import { postApproveProcessInterfereReassign } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessInterfereReassign(data: ProcessReassign4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/approve/process/interfere/reassign`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 流程干预退回
 * import { postApproveProcessInterfereReturn } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessInterfereReturn(data: ProcessReturn4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/approve/process/interfere/return`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据按钮key跳转流程节点
 * import { postApproveProcessJump } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessJump(data: DhrProcessJumpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/approve/process/jump`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postApproveProcessReassign } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessReassign(data: ProcessReassignRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/approve/process/reassign`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 退回
 * import { postApproveProcessReturn } from "/@/apis/gct-apaas/ApproveProcessController"
 */
export async function postApproveProcessReturn(data: ProcessReturnRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/approve/process/return`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}