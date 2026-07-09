<template>
  <baseButton v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-dropdown-button">
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button }>();
</script>

<style scoped lang="less"></style>
