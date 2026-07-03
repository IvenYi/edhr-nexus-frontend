<template>
  <div :class="['form-item ', isFirst ? 'mt-0' : 'mt-12px', inline ? 'form-inline' : '']">
    <div class="form-item__label">
      <slot name="label">
        <span v-if="isRequired" class="error-gct">*</span>
        {{ label }}
      </slot>
    </div>
    <a-form-item v-bind="$attrs" class="form-item__content">
      <slot> </slot>
    </a-form-item>
  </div>
</template>

<script setup lang="ts" name="form-item">
  import { computed } from 'vue';
  import type { Rule } from 'ant-design-vue/es/form';

  const props = withDefaults(
    defineProps<{
      label?: string;
      inline?: boolean;
      isFirst?: boolean;
      rules?: Rule[];
      required?: boolean;
    }>(),
    {
      inline: true,
      isFirst: false,
    },
  );

  const isRequired = computed(() => {
    return props.required || props.rules?.some((rule) => rule.required);
  });
</script>

<style scoped lang="less">
  .form-item {
    line-height: 18px;

    &__label {
      color: #252525;
      font-size: 12px;
      flex: none;
    }

    &__content {
      flex: 1;
      margin-bottom: 0;
    }

    &.form-inline {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    &:not(.form-inline) &__label {
      margin-bottom: 4px;
    }
  }
</style>
