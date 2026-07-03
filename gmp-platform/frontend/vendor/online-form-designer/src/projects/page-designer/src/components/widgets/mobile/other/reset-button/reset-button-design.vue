<template>
  <!-- <van-button type="primary"> {{ title }}</van-button> -->
  <vantButton :widget="widget" v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-reset-button">
  import { toRefs } from 'vue';
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '../../__components__/vantButton.vue';

  const props = defineProps<{ widget: BaseButton }>();
  const { title, hasIcon, hasText, type, size, danger, icon, disabled, i18nConfig, buttonStyle } =
    toRefs(props.widget.props);
</script>
<style scoped lang="less"></style>
