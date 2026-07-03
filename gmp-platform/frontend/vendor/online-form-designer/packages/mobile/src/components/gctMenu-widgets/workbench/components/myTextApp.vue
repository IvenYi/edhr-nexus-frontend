<template>
  <div>
    <div class="component-title" style="position: relative">
      <div class="ell title">{{ $t('sys.portal.myTestApp') }}</div>
      <van-icon
        v-if="appTextOptions.length > 4"
        name="arrow-down"
        class="text-[#A2A9B5] font-16px arrow"
        :class="{ showMore: visible }"
        @click="visible = !visible"
      />
    </div>
    <div style="display: flex; flex-wrap: wrap">
      <appItem
        v-for="(app, index) in appTextOptions.filter((e, i) => i < 4)"
        :key="index"
        :app="app"
        @click="goApp(app)"
      />
    </div>
    <div v-show="visible" style="display: flex; flex-wrap: wrap">
      <appItem
        v-for="(app, index) in appTextOptions.filter((e, i) => i > 3)"
        :key="index"
        :app="app"
        @click="goApp(app)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AppMueus } from '@mobile/components/appItem/type';
  import appItem from '@mobile/components/appItem/index.vue';
  import { UserRoleReqEnum } from '@mobile/type';
  import { getAppTenantRoleByRolesApps } from '@mobile/apis/gct-platform/AppController';
  import { getAid, getAppName } from '@mobile/stores/sessionHooks';
  import { SqlitePage } from '@mobile/utils/sqlite_page';
  import { checkLicense } from '@mobile/utils/licenseHelper';

  const router = useRouter();
  const appTextOptions = ref<AppMueus[]>([]);
  const visible = ref(false);

  onMounted(async () => {
    const { data = [] } =
      (await getAppTenantRoleByRolesApps(
        {
          roles: UserRoleReqEnum.TESTER,
        },
        { pageNo: 1, pageSize: 10 },
      )) || {};
    appTextOptions.value = data.map((i) => {
      return {
        name: i.name!,
        appId: i.id!,
        logo: i.logo,
        logoType: i.logoType,
        color: i.logoColor,
        bgColor: i.logoBgColor,
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
    const res = checkLicense ? await checkLicense(app.appId, { env: 'dev' }) : null;
    if (res) {
      router.push({ name: 'menucenter', query: { title: app.name, appId: app.appId } });
    }
  }
</script>
<style scoped lang="less">
  .arrow {
    position: absolute;
    // top: 12px;
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
