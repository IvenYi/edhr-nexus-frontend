import { defHttp } from '@/utils/http/axios';
import { ResponseEntityOnlineFormInstanceResponse, ResponseEntityProductReleaseFormResponse, ResponseEntityProductReleaseFormInstanctDTO, ResponseEntityPageBaseProductReleaseResponse } from './model/index';

/**
 * 根据批次号/表单流水号查询放行单实例
 * import { getProductReleaseGetProductReleaseByMaterialNo } from "/@/apis/gct-apaas/ProductReleaseController"
 */
export interface getProductReleaseGetProductReleaseByMaterialNoQueryInterface {
  materialNo: string; // 批次号
}
export async function getProductReleaseGetProductReleaseByMaterialNo(params: getProductReleaseGetProductReleaseByMaterialNoQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/product-release/getProductReleaseByMaterialNo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取放行单实例/表单模板
 * import { getProductReleaseGetProductReleaseForm } from "/@/apis/gct-apaas/ProductReleaseController"
 */
export interface getProductReleaseGetProductReleaseFormQueryInterface {
  edhrInstanceId: string; // edhr实例id
}
export async function getProductReleaseGetProductReleaseForm(params: getProductReleaseGetProductReleaseFormQueryInterface = {}, config = {}): Promise<ResponseEntityProductReleaseFormResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/product-release/getProductReleaseForm`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据批次号/表单流水号查询放行单实例列表
 * import { getProductReleaseGetProductReleaseInstByMaterialNo } from "/@/apis/gct-apaas/ProductReleaseController"
 */
export interface getProductReleaseGetProductReleaseInstByMaterialNoQueryInterface {
  materialNo: string; // materialNo
}
export async function getProductReleaseGetProductReleaseInstByMaterialNo(params: getProductReleaseGetProductReleaseInstByMaterialNoQueryInterface = {}, config = {}): Promise<ResponseEntityProductReleaseFormInstanctDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/product-release/getProductReleaseInstByMaterialNo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProductReleasePageList } from "/@/apis/gct-apaas/ProductReleaseController"
 */
export interface getProductReleasePageListQueryInterface {
  createUserId?: string; // 创建人id
  endCompletedTime?: string; // 放行时间 - 结束
  endCreateTime?: string; // 创建时间 - 结束
  instanceStatus?: string; // 待放行：UNFILLED、RUNNING 放行中、已完成：COMPLETED
  materialNo?: string; // 批次或SN
  mfgOrderId?: string; // 工单ID
  modifyUserId?: string; // 更新人id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  productId?: string; // 产品id
  serialNo?: string; // 放行序列号
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startCompletedTime?: string; // 放行时间 - 开始
  startCreateTime?: string; // 创建时间 - 开始
}
export async function getProductReleasePageList(params: getProductReleasePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProductReleaseResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/product-release/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}