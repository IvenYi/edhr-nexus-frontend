<template>
  <div :class="['enum-radio-group', isAutoLineBreak && 'enum-radio-group--auto-line-break']">
    <span v-for="option of options" :key="option.value">
      <Radio
        :disabled="$attrs.disabled"
        :value="option.value"
        :checked="internalValues.includes(option.value)"
        @click="handleItemClick(option.value)"
        >{{ option.label }}</Radio
      >
      <slot name="introduceField" :refFields="option.refFields" :optionValue="option.value"></slot>
    </span>
  </div>
</template>

<script setup lang="ts" name="RadioEnum">
  import { computed } from 'vue';
  import { Radio } from 'ant-design-vue';

  const props = defineProps<{
    value?: any;
    options: any;
    mode: string | undefined;
    isAutoLineBreak?: boolean;
  }>();

  const emit = defineEmits(['update:value']);

  const internalValues = computed(() => {
    if (props.mode === 'multiple') {
      return props.value;
    }

    return props.value ? [props.value] : [];
  });

  const handleItemClick = (value) => {
    const index = internalValues.value.indexOf(value);
    const newValue = internalValues.value.slice();
    if (props.mode === 'multiple') {
      if (index !== -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(value);
      }

      emit('update:value', [...newValue]);
    } else {
      emit('update:value', index === -1 ? value : undefined);
    }
  };
</script>

<style scoped lang="less">
  .enum-radio-group {
    display: inline;
    font-size: 12px;
    label.ant-radio-wrapper {
      margin: 0;
      &::after {
        line-height: 22px;
      }

      > :deep(span.ant-radio) {
        top: 3px;
      }
      > :deep(span:last-child) {
        padding-left: 0;
        padding-right: 0;
        font-size: var(--size, 12px);
        line-height: 21px;
        text-wrap: nowrap;
      }

      &:not(&.ant-radio-wrapper-checked) {
        :deep(.ant-radio-inner) {
          border-color: var(--required-border-color, #e9e9e9);
          background-color: var(--required-background-color, transparent);
        }
      }

      &:hover {
        &:not(&.ant-radio-wrapper-checked) {
          :deep(.ant-radio-inner) {
            border-color: var(--required-border-hover-color, var(--ant-primary-color));
          }
        }
      }

      &.ant-radio-wrapper-disabled {
        :deep(.ant-radio-inner) {
          background-color: #f7f8fa !important;
        }
      }
    }

    &.is-show-required.flashing-border {
      background-color: transparent !important;
      label.ant-radio-wrapper {
        &:not(&.ant-radio-wrapper-checked) {
          :deep(.ant-radio-inner) {
            animation: flashBorder 2s infinite;
          }
        }
      }
    }

    /*** 文字在后 */
    &.text-pos-after {
      label.ant-radio-wrapper > :deep(span:last-child) {
        padding-left: var(--space, 0);
      }
    }

    /*** 文字在前 */
    &.text-pos-before {
      label.ant-radio-wrapper {
        display: inline-flex;
        flex-direction: row-reverse;
        > :deep(span:last-child) {
          padding-right: var(--space, 0);
        }
      }
    }

    /*** 水平(横向) */
    &.landscape {
      > span:not(:last-child) {
        > :last-child {
          margin-right: 4px;
        }
      }
    }

    /*** 垂直(纵向) */
    &.portrait {
      display: flex;
      flex-direction: column;
    }

    &--auto-line-break {
      :deep(label.ant-radio-wrapper > span:last-child) {
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
</style>
