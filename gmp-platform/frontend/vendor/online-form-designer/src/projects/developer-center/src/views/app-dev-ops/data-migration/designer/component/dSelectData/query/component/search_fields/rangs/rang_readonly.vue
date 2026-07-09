<template>
  <div class="ks-row-middle" v-if="isRang">
    {{ start }}
    <div class="w6 text-center">-</div>
    {{ end }}
  </div>
  <div v-else> {{ modelValue }}</div>
</template>

<script setup lang="ts" name="gct-inputmoney">
  import { computed, toRef, ref, reactive, toRaw } from 'vue';
  import type { InputNumberProps } from 'ant-design-vue';
  import { Form } from 'ant-design-vue';

  const props = defineProps<{
    modelValue?: string | [string, string];
    isRang: boolean;
  }>();

  const start = toRef(() => props.modelValue?.[0]);
  const end = toRef(() => props.modelValue?.[1]);
</script>
<style scoped lang="less"></style>
