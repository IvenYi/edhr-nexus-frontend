<template>
  <div
    :class="['radio-cell-comp-field-mobile', realFieldId, { 'is-disabled': showDisabled }]"
    role="group"
  >
    <span
      v-for="option in options"
      :key="option.value"
      class="option"
      :class="{ 'is-selected': isSelected(option) }"
    >
      <span class="indicator" aria-hidden="true">
        <i v-if="isSelected(option)" class="check-icon"></i>
      </span>

      <span class="label">{{ option.label }}</span>

      <slot name="introduceField" :refFields="option.refFields" :optionValue="option.value"></slot>
    </span>
  </div>
</template>

<script setup lang="ts" name="radio-cell-comp-field">
  import { FIELD_TYPE } from '@gct/runtime';
  import { renderUtils } from '@gct/nocode-base';

  type Option = {
    label: string;
    value: any;
    refFields?: any;
  };

  const props = defineProps<{
    value?: any;
    fieldType: FIELD_TYPE;
    showDisabled: boolean;
    realFieldId: string | undefined;
    options: Option[];
  }>();

  const isSelected = (option: Option) => {
    const v = props.value;

    if (Array.isArray(v)) {
      return v.some((x) => {
        if (props.fieldType === FIELD_TYPE.BOOLEAN) {
          return renderUtils.getBoolValue(x) === renderUtils.getBoolValue(option.value);
        }
        return x === option.value;
      });
    }

    if (props.fieldType === FIELD_TYPE.BOOLEAN) {
      return renderUtils.getBoolValue(v) === renderUtils.getBoolValue(option.value);
    }
    return v === option.value;
  };
</script>

<style scoped lang="less">
  .radio-cell-comp-field-mobile {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 4px;
    align-items: center;
    font-size: 14px;
    line-height: 1;

    .option {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      background: transparent;
      color: #333;
      gap: var(--space, 0);
      white-space: nowrap;
      opacity: 1;

      /* 勾选图标容器 */
      .indicator {
        display: inline-flex;
        width: 16px;
        height: 16px;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border-radius: 8px;
        border: 1px solid var(--required-border-color, #e9e9e9);
        background-color: var(--required-background-color, transparent);

        .check-icon {
          width: 8px;
          height: 8px;
          display: block;
          fill: currentColor;
          background: transparent;
          border-radius: 4px;
        }
      }

      /* label 文本 */
      .label {
        display: inline-block;
        font-size: var(--size, 12px);
        line-height: 22px;
        text-wrap: nowrap;
      }

      /* 选中样式（高亮） */
      &.is-selected .check-icon {
        background: #1677ff;
      }
    }

    /*** 文字在前 */
    &.text-pos-before .option {
      flex-direction: row-reverse;
    }

    /*** 垂直(纵向) */
    &.portrait {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    &.is-disabled {
      .option {
        color: rgba(0, 0, 0, 0.35);
        .indicator {
          border-color: #e0e3eb !important;
          background: #f5f5f5 !important;

          .check-icon {
            background: rgba(0, 0, 0, 0.35) !important;
          }
        }
      }
    }
  }
</style>
