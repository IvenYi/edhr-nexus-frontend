<template>
  <baseButton v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-empty">
  import { IQrcodeReader } from './schema';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';

  const props = defineProps<{
    widget: IQrcodeReader;
  }>();
</script>

<style scoped lang="less"></style>
