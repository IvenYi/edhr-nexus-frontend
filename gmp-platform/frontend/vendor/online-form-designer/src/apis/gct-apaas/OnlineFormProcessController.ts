import { defHttp } from '@/utils/http/axios';
import { OfProcessAbandonRequest, ResponseEntitystring, OfProcessApproveRequest, OfProcessQualifiedRequest, OfProcessChangeRequest, OfProcessControlRequest, OfProcessReassign4InterfereRequest, OfProcessReturn4InterfereRequest, OfProcessJumpRequest, OfProcessSaveRequest, OfProcessReassignRequest, OfProcessResubmitRequest, OfProcessReturnRequest, OfProcessSubmitRequest } from './model/index';

/**
 * 表单作废
 * import { postOnlineFormProcessAbandon } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessAbandon(data: OfProcessAbandonRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/abandon`,
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
 * import { postOnlineFormProcessApprove } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessApprove(data: OfProcessApproveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/approve`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 合格审批/不合格审批
 * import { postOnlineFormProcessApproveQualification } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessApproveQualification(data: OfProcessQualifiedRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/approveQualification`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 表单变更
 * import { postOnlineFormProcessChange } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessChange(data: OfProcessChangeRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/change`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 表单发起受控
 * import { postOnlineFormProcessControl } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessControl(data: OfProcessControlRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/control`,
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
 * import { postOnlineFormProcessInterfereReassign } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessInterfereReassign(data: OfProcessReassign4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/interfere/reassign`,
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
 * import { postOnlineFormProcessInterfereReturn } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessInterfereReturn(data: OfProcessReturn4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/interfere/return`,
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
 * import { postOnlineFormProcessJump } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessJump(data: OfProcessJumpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/jump`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 部分提交（Medpro用）
 * import { postOnlineFormProcessPartialSubmit } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessPartialSubmit(data: OfProcessSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/partialSubmit`,
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
 * import { postOnlineFormProcessReassign } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessReassign(data: OfProcessReassignRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/reassign`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 在线表单重新提报
 * import { postOnlineFormProcessResubmitOf } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessResubmitOf(data: OfProcessResubmitRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/resubmitOf`,
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
 * import { postOnlineFormProcessReturn } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessReturn(data: OfProcessReturnRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/return`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postOnlineFormProcessSave } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessSave(data: OfProcessSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/save`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 提交
 * import { postOnlineFormProcessSubmit } from "/@/apis/gct-apaas/OnlineFormProcessController"
 */
export async function postOnlineFormProcessSubmit(data: OfProcessSubmitRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/process/submit`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}