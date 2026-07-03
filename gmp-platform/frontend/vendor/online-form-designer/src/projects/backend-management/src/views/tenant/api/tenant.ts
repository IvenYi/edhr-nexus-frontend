import { defHttp } from '/@/utils/http/axios';
import { 
  deleteTenentApiReq, 
  // deleteTenentApiRes, 
  getTenantInfoApiReq, 
  getTenantInfoApiRes,
  getTenantListApiRes, 
  getTenantPageListApiRes, 
  OrgListInfo, 
  saveTenantApiReq, 
  // saveTenantApiRes, 
  tenantChangeApiReq,
  tenantPageListReq,
  userFilterApiReq,
  UserInfo, 
  // tenantChangeApiRes 
} from '../types/tenant';

enum Api {
  Tenant = '/tenant',
  Change = '/tenant/',
  List = '/tenant/list',
  PageList = '/tenant/page/list',
  Info = '/tenant/info/',
  UserSearch = '/user/search',
  OrgList = '/org/list'
}

/**
 * @description: tenant list api
 */
export function getTenantListApi(): Promise<getTenantListApiRes> {
  return defHttp.get({ url: Api.List});
}

/**
 * @description: tenant page list api 
 */
export function getTenantPageListApi(params?: Partial<tenantPageListReq>): Promise<getTenantPageListApiRes> {
  return defHttp.get({
    url: Api.PageList,
    params
  });
}

/**
 * @description tenant save api
 */
export function saveTenantApi(data: saveTenantApiReq): Promise<any> {
  return defHttp.post({
    url: Api.Tenant,
    data
  });
}

/**
 * @description tenant delete Api 
 */
export function deleteTenantApi(params: deleteTenentApiReq): Promise<any> {
  return defHttp.delete({
    url: Api.Change,
    params,
  }, {
    joinParamsToUrl: true
  });
}

/**
 * @description tenant detail api
 */
export function getTenantInfoApi(params: string): Promise<getTenantInfoApiRes> {
  return defHttp.get({
    url: Api.Info,
    params
  });
}

/**
 * @description tenant changes api
 */
export function tenantChangeApi(data: tenantChangeApiReq, params: string): Promise<any | null> {
  return defHttp.put({
    url: Api.Change,
    params,
    data
  }) 
}

/**
 * @description user search api 
 */
export function getUserListApi(data: userFilterApiReq): Promise<UserInfo[]> {
  return defHttp.get({
    url: Api.UserSearch,
    data
  }, {
    joinParamsToUrl: true
  })   
  
}

/**
 * @description org list api 
 */
export function getOrgListApi(): Promise<OrgListInfo[]> {
  return defHttp.get({
    url: Api.OrgList,
  })
}
