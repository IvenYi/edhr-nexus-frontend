<template>
  <div :class="[ns.b()]">
    <a-select
      class="w-full"
      :value="value"
      @update:value="(v) => emit('update:value', v)"
      :placeholder="t('sys.inputText')"
      :options="[
        {
          label: t('sys.real'),
          value: true as any,
        },
        {
          label: t('sys.fake'),
          value: false as any,
        },
      ]"
    />
  </div>
</template>

<script lang="ts" setup name="boolean-editor">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IModelField } from '../types';

  const ns = useNamespace('boolean-editor');
  const { t } = useI18n() as any;

  withDefaults(
    defineProps<{
      value?: unknown;
      fieldInfo: IModelField;
    }>(),
    {
      value: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: unknown): void;
  }>();
</script>

<style lang="scss" scoped>
  $boolean-editor: (
    height: auto,
  );

  @include b(boolean-editor) {
    @include set-component-css-var(boolean-editor, $boolean-editor);
    height: getCssVar(boolean-editor, height);
  }
</style>
