import { defHttp } from '@/utils/http/axios';
import { ProcessApproveRequest, ResponseEntitystring, ProcessReassign4InterfereRequest, ProcessReturn4InterfereRequest, DhrProcessJumpRequest, ProcessReassignRequest, ProcessReturnRequest } from './model/index';

/**
 * 审核
 * import { postMedproApproveProcessApprove } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessApprove(data: ProcessApproveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/approve/process/approve`,
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
 * import { postMedproApproveProcessInterfereReassign } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessInterfereReassign(data: ProcessReassign4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/approve/process/interfere/reassign`,
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
 * import { postMedproApproveProcessInterfereReturn } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessInterfereReturn(data: ProcessReturn4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/approve/process/interfere/return`,
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
 * import { postMedproApproveProcessJump } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessJump(data: DhrProcessJumpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/approve/process/jump`,
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
 * import { postMedproApproveProcessReassign } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessReassign(data: ProcessReassignRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/approve/process/reassign`,
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
 * import { postMedproApproveProcessReturn } from "/@/apis/gct-apaas/MedproApproveProcessController"
 */
export async function postMedproApproveProcessReturn(data: ProcessReturnRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/approve/process/return`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}