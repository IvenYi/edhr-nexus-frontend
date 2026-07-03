import userSelectModal from './user-select-modal.vue';
import { getOrgUserPickerTenantManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

interface IParams {
  title?: string;
  selectKeys?: string[] | string;
  selectOptions?: any[];
  multiple?: boolean;
  showTabs?: string[];
  callback?: Function;
}

export async function openUserSlectModal({
  title,
  showTabs,
  selectKeys,
  selectOptions,
  multiple,
  callback,
}: IParams) {
  const tabs = ['User', 'Org', 'UserGroup'];
  const res = await gct.openUtil.modal(
    userSelectModal,
    {
      baseProps: {
        selectValues: selectKeys
          ? Array.isArray(selectKeys)
            ? selectKeys
            : selectKeys.split(',')
          : [],
        selectOptions: selectOptions || [],
        showTabs: showTabs || tabs,
        multiple: multiple ?? true,
      },

      callback,
    },
    {
      title: title || t('sys.appDesigner.approval.approvalUserSelect'),
      width: '640px',
    },
  );
  if (res.ok) {
    return Promise.resolve(res.data);
  } else {
    return Promise.reject();
  }
}

/** 获取已选择的人员信息 */
export async function getSelectedUser(id) {
  const ids = Array.isArray(id) ? id.join(',') : id;
  const res = (await getOrgUserPickerTenantManagementUserListByIds({ ids })) ?? [];
  return res;
}
