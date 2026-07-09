<template>
  <basic-page>
    <div class="p-16px h-100%">
      <a-tabs :class="['--tl-space', prefixCls]" v-model:activeKey="activeKey">
        <a-tab-pane key="1" :tab="t('sys.appDesigner.menuTab', { tab: 'Web' })">
          <menuSettingWeb />
        </a-tab-pane>
        <a-tab-pane
          key="2"
          :tab="t('sys.appDesigner.menuTab', { tab: 'PDA' })"
          force-render
          v-if="appInfoStore.appInfo.mobileEnabled"
        >
          <menu-setting-mobile v-if="activeKey === '2'" />
        </a-tab-pane>
        <a-tab-pane
          key="3"
          :tab="t('sys.appDesigner.menuTab', { tab: 'Pad' })"
          force-render
          v-if="appInfoStore.appInfo.mobileEnabled"
        >
          <menu-setting-mobile v-if="activeKey === '3'" menuType="PAD" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import menuSettingWeb from './modules/menu-setting-web.vue';
  import MenuSettingMobile from './modules/menu-setting-mobile.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();

  const activeKey = ref('1');
  const { t } = useI18n();
  const { prefixCls } = useDesign('menu-setting-tabs-wrap');
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-menu-setting-tabs-wrap';

  .@{prefix-cls} {
    height: 100%;

    .ant-tabs-nav {
      margin-bottom: 0;
    }

    .ant-tabs-content {
      height: 100%;

      .ant-spin-nested-loading {
        display: flex;
        position: relative;
        flex: auto;
        // height: 0;
        flex-direction: column;
        flex-grow: 1;
        width: 100%;
        height: 100%;

        .ant-spin-container {
          width: 100%;
          height: 100%;
          overflow: auto;
        }
      }

      .ant-table-wrapper {
        height: 100%;

        .ant-table {
          height: 100%;

          .ant-table-container {
            height: 100%;
            overflow: hidden;
          }
        }
      }
    }
  }
</style>
<style lang="less" scoped>
  :deep(.ant-tabs.--tl-space .ant-tabs-nav) {
    padding-left: 0;
  }

  :deep(.ant-tabs-tab) {
    padding: 12px 16px;
  }

  :deep(.ant-tabs-tab + .ant-tabs-tab) {
    margin-left: 24px;
  }
</style>
