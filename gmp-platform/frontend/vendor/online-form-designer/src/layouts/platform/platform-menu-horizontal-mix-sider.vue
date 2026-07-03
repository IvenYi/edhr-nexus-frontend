<template>
  <MenuHorizontalMixSider v-bind="getCommonProps" :items="menus" />
</template>

<script setup lang="ts">
  import { computed, unref, toRef } from 'vue';
  import { useSplitMenu } from '../default/menu/useLayoutMenu';
  import { MenuHorizontalMixSider } from '/@/components/Menu';
  import { menuClickHandler } from './utils';

  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';

  import { useGo } from '/@/hooks/web/usePage';
  import { openWindow } from '/@/utils';
  import { isUrl } from '/@/utils/is';

  const { menusRef: menus } = useSplitMenu(toRef({}, 'splitType'));

  const go = useGo();

  const { getCollapsed } = useMenuSetting();

  const getCommonProps = computed(() => {
    return {
      beforeClickFn: beforeMenuClickFn,
      items: menus,
      collapse: unref(getCollapsed),
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
