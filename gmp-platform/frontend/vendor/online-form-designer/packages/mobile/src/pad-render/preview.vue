<template>
  <PadLayout :pageTitle="pageTitle">
    <div class="h100% overflow-auto" ref="mobileRender">
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
      <div v-if="!pageData" class="flex flex-col h-full">
        <div class="flex-grow flex justify-center items-center">
          <Empty />
        </div>
      </div>
    </div>
  </PadLayout>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import pageRender from './page-render.vue';
  import type { RuntimePageJson } from '/@page-designer/types/designer';
  import { getAid } from '@mobile/stores/sessionHooks';
  import { AccessToken, reloadUser } from '@mobile/stores/loginHooks';
  import Globals, {
    getPageTitle,
    pageDataforJson,
  } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { propsToStyle } from '/@page-designer/hooks/useStyle';
  import { PluginPgkUtil, setToken, setTenant, getTenant } from '@gct-paas/core';
  import { useAppInst } from '@gct/runtime';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import Empty from '@mobile/components/common/empty.vue';
  import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import PadLayout from './pad-layout.vue';

  const app = useAppInst();
  const isPluginLoaded = ref(false);
  const route = useRoute();
  const pageData = ref<RuntimePageJson>();
  const mobileRender = ref();
  const pageStyle = toRef(() => propsToStyle(pageData.value?.pageStyle));
  const { search, pathname, origin, hash } = location;
  const data = new URLSearchParams(search);
  const token = data.get('token');
  if (token) {
    window.history.replaceState({}, '', origin + pathname + hash);
    AccessToken.value = token;
    setToken(token);
  }
  const tenantId = data.get('tenant-id');
  if (tenantId) {
    setTenant(tenantId);
  }
  if (window._gct) {
    _gct.store.setTenantId(getTenant()!);
  }
  const aid = location.pathname.match(/\/(pad-render|pad-sandbox)\/([^/]+)/)?.[2];
  if (aid) {
    getAid.value = aid;
  }
  const getPreviewAPi =
    route.name === 'PagePreview'
      ? Globals.initPageByid.bind(Globals)
      : Globals.initHistoryByid.bind(Globals);

  const pageTitle = computed(() => {
    return getPageTitle.value || pageDataforJson.value.pageName;
  });

  /** 加载全局配置 */
  const { loadGlobalSetting } = useGlobalSetting();

  async function getRunPages() {
    await reloadUser();
    await loadGlobalSetting();
    const linkPage = route.params.linkPage as string;
    if (linkPage) {
      const { res, data } = (await getPreviewAPi(linkPage, PageTypeEnum.PAD)) || {};
      pageData.value = data;
      await PluginPgkUtil.loadMobilePlugin(data.plugins);
      isPluginLoaded.value = true;
      window.parent.postMessage(
        JSON.stringify({
          cmd: 'previewPageData',
          data: res,
        }),
        '*',
      );
    }
  }

  const hadleClick = (e: any) => {
    e.stopPropagation();
  };

  onMounted(() => {
    if (window.top !== window.self && route.query.designPreview !== 'true') {
      mobileRender.value.addEventListener('click', hadleClick, true);
    }
  });
  onUnmounted(() => {
    mobileRender.value?.removeEventListener('click', hadleClick, true);
  });
  watch(
    () => route.params.linkPage,
    () => {
      getRunPages().catch(() => {
        pageData.value = undefined;
      });
    },
  );
  getRunPages();
</script>
<style scoped lang="less">
  .mobile-render-main {
    display: flex;
    flex-direction: column;
  }
  // .events-none {
  //   pointer-events: none;
  //   user-select: none;
  // }
</style>
