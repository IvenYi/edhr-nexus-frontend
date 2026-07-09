import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 完成任务
 * import { getProcessTestCompleteTask } from "/@/apis/gct-apaas/ProcessTestController"
 */
export interface getProcessTestCompleteTaskQueryInterface {
  taskId?: string; // taskId
}
export async function getProcessTestCompleteTask(params: getProcessTestCompleteTaskQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/processTest/completeTask`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 部署
 * import { getProcessTestDeploy } from "/@/apis/gct-apaas/ProcessTestController"
 */
export interface getProcessTestDeployQueryInterface {
  filePath?: string; // filePath
}
export async function getProcessTestDeploy(params: getProcessTestDeployQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/processTest/deploy`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 解析xml，判断开始节点和终止节点是否经过排他网关或者包容网关fork节点
 * import { getProcessTestReadXml } from "/@/apis/gct-apaas/ProcessTestController"
 */
export interface getProcessTestReadXmlQueryInterface {
  endActId?: string; // endActId
  procDefId?: string; // procDefId
  startActId?: string; // startActId
}
export async function getProcessTestReadXml(params: getProcessTestReadXmlQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/processTest/readXml`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 接收任务
 * import { getProcessTestSignal } from "/@/apis/gct-apaas/ProcessTestController"
 */
export interface getProcessTestSignalQueryInterface {
  activityId?: string; // activityId
  instanceId?: string; // instanceId
}
export async function getProcessTestSignal(params: getProcessTestSignalQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/processTest/signal`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 启动
 * import { getProcessTestStart } from "/@/apis/gct-apaas/ProcessTestController"
 */
export interface getProcessTestStartQueryInterface {
  procDefId?: string; // procDefId
}
export async function getProcessTestStart(params: getProcessTestStartQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/processTest/start`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 更新变量
 * import { getProcessTestUpdateVar } from "/@/apis/gct-apaas/ProcessTestController"
 */
export interface getProcessTestUpdateVarQueryInterface {
  procInstId?: string; // procInstId
}
export async function getProcessTestUpdateVar(params: getProcessTestUpdateVarQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/processTest/updateVar`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 撤回
 * import { getProcessTestWithdraw } from "/@/apis/gct-apaas/ProcessTestController"
 */
export interface getProcessTestWithdrawQueryInterface {
  taskId?: string; // taskId
}
export async function getProcessTestWithdraw(params: getProcessTestWithdrawQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/processTest/withdraw`,
      method: 'get',
      params,
      ...config,
    },
  );
}