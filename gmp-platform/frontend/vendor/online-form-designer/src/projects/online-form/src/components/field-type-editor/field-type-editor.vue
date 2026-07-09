<template>
  <div :class="[ns.b()]">
    <component
      :class="[ns.e('editor')]"
      ref="DesignRef"
      :is="getEditorByType!(fieldInfo?.fieldType)"
      :fieldInfo="fieldInfo"
      :value="value"
      @update:value="emit('update:value', $event)"
    />
  </div>
</template>

<script lang="ts" setup name="field-type-editor">
  import { FIELD_TYPE, useNamespace } from '@gct/runtime';
  import type { IModelField } from './types';
  import { getEditorByOnlineFormType } from './logic';

  const ns = useNamespace('field-type-editor');

  withDefaults(
    defineProps<{
      value?: unknown;
      fieldInfo?: IModelField;
      getEditorByType?: (type?: FIELD_TYPE) => any;
    }>(),
    {
      getEditorByType: getEditorByOnlineFormType,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: unknown): void;
  }>();
</script>

<style lang="scss" scoped>
  $field-type-editor: (
    height: auto,
  );

  @include b(field-type-editor) {
    @include set-component-css-var(field-type-editor, $field-type-editor);
    height: getCssVar(field-type-editor, height);
    width: 200px;

    @include e(editor) {
      width: 100%;
    }
  }
</style>
