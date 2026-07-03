import { Ref } from 'vue';
import { OrgDTO, UserDTO } from '../type';
import { list2Tree } from '../utils';

export abstract class BaseController {
  /** 部门数据 */
  orgData: Ref<OrgDTO[]>;

  /** 顶级部门id集合 */
  get rootOrgIds() {
    return list2Tree(this.orgData.value).map((item) => item.id) as string[];
  }
  constructor(opts: { orgData: Ref<OrgDTO[]> }) {
    this.orgData = opts.orgData;
  }

  /**
   * 获取对应部门的用户数据
   */
  abstract getUserDataByOrg(params: { orgId: string }): Promise<UserDTO[]>;

  /** 通过关键字查询所有用户数据 */
  abstract getUserDataByKeyword(params: { keyword: string }): Promise<UserDTO[]>;
}
