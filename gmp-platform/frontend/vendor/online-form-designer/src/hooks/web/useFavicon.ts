import { useFavicon as useIcon } from '@vueuse/core';
import { useRootSetting } from '../setting/useRootSetting';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { usePermissionStore } from '/@/store/modules/permission';
import { ProjectName } from '/@/enums/appEnum';
import { watch, computed } from 'vue';

export function useFavicon() {
  const { getPlatformIcon } = useRootSetting();
  const { getCurrentProject } = usePermissionStore();
  const { appInfo } = useAppInfoStore();
  const icon = useIcon();

  const siteIcon = computed(() => {
    return getCurrentProject === ProjectName.APP_DESIGNER
      ? appInfo.pageIcon
      : getPlatformIcon.value;
  });

  watch(
    siteIcon,
    (value) => {
      console.log('icon icon', siteIcon);
      if (!value) return;
      icon.value = `/minio/${value}`;
    },
    { immediate: true },
  );
}

export function updateFavicon(iconValue) {
  if (!iconValue) return;
  const icon = useIcon();
  icon.value = `/minio/${iconValue}`;
}
