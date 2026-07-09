import { Ref } from 'vue';
import { OrgDTO, UserDTO } from '../type';
import { BaseController } from './base-controller';
import { getDesignerCommonGetVisibleOrgUser } from '/@/apis/gct-apaas/DesignerCommonController';

export class EdhrController extends BaseController {
  /** 是否是授权的席位用户 */
  isGranted: boolean;

  constructor(opts: { orgData: Ref<OrgDTO[]>; isGranted: boolean }) {
    super(opts);
    this.isGranted = opts.isGranted;
  }

  async getUserDataByOrg(params: { orgId: string }): Promise<UserDTO[]> {
    const res = await getDesignerCommonGetVisibleOrgUser({
      orgIds: params.orgId,
      pageNo: 1,
      pageSize: 999999999,
      // appUserGranted: this.isGranted ? 1 : 0,
      ignoreEnabled: 1,
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
      // appUserGranted: this.isGranted ? 1 : 0,
      ignoreEnabled: 1,
    });
    return (res?.data || []).map((info) => {
      return { ...info, formatId: `USER:${info.id}` };
    }) as any;
  }
}
