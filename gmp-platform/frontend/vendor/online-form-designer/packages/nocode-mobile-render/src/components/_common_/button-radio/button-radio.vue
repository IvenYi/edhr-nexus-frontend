<template>
  <div :class="['button-radio']">
    <div
      v-for="option in options"
      :key="option.value"
      :class="['button-radio__item', { 'button-radio__item--active': option.value === value }]"
      @click="handleClick(option.value)"
    >
      {{ option.label }}
    </div>
  </div>
</template>

<script lang="ts" setup name="button-radio">
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      value?: string;
      options?: {
        label: string;
        value: string;
      }[];
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined): void;
  }>();

  const handleClick = (val: string) => {
    emit('update:value', val);
  };
</script>

<style lang="less" scoped>
  .button-radio {
    display: flex;
    background: #e6e9ee;
    padding: 2px;
    border-radius: 10px 10px 10px 10px;

    &__item {
      width: 1px;
      flex-grow: 1;
      line-height: 32px;
      text-align: center;
      color: #5a5f6b;
      font-size: 15px;

      &--active {
        font-weight: 500;
        color: #1a1d23;
        background: #ffffff;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
        border-radius: 8px 8px 8px 8px;
      }
    }
  }
</style>
