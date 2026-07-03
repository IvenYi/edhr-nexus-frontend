<template>
  <div
    class="menu-classic pt-16px pb-16px pl-8px pr-8px"
    :class="{
      'menu-classic--collapsed': menuCollapsed,
    }"
  >
    <div v-if="isSearchable">
      <div v-if="!menuCollapsed" class="pr10px">
        <a-input
          ref="searchBox"
          class="mb-16px mr-10px"
          v-model:value="searchVal"
          :placeholder="t('sys.searchMenu')"
          @change="filterMenu"
        >
          <template #prefix>
            <!-- <SearchOutlined /> -->
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </a-input>
      </div>
      <div v-else-if="menuCollapsed" class="menu-title" @click="clickSearchIcon">
        <SearchOutlined :style="{ fontSize: '16px' }" />
      </div>
    </div>

    <menu-render :items="filterMenuList" :level="1" :searchVal="searchVal" />
  </div>
</template>

<script setup lang="ts" name="menu-classic">
  import { provide, computed, watch, ref, nextTick, onMounted } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import MenuRender from './components/MenuRender.vue';
  import { useRouter } from 'vue-router';
  import { useMenu } from './useMenu';
  import { getAllParentPath } from '/@/router/helper/menuHelper';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { match } from 'pinyin-pro';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { t } = useI18n();
  const { appInfo } = useAppInfoStore();

  const props = defineProps<{
    items: any[];
  }>();

  const emit = defineEmits(['menuClick']);

  const { currentRoute } = useRouter();
  const { setSelectedKeys, setOpenKeys, addOpenKey } = useMenu();
  const { menuCollapsed, toggleMenuCollapsed, themeSetting } = useThemeSetting();

  const searchBox = ref(null);
  const filterMenuList = ref<any>([]);
  const searchVal = ref<string>('');

  onMounted(() => {
    const list = cloneDeep(props.items);
    let menuList: any[] = [];
    menuList = appInfo?.suiteKey
      ? list
      : list.map((n) => {
          n.children = n.children.filter((item) => !['eDHR'].includes(item.name));
          return n;
        });

    filterMenuList.value = menuList;
  });
  const filterMenu = () => {
    let allMenuList = cloneDeep(props.items);
    if (searchVal.value) {
      let list = [];
      for (let menu of allMenuList) {
        const title = t(menu.name) || t(menu.title) || '';
        const isMatch = title.includes(searchVal.value) || match(title, searchVal.value);
        if (isMatch) {
          list.push(menu);
          // 搜索时，即使菜单收起也允许展开
          addOpenKey(getAllParentPath(props.items, menu.path));
        } else {
          if (menu?.children?.length) {
            const subMenu = recursiveMenu(menu);
            const _menu = cloneDeep(menu);
            _menu.children = subMenu;
            if (subMenu.length) {
              list.push(_menu);
            }
          }
        }
      }
      filterMenuList.value = list;
    } else {
      filterMenuList.value = allMenuList;
      // 清除搜索时，只在菜单未收起时恢复展开状态
      if (!menuCollapsed.value) {
        setOpenKeys(getAllParentPath(props.items, currentActiveMenu.value));
      }
    }
  };

  const recursiveMenu = (menuList) => {
    let list = [];
    for (let menu of menuList.children) {
      const title = t(menu.name) || t(menu.title) || '';
      const isMatch = title.includes(searchVal.value) || match(title, searchVal.value);
      if (isMatch) {
        list.push(menu);
        addOpenKey(getAllParentPath(props.items, menu.path));
      } else {
        if (menu?.children?.length) {
          const subMenu = recursiveMenu(menu);
          const _menu = cloneDeep(menu);
          _menu.children = subMenu;
          if (subMenu.length) {
            list.push(_menu);
          }
        }
      }
    }
    return list;
  };

  const isSearchable = computed(() => themeSetting.menuSearchable);
  watch(isSearchable, (value) => {
    if (!value) {
      filterMenuList.value = cloneDeep(props.items);
      searchVal.value = '';
      // 关闭搜索功能时，只在菜单未收起时恢复展开状态
      if (!menuCollapsed.value) {
        setOpenKeys(getAllParentPath(props.items, currentActiveMenu.value));
      }
    }
  });

  // const currentActiveMenu = currentRoute.value.meta.currentActiveMenu ?? currentRoute.value.path;
  const currentActiveMenu = computed(() => {
    return currentRoute.value.meta.currentActiveMenu ?? currentRoute.value.path;
  });

  setSelectedKeys([currentActiveMenu.value]);
  setOpenKeys(getAllParentPath(props.items, currentActiveMenu.value));

  let triggerFromClick = false;
  watch(currentActiveMenu, (value) => {
    setSelectedKeys([value]);
    if (triggerFromClick) {
      triggerFromClick = false;
      return;
    }
    // 当菜单收起时，不要展开菜单
    if (!menuCollapsed.value) {
      addOpenKey(getAllParentPath(props.items, value));
    }
  });

  const handleMenuClick = (menu: any) => {
    triggerFromClick = true;
    emit('menuClick', menu);
  };
  provide('handleMenuClick', handleMenuClick);

  const clickSearchIcon = async () => {
    toggleMenuCollapsed();
    await nextTick();
    searchBox?.value?.$el?.querySelector('input')?.focus();
  };
</script>

<style lang="less">
  @import url('./menu-classic.less');
</style>
