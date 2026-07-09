<template>
  <baseButton :widget="widget" v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-sub-table-delete-button">
  import baseButton from '../../__components__/base_button.vue';

  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button }>();
</script>
<style scoped lang="less"></style>
