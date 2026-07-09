<template>
  <NocodeField
    :class="['field-textarea']"
    v-model="value"
    :label="label"
    rows="1"
    type="textarea"
    maxlength="200"
    label-align="top"
    input-align="left"
    show-word-limit
    v-bind="$attrs"
  >
    <template v-for="(_slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
  </NocodeField>
</template>

<script lang="ts" setup name="field-textarea">
  import { i18n } from '@mobile/locales/setupI18n';
  import { computed } from 'vue';
  import NocodeField from '../nocode-field/nocode-field.vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      label?: string;
      modelValue?: string;
    }>(),
    {},
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
</script>

<style lang="less" scoped>
  .field-textarea {
  }
</style>
