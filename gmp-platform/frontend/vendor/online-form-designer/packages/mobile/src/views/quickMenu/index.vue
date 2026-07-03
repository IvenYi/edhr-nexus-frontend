<template>
  <div class="leading-none">
    <van-nav-bar
      placeholder
      fixed
      title="快捷菜单配置"
      left-arrow
      right-text="完成"
      :border="false"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    />
    <van-tabs
      v-model:active="active"
      shrink
      animated
      sticky
      offset-top="52px"
      :before-change="reloadMenus"
    >
      <van-tab title="应用" name="app">
        <appList class="pl16px pr16px pb40px" :activeAppId="avitveApp?.id" @change="changeApp" />
      </van-tab>
      <van-tab title="菜单" name="menu">
        <menuList
          :avitveApp="avitveApp!"
          :checkedMenus="checkedMenus"
          class="pl16px pr16px pb40px pt10px"
          :menuOptions="appMueuOptions"
        />
      </van-tab>
      <van-tab title="已选菜单" name="activemenu">
        <selectedMenuList class="pl16px pr16px pb40px pt10px" :checkedMenus="checkedMenus" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
  import menuList from './menuList.vue';
  import selectedMenuList from './selectedMenuList.vue';
  import appList from './appList.vue';
  import {
    postShortcutMenuSaveBatch,
    getShortcutMenuListAPpMenu,
    getShortcutMenuList,
  } from '@mobile/apis/gct-platform/ShortcutMenuController';
  import type { ShortcutMenuRequest } from '@mobile/apis/gct-platform/model/index';
  import { cloneDeep } from 'lodash-es';
  import type { AppMueus, Menus } from '@mobile/components/appItem/type';
  import { WorkBenchTabEnum, LogoTypeEnum } from '@mobile/type';
  import type { AppResponse } from '@mobile/apis/gct-platform/model';
  import { showToast } from 'vant';
  import { list_to_tree } from '@mobile/utils/treeHelper';

  const terminalType = import.meta.env.VITE_APP_ENV === 'ipad' ? 'PAD' : 'MOBILE';

  const checkedMenus = ref<AppMueus[]>([]);
  const appMueuOptions = ref<Menus[]>([]);
  const avitveApp = ref<Required<AppResponse>>();
  const router = useRouter();
  const active = ref(WorkBenchTabEnum.APP);
  const isLoading = ref(false);

  function onClickLeft() {
    router.back();
  }

  getShortcutMenuList().then((res = []) => {
    const data = res.map((i) => ({
      appId: i.appId,
      menuId: i.menuId,
      type: i.type,
      name: i.menuName,
      invalid: i.invalid,
      logoType: LogoTypeEnum.Icon,
      logo: i.logo,
      color: i.color,
    }));
    checkedMenus.value = data
      .filter((i) => i.type === 'APP' && i.invalid === 1)
      .map((i) => ({
        ...i,
        children: data.filter((m) => m.type === 'MENU' && m.appId === i.appId && m.invalid === 1),
      })) as any;
  });
  async function onClickRight() {
    if (isLoading.value) return;

    let queen: AppMueus[] = [];
    queen = queen.concat(cloneDeep(checkedMenus.value));
    const saveData: ShortcutMenuRequest[] = [];
    let sortNum = 0;
    while (queen.length) {
      let first = queen.shift();
      let { appId, menuId, type, children = [] } = first!;
      saveData.push({ appId, menuId, type, sortNum, terminalType });
      sortNum++;
      children.reverse().forEach((i) => {
        queen.unshift(i);
      });
    }

    isLoading.value = true;

    postShortcutMenuSaveBatch(saveData)
      .then(() => {
        showToast('操作成功');
        router.back();
      })
      .finally(() => {
        isLoading.value = false;
      });
  }
  function changeApp(value: Required<AppResponse>) {
    avitveApp.value = value;
  }

  async function reloadMenus(name: WorkBenchTabEnum) {
    if (!avitveApp.value) return false;
    if (name === WorkBenchTabEnum.MENU) {
      const data: any = await getShortcutMenuListAPpMenu({
        appId: avitveApp.value.id,
        terminalType,
      });
      appMueuOptions.value = list_to_tree(
        data.filter((i) => !i.sysBuiltin).map((i) => ({ ...i, logoType: LogoTypeEnum.Icon })),
      );
    }

    return true;
  }
</script>
<style scoped lang="less">
  :deep(.van-tabs__wrap) {
    border-bottom: 1px solid #eaeaeaff;
  }

  :deep(.menubox) {
    border-radius: 6px;
    box-shadow: 0 0 4px 0 rgb(0 0 0 / 16%);
  }
</style>
