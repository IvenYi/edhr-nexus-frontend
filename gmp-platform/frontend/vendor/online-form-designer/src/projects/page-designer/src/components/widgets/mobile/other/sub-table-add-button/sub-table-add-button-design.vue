<template>
  <vantButton 
    :widget="widget"
    :hasIcon="hasIcon"
    :hasText="hasText"
    :type="type"
    :size="size"
    :danger="danger"
    :icon="icon"
    :title="title"
    :disabled="disabled"
    :i18nConfig="i18nConfig"
    :buttonStyle="buttonStyle"
    :enableCustomColor="enableCustomColor"
    :fontColor="fontColor"
    :backgroundColor="backgroundColor"
  />
</template>

<script setup lang="ts" name="gct-sub-add-button">
  import { toRefs } from 'vue';
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '../../__components__/vantButton.vue';

  const props = defineProps<{ widget: BaseButton }>();
  const {
    title,
    hasIcon,
    hasText,
    type,
    size,
    danger,
    icon,
    disabled,
    i18nConfig,
    buttonStyle,
    enableCustomColor,
    fontColor,
    backgroundColor,
  } = toRefs(props.widget.props);
</script>
<style scoped lang="less"></style>
