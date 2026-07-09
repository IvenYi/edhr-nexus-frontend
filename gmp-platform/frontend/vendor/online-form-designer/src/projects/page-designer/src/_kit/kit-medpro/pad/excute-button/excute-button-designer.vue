<template>
  <vantButton v-bind="convertProps(widget.props)" />
</template>

<script setup lang="ts" name="gct-excute-button">
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '/@page-designer/components/widgets/mobile/__components__/vantButton.vue';

  interface ButtonType {
    primary: 'primary';
    success: 'success';
    danger: 'danger';
    warning: 'warning';
    info: 'info';
    text: 'text';
  }

  const props = defineProps<{ widget: BaseButton }>();

  function convertProps(props: any) {
    return {
      ...props,
      type: props.type as ButtonType, // 显式类型断言
    };
  }
</script>

<style scoped lang="less"></style>
