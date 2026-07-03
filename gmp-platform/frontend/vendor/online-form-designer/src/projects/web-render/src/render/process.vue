<template>
  <div class="h100% p1px overflow-auto web-render-main">
    <pageRender
      :widgetlist="pageData.widgets"
      :css="pageData.css"
      :js="pageData.runJs"
      :pageEvents="pageData.pageEvents"
      :pageStyle="pageData.pageStyle"
      :globalEvents="pageData.globalEvents"
      :pageCallback="runProcess"
      :pageLayoutMode="pageData!.pageLayoutMode"
      v-if="!!pageData && pageData.widgets.length"
    />
    <template v-else>
      <PreviewEmpty />
    </template>
  </div>
</template>

<script setup lang="ts" name="app1">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import pageRender from './page-render.vue';
  import { RuntimePageJson } from '/@page-designer/types/designer';
  import Globals from './Event/utils/runGlobalByPage';
  import PreviewEmpty from '/@/components/Preview/src/preview-empty.vue';
  import { PluginPgkUtil } from '@gct-paas/core';

  const route = useRoute();
  const pageData = ref<RuntimePageJson>();

  getRunPages();

  async function getRunPages() {
    const linkPage = route.params.linkPage as string;
    if (linkPage) {
      const { data, name } = await Globals.initPageByid(linkPage);
      //初始化权限
      Globals.initPermission(data.permissions);
      pageData.value = data;
      await PluginPgkUtil.loadWebPlugin(data.plugins);
      document.title = name!;
    }
  }

  /**流程信息初始化 */
  async function runProcess(Event) {
    const { taskId, processInstanceId, state } = route.query || {};
    await Event.runProcessBySaskId({ taskId, processInstanceId, examineAndApproveState: state });
  }
</script>
<style scoped lang="less">
  :deep(.ant-form-item) {
    .ant-input-affix-wrapper:not([class*='-disabled']),
    .ant-input:not([class*='-disabled']),
    .ant-input-number:not([class*='-disabled']),
    .ant-input-number-handler-wrap:not([class*='-disabled']),
    .ant-picker:not([class*='-disabled']),
    .ant-select:not(.ant-select-customize-input):not([class*='-disabled'])
      .ant-select-selector:not([class*='-disabled']),
    .ant-tree:not([class*='-disabled']) {
      background-color: transparent;
    }
  }

  .web-render-main {
    display: flex;
    flex-direction: column;
    background-color: #f0f2f5;
  }
</style>
