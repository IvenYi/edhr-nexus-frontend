<template>
  <NocodeField
    :class="['field-double-input']"
    v-model="value"
    :label="label"
    v-bind="$attrs"
    :type="_type"
  >
    <template v-for="(_slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
  </NocodeField>
</template>

<script lang="ts" setup name="field-double-input">
  import { i18n } from '@mobile/locales/setupI18n';
  import { computed } from 'vue';
  import NocodeField from '../nocode-field/nocode-field.vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      label?: string;
      modelValue?: string;
      isInteger?: boolean;
    }>(),
    {
      isInteger: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void;
  }>();

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emit('update:modelValue', val);
    },
  });

  const _type = computed(() => {
    return props.isInteger ? 'digit' : 'number';
  });
</script>

<style lang="less" scoped>
  .field-double-input {
  }
</style>
