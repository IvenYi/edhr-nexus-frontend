<template>
  <div class="h100% overflow-auto pt52px">
    <pageRender
      :widgetlist="pageData.widgets"
      :css="pageData.css"
      :js="pageData.runJs"
      :pageStyle="pageStyle"
      :pageEvents="pageData.pageEvents"
      :globalEvents="pageData.globalEvents"
      :enableBGColor="pageStyle?.enableHeaderBGColor"
      :pageCallback="runProcess"
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
  import { EventsMobile } from '/@web-render/render/Event/EventsMobile';
  import { PluginPgkUtil } from '@gct-paas/core';
  import { useAppInst } from '@gct/runtime';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const app = useAppInst();
  const isPluginLoaded = ref(false);
  const route = useRoute();
  const router = useRouter();
  const pageData = ref<RuntimePageJson>();
  const pageStyle = toRef(() => propsToStyle(pageData.value?.pageStyle));
  const title = ref('');

  function onClickLeft() {
    router.back();
  }

  const { loadGlobalSetting } = useGlobalSetting();

  async function getRunPages() {
    await loadGlobalSetting();
    const linkPage = route.params.linkPage as string;
    if (linkPage) {
      const { data, name } = await Globals.initPageByid(linkPage, PageTypeEnum.PAD);
      pageData.value = data;
      await PluginPgkUtil.loadMobilePlugin(data.plugins);
      isPluginLoaded.value = true;
      Globals.initPermission(data.permissions);
      title.value = name || '';
    }
  }

  getRunPages();

  /**流程信息初始化 */
  async function runProcess(Event: EventsMobile) {
    const { taskId, processInstanceId, state } = route.query || {};
    await Event.runProcessBySaskId({ taskId, processInstanceId, examineAndApproveState: state });
  }
</script>
<style scoped lang="less">
  :deep(.van-nav-bar__title) {
    font-weight: normal;
    text-wrap: wrap;
  }

  :deep(.van-nav-bar) {
    height: 52px;
  }
</style>
