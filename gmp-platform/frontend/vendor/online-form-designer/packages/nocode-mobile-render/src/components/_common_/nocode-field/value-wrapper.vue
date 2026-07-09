<template>
  <span :class="['value-wrapper']">
    <template v-if="modelValue">
      <slot></slot>
      <van-icon
        v-if="clearable"
        class="ml-2"
        name="clear"
        size="20"
        color="#c8c9cc"
        @click.stop="onClear"
      />
    </template>
    <template v-else>
      <span class="value-wrapper__placeholder">{{ placeholder }}</span>
    </template>
  </span>
</template>

<script lang="ts" setup name="value-wrapper">
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      modelValue?: any;
      placeholder?: string;
      clearable?: boolean;
    }>(),
    {
      placeholder: '请输入',
      clearable: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: undefined): void;
  }>();

  const onClear = () => {
    emit('update:modelValue', undefined);
  };
</script>

<style lang="less" scoped>
  .value-wrapper {
    text-align: right;
    &__placeholder {
      color: #c8c9cc;
    }
  }
</style>
