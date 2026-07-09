<template>
  <!-- 新版本的BaseButton -->
  <vantButton :widget="widget" v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-process-approve-button">
  import vantButton from '../../__components__/vantButton.vue';
  import { BaseButton } from '/@page-designer/types/mobile';

  defineProps<{ widget: BaseButton }>();
</script>
<style scoped lang="less"></style>
