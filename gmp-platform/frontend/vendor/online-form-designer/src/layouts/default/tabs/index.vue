<template>
  <div :class="getWrapClass">
    <Tabs
      type="editable-card"
      size="small"
      :animated="false"
      :hideAdd="true"
      :tabBarGutter="3"
      :activeKey="activeKeyRef"
      @change="handleChange"
      @edit="handleEdit"
      :class="isAppRun ? 'font-menu' : ''"
    >
      <template v-for="item in getTabsState" :key="getTabKey(item)">
        <TabPane :closable="getTabsState && getTabsState.length > 1 && item.name !== 'Dashboard'">
          <template #tab>
            <a-tooltip placement="bottom" v-if="item.name === 'Dashboard'">
              <template #title>
                {{ item.meta.title }}
              </template>
              <div class="pl6px">
                <img
                  :src="dashboardIcon"
                  v-if="activeKeyRef !== (item.query ? item.fullPath : item.path)"
                />
                <img
                  :src="dashboardIconSelect"
                  v-else-if="
                    activeKeyRef === (item.query ? item.fullPath : item.path) &&
                    themeSetting.themeColor === '#026AC8'
                  "
                />
                <img
                  :src="dashboardIconSelectGreen"
                  v-if="
                    activeKeyRef === (item.query ? item.fullPath : item.path) &&
                    themeSetting.themeColor === '#0DAA9C'
                  "
                />
              </div>
            </a-tooltip>

            <TabContent v-else :tabItem="item" />
          </template>
        </TabPane>
      </template>

      <!-- <template #rightExtra v-if="getShowRedo || getShowQuick">
        <TabRedo v-if="getShowRedo" />
        <TabContent isExtra :tabItem="$route" v-if="getShowQuick" />
        <FoldButton v-if="getShowFold" />
      </template> -->
    </Tabs>
  </div>
</template>
<script lang="ts">
  import type { RouteLocationNormalized, RouteMeta } from 'vue-router';

  import { defineComponent, computed, unref, ref } from 'vue';

  import { Tabs } from 'ant-design-vue';
  import TabContent from './components/TabContent.vue';
  import FoldButton from './components/FoldButton.vue';
  import TabRedo from './components/TabRedo.vue';

  import { useGo } from '/@/hooks/web/usePage';

  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { useUserStore } from '/@/store/modules/user';

  import { initAffixTabs, useTabsDrag } from './useMultipleTabs';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMultipleTabSetting } from '/@/hooks/setting/useMultipleTabSetting';

  import { REDIRECT_NAME } from '/@/router/constant';
  import { listenerRouteChange } from '/@/logics/mitt/routeChange';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { useRouter } from 'vue-router';
  import dashboardIcon from '/@/assets/svg/pic_ybp.svg';
  import dashboardIconSelect from '/@/assets/svg/pic_ybp_selected.svg';
  import dashboardIconSelectGreen from '/@/assets/svg/pic_ybp_selected_green.svg';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

  export default defineComponent({
    name: 'MultipleTabs',
    components: {
      TabRedo,
      FoldButton,
      Tabs,
      TabPane: Tabs.TabPane,
      TabContent,
    },
    setup() {
      const { themeSetting } = useThemeSetting();

      const affixTextList = initAffixTabs();
      const activeKeyRef = ref('');
      const { isAppRun } = useEnv();
      useTabsDrag(affixTextList);
      const tabStore = useMultipleTabStore();
      // const dashboardTabStore = useDashboardTabWithOutStore();
      const userStore = useUserStore();
      const router = useRouter();

      const { prefixCls } = useDesign('multiple-tabs');
      const go = useGo();
      const { getShowQuick, getShowRedo, getShowFold } = useMultipleTabSetting();
      const { getCurrentProject } = usePermissionStoreWithOut();
      /** 初次初始化仪表盘 */
      if (getCurrentProject === ProjectName.WEB_RENDER) {
        tabStore.updateDashboard();
      }

      const getTabsState = computed(() => {
        return tabStore.getTabList.filter((item) => !item.meta?.hideTab);
      });
      // dashboardTabStore.getDashoard();
      // const getDashboardTabsState = computed(() => {
      //   console.log('dashboardTabStore.getDashboardTabList', dashboardTabStore.getDashboardTabList);
      //   return dashboardTabStore.getDashboardTabList;
      // });

      // console.log('getDashboardTabsState', getDashboardTabsState.value);

      const unClose = computed(() => unref(getTabsState).length === 1);

      const getWrapClass = computed(() => {
        return [
          prefixCls,
          {
            [`${prefixCls}--hide-close`]: unref(unClose),
          },
        ];
      });

      listenerRouteChange((route) => {
        const { name } = route;
        if (name === REDIRECT_NAME || !route || !userStore.getToken) {
          return;
        }

        const { meta = {} } = route;
        const { currentActiveMenu, hideTab } = meta as RouteMeta;
        const isHide = !hideTab ? null : currentActiveMenu;

        // 使用getTabKey获取一致的键值
        const p = isHide || getTabKey(route as unknown as RouteLocationNormalized);

        if (activeKeyRef.value !== p) {
          activeKeyRef.value = p as string;
        }
        if (isHide) {
          const findParentRoute = router
            .getRoutes()
            .find((item) => item.path === currentActiveMenu);

          findParentRoute && tabStore.addTab(findParentRoute as unknown as RouteLocationNormalized);
        } else {
          tabStore.addTab(unref(route));
        }
      });

      function handleChange(activeKey: any) {
        activeKeyRef.value = activeKey;
        go(activeKey, false);
      }

      // Close the current tab
      function handleEdit(targetKey: any, action: 'add' | 'remove') {
        if (action !== 'remove') return;
        console.log('targetKey', targetKey);
        // Added operation to hide, currently only use delete operation
        if (unref(unClose)) {
          return;
        }

        tabStore.closeTabByKey(targetKey, router);
      }

      // 获取标签的唯一键
      function getTabKey(item: RouteLocationNormalized) {
        // 检查路径是否在忽略查询参数变化的白名单中
        if (tabStore.ignoreQueryChangeList.includes(item.path)) {
          return item.path;
        }
        // 其他情况保持原有逻辑
        return item.query ? item.fullPath : item.path;
      }
      return {
        getWrapClass,
        handleEdit,
        handleChange,
        isAppRun,
        activeKeyRef,
        getTabsState,
        getShowQuick,
        getShowRedo,
        getShowFold,
        dashboardIcon,
        dashboardIconSelect,
        dashboardIconSelectGreen,
        themeSetting,
        getTabKey,
      };
    },
  });
</script>
<style lang="less">
  @import url('./index.less');
</style>
