<template>
  <div class="label-template labeltext text-[#bfbfbf] relative"> </div>
</template>

<script setup lang="ts" name="gct-label-template">
  import { toRefs, computed } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';

  const props = defineProps(widgetProps);
</script>
<style scoped lang="less">
  .label-template {
    width: 300px;
    height: 180px;
    border: 1px solid #dedede;
  }

  .labeltext::before {
    content: '请配置标签模板组件';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%);
    line-height: 0;
  }
</style>
