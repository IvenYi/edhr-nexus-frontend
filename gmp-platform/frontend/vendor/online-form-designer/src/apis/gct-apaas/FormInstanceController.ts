import { defHttp } from '@/utils/http/axios';
import { ResponseEntityOnlineFormInstanceResponse, ResponseEntitystring, AppendRelatedInstRequest, BindRelatedIndstRequest, OnlineFormInsTaskRequest } from './model/index';

/**
 * 查询表单实例-附录追加表单使用
 * import { getOnlineFormInstanceGetOne } from "/@/apis/gct-apaas/FormInstanceController"
 */
export interface getOnlineFormInstanceGetOneQueryInterface {
  materialStatus?: string; // 单据实例类型(单据任务:FORM ,放行单:PRODUCT_RELEASE 批次:LOT)多个值逗号拼接
  recordNo?: string; // 记录单号
  serialNo?: string; // 序列号
}
export async function getOnlineFormInstanceGetOne(params: getOnlineFormInstanceGetOneQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/getOne`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 表单内容加密校验测试
 * import { getOnlineFormInstanceInstEncodeCheck } from "/@/apis/gct-apaas/FormInstanceController"
 */
export interface getOnlineFormInstanceInstEncodeCheckQueryInterface {
  instId: string; // instId
}
export async function getOnlineFormInstanceInstEncodeCheck(params: getOnlineFormInstanceInstEncodeCheckQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/inst/encode/check`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 追加关联实例
 * import { postOnlineFormInstanceRelatedInstAppend } from "/@/apis/gct-apaas/FormInstanceController"
 */
export async function postOnlineFormInstanceRelatedInstAppend(data: AppendRelatedInstRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/related/inst/append`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 绑定已有实例
 * import { postOnlineFormInstanceRelatedInstBind } from "/@/apis/gct-apaas/FormInstanceController"
 */
export async function postOnlineFormInstanceRelatedInstBind(data: BindRelatedIndstRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/related/inst/bind`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 创建单据填报任务
 * import { postOnlineFormInstanceTaskForm } from "/@/apis/gct-apaas/FormInstanceController"
 */
export async function postOnlineFormInstanceTaskForm(data: OnlineFormInsTaskRequest, config = {}): Promise<ResponseEntityOnlineFormInstanceResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/taskForm`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}