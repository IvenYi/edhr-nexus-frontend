import {
  ApplicationType,
  modifyApplicationReq,
} from '/@backend-management/views/tenant/types/tenant';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  List = '/app/list',
  PageList = 'app/page/list',
  App = '/app',
  Appinfo = '/app/info',
}

// 获取应用列表
export function getApplicationList(): Promise<ApplicationType[]> {
  return defHttp.get({
    url: Api.List,
  });
}

// 获取应用的分页列表
export function getApplicationPageList(params) {
  return defHttp.get({
    url: Api.PageList,
    params,
  });
}

// 保存
export function saveApplication(data: modifyApplicationReq) {
  return defHttp.post({
    url: Api.App,
    data,
  });
}

// 删除
export function deleteApplication(params: { ids: string }) {
  return defHttp.delete({
    url: Api.App,
    params,
  });
}

// 详情
export function getApplicationDetail(params: { id: string }) {
  return defHttp.get({
    url: Api.Appinfo,
    params,
  });
}

// 修改
export function modifyApplication(params: { id: string }, data: modifyApplicationReq) {
  return defHttp.put({
    url: Api.App,
    params,
    data,
  });
}
