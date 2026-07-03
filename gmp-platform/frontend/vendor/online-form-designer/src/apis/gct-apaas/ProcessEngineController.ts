import { defHttp } from '@/utils/http/axios';
import { ProcessEngineRequest, ResponseEntitystring, ResponseEntityMapstringobject, ResponseEntityProcessModelInfo, ReassignmentRequest } from './model/index';

/**
 * 执行
 * import { postProcessEngineExecute } from "/@/apis/gct-apaas/ProcessEngineController"
 */
export async function postProcessEngineExecute(data: ProcessEngineRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-engine/execute`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessEngineHiTaskExtension(params: getProcessEngineHiTaskExtensionQueryInterface = {}, config = {}): Promise<ResponseEntityMapstringobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-engine/hi-task/extension`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessEngineInitialTaskExtension(params: getProcessEngineInitialTaskExtensionQueryInterface = {}, config = {}): Promise<ResponseEntityMapstringobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-engine/initial-task/extension`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessEngineModel(params: getProcessEngineModelQueryInterface = {}, config = {}): Promise<ResponseEntityProcessModelInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-engine/model`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 转办
 * import { postProcessEngineReassignment } from "/@/apis/gct-apaas/ProcessEngineController"
 */
export async function postProcessEngineReassignment(data: ReassignmentRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-engine/reassignment`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessEngineTaskExtension(params: getProcessEngineTaskExtensionQueryInterface = {}, config = {}): Promise<ResponseEntityMapstringobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-engine/task/extension`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}