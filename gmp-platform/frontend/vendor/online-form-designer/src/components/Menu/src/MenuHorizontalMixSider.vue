<template>
  <div :class="[prefixCls]">
    <div :class="`${prefixCls}__left`">
      <li
        :class="[
          `${prefixCls}__title-1`,
          'search-item',
          {
            selected: mixsiderSelected.includes('search'),
          },
        ]"
        @click="clickSearchIcon"
      >
        <div style="display: flex; height: 28px">
          <SearchOutlined class="menu-icon" :style="{ fontSize: '18px' }" />
        </div>
      </li>
      <ScrollContainer>
        <ul>
          <li
            :class="[
              `${prefixCls}__title-1`,
              {
                selected: mixsiderSelected.includes(menu.path),
              },
            ]"
            v-for="menu in computedMenus"
            :key="menu.path"
            @click="handleClick(menu)"
          >
            <a-popover
              v-if="menuCollapsed"
              class="menu-menuCollapsed"
              placement="rightTop"
              overlay-class-name="menu-popup-overlay menu-classic"
            >
              <template #content>
                <div class="flex items-center h-16px pl-10px pr-10px primary-gct font-500">{{
                  t(menu.name)
                }}</div>
                <template v-if="menu.children && menu.children.length > 0">
                  <div class="h-1px bg-[#E0E3EA] mt-8px mb-8px"></div>
                  <menu-popover :items="menu.children" :level="1" />
                </template>
              </template>
              <MenuIcon :data="menu" class="menu-icon" />
              <div
                :title="t(menu.name)"
                class="important-block text-center menu-name h-16px pl-10px pr-10px mt4px ell"
              >
                {{ t(menu.name) }}
              </div>
            </a-popover>
            <template v-else>
              <MenuIcon :data="menu" class="menu-icon" />
              <div
                :title="t(menu.name)"
                class="important-block text-center menu-name h-16px pl-10px pr-10px mt4px ell"
              >
                {{ t(menu.name) }}
              </div>
            </template>
          </li>
        </ul>
      </ScrollContainer>
    </div>

    <div
      :class="[
        `${prefixCls}__right`,
        'menu-classic',
        {
          'menu-collapsed': menuCollapsed,
        },
      ]"
    >
      <div v-if="isSearchable" style="margin-right: 10px" class="my16px">
        <a-input
          v-if="!menuCollapsed && mixsiderSelected?.includes('search')"
          ref="searchBox"
          v-model:value="searchVal"
          :placeholder="t('sys.searchMenu')"
          @change="filterMenu"
        >
          <template #prefix>
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </a-input>
      </div>
      <ScrollContainer>
        <menu-render :items="filterMenuList" :level="1" :searchVal="searchVal" />
      </ScrollContainer>
    </div>
  </div>
</template>

<script setup lang="ts" name="menu-default">
  import { provide, computed, ref, onMounted, watch, nextTick } from 'vue';
  import MenuRender from './components/MenuRender.vue';
  import MenuIcon from './components/MenuIcon.vue';
  import MenuPopover from './components/MenuPopover.vue';
  import { useRouter } from 'vue-router';
  import { useMenu } from './useMenu';
  import { getAllParentPath } from '/@/router/helper/menuHelper';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { ScrollContainer } from '/@/components/Container';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { match } from 'pinyin-pro';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const props = defineProps<{
    items: any[];
  }>();

  const prefixCls = 'menu-horizontal-mix-sider';

  const { appInfo } = useAppInfoStore();

  const computedMenus = computed(() => {
    const list = cloneDeep(props.items);
    return appInfo?.suiteKey
      ? list
      : list.map((n) => {
          n.children = n.children.filter((item) => !['eDHR'].includes(item.name));
          return n;
        });
  });

  const emit = defineEmits(['menuClick']);

  const { t } = useI18n();
  const { currentRoute } = useRouter();
  const {
    setSelectedKeys,
    setOpenKeys,
    selectedKeys,
    openKeys,
    mixsiderSelected,
    setMixsiderSelected,
    addOpenKey,
  } = useMenu();
  const { menuCollapsed, toggleMenuCollapsed, themeSetting } = useThemeSetting();

  const rightMenus = ref<any[]>([]);
  const searchBox = ref(null);
  const filterMenuList = ref<any[]>([]);
  const searchVal = ref<string>('');

  const currentActiveMenu = computed(() => {
    return currentRoute.value.meta.currentActiveMenu ?? currentRoute.value.path;
  });

  watch(currentActiveMenu, (value) => {
    const mixSiderSelected = getAllParentPath(props.items, value)[0];
    const menu = props.items.find((n) => n.path === mixSiderSelected);
    handleClick(menu);
    setSelectedKeys([value]);
  });

  watch(
    () => props.items,
    (value) => {
      if (!value || value.length === 0) return;
      setSelectedKeys([currentActiveMenu.value]);
      console.log(props.items);
      const keys = getAllParentPath(props.items, currentActiveMenu.value);
      setOpenKeys(keys);
      const mixSiderSelected = keys[0];
      setMixsiderSelected([mixSiderSelected]);
      const menu = props.items.find((m) => m.path === mixSiderSelected);
      rightMenus.value = menu?.children ?? [];
      filterMenuList.value = cloneDeep(rightMenus.value);
      console.log('filterMenuList', filterMenuList);
    },
    {
      immediate: true,
    },
  );

  const handleMenuClick = (menu: any) => {
    emit('menuClick', menu);
  };
  provide('handleMenuClick', handleMenuClick);

  const handleClick = (menu) => {
    if (menu) {
      setMixsiderSelected([menu.path]);
      searchVal.value = '';
      rightMenus.value = menu.children ?? [];
      filterMenuList.value = cloneDeep(rightMenus.value);
    }
    console.log(menu, 'menu');
  };

  const filterMenu = () => {
    let allMenuList = mixsiderSelected?.value?.includes('search')
      ? cloneDeep(props.items)
      : cloneDeep(rightMenus.value);
    if (searchVal.value) {
      let list = [];
      for (let menu of allMenuList) {
        const title = t(menu.name) || t(menu.title) || '';
        const isMatch = title.includes(searchVal.value) || match(title, searchVal.value);
        if (isMatch) {
          list.push(menu);
          // 搜索时，即使菜单收起也允许展开
          addOpenKey(getAllParentPath(rightMenus.value, menu.path));
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
      if (mixsiderSelected?.value?.includes('search')) {
        filterMenuList.value = [];
      } else {
        filterMenuList.value = allMenuList;
        // 清除搜索时，只在菜单未收起时恢复展开状态
        if (!menuCollapsed.value) {
          setOpenKeys(getAllParentPath(rightMenus, currentActiveMenu.value));
        }
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
  const clickSearchIcon = async () => {
    setMixsiderSelected(['search']);
    filterMenuList.value = [];
    searchVal.value = '';

    if (menuCollapsed.value) {
      toggleMenuCollapsed();
      await nextTick();
    }
    searchBox?.value?.$el?.querySelector('input')?.focus();
  };
</script>

<style lang="less">
  @import url('./menu-horizontal-mix-sider.less');
</style>
<style lang="less" scoped>
  .menu-mix-sider__right {
    padding: 0;
    .menu-ul {
      padding: 16px 8px;
    }
  }
</style>
