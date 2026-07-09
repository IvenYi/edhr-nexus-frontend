<template>
  <div
    class="h100% p1px web-render-content"
    :class="isInIframe() ? '' : 'overflow-auto'"
    :style="contentStyle"
    id="gct-scrollbody"
  >
    <Widget :widgetlist="widgetList" v-if="pageload" />
  </div>
  <Widget :widgetlist="bottomWidget" v-if="pageload && bottomWidget" />
</template>

<script setup lang="ts" name="app1">
  import { computed } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { EventsPc } from './Event/EventsPc';
  import Widget from './widget/index.vue';
  import Globals from './Event/utils/runGlobalByPage';
  import { RuntimePageJson } from '/@page-designer/types/designer';
  import { propsToStyle } from '/@page-designer/hooks/useStyle';
  import { useRoute } from 'vue-router';

  const props = defineProps<{
    widgetlist: LowCodeWidget.BasicSchema[];
    css: string;
    js: string;
    pageEvents?: RuntimePageJson['pageEvents'];
    globalEvents?: RuntimePageJson['globalEvents'];
    pageStyle?: RuntimePageJson['pageStyle'];
    pageLayoutMode: RuntimePageJson['pageLayoutMode'];
    pageCallback?: (EventsPc) => Promise<void>;
    close?: Function;
  }>();
  const Event = new EventsPc({ js: props.js, css: props.css }, { close: props.close });
  Event.pageLayoutMode = props.pageLayoutMode;
  const { pageload } = Globals.usePageHooks(
    Event,
    props.pageEvents!,
    props.globalEvents!,
    props.pageCallback,
  );

  const bottomWidget = computed(() => {
    const widget = props?.widgetlist?.find((item) => item.type === 'bottom-button-container');
    return widget ? [widget] : null;
  });

  const widgetList = computed(() => {
    return props?.widgetlist?.filter((item) => item.type !== 'bottom-button-container') || [];
  });
  const styleData = computed(() => {
    return { ...propsToStyle(props.pageStyle) };
  });

  const contentStyle = computed(() => {
    const baseStyle = { ...styleData.value };
    if (bottomWidget.value) {
      baseStyle.height = 'calc(100% - 60px)';
    }
    return baseStyle;
  });

  const route = useRoute();

  /**
   * 判断页面是否在iframe中
   */
  function isInIframe() {
    return window.top !== window.self && route.query.designPreview !== 'true';
  }

  defineExpose({
    getEvent() {
      return Event;
    },
  });
</script>
<style scoped lang="less">
  .web-render-content {
    position: relative;
    flex: 1;
    // padding: 0 16px 16px;
    // overflow: auto;
  }

  :deep(.vxe-table--filter-option .vxe-checkbox--icon),
  :deep(.vxe-checkbox .vxe-checkbox--icon),
  :deep(.vxe-export--panel-column-option .vxe-checkbox--icon),
  :deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--icon),
  :deep(.vxe-custom--checkbox-option .vxe-checkbox--icon) {
    font-weight: 100;
  }

  :deep(.vxe-table--render-default .is--indeterminate.vxe-cell--checkbox .vxe-checkbox--icon),
  :deep(.vxe-table--render-default .is--checked.vxe-cell--checkbox .vxe-checkbox--icon),
  :deep(
    .vxe-table--render-default .vxe-cell--checkbox:not(.is--disabled):hover .vxe-checkbox--icon
  ),
  :deep(.is--checked.vxe-table--filter-option),
  :deep(.is--checked.vxe-export--panel-column-option),
  :deep(.is--indeterminate.vxe-checkbox),
  :deep(.is--indeterminate.vxe-custom--checkbox-option),
  :deep(.vxe-table--render-default .is--indeterminate.vxe-cell--checkbox),
  :deep(.is--indeterminate.vxe-export--panel-column-option),
  :deep(.is--indeterminate.vxe-table--filter-option),
  :deep(.is--checked.vxe-checkbox),
  :deep(.is--checked.vxe-custom--checkbox-option),
  :deep(.vxe-table--render-default .is--checked.vxe-cell--checkbox),
  :deep(.vxe-table--render-default .is--checked.vxe-cell--radio .vxe-radio--icon) {
    color: var(--ant-primary-color);
  }
</style>
