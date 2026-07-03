import { defHttp } from '@/utils/http/axios';
import { ResponseEntityDocControlTaskDoneResponse, ResponseEntityListDocControlTaskDoneResponse, ResponseEntityPageBaseDocControlTaskDoneResponse } from './model/index';

/**
 * 详情
 * import { getDocControlTaskDoneInfo } from "/@/apis/gct-apaas/DocControlTaskDoneController"
 */
export interface getDocControlTaskDoneInfoQueryInterface {
  id: string; // id
}
export async function getDocControlTaskDoneInfo(params: getDocControlTaskDoneInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDocControlTaskDoneResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control-task-done/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 受控历史列表
 * import { getDocControlTaskDoneList } from "/@/apis/gct-apaas/DocControlTaskDoneController"
 */
export interface getDocControlTaskDoneListQueryInterface {
  categoryId?: string; // 分类ID
  code?: string; // 文件编码
  controlTmplType?: string; // 类型(EDHR,在线表单:FORM)
  name?: string; // 文件名称
}
export async function getDocControlTaskDoneList(params: getDocControlTaskDoneListQueryInterface = {}, config = {}): Promise<ResponseEntityListDocControlTaskDoneResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control-task-done/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 受控历史分页列表
 * import { getDocControlTaskDonePageList } from "/@/apis/gct-apaas/DocControlTaskDoneController"
 */
export interface getDocControlTaskDonePageListQueryInterface {
  categoryId?: string; // 分类ID
  code?: string; // 文件编码
  controlTmplType?: string; // 类型(EDHR,在线表单:FORM)
  name?: string; // 文件名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDocControlTaskDonePageList(params: getDocControlTaskDonePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDocControlTaskDoneResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control-task-done/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}