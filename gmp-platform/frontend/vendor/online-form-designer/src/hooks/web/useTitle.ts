import { watch, unref, computed } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { useTitle as usePageTitle } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { useLocaleStore } from '/@/store/modules/locale';
import { REDIRECT_NAME } from '/@/router/constant';
import { useRootSetting } from '../setting/useRootSetting';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { usePermissionStore } from '/@/store/modules/permission';
import { ProjectName } from '/@/enums/appEnum';

let tTitleBak = '';

/**
 * Listening to page changes and dynamically changing site titles
 */
export function useTitle() {
  const { getCurrentProject } = usePermissionStore();
  const { getPlatformName } = useRootSetting();
  const appInfoStore = useAppInfoStore();

  const siteName = computed(() => {
    return appInfoStore.appInfo?.name &&
      [ProjectName.APP_DESIGNER, ProjectName.WEB_RENDER].includes(getCurrentProject as ProjectName)
      ? appInfoStore.appInfo.name
      : getPlatformName.value;
  });

  const { t } = useI18n();
  const { currentRoute } = useRouter();
  const localeStore = useLocaleStore();

  const pageTitle = usePageTitle();

  watch(
    [() => currentRoute.value.path, () => localeStore.getLocale],
    () => {
      const route = unref(currentRoute);

      if (route.name === REDIRECT_NAME) {
        return;
      }

      const tTitle = t(route?.meta?.title as string);
      tTitleBak = tTitle;
      pageTitle.value = tTitle ? ` ${tTitle} - ${siteName.value} ` : `${siteName.value}`;
    },
    { immediate: true },
  );
}

export function updateTitle(titleValue) {
  if (!titleValue) return;
  const pageTitle = usePageTitle();
  pageTitle.value = tTitleBak ? ` ${tTitleBak} - ${titleValue} ` : `${titleValue}`;
}
