import { defHttp } from '@/utils/http/axios';
import { PageLockRequest, ResponseEntitystring, ResponseEntityPageOccupyResponse } from './model/index';

/**
 * 取消page页面占用
 * import { postDesignerLockCancelOccupyPage } from "/@/apis/gct-apaas/DesignerLockController"
 */
export async function postDesignerLockCancelOccupyPage(data: PageLockRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/designer-lock/cancelOccupyPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDesignerLockGetPageOccupyMsg(params: getDesignerLockGetPageOccupyMsgQueryInterface = {}, config = {}): Promise<ResponseEntityPageOccupyResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/designer-lock/getPageOccupyMsg`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 锁定page页面
 * import { postDesignerLockLockPage } from "/@/apis/gct-apaas/DesignerLockController"
 */
export async function postDesignerLockLockPage(data: PageLockRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/designer-lock/lockPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 占用page页面进行编辑
 * import { postDesignerLockOccupyPage } from "/@/apis/gct-apaas/DesignerLockController"
 */
export async function postDesignerLockOccupyPage(data: PageLockRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/designer-lock/occupyPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 解除锁定page页面
 * import { postDesignerLockUnLockPage } from "/@/apis/gct-apaas/DesignerLockController"
 */
export async function postDesignerLockUnLockPage(data: PageLockRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/designer-lock/unLockPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}