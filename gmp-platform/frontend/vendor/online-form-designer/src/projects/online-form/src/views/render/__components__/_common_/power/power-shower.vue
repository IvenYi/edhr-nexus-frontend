<template>
  <span :class="ns.b()">
    <span :class="ns.e('base')">{{ value?.base }}</span>
    <span :class="ns.e('exponent')">{{ value?.exponent }}</span>
  </span>
</template>

<script setup lang="ts">
  import { SaveDataObj } from './use-power';
  import { useNamespace } from '@gct/runtime';

  const ns = useNamespace('power-shower');

  defineProps<{
    value?: SaveDataObj;
  }>();
</script>

<style scoped lang="scss">
  @include b(power-shower) {
    @include e(exponent) {
      font-size: 75%;
      line-height: 0;
      position: relative;
      vertical-align: baseline;
      top: -0.5em;
    }
  }
</style>
