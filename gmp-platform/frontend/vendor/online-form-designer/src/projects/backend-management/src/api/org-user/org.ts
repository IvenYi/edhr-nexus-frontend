import { defHttp } from '/@/utils/http/axios';
import { Org, DragOrg } from '/@backend-management/views/user/types/org-user.d';
import { DeleteApiReq } from '/@/../types/api.d';
enum Api {
  OrgList = '/org/list',
  Org = '/org',
  OrgUpdate = '/org/',
  OrgDrag = '/org/drag',
  OrgDelTrans = '/org/transferAndDelete',
}

/**
 * @description: org list api
 */
export function getOrgListApi(): Promise<Org[]> {
  return defHttp.get({ url: Api.OrgList });
}

/**
 * @description delete org api
 */
export function deleteOrgApi(params: DeleteApiReq): Promise<any> {
  return defHttp.delete(
    {
      url: Api.Org,
      params,
    },
    { joinParamsToUrl: true },
  );
}

/**
 * @description update org  api
 */
export function updateOrgApi(params: string, data: Org): Promise<any | null> {
  return defHttp.put({
    url: Api.OrgUpdate,
    params,
    data,
  });
}

/**
 * @description drag org api
 */
export function dragOrgApi(data: DragOrg) {
  return defHttp.post({
    url: Api.OrgDrag,
    data,
  });
}
/**
 * @description add org api
 */
export function addOrgApi(data: Org) {
  return defHttp.post({
    url: Api.Org,
    data,
  });
}
/**
 * @description drag org api
 */
export function transferAndDeleteOrg(data: DragOrg) {
  return defHttp.post({
    url: Api.OrgDelTrans,
    data,
  });
}
