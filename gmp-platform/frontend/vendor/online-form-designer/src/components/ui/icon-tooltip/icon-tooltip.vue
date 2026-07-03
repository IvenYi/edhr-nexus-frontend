<template>
  <a-tooltip :class="[ns.b()]">
    <template #title>
      {{ tooltip }}
    </template>
    <IconNext :value="icon" color="#9a9a9a" />
  </a-tooltip>
</template>

<script lang="ts" setup name="Demo">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IconNext } from '/@/components/Icon';

  IconNext;

  const { t } = useI18n();
  const ns = useNamespace('icon-tooltip');

  const props = withDefaults(
    defineProps<{
      /** 图标 */
      icon?: string;
      /** 提示文本 */
      tooltip: string;
    }>(),
    {
      icon: 'icon-bangzhu',
    },
  );
</script>

<style lang="scss" scoped>
  $icon-tooltip: ();

  @include b(icon-tooltip) {
    @include set-component-css-var(icon-tooltip, $icon-tooltip);
    vertical-align: middle;
    cursor: pointer;
  }
</style>
