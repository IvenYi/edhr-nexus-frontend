<template>
  <basic-page>
    <a-tabs v-model:activeKey="activeKey" animated>
      <a-tab-pane :key="NavTabEnum.NAV_MENU" :tab="t('sys.menu.customNavMenu')">
        <CustomNavMenuView ref="CustomNavMenuViewRef" />
      </a-tab-pane>
      <a-tab-pane :key="NavTabEnum.NAV_PAGE" :tab="t('sys.menu.customNavPage')">
        <CustomNavPageView ref="CustomNavPageViewRef" />
      </a-tab-pane>
    </a-tabs>
  </basic-page>
</template>

<script setup lang="ts" name="mobile-desinger">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CustomNavMenuView from './components/custom-nav-menu-view/custom-nav-menu-view';
  import CustomNavPageView from './components/custom-nav-page-view/custom-nav-page-view';

  enum NavTabEnum {
    NAV_MENU = 'NAV_MENU',
    NAV_PAGE = 'NAV_PAGE',
  }

  const { t } = useI18n();
  const activeKey = ref('NAV_MENU');
  const CustomNavMenuViewRef = ref();
  const CustomNavPageViewRef = ref();
</script>
<style lang="less" scoped>
  :deep(.ant-tabs) {
    height: 100%;
    .ant-tabs-nav {
      margin-bottom: 0;
      .ant-tabs-tab:first-child {
        margin-left: 20px;
      }
    }
    .ant-tabs-content {
      height: 100%;
      .ant-tabs-tabpane {
        padding: 0 16px;
      }
    }
  }
</style>
