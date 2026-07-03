<template>
  <MenuMixSider v-bind="getCommonProps" :items="menus" />
</template>

<script setup lang="ts">
  import { computed, unref, toRef } from 'vue';
  import { useSplitMenu } from '../default/menu/useLayoutMenu';
  import { MenuMixSider } from '/@/components/Menu';
  import type { PropType, CSSProperties } from 'vue';
  import { menuClickHandler } from './utils';

  // import { MenuModeEnum, MenuSplitTyeEnum } from '/@/enums/menuEnum';

  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';

  import { useGo } from '/@/hooks/web/usePage';
  import { openWindow } from '/@/utils';
  import { isUrl } from '/@/utils/is';

  const { menusRef: menus } = useSplitMenu(toRef({}, 'splitType'));

  const go = useGo();

  const {
    getMenuMode,
    getMenuType,
    getMenuTheme,
    getCollapsed,
    getCollapsedShowTitle,
    getAccordion,
    getIsHorizontal,
    getIsSidebarType,
    getSplit,
  } = useMenuSetting();

  const getCommonProps = computed(() => {
    return {
      beforeClickFn: beforeMenuClickFn,
      items: menus,
      // theme: unref(getComputedMenuTheme),
      // accordion: unref(getAccordion),
      collapse: unref(getCollapsed),
      // collapsedShowTitle: unref(getCollapsedShowTitle),
      onMenuClick: handleMenuClick,
    };
  });

  /**
   * before click menu
   * @param menu
   */
  async function beforeMenuClickFn(path: string) {
    if (!isUrl(path)) {
      return true;
    }
    openWindow(path);
    return false;
  }

  function handleMenuClick(menu) {
    menuClickHandler(menu, go);
  }
</script>

<style></style>
