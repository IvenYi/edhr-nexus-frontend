import { defHttp } from '@/utils/http/axios';
import { ProcessTaskApproveHisQueryRequest, ResponseEntityPageBaseProcessTaskDoneApproveHisResponse, ResponseEntityPageBaseProcessTaskDoneResponse } from './model/index';

/**
 * 连审批流程记录表分页列表
 * import { postProcessTaskDoneApproveHisPageList } from "/@/apis/gct-apaas/ProcessTaskDoneController"
 */
export async function postProcessTaskDoneApproveHisPageList(data: ProcessTaskApproveHisQueryRequest, config = {}): Promise<ResponseEntityPageBaseProcessTaskDoneApproveHisResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-task-done/approve/his/page/list`,
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
 * import { getProcessTaskDonePageList } from "/@/apis/gct-apaas/ProcessTaskDoneController"
 */
export interface getProcessTaskDonePageListQueryInterface {
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
export async function getProcessTaskDonePageList(params: getProcessTaskDonePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessTaskDoneResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-task-done/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}