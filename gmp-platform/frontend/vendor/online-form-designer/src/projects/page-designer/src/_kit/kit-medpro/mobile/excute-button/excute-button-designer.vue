<template>
  <vantButton v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-excute-button">
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '/@page-designer/components/widgets/mobile/__components__/vantButton.vue';
  const props = defineProps<{ widget: BaseButton }>();
</script>

<style scoped lang="less"></style>
