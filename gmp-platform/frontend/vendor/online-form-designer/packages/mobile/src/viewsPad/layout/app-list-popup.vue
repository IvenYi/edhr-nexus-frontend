<template>
  <van-popup
    v-model:show="visible"
    position="left"
    class="app-list-popup"
    :style="{ width: '30%', height: '100%' }"
  >
    <div class="relative z-0 h-full flex flex-col bg-white">
      <!-- app icon -->
      <div class="flex-shrink-0 flex items-center px-6 py-5 border-b-solid border-zinc-100">
        <div
          class="flex-shrink-0 flex justify-center items-center w-12 h-12 rounded-10px overflow-hidden"
          :style="{ background: logoInfo.bgColor || '#fff' }"
        >
          <vImage
            :size="logoInfo.logoType === LogoTypeEnum.Icon ? 28 : 48"
            :src="logoInfo.logo"
            :logoType="logoInfo.logoType"
            :color="logoInfo.color"
          />
        </div>
        <div class="flex-grow ml-3 min-w-0">
          <div class="font-bold text-md truncate">{{ appStore?.appConfig?.name }}</div>
          <div class="text-[#8B8B8B] text-sm truncate">{{ (CurrentTenant as any)?.name }}</div>
        </div>
      </div>

      <!-- 工作台 -->
      <div
        v-if="appStore.isInAppPage"
        class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b-solid border-zinc-100"
        @click="handleSwitch()"
      >
        <i class="flex-shrink-0 icon gct-iconfont icon-caidan-gongzuotai-rest text-3xl"></i>
        <span class="flex-grow ml-2 font-500 text-xl">工作台</span>
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 flex justify-center items-center"
        >
          <i class="icon gct-iconfont icon-youjiantou-Padduan"></i>
        </div>
      </div>

      <!-- app list -->
      <div v-if="appStore.isInAppPage" class="flex-grow pt-3 px-3 overflow-y-auto">
        <div class="px-3 text-zinc-500">{{ $t('sys.portal.myApp') }}</div>
        <div
          v-for="app in appList"
          :key="app.id"
          class="px-3 py-3 rounded-lg"
          :class="app.id === getAid ? 'bg-[#f0f6fc]' : ''"
          @click="handleSwitch(app)"
        >
          <div class="flex items-center text-sm text-zinc-500">
            <div class="flex-shrink-0">
              <div
                class="flex justify-center items-center w-10 h-10 rounded-lg overflow-hidden"
                :style="{ background: app.bgColor }"
              >
                <vImage
                  :size="app.logoType === LogoTypeEnum.Icon ? 28 : 40"
                  :src="app.logo"
                  :logoType="app.logoType"
                  :color="app.color"
                />
              </div>
            </div>
            <div
              class="flex-grow ml-3 min-w-0 font-bold text-lg truncate"
              :class="app.id === getAid ? 'text-[#026AC8]' : 'text-black'"
            >
              {{ app.name }}
            </div>
            <div v-if="app.id === getAid" class="px-2 text-[#026AC8]">
              <i class="icon gct-iconfont icon-duigou-da text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { getAppPageGetListReleasedApp } from '@mobile/apis/gct-platform/AppController';
  import { onMounted, ref } from 'vue';
  import type { IApp } from '@mobile/type';
  import { getAppList } from '@mobile/components/tabbar-views/workbench/components/panes/util';
  import { useAppStore } from '@mobile/stores/useAppStore';
  import { getAid } from '@mobile/stores/sessionHooks';
  import { SqlitePage } from '@mobile/utils/sqlite_page';
  import { LogoTypeEnum } from '@mobile/type';
  import { CurrentTenant } from '@mobile/stores/loginHooks';
  import { useplatSetting } from '@mobile/utils/useplatSetting';

  const router = useRouter();
  const appStore = useAppStore();
  const { setPassTheme } = useplatSetting();

  const logoInfo = appStore.getLogoInfo;

  const visible = ref(false);
  const isLoading = ref(false);
  const appList = ref<IApp[]>([]);

  const handleQueryList = async () => {
    try {
      isLoading.value = true;
      const res = await getAppPageGetListReleasedApp();
      appList.value = getAppList(res || [], false);
      isLoading.value = false;
    } catch (err) {
      isLoading.value = false;
    }
  };

  const open = () => {
    visible.value = true;
  };

  const close = () => {
    visible.value = false;
  };

  const handleSwitch = async (app?: IApp) => {
    if (app) {
      await SqlitePage.updateAppDB(app.id);
      await appStore.pushApp(app.id);
      router.push({
        name: 'appMenu',
        query: { refreshKey: new Date().getTime() },
      });
    } else {
      setPassTheme();
      await router.push({ path: '/main/workbench' });
      appStore.pushWorkbench();
    }
  };

  onMounted(handleQueryList);

  defineExpose({ open, close });
</script>

<style scoped>
  .van-overlay {
    background-color: rgb(0 0 0 / 20%);
  }
</style>
