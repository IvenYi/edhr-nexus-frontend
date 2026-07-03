<template>
  <div :class="[ns.b()]">
    <a-select
      class="w-full"
      :value="value"
      @update:value="(v) => emit('update:value', v)"
      :placeholder="t('sys.inputText')"
      :options="enumOptions"
    />
  </div>
</template>

<script lang="ts" setup name="enum-editor">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IModelField } from '../../model-field-select';
  import { ref, watch } from 'vue';

  const ns = useNamespace('enum-editor');
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

  const enumOptions = ref([]);

  watch(
    () => props.fieldInfo,
    () => {
      // todo 获取枚举数据
    },
  );
</script>

<style lang="scss" scoped>
  $enum-editor: (
    height: auto,
  );

  @include b(enum-editor) {
    @include set-component-css-var(enum-editor, $enum-editor);
    height: getCssVar(enum-editor, height);
  }
</style>
