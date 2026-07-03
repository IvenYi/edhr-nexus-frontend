<template>
  <div :class="[ns.b()]">
    <a-input
      :value="value"
      @update:value="(v) => emit('update:value', v)"
      :placeholder="t('sys.inputText')"
    />
  </div>
</template>

<script lang="ts" setup name="text-editor">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IModelField } from '../../model-field-select';

  const ns = useNamespace('text-editor');
  const { t } = useI18n() as any;

  withDefaults(
    defineProps<{
      value?: string;
      fieldInfo: IModelField;
    }>(),
    {
      value: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string): void;
  }>();
</script>

<style lang="scss" scoped>
  $text-editor: (
    height: auto,
  );

  @include b(text-editor) {
    @include set-component-css-var(text-editor, $text-editor);
    height: getCssVar(text-editor, height);
  }
</style>
