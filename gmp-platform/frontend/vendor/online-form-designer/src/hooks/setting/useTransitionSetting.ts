import type { TransitionSetting } from '/#/config';

import { computed } from 'vue';

import { useAppStore } from '/@/store/modules/app';

export function useTransitionSetting() {
  const appStore = useAppStore();

  // 切换动画
  const getEnableTransition = true;

  // 顶部进度条
  const getOpenNProgress = computed(() => {
    return appStore.themeSetting.pageProgress;
  });

  // 切换loading
  const getOpenPageLoading = computed((): boolean => {
    return appStore.themeSetting.pageLoading;
  });

  // 修改主题动画
  const getBasicTransition = 'fade-slide';

  function setTransitionSetting(transitionSetting: Partial<TransitionSetting>) {
    appStore.setProjectConfig({ transitionSetting });
  }
  return {
    setTransitionSetting,

    getEnableTransition,
    getOpenNProgress,
    getOpenPageLoading,
    getBasicTransition,
  };
}
