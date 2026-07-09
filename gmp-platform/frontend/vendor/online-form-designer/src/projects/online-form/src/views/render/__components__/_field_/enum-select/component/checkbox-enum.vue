<template>
  <CheckboxGroup
    v-model:value="currentValue"
    :class="['enum-checkbox-group', isAutoLineBreak && 'enum-checkbox-group--auto-line-break']"
  >
    <span v-for="option of options" :key="option.value">
      <Checkbox :value="option.value">{{ option.label }}</Checkbox>
      <slot name="introduceField" :refFields="option.refFields" :optionValue="option.value"></slot>
    </span>
  </CheckboxGroup>
</template>

<script setup lang="ts" name="CheckboxEnum">
  import { computed } from 'vue';
  import { CheckboxGroup, Checkbox } from 'ant-design-vue';
  import { last } from 'lodash-es';

  const props = defineProps<{
    value?: any;
    options: any;
    mode: string | undefined;
    isAutoLineBreak?: boolean;
  }>();

  const emit = defineEmits(['update:value']);

  const currentValue = computed({
    get() {
      if (props.value && !Array.isArray(props.value) && props.mode !== 'multiple') {
        return [props.value];
      }

      return props.value;
    },
    set(value) {
      emit('update:value', props.mode === 'multiple' ? value : last(value));
    },
  });
</script>

<style scoped lang="less">
  .enum-checkbox-group {
    display: inline;
    label.ant-checkbox-wrapper {
      margin: 0;
      &::after {
        line-height: 22px;
      }

      > :deep(span.ant-checkbox) {
        top: 3px;
      }
      > :deep(span:last-child) {
        padding-left: 0;
        padding-right: 0;
        font-size: var(--size, 12px);
        line-height: 21px;
        text-wrap: nowrap;
      }

      &:not(&.ant-checkbox-wrapper-checked) {
        :deep(.ant-checkbox-inner) {
          border-color: var(--required-border-color, #e9e9e9);
          background-color: var(--required-background-color, transparent);
        }
      }

      &:hover {
        &:not(&.ant-checkbox-wrapper-checked) {
          :deep(.ant-checkbox-inner) {
            border-color: var(--required-border-hover-color, var(--ant-primary-color));
          }
        }
      }

      &.ant-checkbox-wrapper-disabled {
        :deep(.ant-checkbox-inner) {
          background-color: #f7f8fa !important;
        }
      }
    }

    &.is-show-required.flashing-border {
      background-color: transparent !important;
      label.ant-checkbox-wrapper {
        &:not(&.ant-checkbox-wrapper-checked) {
          :deep(.ant-checkbox-inner) {
            animation: flashBorder 2s infinite;
          }
        }
      }
    }

    /*** 文字在后 */
    &.text-pos-after {
      label.ant-checkbox-wrapper > :deep(span:last-child) {
        padding-left: var(--space, 0);
      }
    }

    /*** 文字在前 */
    &.text-pos-before {
      label.ant-checkbox-wrapper {
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
      :deep(label.ant-checkbox-wrapper > span:last-child) {
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
</style>
