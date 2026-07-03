import request from '@mobile/utils/request';
import type { PageLockRequest, ResponseEntitystring, ResponseEntityPageOccupyResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 取消page页面占用
 * import { postDesignerLockCancelOccupyPage } from "/@/apis/gct-apaas/DesignerLockController"
 */
export async function postDesignerLockCancelOccupyPage(data: PageLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-lock/cancelOccupyPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取page页面占用信息
 * import { getDesignerLockGetPageOccupyMsg } from "/@/apis/gct-apaas/DesignerLockController"
 */
export interface getDesignerLockGetPageOccupyMsgQueryInterface {
  id: string; // id
  type?: string; // type
}
export async function getDesignerLockGetPageOccupyMsg(params: getDesignerLockGetPageOccupyMsgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageOccupyResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-lock/getPageOccupyMsg`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 锁定page页面
 * import { postDesignerLockLockPage } from "/@/apis/gct-apaas/DesignerLockController"
 */
export async function postDesignerLockLockPage(data: PageLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-lock/lockPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 占用page页面进行编辑
 * import { postDesignerLockOccupyPage } from "/@/apis/gct-apaas/DesignerLockController"
 */
export async function postDesignerLockOccupyPage(data: PageLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-lock/occupyPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 解除锁定page页面
 * import { postDesignerLockUnLockPage } from "/@/apis/gct-apaas/DesignerLockController"
 */
export async function postDesignerLockUnLockPage(data: PageLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-lock/unLockPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}