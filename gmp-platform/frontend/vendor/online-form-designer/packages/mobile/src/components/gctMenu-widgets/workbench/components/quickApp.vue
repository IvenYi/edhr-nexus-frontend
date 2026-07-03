<template>
  <div>
    <div class="component-title ks-row-middle mb12px" style="position: relative">
      <div class="ell title">{{ $t('sys.portal.quickAccess') }}</div>
      <span class="add-icon" @click="addMenu">
        <span class="iconfont icon-kuaijiefangwen text-[#A2A9B5]"></span>
      </span>
    </div>
    <div>
      <div
        v-for="group in appShortOptions.filter((e) => e.type === 'APP')"
        :key="group.appId"
        class="overflow-hidden ks-row w100%"
        style="flex-wrap: wrap"
      >
        <div class="ell px10px mt14px mb4px w100%">{{ group.name }}</div>
        <appItem
          v-for="(app, index) in appShortOptions.filter(
            (e) => e.appId === group.appId && e.type === 'MENU',
          )"
          :key="index"
          :app="app"
          @click="goPageMenu(app)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AppMueus } from '@mobile/components/appItem/type';
  import appItem from '@mobile/components/appItem/index.vue';
  import { getAid, getAppName } from '@mobile/stores/sessionHooks';
  import { getShortcutMenuList } from '@mobile/apis/gct-platform/ShortcutMenuController';
  import { SqlitePage } from '@mobile/utils/sqlite_page';
  import { LogoTypeEnum } from '@mobile/type';
  import { routerPush } from '@mobile/router/index';
  import { checkLicense } from '@mobile/utils/licenseHelper';

  const router = useRouter();
  const appShortOptions = ref<AppMueus[]>([]);
  onMounted(async () => {
    const shortData = (await getShortcutMenuList()) || [];
    appShortOptions.value =
      shortData
        // .filter((i) => i.type === 'MENU')
        .map((i) => {
          return {
            ...i,
            name: i.menuName!,
            appId: i.appId!,
            linkPage: i.linkPage,
            logoType: LogoTypeEnum.Icon,
            logo: i.logo!,
            color: i.logoColor || '#FFFFFF',
            bgColor: i.color,
          };
        }) || [];
  });

  /**
   * 添加快捷菜单
   * @param menu
   */
  function addMenu() {
    router.push({ name: 'quickMenu' });
  }
  /**
   * 进入页面菜单
   * @param menu
   */
  async function goPageMenu(menu: AppMueus) {
    await SqlitePage.updateAppDB(menu.appId);
    getAid.value = menu.appId;
    getAppName.value = menu.name;
    const res = checkLicense ? await checkLicense(menu.appId) : null;
    if (res) {
      routerPush(menu.linkPage + '', { menuName: menu.name });
    }
  }
</script>
<style scoped lang="less">
  .add-icon {
    position: absolute;
    // top: 12px;
    right: 16px;
  }
</style>
