<template>
  <RadioGroup
    v-model:value="currentValue"
    :class="['switch-radio-group', isAutoLineBreak && 'switch-radio-group--auto-line-break']"
  >
    <span v-for="option of options" :key="option.value">
      <Radio :value="option.value">{{ option.label }}</Radio>
      <slot name="introduceField" :refFields="option.refFields"></slot>
    </span>
  </RadioGroup>
</template>

<script setup lang="ts" name="RadioSwitch">
  import { computed } from 'vue';
  import { RadioGroup, Radio } from 'ant-design-vue';
  import { isNil } from 'lodash-es';

  const props = defineProps<{ value?: any; options: any; isAutoLineBreak?: boolean }>();

  const emit = defineEmits(['update:value']);

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(value) {
      if (isNil(value)) {
        emit('update:value', null);
        return;
      }
      emit('update:value', typeof value !== 'boolean' ? Boolean(value) : !!value);
    },
  });
</script>

<style scoped lang="less">
  .switch-radio-group {
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
