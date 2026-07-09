<template>
  <div class="flex items-center gap-4px">
    <a-checkbox v-model:checked="buttonConfig._checked" />
    <span :title="buttonConfig._title" class="flex-none max-w-4.2em ell">{{
      buttonConfig._title ?? '--'
    }}</span>
    <a-input
      size="small"
      v-model:value="buttonConfig._alias"
      :placeholder="$t('sys.onlineForm.pleaseEnterAlias')"
    />
  </div>
</template>

<script setup lang="ts">
  import { type ButtonConfig } from '../types';

  defineProps<{
    buttonConfig: ButtonConfig;
  }>();
</script>

<style scoped></style>
