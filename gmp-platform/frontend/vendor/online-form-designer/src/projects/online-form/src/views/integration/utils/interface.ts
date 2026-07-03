import { useUserStore } from '/@/store/modules/user';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';

/** 获取web端配置信息 */
export const getConfigInfoByWeb = () => {
  const userStore = useUserStore();
  const { businessSetting } = useBusinessSetting();
  const searchField = businessSetting.productSearchFields || 'name_,code_';
  return {
    defaultUserId: userStore.getUserInfo?.userId,
    defaultOrgId: userStore.getTenantUserInfo?.masterOrgId,
    defaultProductSearchFields: searchField,
  };
};
