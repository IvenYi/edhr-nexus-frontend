<template>
  <span :class="ns.b()">
    {{ value ? t(`sys.onlineForm.formEditionEnum.${value}`) : '' }}
  </span>
</template>

<script lang="ts" setup name="form-edition-tag">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormEditionEnum } from '/@app-designer/views/online-form/constants';

  const { t } = useI18n();
  const ns = useNamespace('form-edition-tag');

  withDefaults(
    defineProps<{
      value: FormEditionEnum;
    }>(),
    {},
  );
</script>

<style lang="scss" scoped>
  $form-edition-tag: ();

  @include b(form-edition-tag) {
    @include set-component-css-var(form-edition-tag, $form-edition-tag);
  }
</style>
