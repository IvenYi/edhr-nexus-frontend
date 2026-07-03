<template>
  <a-tag :class="[ns.b(), ns.m(value.toLowerCase())]" :color="colors[value]">
    {{ value ? t(`sys.onlineForm.controlStatusEnum.${value}`) : '--' }}
  </a-tag>
</template>

<script lang="ts" setup name="control-status-tag">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ControlStatusEnum } from '/@app-designer/views/online-form/constants';

  const { t } = useI18n();
  const ns = useNamespace('control-status-tag');

  withDefaults(
    defineProps<{
      value: ControlStatusEnum;
    }>(),
    {},
  );

  const colors = {
    [ControlStatusEnum.RUNNING]: 'default',
    [ControlStatusEnum.UNCONTROLLED]: 'default',
    [ControlStatusEnum.CONTROLLED]: 'processing',
  };
</script>

<style lang="scss" scoped>
  $control-status-tag: ();

  @include b(control-status-tag) {
    @include set-component-css-var(control-status-tag, $control-status-tag);

    @include m(uncontrolled) {
      color: #8f8f8f;
    }
  }
</style>
