import { isClient } from '@/utils/is';
import { createVNode, render } from 'vue';
import { type openPickerByType, type Options, type Props } from './src/typing';
import UserSelectPopup from './src/user-select-popup.vue';
import { getOrgUserPickerTenantManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';

let instance: ReturnType<typeof createVNode> | null = null;
export function createUserSelectPopup(options: Options) {
  if (!isClient) return;
  const propsData: Partial<Props> = {
    multiple: true,
    showTabs: ['User', 'Org', 'UserGroup'],
  };
  let popupRef: any;
  const container = document.createElement('div');
  Object.assign(propsData, options);

  function readyModal() {
    instance = createVNode(UserSelectPopup, propsData);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }
  function openUserSelectPopup({ ids, callback }: openPickerByType) {
    readyModal();
    popupRef.open({ ids, callback });
  }

  return { openUserSelectPopup };
}

/** 获取已选择的人员信息 */
export async function getSelectedUser(id) {
  const ids = Array.isArray(id) ? id.join(',') : id;
  const res = (await getOrgUserPickerTenantManagementUserListByIds({ ids })) ?? [];
  return res;
}
