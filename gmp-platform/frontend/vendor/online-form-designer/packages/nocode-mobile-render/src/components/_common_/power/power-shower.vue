<template>
  <span class="power-shower">
    <span class="power-shower-base">{{ value?.base }}</span>
    <span class="power-shower-exponent">{{ value?.exponent }}</span>
  </span>
</template>

<script setup lang="ts">
  import { SaveDataObj } from './use-power';

  defineProps<{
    value?: SaveDataObj;
  }>();
</script>

<style scoped lang="less">
  .power-shower {
    .power-shower-exponent {
      font-size: 75%;
      line-height: 0;
      position: relative;
      vertical-align: baseline;
      top: -0.5em;
    }
  }
</style>
