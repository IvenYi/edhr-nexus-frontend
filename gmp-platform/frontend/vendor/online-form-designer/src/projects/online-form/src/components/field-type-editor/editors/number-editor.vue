<template>
  <div :class="[ns.b()]">
    <a-input-number
      :value="value"
      @update:value="(v) => emit('update:value', v)"
      :placeholder="t('sys.inputText')"
    />
  </div>
</template>

<script lang="ts" setup name="number-editor">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IModelField } from '../../model-field-select';

  const ns = useNamespace('number-editor');
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
  $number-editor: (
    height: auto,
  );

  @include b(number-editor) {
    @include set-component-css-var(number-editor, $number-editor);
    height: getCssVar(number-editor, height);
  }
</style>
