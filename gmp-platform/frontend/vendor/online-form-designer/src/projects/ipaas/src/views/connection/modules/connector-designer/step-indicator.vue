<template>
  <div :class="[ns.b()]">
    <a-steps :class="[ns.e('steps')]" :current="value">
      <!-- <a-step>
        <template #title>
          设置鉴权字段
          <IconTooltip
            class="mb-3px"
            tooltip="自定义鉴权字段，例：密钥KEY字段和密钥值字段用于组装签名字段"
          />
        </template>
      </a-step> -->
      <a-step :title="t('sys.integration.authApiAddress')" />
      <a-step :title="t('sys.integration.authDebug')" />
    </a-steps>
  </div>
</template>

<script lang="ts" setup name="step-indicator">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IconTooltip } from '/@/components/ui';

  const { t } = useI18n();
  const ns = useNamespace('step-indicator');

  const props = withDefaults(
    defineProps<{
      value?: number;
    }>(),
    {
      value: 0,
    },
  );
</script>

<style lang="scss" scoped>
  $step-indicator: ();

  @include b(step-indicator) {
    @include set-component-css-var(step-indicator, $step-indicator);

    @include e('steps') {
      width: 50%;
      margin: auto;
    }
  }
</style>
