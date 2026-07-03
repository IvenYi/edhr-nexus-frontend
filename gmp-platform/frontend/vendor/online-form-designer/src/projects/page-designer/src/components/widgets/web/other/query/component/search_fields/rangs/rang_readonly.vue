<template>
  <div class="ks-row-middle" v-if="isRang">
    <template v-if="!start && !end">
      {{ emptyDisplayValue }}
    </template>
    <template v-else>
      {{ start || emptyDisplayValue }}
      <div class="w6 text-center">-</div>
      {{ end || emptyDisplayValue }}
    </template>
  </div>
  <div v-else> {{ value || emptyDisplayValue }}</div>
</template>

<script setup lang="ts" name="gct-inputmoney">
  import { toRef } from 'vue';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const props = defineProps<{
    value?: string | [string, string];
    isRang: boolean;
  }>();

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const start = toRef(() => props.value?.[0]);
  const end = toRef(() => props.value?.[1]);
</script>
<style scoped lang="less"></style>
