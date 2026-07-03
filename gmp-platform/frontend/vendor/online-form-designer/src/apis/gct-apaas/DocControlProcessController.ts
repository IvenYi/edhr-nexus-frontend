import { defHttp } from '@/utils/http/axios';
import { ControlProcessApproveRequest, ResponseEntitystring, ResponseEntityDocControlProcessResponse, ControlProcessReassign4InterfereRequest, ControlProcessReturn4InterfereRequest, ControlProcessJumpRequest, ControlProcessReassignRequest, ControlProcessResubmitRequest, ResponseEntityboolean, ControlProcessReturnRequest } from './model/index';

/**
 * 审核
 * import { postDocControlProcessApprove } from "/@/apis/gct-apaas/DocControlProcessController"
 */
export async function postDocControlProcessApprove(data: ControlProcessApproveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/doc-control/process/approve`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询受控文档详情
 * import { getDocControlProcessInfo } from "/@/apis/gct-apaas/DocControlProcessController"
 */
export interface getDocControlProcessInfoQueryInterface {
  controlTmplType: string; // 受控文件模板类型：FORM 表单模板、EDHR edhr模板
  tmplId: string; // 受控文件模板版本id: baseId:id
}
export async function getDocControlProcessInfo(params: getDocControlProcessInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDocControlProcessResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control/process/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 流程干预转办
 * import { postDocControlProcessInterfereReassign } from "/@/apis/gct-apaas/DocControlProcessController"
 */
export async function postDocControlProcessInterfereReassign(data: ControlProcessReassign4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/doc-control/process/interfere/reassign`,
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
 * import { postDocControlProcessInterfereReturn } from "/@/apis/gct-apaas/DocControlProcessController"
 */
export async function postDocControlProcessInterfereReturn(data: ControlProcessReturn4InterfereRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/doc-control/process/interfere/return`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 跳开始、跳结束、跳上/下节点
 * import { postDocControlProcessJump } from "/@/apis/gct-apaas/DocControlProcessController"
 */
export async function postDocControlProcessJump(data: ControlProcessJumpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/doc-control/process/jump`,
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
 * import { postDocControlProcessReassign } from "/@/apis/gct-apaas/DocControlProcessController"
 */
export async function postDocControlProcessReassign(data: ControlProcessReassignRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/doc-control/process/reassign`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 重新提交
 * import { postDocControlProcessResubmit } from "/@/apis/gct-apaas/DocControlProcessController"
 */
export async function postDocControlProcessResubmit(data: ControlProcessResubmitRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/doc-control/process/resubmit`,
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
 * import { postDocControlProcessReturn } from "/@/apis/gct-apaas/DocControlProcessController"
 */
export async function postDocControlProcessReturn(data: ControlProcessReturnRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/doc-control/process/return`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 开启流程- 测试使用
 * import { getDocControlProcessStartProcess } from "/@/apis/gct-apaas/DocControlProcessController"
 */
export interface getDocControlProcessStartProcessQueryInterface {
  controlTmplTypeEnum?: string; // controlTmplTypeEnum
  procDefVerId?: string; // procDefVerId
  tmplVerId?: string; // tmplVerId
}
export async function getDocControlProcessStartProcess(params: getDocControlProcessStartProcessQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control/process/startProcess`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}