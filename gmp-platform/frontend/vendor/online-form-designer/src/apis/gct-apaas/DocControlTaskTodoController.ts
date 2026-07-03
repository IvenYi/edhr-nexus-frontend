import { defHttp } from '@/utils/http/axios';
import { ResponseEntityPageBaseDocControlTaskTodoResponse, ResponseEntitylong, ResponseEntityDocControlTaskTodoResponse, ResponseEntityListDocControlTaskTodoResponse } from './model/index';

/**
 * 所有人的分页列表
 * import { getDocControlTaskTodoAllUserPageList } from "/@/apis/gct-apaas/DocControlTaskTodoController"
 */
export interface getDocControlTaskTodoAllUserPageListQueryInterface {
  categoryId?: string; // 分类ID
  code?: string; // 文件编码
  controlTmplType?: string; // 类型(EDHR,在线表单:FORM)
  createUserId?: string; // 创建人id
  endCreateTime?: string; // 创建时间 - 结束
  name?: string; // 文件名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startCreateTime?: string; // 创建时间 - 开始
}
export async function getDocControlTaskTodoAllUserPageList(params: getDocControlTaskTodoAllUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDocControlTaskTodoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control-task-todo/all-user/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 待我受控数量
 * import { getDocControlTaskTodoCount } from "/@/apis/gct-apaas/DocControlTaskTodoController"
 */
export async function getDocControlTaskTodoCount(config = {}): Promise<ResponseEntitylong['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control-task-todo/count`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getDocControlTaskTodoInfo } from "/@/apis/gct-apaas/DocControlTaskTodoController"
 */
export interface getDocControlTaskTodoInfoQueryInterface {
  id: string; // id
}
export async function getDocControlTaskTodoInfo(params: getDocControlTaskTodoInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDocControlTaskTodoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control-task-todo/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 待我受控列表
 * import { getDocControlTaskTodoList } from "/@/apis/gct-apaas/DocControlTaskTodoController"
 */
export interface getDocControlTaskTodoListQueryInterface {
  categoryId?: string; // 分类ID
  code?: string; // 文件编码
  controlTmplType?: string; // 类型(EDHR,在线表单:FORM)
  name?: string; // 文件名称
}
export async function getDocControlTaskTodoList(params: getDocControlTaskTodoListQueryInterface = {}, config = {}): Promise<ResponseEntityListDocControlTaskTodoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control-task-todo/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 待我受控分页列表
 * import { getDocControlTaskTodoPageList } from "/@/apis/gct-apaas/DocControlTaskTodoController"
 */
export interface getDocControlTaskTodoPageListQueryInterface {
  categoryId?: string; // 分类ID
  code?: string; // 文件编码
  controlTmplType?: string; // 类型(EDHR,在线表单:FORM)
  name?: string; // 文件名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDocControlTaskTodoPageList(params: getDocControlTaskTodoPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDocControlTaskTodoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/doc-control-task-todo/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}