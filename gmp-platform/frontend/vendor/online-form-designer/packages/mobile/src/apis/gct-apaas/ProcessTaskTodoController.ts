import request from '@mobile/utils/request';
import type { ResponseEntityPageBaseProcessTaskTodoResponse, ProcessTaskApproveHisQueryRequest, ResponseEntityPageBaseProcessTaskTodoApproveHisResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 所有人的分页列表
 * import { getProcessTaskTodoAllUserPageList } from "/@/apis/gct-apaas/ProcessTaskTodoController"
 */
export interface getProcessTaskTodoAllUserPageListQueryInterface {
  businessCode?: string; // 业务编号(关联其他业务数据的编号)
  businessId?: string; // 业务id(关联其他业务数据的id)
  edhrTmplId?: string; // edhr模板id
  endCreateTime?: string; // 创建时间 - 结束
  endTime?: string; // 待办：任务接收/已办：任务审核-结束时间
  materialNo?: string; // 批次/sn
  materialStatus?: string; // 记录类型(NO或SN)，为空则表示全部
  mfgOrderId?: string; // 工单ID
  notEdhr?: number; // 是否不显示edhr
  ofCode?: string; // 在线表单code
  ofCreateUserId?: string; // 表单创建人id
  ofModifyUserId?: string; // 表单更新人id
  ofTmplId?: string; // 表单模板
  ofTmplName?: string; // 表单模板名称
  onlyEdhr?: number; // 是否仅显示edhr
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  processInstanceStatus?: string; // 当前流程状态： 进行中：RUNNING 已结束：COMPLETED
  productId?: string; // 产品id
  serialNo?: string; // 流水码
  showChange?: number; // 是否显示表单变更数据
  showFormProcess?: boolean; // 显示表单流程数据
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startCreateTime?: string; // 创建时间 - 开始
  starterId?: string; // 汇总人ID
  startTime?: string; // 待办：任务接收/已办：任务审核-开始时间
  taskType?: string; // 任务类型
  taskTypeList?: array; // ...
  title?: string; // 表单任务名称
}
export async function getProcessTaskTodoAllUserPageList(params: getProcessTaskTodoAllUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessTaskTodoResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-task-todo/all-user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 连审批流程记录表分页列表
 * import { postProcessTaskTodoApproveHisPageList } from "/@/apis/gct-apaas/ProcessTaskTodoController"
 */
export async function postProcessTaskTodoApproveHisPageList(data: ProcessTaskApproveHisQueryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessTaskTodoApproveHisResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-task-todo/approve/his/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessTaskTodoPageList } from "/@/apis/gct-apaas/ProcessTaskTodoController"
 */
export interface getProcessTaskTodoPageListQueryInterface {
  businessCode?: string; // 业务编号(关联其他业务数据的编号)
  businessId?: string; // 业务id(关联其他业务数据的id)
  edhrTmplId?: string; // edhr模板id
  endCreateTime?: string; // 创建时间 - 结束
  endTime?: string; // 待办：任务接收/已办：任务审核-结束时间
  materialNo?: string; // 批次/sn
  materialStatus?: string; // 记录类型(NO或SN)，为空则表示全部
  mfgOrderId?: string; // 工单ID
  notEdhr?: number; // 是否不显示edhr
  ofCode?: string; // 在线表单code
  ofCreateUserId?: string; // 表单创建人id
  ofModifyUserId?: string; // 表单更新人id
  ofTmplId?: string; // 表单模板
  ofTmplName?: string; // 表单模板名称
  onlyEdhr?: number; // 是否仅显示edhr
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  processInstanceStatus?: string; // 当前流程状态： 进行中：RUNNING 已结束：COMPLETED
  productId?: string; // 产品id
  serialNo?: string; // 流水码
  showChange?: number; // 是否显示表单变更数据
  showFormProcess?: boolean; // 显示表单流程数据
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startCreateTime?: string; // 创建时间 - 开始
  starterId?: string; // 汇总人ID
  startTime?: string; // 待办：任务接收/已办：任务审核-开始时间
  taskType?: string; // 任务类型
  taskTypeList?: array; // ...
  title?: string; // 表单任务名称
}
export async function getProcessTaskTodoPageList(params: getProcessTaskTodoPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessTaskTodoResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-task-todo/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}