<template>
  <vantButton
    :widget="widget"
    :has-icon="hasIcon"
    :has-text="hasText"
    :icon="icon"
    :text="title"
    :size="size"
    :type="type"
    :danger="danger"
    :i18nConfig="i18nConfig"
    :enableCustomColor="enableCustomColor"
    :fontColor="fontColor"
    :backgroundColor="backgroundColor"
  />
</template>
<script setup lang="ts" name="base-button-render">
  import { toRefs } from 'vue';
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '../../__components__/vantButton.vue';

  const props = defineProps<{ widget: BaseButton }>();
  const {
    hasIcon,
    hasText,
    icon,
    title,
    size,
    type,
    danger,
    i18nConfig,
    enableCustomColor,
    fontColor,
    backgroundColor,
  } = toRefs(props.widget.props);
</script>
<style lang="scss" scoped></style>
