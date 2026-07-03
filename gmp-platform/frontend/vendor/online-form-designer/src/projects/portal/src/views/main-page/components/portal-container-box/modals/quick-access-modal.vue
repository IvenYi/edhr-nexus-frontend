<template>
  <basic-modal
    @register="register"
    :height="500"
    :title="$t('sys.portal.addQuickAccess')"
    centered
    width="740px"
    :maskClosable="false"
    @ok="handleOk"
  >
    <div class="ks-row main">
      <div class="shrink-0 w-1/3 dept baseborder border-0 border-r ks-row flex-col">
        <div class="h40px pl5px leading-10 font-bold baseborder border-0 border-b border-r"
          >{{ $t('sys.portal.appList') }}</div
        >
        <div class="ks-col overflow-x-auto pt10px">
          <div v-for="i in applist" :key="i.id" class="approws mb8px" @click="changeApp(i)">
            <a-radio :checked="avitveApp?.id === i.id"> {{ i.name }}</a-radio>
          </div>
        </div>
      </div>
      <div class="shrink-0 ks-row w-1/3 flex-col">
        <div class="baseborder border-0 border-b h40px pl5px leading-10 font-bold">{{ $t('sys.portal.toAddMenu') }}</div>
        <div class="overflow-x-auto ks-col ml10px mr10px pt10px">
          <div v-for="(app, index) in menutreeData" :key="index" class="mb10px">
            <div class="mb5px">
              <!-- <a-checkbox :value="app.id"  @change="(e) => hanlerParent(e, app)">{{
                app.name
              }}</a-checkbox> -->
              <span class="c9b"> {{ app.name }}</span>
            </div>
            <div v-for="i in app.children" :key="i.id" class="pl20px">
              <a-checkbox :checked="getMenuStatu(i.id)" @change="(e) => hanlerMenu(e, i)">{{
                i.name
              }}</a-checkbox>
            </div>
          </div>
        </div>
      </div>
      <div class="shrink-0 baseborder border-0 border-l ks-row w-1/3 flex-col">
        <div class="font-bold baseborder border-0 border-b border-l h40p pl5px leading-10"
          >{{ $t('sys.portal.menuAdded') }}</div
        >
        <div class="overflow-x-auto ks-col pt5px ml10px mr10px">
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" v-show="!checkedMenus.length" />
          <draggable :list="checkedMenus" :animation="300" handle=".app_mover" item-key="appId">
            <template #item="{ element, index }">
              <div class="mb10px">
                <div class="c9b ks-row-middle">
                  <span class="iconfont icon-drag cursor-pointer app_mover mr5px"></span>
                  <div class="ks-col"> {{ element.name }}</div>
                </div>
                <draggable
                  :list="element.children"
                  :animation="300"
                  handle=".menu_mover"
                  item-key="menuId"
                >
                  <template #item="{ element: menu, index: menuIndex }">
                    <div class="pl10px ks-row-middle">
                      <div class="ks-col ml5px">{{ menu.name }} </div>
                      <a-button
                        type="link"
                        danger
                        size="small"
                        class="lh1"
                        @click="deleteMunu(element, menuIndex, index)"
                      >
                        <span class="iconfont icon-shanchu"></span
                      ></a-button>
                      <drag-outlined class="cursor-pointer menu_mover" />
                    </div>
                  </template>
                </draggable>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModal } from '/@/components/Modal';
  import { reactive, ref, nextTick, toRaw } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Empty } from 'ant-design-vue';
  import { getAppPageGetListReleasedApp } from '/@/apis/gct-platform/AppController';
  import { AppResponse } from '/@/apis/gct-platform/model';
  import {
    getShortcutMenuListAPpMenu,
    postShortcutMenuSaveBatch,
  } from '/@/apis/gct-platform/ShortcutMenuController';
  import { list_to_tree } from '/@/utils/helper/treeHelper';
  import draggable from 'vuedraggable';
  import { ShortcutMenuRequest } from '/@/apis/gct-platform/model/index';
  import { Menus, AppMueus } from './type';
  import { cloneDeep } from 'lodash-es';

  const emit = defineEmits(['ok']);
  const { t } = useI18n();
  const [register, { openModal, closeModal }] = useModal();
  const applist = ref<Required<AppResponse>[]>([]);
  const menutreeData = ref<Menus[]>([]);
  const checkedMenus = ref<AppMueus[]>([]);
  const avitveApp = ref<Required<AppResponse>>();
  async function getApp() {
    applist.value = (await getAppPageGetListReleasedApp()) as any;
    avitveApp.value = applist.value[0];
  }
  function changeApp(app) {
    avitveApp.value = app;
    menutreeData.value = [];
    getMenusByApp();
  }
  async function getMenusByApp() {
    if (!avitveApp.value) return;
    await nextTick();
    const menus: any =
      (await getShortcutMenuListAPpMenu({ appId: avitveApp.value.id, terminalType: 'WEB' })) || [];
    menutreeData.value = list_to_tree(menus);
  }
  const handleOpen = async (quicklist: AppMueus[]) => {
    checkedMenus.value = quicklist;
    await getApp();
    await getMenusByApp();
    openModal();
  };
  const handleOk = async () => {
    let queen: AppMueus[] = [];
    queen = queen.concat(cloneDeep(checkedMenus.value));
    const saveData: ShortcutMenuRequest[] = [];
    let sortNum = 0;
    while (queen.length) {
      let first = queen.shift();
      let { appId, menuId, type, children = [] } = first!;
      saveData.push({ appId, menuId, type, sortNum, terminalType: 'WEB' });
      sortNum++;
      children.reverse().forEach((i) => {
        queen.unshift(i);
      });
    }
    await postShortcutMenuSaveBatch(saveData);
    closeModal();
    emit('ok');
  };
  function hanlerParent(e, app) {
    console.log(e.target.checked, app);
  }
  function hanlerMenu(e, menu) {
    if (e.target.checked) {
      addMenu(menu);
    } else {
      removeMunu(menu);
    }
  }
  function deleteMunu(element: Menus, index: number, appIndex: number) {
    element.children?.splice(index, 1);
    if (!element.children?.length) {
      checkedMenus.value.splice(appIndex, 1);
    }
  }
  function addMenu(menu: Menus) {
    let menuId = menu.id;
    let { id: appId, name: appName } = avitveApp.value!;
    const appItem = checkedMenus.value.find((i) => i.appId === appId);
    const menuItem: AppMueus = { appId, menuId, name: menu.name, type: 'MENU' };
    if (appItem) {
      appItem.children!.push(menuItem);
    } else {
      checkedMenus.value.push({ appId, name: appName, type: 'APP', children: [menuItem] });
    }
  }
  function removeMunu(menu: Menus) {
    let menuId = menu.id;
    let { id: appId } = avitveApp.value!;
    const appIndex = checkedMenus.value.findIndex((i) => i.appId === appId);
    const appItem = checkedMenus.value[appIndex];
    const menuIndex = appItem!.children!.findIndex((i) => i.menuId === menuId);
    menuIndex > -1 && appItem?.children?.splice(menuIndex, 1);
    if (!appItem?.children?.length) {
      checkedMenus.value.splice(appIndex, 1);
    }
  }
  /**
   *获取选中状态
   */
  function getMenuStatu(menuId: string): boolean {
    let { id: appId } = avitveApp.value!;
    const appItem = checkedMenus.value.find((i) => i.appId === appId);
    return !!appItem?.children?.find((i) => i.menuId === menuId);
  }
  defineExpose({ handleOpen });

  // APP MENU
</script>

<style scoped lang="less">
  .lh1 {
    line-height: 1;
  }

  .main {
    height: 100%;
    border: 1px solid #eaeaea;
  }

  .baseborder {
    border-style: solid;
    border-color: #eaeaea;
  }

  .approws {
    padding: 10px 8px;
    // height: 32px;
    background-color: #f7f8fa;
    line-height: 1;

    &:hover {
      background-color: #ececec;
    }
  }

  .c9b {
    color: #9b9b9b;
  }
</style>
./type
