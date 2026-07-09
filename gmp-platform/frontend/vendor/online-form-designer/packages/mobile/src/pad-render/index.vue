<template>
  <div class="h100% overflow-auto">
    <pageRender
      :widgetlist="pageData.widgets"
      :css="pageData.css"
      :js="pageData.runJs"
      :pageStyle="pageStyle"
      :pageEvents="pageData.pageEvents"
      :globalEvents="pageData.globalEvents"
      :enableBGColor="pageStyle?.enableHeaderBGColor"
      v-if="!!pageData && isPluginLoaded === true"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import pageRender from './page-render.vue';
  import type { RuntimePageJson } from '/@page-designer/types/designer';
  import Globals from '/@web-render/render/Event/utils/runGlobalByPage';
  import { propsToStyle } from '/@page-designer/hooks/useStyle';
  import { usePageCaches } from '@mobile/utils/cachePage';
  import { PluginPgkUtil } from '@gct-paas/core';
  import { useAppInst } from '@gct/runtime';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
  const props = defineProps<{
    linkPage?: string;
  }>();

  const route = useRoute();
  const pageData = ref<RuntimePageJson>();
  const pageStyle = toRef(() => propsToStyle(pageData.value?.pageStyle));
  const { setPageKey } = usePageCaches();

  const isPluginLoaded = ref(false);

  const app = useAppInst();

  /** 加载全局配置 */
  const { loadGlobalSetting } = useGlobalSetting();

  async function getRunPages() {
    await loadGlobalSetting();
    const linkPage = route.params.linkPage || (props?.linkPage as string);
    if (linkPage) {
      const { data, name } = await Globals.initPageByid(linkPage, PageTypeEnum.PAD);
      pageData.value = data;
      Globals.initPermission(data.permissions);
      await PluginPgkUtil.loadMobilePlugin(data.plugins);
      isPluginLoaded.value = true;
      const hash = <string>route.name;
      setPageKey({ linkPage, hash, keepAlive: data.keepAlive });
    }
  }
  watch(
    () => route.params.linkPage,
    () => {
      getRunPages().catch((err) => {
        pageData.value = undefined;
      });
    },
  );
  getRunPages();
</script>
<style scoped lang="less"></style>
