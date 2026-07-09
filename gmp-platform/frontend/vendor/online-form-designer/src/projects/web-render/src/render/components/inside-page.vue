<template>
  <div class="h100% p1px overflow-auto web-render-main">
    <pageRender
      :widgetlist="pageData!.widgets"
      :css="pageData!.css"
      :js="pageData!.runJs"
      :pageStyle="pageData!.pageStyle"
      :pageEvents="pageData!.pageEvents"
      :globalEvents="pageData!.globalEvents"
      :pageLayoutMode="pageData!.pageLayoutMode"
      :pageCallback="pageCallback"
      :close="close ?? onClose"
      v-if="status === 'success'"
      ref="pageRenderRef"
    />

    <PreviewEmpty v-if="status === 'empty'" />
    <noFond v-if="status === 'error'" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import pageRender from '../page-render.vue';
  import { RuntimePageJson } from '/@page-designer/types/designer';
  import Globals from '../Event/utils/runGlobalByPage';
  import PreviewEmpty from '/@/components/Preview/src/preview-empty.vue';
  import noFond from '/@/views/sys/exception/Exception.vue';
  import { PluginPgkUtil } from '@gct-paas/core';

  type pageStatus = 'reday' | 'success' | 'empty' | 'error';
  const pageData = ref<RuntimePageJson>();
  const status = ref<pageStatus>('reday');

  const props = defineProps<{
    linkPage: string;
    close?: Function;
    pageCallback?: (EventsPc) => Promise<void>;
  }>();

  const pageRenderRef = ref();

  getRunPages();

  async function getRunPages() {
    const linkPage = props.linkPage;
    try {
      if (linkPage) {
        const { data, name } = await Globals.initPageByid(linkPage);
        //初始化权限
        Globals.initPermission(data.permissions);
        pageData.value = data;
        await PluginPgkUtil.loadWebPlugin(data.plugins);
        status.value = data?.widgets?.length ? 'success' : 'empty';
      }
    } catch (error) {
      status.value = 'error';
    }
  }

  async function onClose() {
    console.log('关闭');
  }

  defineExpose({
    getEvent() {
      return pageRenderRef.value?.getEvent();
    },
  });
</script>
<style scoped lang="less">
  .layout {
    height: 100%;
  }

  .web-render-main {
    display: flex;
    flex-direction: column;
  }
</style>
