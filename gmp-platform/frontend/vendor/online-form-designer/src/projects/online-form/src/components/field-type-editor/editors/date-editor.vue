<template>
  <div :class="[ns.b()]">
    <a-date-picker
      class="w-full"
      v-if="!isTime"
      :show-time="fieldInfo.fieldType === FIELD_TYPE.DATE_TIME"
      :value="value"
      @update:value="(v) => emit('update:value', v)"
      :placeholder="t('sys.inputText')"
    />
    <a-time-picker
      v-else
      class="w-full"
      :value="value"
      @update:value="(v) => emit('update:value', v)"
      :placeholder="t('sys.inputText')"
    />
  </div>
</template>

<script lang="ts" setup name="date-editor">
  import { FIELD_TYPE, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IModelField } from '../../model-field-select';
  import { computed } from 'vue';

  const ns = useNamespace('date-editor');
  const { t } = useI18n() as any;

  const props = withDefaults(
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

  const isTime = computed(() => props.fieldInfo.fieldType === FIELD_TYPE.TIME);
</script>

<style lang="scss" scoped>
  $date-editor: (
    height: auto,
  );

  @include b(date-editor) {
    @include set-component-css-var(date-editor, $date-editor);
    height: getCssVar(date-editor, height);
  }
</style>
