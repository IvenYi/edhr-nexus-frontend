<template>
  <div class="h100% mobile-render-main">
    <div class="h100% overflow-auto mobile-render-content">
      <div :style="pageStyle" class="min-h100%" :class="isInIframe() ? 'events-none' : undefined">
        <Widget :widgetlist="widgetList" v-if="pageload" />
      </div>
    </div>
    <Widget :widgetlist="bottomWidget" v-if="pageload && bottomWidget" />
  </div>
</template>

<script setup lang="ts">
  import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import type { RuntimePageJson } from '/@page-designer/types/designer';
  import { EventsPad } from '/@web-render/render/Event/EventsPad';
  import Widget from '/@web-render/render/widget/pad.vue';
  import Globals from '/@web-render/render/Event/utils/runGlobalByPage';
  import { useplatSetting } from '../utils/useplatSetting';
  import { useRoute } from 'vue-router';

  const { getBasicThemeColor, setAppTheme } = useplatSetting();
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
    pageStyle?: RuntimePageJson['pageStyle'];
    pageCallback?: (E: EventsPad) => Promise<void>;
  }>();
  const Event = new EventsPad({ js: props.js, css: props.css });
  const { pageload } = Globals.usePageHooks(
    Event,
    props.pageEvents,
    props.globalEvents,
    props.pageCallback,
  );

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
<style>
  .van-field {
    --van-cell-font-size: 16px;
    --van-cell-value-font-size: 16px;
    --van-cell-line-height: 1.375;
    --van-cell-vertical-padding: 16px;
    --van-cell-horizontal-padding: 16px;
  }
</style>
