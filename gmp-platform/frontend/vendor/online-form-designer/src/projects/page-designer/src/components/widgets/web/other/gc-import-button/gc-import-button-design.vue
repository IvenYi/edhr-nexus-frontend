<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-gc-import-button">
  import baseButton from '../../__components__/base_button.vue';
  import { toRefs } from 'vue';
  import { ExportButton } from '/@page-designer/types/web';

  const props = defineProps<{ widget: ExportButton }>();
</script>
<style scoped lang="less"></style>
