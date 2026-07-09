<template>
  <basic-page use-bg-color>
    <a-tabs :class="['--tl-space', prefixCls]" v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="WEB配置">
        <basicSettingWeb />
      </a-tab-pane>
      <a-tab-pane key="2" tab="MOBILE配置" force-render v-if="appInfoStore.appInfo.mobileEnabled">
        <basicSettingMobile />
      </a-tab-pane>
    </a-tabs>
  </basic-page>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import basicSettingWeb from './modules/basic-setting-web.vue';
  import basicSettingMobile from './modules/basic-setting-mobile.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();

  const activeKey = ref('1');

  const { prefixCls } = useDesign('app-setting-tabs-wrap');
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-app-setting-tabs-wrap';
  .@{prefix-cls} {
    height: 100%;
    .ant-tabs-nav {
      margin-bottom: 0;
    }
    .ant-tabs-content {
      height: 100%;

      .ant-spin-nested-loading {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex: auto;
        flex-grow: 1;
        // height: 0;
        flex-direction: column;
        .ant-spin-container {
          width: 100%;
          height: 100%;
          overflow: auto;
        }
      }
    }
  }
</style>
