<template>
  <WidgetAsync class="bottom-btn" :widget="props.widget" />
</template>

<script name="gct-bottom-container" setup lang="ts">
  import { BaseButton } from '/@page-designer/types/mobile';
  import WidgetAsync from '/@web-render/render/widget/widget-pad-async.vue';
  import { operateSysEnums, FormComponents } from '/@page-designer/enum';

  const props = defineProps<{ widget: BaseButton }>();
</script>
<style lang="less" scoped>
  .bottom-btn {
    display: block;

    :deep(.van-button) {
      height: var(--van-button-default-height);
      padding: 0 8px;
      font-size: 12px;
    }
  }
</style>
