<template>
  <template v-if="!model">
    <div v-for="(app, index) in menuOptions" :key="index" class="my-app bg-[#FFFFFF]">
      <div class="font-500 text-16px text-[#212528] pt12px mb24px ml16px mr16px text-overflow">{{
        app.name
      }}</div>
      <div class="my-app-item">
        <appItem
          v-for="i in app.children"
          :key="i.id"
          :app="{
            logoType: i.logoType,
            name: i.name,
            logo: i.logo,
            bgColor: i.color,
          }"
          @click="goPage(i)"
        />
      </div>
    </div>
  </template>
  <div v-if="!model" v-show="!menuOptions.length" class="no-data bg-[#FAFAFA] pt80px">
    <van-empty :image="imageSrc" image-size="176" description="暂无菜单" />
  </div>
  <design-render
    v-if="model"
    :context="context"
    :prefix="DesignRenderViewPrefix.CUSTOM_HOME"
    :model="model"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { DesignRenderViewPrefix } from '@gct/runtime-render';
  import { getMobileHomepageGetSelected } from '/@/apis/gct-apaas/MobileHomepageController';
  import appItem from '@mobile/components/appItem/index.vue';
  import type { Menus } from '@mobile/components/appItem/type';
  import type { MenuConfigResponse } from '@mobile/apis/gct-apaas/model/index';
  import { list_to_tree } from '@mobile/utils/treeHelper';
  import { getMenuConfigAvailableList } from '@mobile/apis/gct-apaas/MenuConfigController';
  import { LogoTypeEnum } from '@mobile/type';
  import imageSrc from '@mobile/assets/image/no-app.png';
  import { routerPush } from '@mobile/router/index';
  import { getAid } from '@mobile/stores/sessionHooks';
  import { UserData, initMqttApp } from '@mobile/stores/loginHooks';
  import { GlobaAppInfo } from '/@web-render/render/Event/utils/appRedis';
  import { getEnvCode } from '../../utils/useEnv';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  GlobaAppInfo.runApp({
    userInfo: UserData.value,
    env: getEnvCode(),
    aid: getAid.value,
  });

  // initMqttApp();

  getMenuConfigAvailableList({ menuType: 'MOBILE' }).then((res = []) => {
    menuOptions.value = list_to_tree(
      res
        .filter((i) => i.visible === 1 && !i.sysBuiltin)
        .map((i) => ({ ...i, logoType: LogoTypeEnum.Icon })),
    ).filter((e) => e.children.length);
  });

  const menuOptions = ref<Menus[]>([]);

  const context = {
    aid: getAid.value,
    UserData: UserData.value,
  };

  async function goPage(menu: MenuConfigResponse) {
    if (menu.linkPage) {
      routerPush(menu.linkPage + '', { menuName: menu.name });
    } else if (menu.url) {
      window.location.href = menu.url;
    }
  }

  const model = ref<IData | null>(null);

  const loadDesign = async () => {
    const data = await getMobileHomepageGetSelected();
    if (!data) {
      getMenuConfigAvailableList({ menuType: 'MOBILE' }).then((res = []) => {
        menuOptions.value = list_to_tree(
          res
            .filter((i) => i.visible === 1 && !i.sysBuiltin)
            .map((i) => ({ ...i, logoType: LogoTypeEnum.Icon })),
        ).filter((e) => e.children.length);
      });
    } else if (data && data.designerJson) {
      model.value = JSON.parse(data.designerJson);
    }
  };
  loadDesign();

  onUnmounted(() => {
    const { mitt } = useMitt();
    mitt.emit('mqtt-app-exit');
  });
</script>
<style scoped lang="less">
  .my-app {
    &:first-child {
      border-radius: 6px 6px 0 0;
    }

    &:last-child {
      border-radius: 0 0 6px 6px;
    }

    & + & {
      border-top: 1px solid #e0e3ea;
    }

    &-item {
      display: flex;
      flex-wrap: wrap;
      padding: 0 4px;
    }
  }

  .no-data {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .text-overflow {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
