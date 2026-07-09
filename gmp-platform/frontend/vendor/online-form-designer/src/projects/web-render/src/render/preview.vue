<template>
  <div class="h100% p1px web-render-main" :class="isInIframe() ? 'events-none' : 'overflow-auto'">
    <pageRender
      :widgetlist="pageData.widgets"
      :css="pageData.css"
      :js="pageData.runJs"
      :pageEvents="pageData.pageEvents"
      :pageStyle="pageData.pageStyle"
      :globalEvents="pageData.globalEvents"
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
  const getPreviewAPi =
    route.name === 'PagePreview'
      ? Globals.initPageByid.bind(Globals)
      : Globals.initHistoryByid.bind(Globals);
  getRunPages();

  async function getRunPages() {
    const linkPage = route.params.linkPage as string;
    if (linkPage) {
      const { data, name } = await getPreviewAPi(linkPage);
      await PluginPgkUtil.loadWebPlugin(data.plugins);
      pageData.value = data;
      document.title = name;
    }
  }

  /**
   * 判断页面是否在iframe中
   */
  function isInIframe() {
    return window.top !== window.self && route.query.designPreview !== 'true';
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

  .events-none {
    pointer-events: none;
    user-select: none;
  }
</style>
