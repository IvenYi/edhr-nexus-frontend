import { defHttp } from '@/utils/http/axios';
import { DhrProcessApproveRequest, ResponseEntitystring, DhrProcessReassign4InterfereRequest, DhrProcessReturn4InterfereRequest, DhrProcessJumpRequest, DhrProcessReassignRequest, DhrProcessReturnRequest } from './model/index';

/**
 * 审核
 * import { postDhrProcessApprove } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessApprove(data: DhrProcessApproveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dhr/process/approve`,
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
 * import { postDhrProcessInterfereReassign } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessInterfereReassign(data: DhrProcessReassign4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dhr/process/interfere/reassign`,
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
 * import { postDhrProcessInterfereReturn } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessInterfereReturn(data: DhrProcessReturn4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dhr/process/interfere/return`,
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
 * import { postDhrProcessJump } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessJump(data: DhrProcessJumpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dhr/process/jump`,
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
 * import { postDhrProcessReassign } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessReassign(data: DhrProcessReassignRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dhr/process/reassign`,
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
 * import { postDhrProcessReturn } from "/@/apis/gct-apaas/DhrProcessController"
 */
export async function postDhrProcessReturn(data: DhrProcessReturnRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dhr/process/return`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}