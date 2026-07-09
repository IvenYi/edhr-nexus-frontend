import { createVNode, render as vueRender } from 'vue';
import modals from './src/view.vue';
import type { OrgUserResponse } from '/@/apis/gct-platform/model/index';
import { Org } from '/@backend-management/views/user/types/org-user.d';
import {
  getDesignerCommonGetCanBeUsedOrgUser,
  getDesignerCommonListUserByIds,
  getDesignerCommonGetCanBeUsedOrg,
  getDesignerCommonGetVisibleOrg,
  getDesignerCommonGetVisibleOrgUser,
} from '/@/apis/gct-apaas/DesignerCommonController';
import {
  getOrgUserPickerTenantManagementOrgUserPageList,
  getOrgUserPickerTenantManagementUserListByIds,
} from '/@/apis/gct-platform/OrgUserPickerController';
import { getTenantManagementOrgList } from '/@/apis/gct-platform/TenantManagementOrgController';

export enum PickType {
  ALL = 'ALL',
  APP = 'APP',
  ViSIBLE = 'ViSIBLE',
}
/**
 * type:ALL 所有的，APP 应用内部场景 ，ViSIBLE用户组配置可见人员
 */
interface PickerParams {
  fieldKey?: string;
  modelKey?: string;
  type?: PickType;
}
type RequiredByKeys<T, K extends keyof T> = {
  [P in K]-?: T[P];
} & Pick<T, Exclude<keyof T, K>>;
export function useModalPicker({ type = PickType.ALL, fieldKey, modelKey }: PickerParams = {}) {
  const { getUserOptions, getUserByIds, getDeptOptions } = getApisByType({
    type,
    fieldKey,
    modelKey,
  });

  let userRef: any;
  const container = document.createDocumentFragment() as any;
  function readyModal() {
    const vm = createVNode(modals, {
      getUserOptions,
      getUserByIds,
      destroyVm,
      getDeptOptions,
      type,
    });
    vueRender(vm, container);
    userRef = vm.component?.exposed;
  }
  function transformSet(values: any, multiple) {
    if (!multiple && !(values instanceof Array)) {
      values = [values];
    }
    return values;
  }
  function destroyVm() {
    setTimeout(() => {
      vueRender(null, container);
      userRef = null;
    }, 300);
  }
  /**
   * 选择人员
   * @param param0
   */
  function openPickerByUser({ userIds = [], multiple = true, callback }: openPickerByUserType) {
    readyModal();
    userIds = transformSet(userIds, multiple);
    userRef.openPickerByUser({
      userIds,
      multiple,
      callback,
    });
  }
  /**
   * 选择人员和部门组件
   * @param param0
   */
  function openPicker({ userIds = [], deptIds = [], callback }: openPickerType) {
    readyModal();
    userRef.openPicker({
      userIds,
      deptIds,
      callback,
    });
  }
  /**
   * 选择部门
   * @param param0
   */
  function openPickerByDept({ deptIds = [], multiple = true, callback }: openPickerByDeptType) {
    readyModal();
    deptIds = transformSet(deptIds, multiple);
    userRef.openPickerByDept({
      deptIds,
      multiple,
      callback,
    });
  }
  return {
    openPickerByUser,
    openPicker,
    openPickerByDept,
    getDeptOptions,
    getUserByIds,
  };
}

export interface openPickerType {
  userIds?: string[];
  deptIds?: string[];
  callback: openPickerCallback;
}
export interface openPickerByUserType {
  userIds?: string[] | string;
  multiple?: boolean;
  callback: openPickerByUserCallback;
}
export type openPickerCallback = (
  value: { userIds: string[]; deptIds: string[] },
  rows: { userMaps: OrgUserResponse[]; DeptMaps: Org[] },
) => void;

export type openPickerByUserCallback = (
  value: string[] | string,
  rows: OrgUserResponse[] | OrgUserResponse,
) => void;
export interface openPickerByDeptType {
  deptIds?: string[];
  multiple?: boolean;
  callback: openPickerByDeptCallback;
}
export type openPickerByDeptCallback = (value: string[], rows: OrgUserResponse[]) => void;

function getApisByType({ type, fieldKey, modelKey }: RequiredByKeys<PickerParams, 'type'>) {
  const Map = {
    [PickType.ALL]: {
      getUserOptions: getOrgUserPickerTenantManagementOrgUserPageList,
      getUserByIds: getOrgUserPickerTenantManagementUserListByIds,
      getDeptOptions: getTenantManagementOrgList,
    },
    [PickType.APP]: {
      getUserOptions: (params) =>
        getDesignerCommonGetCanBeUsedOrgUser({ fieldKey, modelKey, ...params }),
      getUserByIds: (params) => getDesignerCommonListUserByIds({ fieldKey, modelKey, ...params }),
      getDeptOptions: getDesignerCommonGetCanBeUsedOrg,
    },
    [PickType.ViSIBLE]: {
      getUserOptions: getDesignerCommonGetVisibleOrgUser,
      getUserByIds: getOrgUserPickerTenantManagementUserListByIds,
      getDeptOptions: getDesignerCommonGetVisibleOrg,
    },
  };
  return Map[type];
}
