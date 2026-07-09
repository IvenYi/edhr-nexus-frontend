<template>
  <vantButton :widget="widget" v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-custom-button">
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '../../__components__/vantButton.vue';

  defineProps<{ widget: BaseButton }>();
</script>
<style scoped lang="less"></style>
