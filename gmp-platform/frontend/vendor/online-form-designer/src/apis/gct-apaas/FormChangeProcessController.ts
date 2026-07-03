import { defHttp } from '@/utils/http/axios';
import { DhrProcessApproveRequest, ResponseEntitystring, DhrProcessReassign4InterfereRequest, DhrProcessReturn4InterfereRequest, DhrProcessJumpRequest, DhrProcessReassignRequest, DhrProcessReturnRequest } from './model/index';

/**
 * 审核
 * import { postFormChangeProcessApprove } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessApprove(data: DhrProcessApproveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/form/change/process/approve`,
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
 * import { postFormChangeProcessInterfereReassign } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessInterfereReassign(data: DhrProcessReassign4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/form/change/process/interfere/reassign`,
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
 * import { postFormChangeProcessInterfereReturn } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessInterfereReturn(data: DhrProcessReturn4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/form/change/process/interfere/return`,
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
 * import { postFormChangeProcessJump } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessJump(data: DhrProcessJumpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/form/change/process/jump`,
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
 * import { postFormChangeProcessReassign } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessReassign(data: DhrProcessReassignRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/form/change/process/reassign`,
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
 * import { postFormChangeProcessReturn } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postFormChangeProcessReturn(data: DhrProcessReturnRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/form/change/process/return`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 审核
 * import { postMedproFormChangeProcessApprove } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessApprove(data: DhrProcessApproveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/form/change/process/approve`,
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
 * import { postMedproFormChangeProcessInterfereReassign } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessInterfereReassign(data: DhrProcessReassign4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/form/change/process/interfere/reassign`,
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
 * import { postMedproFormChangeProcessInterfereReturn } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessInterfereReturn(data: DhrProcessReturn4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/form/change/process/interfere/return`,
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
 * import { postMedproFormChangeProcessJump } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessJump(data: DhrProcessJumpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/form/change/process/jump`,
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
 * import { postMedproFormChangeProcessReassign } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessReassign(data: DhrProcessReassignRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/form/change/process/reassign`,
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
 * import { postMedproFormChangeProcessReturn } from "/@/apis/gct-apaas/FormChangeProcessController"
 */
export async function postMedproFormChangeProcessReturn(data: DhrProcessReturnRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/form/change/process/return`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}