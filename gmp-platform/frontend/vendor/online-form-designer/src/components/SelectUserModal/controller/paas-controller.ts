import { UserDTO } from '../type';
import { BaseController } from './base-controller';
import { getDesignerCommonGetVisibleOrgUser } from '/@/apis/gct-apaas/DesignerCommonController';

export class PaasController extends BaseController {
  async getUserDataByOrg(params: { orgId: string }): Promise<UserDTO[]> {
    const res = await getDesignerCommonGetVisibleOrgUser({
      orgIds: params.orgId,
      pageNo: 1,
      pageSize: 999999999,
    });
    return (res?.data || []).map((info) => {
      return { ...info, formatId: `USER:${info.id}` };
    }) as any;
  }

  async getUserDataByKeyword(params: { keyword: string }): Promise<UserDTO[]> {
    const res = await getDesignerCommonGetVisibleOrgUser({
      orgIds: this.rootOrgIds.join(','),
      keyword: params.keyword,
      pageNo: 1,
      pageSize: 999999999,
    });
    return (res?.data || []).map((info) => {
      return { ...info, formatId: `USER:${info.id}` };
    }) as any;
  }
}
