<template>
  <div class="pl16px pr16px pb40px pt10px">
    <div v-for="(app, index) in menuOptions" :key="index" class="mb5px">
      <div class="font-bold text-16px mt10px mb10px">{{ app.name }}</div>
      <div style="display: flex; flex-wrap: wrap">
        <appItem
          :opeType="menuIds.indexOf(i.id) === -1 ? 'add' : ''"
          v-for="i in app.children"
          :key="i.id"
          :app="{
            ...i,
            color: '#FFFFFF',
            bgColor: i.color,
          }"
          @add="
            addMenu({
              ...i,
            })
          "
        />
      </div>
    </div>
    <van-empty description="暂无菜单可添加" v-show="!menuOptions.length" />
  </div>
</template>

<script setup lang="ts">
  import appItem from '@mobile/components/appItem/index.vue';
  import type { Menus, AppMueus } from '@mobile/components/appItem/type';
  import type { AppResponse } from '@mobile/apis/gct-platform/model';

  const props = defineProps<{
    menuOptions: Menus[];
    checkedMenus: AppMueus[];
    avitveApp: Required<AppResponse>;
  }>();
  const checkedMenus = computed(() => props.checkedMenus);
  function addMenu(menu: Menus) {
    let menuId = menu.id!;
    let { id: appId, name: appName } = props.avitveApp;
    const appItem = checkedMenus.value.find((i) => i.appId === appId);
    const menuItem: AppMueus = {
      appId,
      menuId,
      name: menu.name,
      type: 'MENU',
      logo: menu.logo,
      logoType: menu.logoType,
      color: menu.color,
      bgColor: menu.bgColor,
    };
    if (appItem) {
      appItem.children!.push(menuItem);
    } else {
      checkedMenus.value.push({ appId, name: appName, type: 'APP', children: [menuItem] });
    }
  }
  const menuIds = computed(() =>
    checkedMenus.value.flatMap((i) => i.children?.map((j) => j.menuId)),
  );
</script>
<style scoped lang="less"></style>
