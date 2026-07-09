<template>
  <a-input-number
    v-model:value="numValue"
    :max="max"
    :min="min"
    :controls="true"
    :placeholder="t('sys.inputText')"
    :precision="0"
    size="small"
    addonAfter="px"
  />
</template>

<script setup lang="ts" name="length-unit-editor">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { parseValueUnit } from '@gct/runtime';

  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      value?: string;
      max?: number;
      min?: number;
    }>(),
    {
      min: 0,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined): void;
  }>();

  const numValue = computed({
    get() {
      if (!props.value) {
        return undefined;
      }
      const { value } = parseValueUnit(props.value);
      return value;
    },
    set(v) {
      emit('update:value', !v ? undefined : v + 'px');
    },
  });
</script>

<style lang="less" scoped></style>
