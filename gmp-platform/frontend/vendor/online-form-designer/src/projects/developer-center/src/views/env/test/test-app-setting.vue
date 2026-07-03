<template>
  <AppSetting :app-id="appId" app-env="test" />
</template>

<script setup lang="ts">
  import { AppSetting } from '/@/components/AppSetting';

  defineProps<{
    appId: string;
  }>();
</script>

<style></style>
