import { computed, ref } from 'vue';
import { getDesignerCommonGetVisibleOrg } from '/@/apis/gct-apaas/DesignerCommonController';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { getRoleList } from '/@/apis/gct-apaas/RoleController';
import { getUserGroupList } from '/@/apis/gct-apaas/UserGroupController';

import { FIELD_TYPE } from '/@/enums/appEnum';
import type { FieldMetaDTO } from '@gct-paas/core';
import { DYN_FORMAT_TYPE_ENUM } from '/@/components/SelectUserModal/utils';
import { getOrgUserPickerTenantManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';
import { PickerOrgDTO, RoleResponse, UserGroupResponse } from '/@/apis/gct-apaas/model';

type Option = {
  label: string;
  value: string;
};

const DynamicFieldTypes = [
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.ORG,
  FIELD_TYPE.ORG_MULTI,
] as const;

export class UserSelectEcho {
  /**
   * 所有的选项的Map
   */
  optionsMap = new Map<string, Option>();

  /**
   * 获取后台数据
   *
   * @private
   * @param modelKey 主模型
   * @return {*}
   */
  private async fetchApiData(modelKey?: string) {
    const getFields = () => (modelKey ? getFieldMetaList({ modelKey }) : []);
    const [roles, userGroups, depts, fields] = await Promise.all([
      getRoleList(),
      getUserGroupList(),
      getDesignerCommonGetVisibleOrg(),
      getFields(),
    ]);

    return {
      roles: roles ?? [],
      userGroups: userGroups ?? [],
      depts: depts ?? [],
      fields: fields ?? [],
    };
  }

  /**
   * 生成角色选项
   * @param roles
   * @return {*}
   */
  getRoleOptions(roles: RoleResponse[]) {
    return (roles ?? []).map((e) => {
      return {
        value: `ROLE:${e.id}`,
        label: e.name!,
      };
    });
  }

  /**
   * 生成用户组选项
   * @param userGroups
   * @return {*}
   */
  getUserGroupOptions(userGroups: UserGroupResponse[]) {
    return (userGroups ?? []).map((e) => {
      return {
        value: `USER_GROUP:${e.id}`,
        label: e.name!,
      };
    });
  }

  /**
   * 生成部门选项
   * @param depts
   * @return {*}
   */
  getDepOptions(depts: PickerOrgDTO[]) {
    return (depts ?? []).map((e) => {
      return {
        value: `ORG:${e.id}`,
        label: e.name!,
      };
    });
  }

  /**
   * 生成动态选项
   *
   * @param fields 所有的主模型字段
   * @param depts 所有部门
   * @return {*}
   */
  getDynamicOptions(fields: FieldMetaDTO[], depts: PickerOrgDTO[]) {
    const dynamicFieldsMap = fields
      .filter((item) => {
        return DynamicFieldTypes.includes(item.type as any);
      })
      .reduce<{ [k in (typeof DynamicFieldTypes)[number]]?: FieldMetaDTO[] }>((acc, item) => {
        if (!acc[item.type!]) {
          acc[item.type!] = [];
        }
        acc[item.type!].push(item);

        return acc;
      }, {});

    const mapField = (fieldType, typeEnum) =>
      (dynamicFieldsMap?.[fieldType] ?? []).map((e) => ({
        value: `${typeEnum}:${e.key}`,
        label: e.name,
      }));

    return [
      // 动态人员、部门字段相关选项
      ...mapField(FIELD_TYPE.USER, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS),
      ...mapField(FIELD_TYPE.USER, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER),
      ...mapField(FIELD_TYPE.USER_MULTI, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS),
      ...mapField(FIELD_TYPE.USER_MULTI, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER),
      ...mapField(FIELD_TYPE.ORG, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL),
      ...mapField(FIELD_TYPE.ORG_MULTI, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL),
      // 指定部门负责人
      ...(depts ?? []).map((e) => ({
        value: `${DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL}:${e.id}`,
        label: e.name,
      })),
      // 固定动态选项
      {
        value: `${DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_MANAGER}:current`,
        label: $t('sys.bpmn.dynamicUser.DYN_SUBMITTER_MANAGER'),
      },
      {
        value: `${DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_DEPT_PRINCIPAL}:current`,
        label: $t('sys.bpmn.dynamicUser.DYN_SUBMITTER_DEPT_PRINCIPAL'),
      },
    ];
  }

  /**
   * 更新用户选项
   * @param selectedKeys 所有选中的选项的key
   */
  async updateUserOptions(selectedKeys: string[]) {
    // 计算没有翻译过的用户选项并查询翻译
    const noExistUserIds = selectedKeys
      .filter((e) => e.includes(`USER:`) && !this.optionsMap.has(e))
      .map((e) => e.replace(/USER:/, ''));

    if (noExistUserIds.length) {
      const res = (
        (await getOrgUserPickerTenantManagementUserListByIds({ ids: noExistUserIds.join(',') })) ??
        []
      ).map((e) => {
        return { ...e, value: `USER:${e.id}`, label: e.fullname! };
      });

      res.forEach((option) => {
        this.optionsMap.set(option.value, option);
      });
    }
  }

  /** 初始化加载并生成对应回显用的选项 */
  async init(opts: { modelKey?: string; selectedKeys?: string[] }) {
    // 清空数据
    this.optionsMap.clear();

    // 初始化除用户选项之外的选项
    const { depts, fields, roles, userGroups } = await this.fetchApiData(opts.modelKey);
    const options = [
      ...this.getRoleOptions(roles),
      ...this.getUserGroupOptions(userGroups),
      ...this.getDepOptions(depts),
    ];

    // 有模型才能加载计算动态选项
    if (opts.modelKey) {
      options.push(...this.getDynamicOptions(fields, depts));
    }

    options.forEach((option) => {
      this.optionsMap.set(option.value, option);
    });

    // 更新用户选项
    if (opts.selectedKeys) {
      await this.updateUserOptions(opts.selectedKeys);
    }
  }

  /**
   * 根据选中项的标识翻译出对应的选项
   * @param selectedKeys
   * @return {*}
   */
  translateSelected(selectedKeys: string[]) {
    return selectedKeys
      .map((e) => {
        if (!this.optionsMap.has(e)) {
          console.warn('警告!选项里没有' + e + '选项!');
        }
        return this.optionsMap.get(e)!;
      })
      .filter(Boolean);
  }
}

/**
 * 响应式的使用选项回显
 * @export
 * @return {*}
 */
export function useUserSelectEcho() {
  const AllOptions = ref<Option[]>([]);

  const echo = new UserSelectEcho();

  const init = async (opts: { modelKey: string; selectedKeys?: string[] }) => {
    await echo.init(opts);
    AllOptions.value = [...echo.optionsMap.values()];
  };

  const translateUsers = async (keys?: string[]) => {
    if (!keys?.length) {
      return;
    }
    await echo.updateUserOptions(keys);
    AllOptions.value = [...echo.optionsMap.values()];
  };

  return {
    init,
    translateUsers,
    AllOptions,
  };
}
