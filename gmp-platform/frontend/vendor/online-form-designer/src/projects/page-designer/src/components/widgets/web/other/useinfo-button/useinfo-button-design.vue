<template>
  <baseButton :widget="widget" v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-useinfo-button">
  import baseButton from '../../__components__/base_button.vue';
  import { Button } from '/@page-designer/types/web';

  defineProps<{ widget: Button }>();
</script>
<style scoped lang="less"></style>
