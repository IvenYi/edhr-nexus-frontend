<template>
  <div>
    <div class="component-title" style="position: relative">
      <div class="ell title">{{ $t('sys.portal.myApp') }}</div>
    </div>
    <div style="display: flex; flex-wrap: wrap">
      <appItem v-for="(app, index) in appOptions" :key="index" :app="app" @click="goApp(app)" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AppMueus } from '@mobile/components/appItem/type';
  import appItem from '@mobile/components/appItem/index.vue';
  import { getAid, getAppName } from '@mobile/stores/sessionHooks';
  import { SqlitePage } from '@mobile/utils/sqlite_page';
  import { LogoTypeEnum } from '@mobile/type';
  import { checkLicense } from '@mobile/utils/licenseHelper';
  import { useAppStore } from '@mobile/stores/useAppStore';

  const appStore = useAppStore();
  const router = useRouter();
  const appOptions = ref<AppMueus[]>([]);
  const visible = ref(false);

  onMounted(async () => {
    const releaseApp = appStore.getAppOptions;
    appOptions.value = releaseApp.map((i) => {
      const data = i.mobileJson ? JSON.parse(i.mobileJson) : {};
      return {
        name: i.name!,
        appId: i.id!,
        logo: i.logoType === LogoTypeEnum.Image ? data.image : i.logo,
        logoType: i.logoType!,
        color: data.logoColor,
        bgColor: i.logoType === LogoTypeEnum.Image ? null : data.logoBgColor,
      };
    });
  });
  /**
   * 跳转app
   * @param app
   */
  async function goApp(app: AppMueus) {
    await SqlitePage.updateAppDB(app.appId);
    getAid.value = app.appId;
    getAppName.value = app.name;
    const res = checkLicense ? await checkLicense(app.appId) : null;
    if (res) {
      router.push({ name: 'menucenter', query: { title: app.name, appId: app.appId } });
    }
  }
</script>

<style scoped lang="less">
  .arrow {
    position: absolute;
    top: 0;
    right: -5px;
    padding: 12px 5px;
    transform: rotateX(0);
    cursor: pointer;

    &.showMore {
      transform: rotateX(-180deg);
    }
  }
</style>
