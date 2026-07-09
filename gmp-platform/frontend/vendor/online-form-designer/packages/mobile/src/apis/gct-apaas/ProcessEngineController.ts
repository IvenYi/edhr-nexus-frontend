import request from '@mobile/utils/request';
import type { ProcessEngineRequest, ResponseEntitystring, ResponseEntityMapstringobject, ResponseEntityProcessModelInfo, ReassignmentRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 执行
 * import { postProcessEngineExecute } from "/@/apis/gct-apaas/ProcessEngineController"
 */
export async function postProcessEngineExecute(data: ProcessEngineRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-engine/execute`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取已办任务节点拓展信息
 * import { getProcessEngineHiTaskExtension } from "/@/apis/gct-apaas/ProcessEngineController"
 */
export interface getProcessEngineHiTaskExtensionQueryInterface {
  taskId: string; // taskId
}
export async function getProcessEngineHiTaskExtension(params: getProcessEngineHiTaskExtensionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMapstringobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-engine/hi-task/extension`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取流程开始节点拓展信息
 * import { getProcessEngineInitialTaskExtension } from "/@/apis/gct-apaas/ProcessEngineController"
 */
export interface getProcessEngineInitialTaskExtensionQueryInterface {
  processInstanceId: string; // processInstanceId
}
export async function getProcessEngineInitialTaskExtension(params: getProcessEngineInitialTaskExtensionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMapstringobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-engine/initial-task/extension`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取模型数据
 * import { getProcessEngineModel } from "/@/apis/gct-apaas/ProcessEngineController"
 */
export interface getProcessEngineModelQueryInterface {
  processInstanceId: string; // processInstanceId
}
export async function getProcessEngineModel(params: getProcessEngineModelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessModelInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-engine/model`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postProcessEngineReassignment } from "/@/apis/gct-apaas/ProcessEngineController"
 */
export async function postProcessEngineReassignment(data: ReassignmentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-engine/reassignment`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取待办任务节点拓展信息
 * import { getProcessEngineTaskExtension } from "/@/apis/gct-apaas/ProcessEngineController"
 */
export interface getProcessEngineTaskExtensionQueryInterface {
  taskId: string; // taskId
}
export async function getProcessEngineTaskExtension(params: getProcessEngineTaskExtensionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMapstringobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-engine/task/extension`,
      method: 'get',
      params,
      ...config,
    },
  );
}