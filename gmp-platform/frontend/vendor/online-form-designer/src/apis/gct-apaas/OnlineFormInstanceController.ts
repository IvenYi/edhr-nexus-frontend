import { defHttp } from '@/utils/http/axios';
import { OnlineFormInstanceRequest, ResponseEntitystring, ResponseEntityListOnlineFormInstanceResponse, ResponseEntityListstring, ResponseEntityOnlineFormInstanceResponse, ResponseEntityOnlineFormInstanceTmplRelationResponse, ResponseEntityOnlineFormInstance, ResponseEntityPageBaseOnlineFormInstanceResponse, ResponseEntityOnlineFormInstanceRelationInfoResponse, ResponseEntityMapstringobject, ResponseEntityFormInstLockResponse, BindRelatedIndstRequest, OnlineFormInsTaskRequest, FormTaskGetDTO, ResponseEntityboolean, OnlineFormInsTaskTransmit, SimpleOnlineFormInstanceRequest } from './model/index';

/**
 * 保存表单实例
 * import { postOnlineFormInstance } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export async function postOnlineFormInstance(data: OnlineFormInstanceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteOnlineFormInstance } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface deleteOnlineFormInstanceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteOnlineFormInstance(params: deleteOnlineFormInstanceQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/online-form-instance`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 查询EDHR 关联的 表单列表(DHR附录)
 * import { getOnlineFormInstanceAppendixFormList } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceAppendixFormListQueryInterface {
  materialNo: string; // Lot/SN 编号
  mfgOrderId?: string; // 工单ID
}
export async function getOnlineFormInstanceAppendixFormList(params: getOnlineFormInstanceAppendixFormListQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/appendix/form/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (EDHR 查询sheet数据Id) 根据在线表单id,业务标志ID(批次)查询填报数据ID 集合
 * import { getOnlineFormInstanceDataIds } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceDataIdsQueryInterface {
  materialNo: string; // 物料编号/或批次ID
  tmplId: string; // 在线表单ID
}
export async function getOnlineFormInstanceDataIds(params: getOnlineFormInstanceDataIdsQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/dataIds`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据实例ID获取在线表单实例详情信息
 * import { getOnlineFormInstanceDetail } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceDetailQueryInterface {
  containerId?: string; // containerId
  id: string; // id
  nodeKey?: string; // nodeKey
  routingOperationId?: string; // routingOperationId
  snId?: string; // snId
}
export async function getOnlineFormInstanceDetail(params: getOnlineFormInstanceDetailQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/detail`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询DHR表单实例（包括待填报/附录）
 * import { getOnlineFormInstanceDhrFormList } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceDhrFormListQueryInterface {
  materialNo: string; // Lot/SN 编号
  mfgOrderId?: string; // 工单ID
  module?: string; // 模块类型
  taskType: string; // 类型（production/rework)
}
export async function getOnlineFormInstanceDhrFormList(params: getOnlineFormInstanceDhrFormListQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/dhr/form/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询Edhr下在线表单实例
 * import { getOnlineFormInstanceFindByMaterialNo } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceFindByMaterialNoQueryInterface {
  materialNo: string; // 物料号
  mfgOrderId?: string; // mfgOrderId
  module?: string; // module
}
export async function getOnlineFormInstanceFindByMaterialNo(params: getOnlineFormInstanceFindByMaterialNoQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/findByMaterialNo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询在线表单实例-根据批次号和edhr目录id
 * import { getOnlineFormInstanceFindByMaterialNoAndDocOutlineId } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceFindByMaterialNoAndDocOutlineIdQueryInterface {
  docOutlineId: string; // docOutlineId
  materialNo: string; // materialNo
}
export async function getOnlineFormInstanceFindByMaterialNoAndDocOutlineId(params: getOnlineFormInstanceFindByMaterialNoAndDocOutlineIdQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/findByMaterialNoAndDocOutlineId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询在线表单实例根据表单id和edhr实例id
 * import { getOnlineFormInstanceFindByOfTmplIdAndEdhrInstanceId } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceFindByOfTmplIdAndEdhrInstanceIdQueryInterface {
  edhrInstanceId: string; // edhr实例id
  ofTmplId: string; // 在线表单模板id
}
export async function getOnlineFormInstanceFindByOfTmplIdAndEdhrInstanceId(params: getOnlineFormInstanceFindByOfTmplIdAndEdhrInstanceIdQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/findByOfTmplIdAndEdhrInstanceId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询Edhr下在线表单模板和其关联之实例
 * import { getOnlineFormInstanceFindByTmplIdAndMaterialNo } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceFindByTmplIdAndMaterialNoQueryInterface {
  materialNo: string; // 物料号
  ofTmplId: string; // 在线表单模板id
}
export async function getOnlineFormInstanceFindByTmplIdAndMaterialNo(params: getOnlineFormInstanceFindByTmplIdAndMaterialNoQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormInstanceTmplRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/findByTmplIdAndMaterialNo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询单据任务表单根据流程号 - 给记录变更使用
 * import { getOnlineFormInstanceFindOfTaskBySerialNo4Change } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceFindOfTaskBySerialNo4ChangeQueryInterface {
  serialNo: string; // 流程号
}
export async function getOnlineFormInstanceFindOfTaskBySerialNo4Change(params: getOnlineFormInstanceFindOfTaskBySerialNo4ChangeQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormInstance['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/findOfTaskBySerialNo4Change`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页查询edhr实例下的表单实例列表
 * import { getOnlineFormInstanceFindPage4EdhrInstance } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceFindPage4EdhrInstanceQueryInterface {
  businessId?: string; // 业务id
  description?: string; // 描述
  docOutlineId?: string; // 文档行id
  edhrInstanceId: string; // edhr实例id
  ignoreAbandon?: boolean; // 是否忽略作废表单
  ofTmplId: string; // 在线表单模板id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}
export async function getOnlineFormInstanceFindPage4EdhrInstance(params: getOnlineFormInstanceFindPage4EdhrInstanceQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/findPage4EdhrInstance`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询在线表单实例之关联信息
 * import { getOnlineFormInstanceFindRelationInfoById } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceFindRelationInfoByIdQueryInterface {
  id: string; // 表单实例id
}
export async function getOnlineFormInstanceFindRelationInfoById(params: getOnlineFormInstanceFindRelationInfoByIdQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormInstanceRelationInfoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/findRelationInfoById`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 表单放行工作台分页列表
 * import { getOnlineFormInstanceFormPageList } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceFormPageListQueryInterface {
  endModifyTime?: string; // 更新结束时间
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  materialStatus?: string; // 单据来源(LOT_SN_APPEND:附录创建表单/FORM:单据任务/PRODUCT_RELEASE)
  ofTmplName?: string; // 在线表单模板名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  serialNo?: string; // 流水号
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startModifyTime?: string; // 更新开始时间
  title?: string; // 标题
}
export async function getOnlineFormInstanceFormPageList(params: getOnlineFormInstanceFormPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/form/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取表单实例上关联的产品信息
 * import { getOnlineFormInstanceGetRelatedProduct } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceGetRelatedProductQueryInterface {
  id: string; // 在线表单实例id
}
export async function getOnlineFormInstanceGetRelatedProduct(params: getOnlineFormInstanceGetRelatedProductQueryInterface = {}, config = {}): Promise<ResponseEntityMapstringobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/getRelatedProduct`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取持有表单实例锁的用户
 * import { getOnlineFormInstanceHoldLockUser } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceHoldLockUserQueryInterface {
  formInstanceId: string; // 表单实例ID
}
export async function getOnlineFormInstanceHoldLockUser(params: getOnlineFormInstanceHoldLockUserQueryInterface = {}, config = {}): Promise<ResponseEntityFormInstLockResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/hold/lock/user`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 表单实例解锁
 * import { postOnlineFormInstanceHoldUnlock } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface postOnlineFormInstanceHoldUnlockQueryInterface {
  formInstanceId: string; // 表单实例ID
}
export async function postOnlineFormInstanceHoldUnlock(params: postOnlineFormInstanceHoldUnlockQueryInterface = {}, config = {}): Promise<ResponseEntityFormInstLockResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/hold/unlock`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据实例ID获取在线表单实例详情
 * import { getOnlineFormInstanceInfo } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceInfoQueryInterface {
  id: string; // id
}
export async function getOnlineFormInstanceInfo(params: getOnlineFormInstanceInfoQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据记录单号获取在线表单实例详情
 * import { getOnlineFormInstanceInfoByRecordNo } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceInfoByRecordNoQueryInterface {
  recordNo: string; // 记录单号
}
export async function getOnlineFormInstanceInfoByRecordNo(params: getOnlineFormInstanceInfoByRecordNoQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/info/byRecordNo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * eDHR根据实例ID集合获取在线表单实例详情
 * import { postOnlineFormInstanceInfos } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export async function postOnlineFormInstanceInfos(data: string[], config = {}): Promise<ResponseEntityListOnlineFormInstanceResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/infos`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getOnlineFormInstancePageList } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstancePageListQueryInterface {
  endCompletedTime?: string; // 任务完成结束时间
  endCreateTime?: string; // 任务创建结束时间
  instanceStatus?: string; // 状态
  instanceStatusNe?: string; // 状态不等于
  modifyUserId?: string; // 更新人id
  ofTmplName?: string; // 在线表单模板名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  relationId?: string; // 关联id
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startCompletedTime?: string; // 任务完成开始时间
  startCreateTime?: string; // 任务创建开始时间
  submitterName?: string; // 提交人名称
  title?: string; // 标题
}
export async function getOnlineFormInstancePageList(params: getOnlineFormInstancePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页查询表单实例
 * import { getOnlineFormInstanceQuery } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceQueryQueryInterface {
  description?: string; // 描述
  ext8?: string; // 扩展字段8
  ignoreAbandon?: boolean; // 是否忽略废弃表单
  materialNo: string; // materialNo
  ofTmplId?: string; // 在线表单模板id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}
export async function getOnlineFormInstanceQuery(params: getOnlineFormInstanceQueryQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/query`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 刷新表单实例快照
 * import { postOnlineFormInstanceRefreshSnapshot } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface postOnlineFormInstanceRefreshSnapshotQueryInterface {
  instIds: string; // 表单实例ids
}
export async function postOnlineFormInstanceRefreshSnapshot(params: postOnlineFormInstanceRefreshSnapshotQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/refresh/snapshot`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页查询查询EDHR 填报关联的 表单填报任务列表
 * import { getOnlineFormInstanceRelateFormPageList } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceRelateFormPageListQueryInterface {
  materialNo: string; // Lot/SN 编号
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getOnlineFormInstanceRelateFormPageList(params: getOnlineFormInstanceRelateFormPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/relate/form/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移除关联实例
 * import { deleteOnlineFormInstanceRelatedInstRemove } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface deleteOnlineFormInstanceRelatedInstRemoveQueryInterface {
  instId: string; // 需要移除的表单实例id
}
export async function deleteOnlineFormInstanceRelatedInstRemove(params: deleteOnlineFormInstanceRelatedInstRemoveQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/online-form-instance/related/inst/remove`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 解绑已有实例
 * import { postOnlineFormInstanceRelatedInstUnbind } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export async function postOnlineFormInstanceRelatedInstUnbind(data: BindRelatedIndstRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/related/inst/unbind`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 反向追溯-分页列表
 * import { getOnlineFormInstanceReverseTracePageList } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceReverseTracePageListQueryInterface {
  deviceId?: string; // 设备名称
  endTraceDate?: string; // 日期结束
  materialNo?: string; // lot/sn
  mfgOrderId?: string; // 工单号
  operatorId?: string; // 填报人
  orderNo?: string; // 订单号
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  productId?: string; // 物料名称
  productIds?: array; // 物料名称
  recordNo?: string; // 记录单号
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTraceDate?: string; // 日期开始
  tmplId?: string; // 表单模板
}
export async function getOnlineFormInstanceReverseTracePageList(params: getOnlineFormInstanceReverseTracePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/reverse/trace/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 创建单据填报任务
 * import { postOnlineFormInstanceTask } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export async function postOnlineFormInstanceTask(data: OnlineFormInsTaskRequest, config = {}): Promise<ResponseEntityOnlineFormInstanceResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/task`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取我的单据任务
 * import { postOnlineFormInstanceTaskPageList } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface postOnlineFormInstanceTaskPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function postOnlineFormInstanceTaskPageList(data: FormTaskGetDTO, params: postOnlineFormInstanceTaskPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormInstanceResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/task/page/list`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 单据填报任务移除
 * import { deleteOnlineFormInstanceTaskRemoveByOfInstId } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface deleteOnlineFormInstanceTaskRemoveByOfInstIdPathInterface {
  ofInstId: string; // ofInstId
}
export async function deleteOnlineFormInstanceTaskRemoveByOfInstId(path: deleteOnlineFormInstanceTaskRemoveByOfInstIdPathInterface, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/online-form-instance/task/remove/${path?.ofInstId}`,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 单据填报任务重新发送
 * import { getOnlineFormInstanceTaskResendByOfInstId } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceTaskResendByOfInstIdPathInterface {
  ofInstId: string; // ofInstId
}
export async function getOnlineFormInstanceTaskResendByOfInstId(path: getOnlineFormInstanceTaskResendByOfInstIdPathInterface, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/task/resend/${path?.ofInstId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 单据填报任务更新
 * import { putOnlineFormInstanceTaskUpdate } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export async function putOnlineFormInstanceTaskUpdate(data: OnlineFormInsTaskRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/online-form-instance/task/update`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 单据填报任务转发
 * import { putOnlineFormInstanceTaskById } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface putOnlineFormInstanceTaskByIdPathInterface {
  id: string; // id
}
export async function putOnlineFormInstanceTaskById(path: putOnlineFormInstanceTaskByIdPathInterface, data: OnlineFormInsTaskTransmit, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/online-form-instance/task/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 正向追溯-分页列表
 * import { getOnlineFormInstanceTracePageList } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export interface getOnlineFormInstanceTracePageListQueryInterface {
  businessType?: string; // 业务类型
  createUserId?: string; // 创建人id
  endTaskCompletedTime?: string; // 任务创建结束时间-结束
  endTaskCreateTime?: string; // 任务创建时间-结束
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  instanceStatus?: string; // 表单状态
  materialStatus?: string; // 表单记录来源:LOT 批次、SN、PRODUCT_RELEASE 放行单、FORM 单据任务、LOT_SN_APPEND 批次或SN临时追加的，一般作为附录呈现
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  relatedMaterialNo?: number; // 是否关联批次 1 是、0 否
  relatedMaterialNoValue?: string; // 关联批次/SN
  serialNo?: string; // 在线表单流水号
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTaskCompletedTime?: string; // 任务创建结束时间-开始
  startTaskCreateTime?: string; // 任务创建时间-开始
  title?: string; // 任务标题
  tmplId?: string; // 表单模板
}
export async function getOnlineFormInstanceTracePageList(params: getOnlineFormInstanceTracePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/trace/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改表单实例描述字段
 * import { putOnlineFormInstanceUpdateDescription } from "/@/apis/gct-apaas/OnlineFormInstanceController"
 */
export async function putOnlineFormInstanceUpdateDescription(data: SimpleOnlineFormInstanceRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/online-form-instance/updateDescription`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}