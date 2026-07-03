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
      v-if="status === 'success'"
    />

    <PreviewEmpty v-if="status === 'empty'" />
    <noFond v-if="status === 'error'" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onActivated } from 'vue';
  import { useRoute } from 'vue-router';
  import pageRender from './page-render.vue';
  import { RuntimePageJson } from '/@page-designer/types/designer';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import Globals from './Event/utils/runGlobalByPage';
  import PreviewEmpty from '/@/components/Preview/src/preview-empty.vue';
  import noFond from '/@/views/sys/exception/Exception.vue';
  import { useTitle as usePageTitle } from '@vueuse/core';
  import { PluginPgkUtil } from '@gct-paas/core';

  type pageStatus = 'reday' | 'success' | 'empty' | 'error';
  const route = useRoute();
  const pageData = ref<RuntimePageJson>();
  const tabStore = useMultipleTabStore();
  const status = ref<pageStatus>('reday');
  const pageTitle = usePageTitle();

  getRunPages();

  async function getRunPages() {
    const linkPage = route.params.linkPage as string;
    try {
      if (linkPage) {
        const { data, name } = await Globals.initPageByid(linkPage);
        //初始化权限
        Globals.initPermission(data.permissions);
        pageData.value = data;
        await PluginPgkUtil.loadWebPlugin(data.plugins);
        if (pageData.value?.keepAlive) {
          //页面开启缓存
          route.meta.ignoreKeepAlive = false;
          tabStore.updateCacheTab();
        }
        status.value = data?.widgets?.length ? 'success' : 'empty';
        //详情页面
        if (route.name === 'designById') {
          const title = (route.query.title as string) || name || '';
          tabStore.setTabTitle(title, route);
          pageTitle.value = title;
        }
      }
    } catch (error) {
      status.value = 'error';
    }
  }

  onActivated(() => {
    Globals.initGlobalS(pageData.value);
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
