import request from '@mobile/utils/request';
import type { ProcessOperateRequest, ResponseEntitystring, ResponseEntityTaskNodeOp, ResponseEntityStarterNodeOp, ResponseEntityListUserBase, ResponseEntityProcModelDataInfo, ResponseEntityPageBaseProcessInstanceResponse, ResponseEntityProcessExtension, ProcStartInstRequest, ResponseEntityProcessInstance } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 通过/同意
 * import { postPmProcessEngineApprove } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function postPmProcessEngineApprove(data: ProcessOperateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/approve`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取已办任务节点拓展信息
 * import { getPmProcessEngineHiTaskExtension } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export interface getPmProcessEngineHiTaskExtensionQueryInterface {
  taskId: string; // taskId
}
export async function getPmProcessEngineHiTaskExtension(params: getPmProcessEngineHiTaskExtensionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTaskNodeOp['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/hi-task/extension`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取流程开始节点拓展信息
 * import { getPmProcessEngineInitialTaskExtension } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export interface getPmProcessEngineInitialTaskExtensionQueryInterface {
  processInstanceId: string; // processInstanceId
}
export async function getPmProcessEngineInitialTaskExtension(params: getPmProcessEngineInitialTaskExtensionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityStarterNodeOp['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/initial-task/extension`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取所有审批人
 * import { getPmProcessEngineListAllAssignees } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function getPmProcessEngineListAllAssignees(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserBase['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/listAllAssignees`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取所有发起人
 * import { getPmProcessEngineListAllInitiators } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function getPmProcessEngineListAllInitiators(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserBase['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/listAllInitiators`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取模型数据
 * import { getPmProcessEngineModel } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export interface getPmProcessEngineModelQueryInterface {
  processInstanceId: string; // processInstanceId
}
export async function getPmProcessEngineModel(params: getPmProcessEngineModelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcModelDataInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/model`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmProcessEnginePageList } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export interface getPmProcessEnginePageListQueryInterface {
  assignees?: string; // 当前审批人
  combinedStatus?: string; // 流程状态
  initiator?: string; // 发起人
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processDefName?: string; // 流程名称
  processInstanceId?: string; // 流程实例id
  taskNames?: string; // 当前环节
  title?: string; // 流程标题
}
export async function getPmProcessEnginePageList(params: getPmProcessEnginePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 流程按钮操作
 * import { postPmProcessEngineProcExecute } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function postPmProcessEngineProcExecute(data: ProcessOperateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/procExecute`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取流程拓展信息
 * import { getPmProcessEngineProcInstExtension } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export interface getPmProcessEngineProcInstExtensionQueryInterface {
  dataId?: string; // dataId
  modelKey?: string; // modelKey
  procInstId?: string; // procInstId
}
export async function getPmProcessEngineProcInstExtension(params: getPmProcessEngineProcInstExtensionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessExtension['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/procInstExtension`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 转交
 * import { postPmProcessEngineReassign } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function postPmProcessEngineReassign(data: ProcessOperateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/reassign`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 拒绝/不同意
 * import { postPmProcessEngineRefuse } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function postPmProcessEngineRefuse(data: ProcessOperateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/refuse`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 驳回
 * import { postPmProcessEngineReject } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function postPmProcessEngineReject(data: ProcessOperateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/reject`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 重新提交
 * import { postPmProcessEngineResubmit } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function postPmProcessEngineResubmit(data: ProcessOperateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/resubmit`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 流程发起
 * import { postPmProcessEngineStartProcInst } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function postPmProcessEngineStartProcInst(data: ProcStartInstRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessInstance['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/startProcInst`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取待办任务节点拓展信息
 * import { getPmProcessEngineTaskExtension } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export interface getPmProcessEngineTaskExtensionQueryInterface {
  taskId: string; // taskId
}
export async function getPmProcessEngineTaskExtension(params: getPmProcessEngineTaskExtensionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTaskNodeOp['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/task/extension`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 终止
 * import { postPmProcessEngineTerminate } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function postPmProcessEngineTerminate(data: ProcessOperateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/terminate`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 撤回
 * import { postPmProcessEngineWithdraw } from "/@/apis/gct-apaas/PmProcessEngineController"
 */
export async function postPmProcessEngineWithdraw(data: ProcessOperateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-engine/withdraw`,
      method: 'post',
      data,
      ...config,
    },
  );
}