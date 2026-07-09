<template>
  <Layout :class="computedLayoutClass">
    <platform-header class="flex-none" />
    <Layout>
      <LayoutSider
        :theme="themeSetting.darkMode"
        :width="renderHorizontalMixSider ? 232 : themeSetting.menuWidth"
        :collapsible="themeSetting.menuCollapsible"
        :collapsed="menuCollapsed"
        :collapsedWidth="renderHorizontalMixSider ? 56 : menuCollapsedWidth"
        :trigger="null"
      >
        <div class="h-full w-full relative z-99 bg-[#F2F5F8] layout-sider-border">
          <platform-menu-horizontal-mix-sider v-if="renderHorizontalMixSider" />
          <platform-menu-mix-sider v-else-if="renderMixsider" />
          <platform-menu-classic v-else />
          <platform-menu-trigger v-if="themeSetting.menuCollapsible" />
        </div>
      </LayoutSider>
      <Layout :class="`${prefixCls}-main`">
        <page-tabs v-if="renaderPageTabs" />
        <breadcrumb v-if="renderBreadcrumb" :show-icon="renderBreadcrumbIcon" />
        <LayoutContent />
        <LayoutFooter />
      </Layout>
    </Layout>
  </Layout>
</template>

<script lang="ts">
  import { defineComponent, computed, provide } from 'vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

  import { Layout } from 'ant-design-vue';
  import LayoutContent from '../default/content/index.vue';

  import PlatformHeader from './platform-header.vue';
  import PlatformMenuClassic from './platform-menu-classic.vue';
  import PlatformMenuMixSider from './platform-menu-mix-sider.vue';
  import PlatformMenuHorizontalMixSider from './platform-menu-horizontal-mix-sider.vue';
  import PlatformMenuTrigger from './platform-menu-trigger.vue';

  import Breadcrumb from '/@/layouts/default/header/components/Breadcrumb.vue';
  import PageTabs from '/@/layouts/default/tabs/index.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { ProjectName } from '/@/enums/appEnum';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    name: 'DefaultLayout',
    components: {
      Layout,
      LayoutSider: Layout.Sider,
      LayoutContent,
      LayoutFooter: createAsyncComponent(() => import('/@/layouts/default/footer/index.vue')),
      PlatformHeader,
      PlatformMenuTrigger,
      PlatformMenuClassic,
      PlatformMenuMixSider,
      PlatformMenuHorizontalMixSider,
      Breadcrumb,
      PageTabs,
    },
    setup() {
      const { prefixCls } = useDesign('default-layout');

      const { getCurrentProject } = usePermissionStoreWithOut();

      const { menuCollapsed, toggleMenuCollapsed, menuCollapsedWidth, themeSetting } =
        useThemeSetting();

      const { currentRoute } = useRouter();

      const renderMixsider = computed(() => {
        return (
          ProjectName.WEB_RENDER === getCurrentProject && themeSetting.menuMode === 'mix-sider'
        );
      });

      const renderHorizontalMixSider = computed(() => {
        return (
          ProjectName.WEB_RENDER === getCurrentProject &&
          themeSetting.menuMode === 'horizontal-mix-sider'
        );
      });

      const renderRunning = getCurrentProject === ProjectName.WEB_RENDER;

      provide('isHorizontal', renderHorizontalMixSider);

      const renderBreadcrumb = computed(() => {
        return (themeSetting.showBreadcrumb && currentRoute.value.name !== 'Dashboard') ?? false;
      });

      const renderBreadcrumbIcon = computed(() => {
        return themeSetting.showBreadcrumbIcon ?? false;
      });

      const renaderPageTabs = computed(() => {
        return themeSetting.showTabs ?? false;
      });

      const computedLayoutClass = computed(() => {
        const classList = [prefixCls];
        if (renderRunning) {
          classList.push('running-layout');
        }
        if (renderHorizontalMixSider.value) {
          classList.push('horizontal-mix-sider-layout');
        }
        return classList;
      });

      return {
        prefixCls,
        themeSetting,

        menuCollapsed,
        toggleMenuCollapsed,
        menuCollapsedWidth,

        renderHorizontalMixSider,
        renderMixsider,
        renderBreadcrumb,
        renderBreadcrumbIcon,
        renaderPageTabs,
        computedLayoutClass,
      };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-default-layout';

  .@{prefix-cls} {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 100%;
    background-color: @content-bg;

    > .ant-layout {
      flex: 1;
    }

    &-main {
      width: 100%;
      margin-left: 1px;
    }
  }

  .layout-sider-border {
    border-right: 1px solid #e0e3ea;
  }

  @import url('./style/sider-running-layout.less');
</style>
