<template>
  <a-tag :class="[ns.b(), ns.m(value?.toLowerCase())]" :color="colors[value]">
    {{ value ? t(`sys.onlineForm.approvalStatusEnum.${value}`) : '--' }}
  </a-tag>
</template>

<script lang="ts" setup name="approve-status-tag">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    ApprovalControlStatusEnum,
    ApproveHisStatusEnum,
  } from '/@app-designer/views/online-form/constants';

  const { t } = useI18n();
  const ns = useNamespace('approve-status-tag');

  withDefaults(
    defineProps<{
      value: ApprovalControlStatusEnum | ApproveHisStatusEnum;
    }>(),
    {
      value: ApprovalControlStatusEnum.UN_AUDITED,
    },
  );

  const colors = {
    [ApprovalControlStatusEnum.UN_AUDITED]: 'default',
    [ApprovalControlStatusEnum.IN_AUDIT]: 'blue',
    [ApprovalControlStatusEnum.WAIT_EFFECTIVE]: 'purple',
    [ApprovalControlStatusEnum.EFFECTIVE]: 'green',
    [ApproveHisStatusEnum.FINISHED]: 'green',
    [ApproveHisStatusEnum.ENDED]: 'red',
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
