import { defHttp } from '/@/utils/http/axios';
import {
  PageReq,
  UserListReq,
  GetUserReq,
  UserStateReq,
} from '/@backend-management/views/user/types/org-user.d';
import { UserDto } from '/@backend-management/views/user/types/org-user.d';
import { DeleteApiReq } from '/@/../types/api.d';
enum Api {
  UserByPage = '/user/list',
  UserSearch = '/user/search',
  UserDetail = '/user/detail',
  User = '/user/revise',
  UserRemove = '/user/remove',
  UserState = '/user/status/setting',
}
/**
 * @description: user list org
 */
export function getUserListByPage(params: PageReq, data: UserListReq): Promise<any[]> {
  return defHttp.post({
    url: Api.UserByPage,
    params,
    data,
  });
}

/**
 * @description: user list search
 */
export function getUserList(params?: string): Promise<any[]> {
  return defHttp.get({
    url: Api.UserSearch,
    params,
  });
}

/**
 * @description: add or edit user
 */
export function addOrEditUser(data: UserDto): Promise<any[]> {
  return defHttp.post({
    url: Api.User,
    data,
  });
}

export function getUserById(params: GetUserReq): Promise<any[]> {
  return defHttp.get({
    url: Api.UserDetail,
    params,
  });
}

/**
 * @description delete org api
 */
export function deleteUser(params: DeleteApiReq): Promise<any> {
  return defHttp.delete(
    {
      url: Api.UserRemove,
      params,
    },
    { joinParamsToUrl: true },
  );
}

/**
 * @description: change user state
 */
export function changeUserState(data: UserStateReq): Promise<any[]> {
  return defHttp.post({
    url: Api.UserState,
    data,
  });
}
// /**
//  * @description: org list api
//  */
// export function getOrgListApi(): Promise<Org[]> {
//   return defHttp.get({ url: Api.OrgList });
// }

// /**
//  * @description delete org api
//  */
// export function deleteOrgApi(params: DeleteApiReq): Promise<any> {
//   return defHttp.delete(
//     {
//       url: Api.Org,
//       params,
//     },
//     { joinParamsToUrl: true },
//   );
// }

// /**
//  * @description update org  api
//  */
// export function updateOrgApi(params: string, data: Org): Promise<any | null> {
//   return defHttp.put({
//     url: Api.OrgUpdate,
//     params,
//     data,
//   });
// }

// export function addOrgApi(data: Org) {
//   return defHttp.post({
//     url: Api.Org,
//     data,
//   });
// }
