<template>
  <van-config-provider :theme-vars="themeVars" class="h100% overflow-auto mobile-render-main">
    <div v-if="isPreview" :class="{ 'mobile-header-wrap': true, 'enable-bg-color': enableBGColor }">
      <i><van-icon name="arrow-left" /></i>
      <div class="mobile-header-title gct-text-overflow ml4px mr4px">
        {{ pageTitle }}
      </div>
      <i><van-icon name="cross" /></i>
    </div>
    <div class="h100% overflow-auto mobile-render-content">
      <div
        :style="pageStyle"
        class="min-h100%"
        :class="isInIframe() ? 'events-none' : 'overflow-auto'"
      >
        <Widget :widgetlist="widgetList" v-if="pageload" />
      </div>
    </div>
    <Widget :widgetlist="bottomWidget" v-if="pageload && bottomWidget" />
  </van-config-provider>
</template>

<script setup lang="ts">
  import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import type { RuntimePageJson } from '/@page-designer/types/designer';
  import { EventsMobile } from '/@web-render/render/Event/EventsMobile';
  import Widget from '/@web-render/render/widget/mobile.vue';
  import Globals from '/@web-render/render/Event/utils/runGlobalByPage';
  import { useplatSetting } from '../utils/useplatSetting';
  import { useRoute } from 'vue-router';

  // initMqttApp();

  const { getBasicThemeColor, setAppTheme, setPassTheme } = useplatSetting();
  getBasicThemeColor().then(() => {
    setAppTheme();
  });
  const props = defineProps<{
    enableBGColor: boolean;
    widgetlist: LowCodeWidget.BasicSchema[];
    css: string;
    js: string;
    pageEvents?: RuntimePageJson['pageEvents'];
    globalEvents?: RuntimePageJson['globalEvents'];
    pageTitle?: string;
    isPreview?: boolean;
    pageStyle?: RuntimePageJson['pageStyle'];
    pageCallback?: (E: EventsMobile) => Promise<void>;
  }>();
  const Event = new EventsMobile({ js: props.js, css: props.css });
  const { pageload } = Globals.usePageHooks(
    Event,
    props.pageEvents,
    props.globalEvents,
    props.pageCallback,
  );
  onUnmounted(() => {
    setPassTheme();
  });
  const themeVars = {
    'cell-background': 'tranparent',
  };
  const bottomWidget = computed(() => {
    const widget = props?.widgetlist?.find((item) => item.type === 'bottom-button-container');
    return widget ? [widget] : null;
  });

  const route = useRoute();

  /**
   * 判断页面是否在iframe中
   */
  function isInIframe() {
    return window.top !== window.self && route.query.designPreview !== 'true';
  }

  const widgetList = computed(() => {
    return props?.widgetlist?.filter((item) => item.type !== 'bottom-button-container') || [];
  });
</script>
<style scoped lang="less">
  .mobile-header-wrap {
    display: flex;
    box-sizing: border-box;
    height: 52px;
    padding: 0 18px;
    background-color: #fff;
    color: #333;
    font-size: 16px;
    line-height: 52px;

    .mobile-header-title {
      flex: 1;
      text-align: center;
    }
  }

  .mobile-header-wrap.enable-bg-color {
    background-color: var(--van-primary-color, #fff);
    color: #fff;
  }

  .mobile-render-main {
    display: flex;
    flex-direction: column;

    .mobile-render-content {
      position: relative;
      flex: 1;
      overflow: auto;
    }
  }

  .events-none {
    pointer-events: none;
    user-select: none;
  }
</style>
