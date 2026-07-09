<template>
  <div
    :class="[
      'base-cell-comp-field-mobile',
      realFieldId,
      { 'is-disabled': showDisabled, 'is-multiple': multiple },
    ]"
    role="textbox"
    aria-readonly="true"
  >
    <div class="content">
      <template v-if="multiple && selectedLabels.length">
        <span class="tag" v-for="(label, idx) in selectedLabels" :key="idx">
          {{ label }}
        </span>
      </template>
      <template v-else-if="hasValue">
        <span class="value">{{ displayValue }}</span>
      </template>
      <template v-else>
        <span class="placeholder">{{ placeholder }}</span>
      </template>
    </div>
    <span v-if="showSuffixIcon" class="suffix-icon">
      <slot name="suffixIcon" />
    </span>
    <component :is="renderScript" />
  </div>
</template>

<script setup lang="ts" name="base-cell-comp-field">
  import { computed } from 'vue';
  import { isNil } from 'lodash-es';
  import { renderUtils } from '@gct/nocode-base';

  const props = defineProps<{
    value?: string | number | null;
    showDisabled: boolean;
    realFieldId: string | undefined;
    placeholder?: string;
    /** 显示后缀图标 */
    showSuffixIcon?: boolean;
    /** 多选模式 */
    multiple?: boolean;
    /** 角标组件 */
    renderScript?: any;
    callback?: Function;
  }>();

  function isEmpty(v) {
    if (isNil(v)) {
      return true;
    }
    if (typeof v === 'string' && v.trim() === '') {
      return true;
    }
    if (Array.isArray(v) && v.length === 0) {
      return true;
    }
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) {
      return true;
    }
    return false;
  }

  const hasValue = computed(() => {
    return !isEmpty(props.value);
  });

  const displayValue = computed(() => {
    return props.callback ? props.callback(props.value) : props.value;
  });

  const selectedLabels = computed(() => {
    return renderUtils.getValue(displayValue.value, props.multiple);
  });
</script>

<style scoped lang="less">
  .base-cell-comp-field-mobile {
    display: inline-flex;
    width: var(--cmp-width, 100%);
    min-width: 30px;
    height: 28px;
    padding: 4px;
    border-radius: 2px;
    border: 1px solid var(--required-border-color, #e9e9e9);
    background-color: var(--required-background-color, transparent);
    font-size: var(--size, 12px);
    line-height: 1.5715;
    text-align: left;
    color: rgba(0, 0, 0, 0.85);
    word-break: break-word;
    overflow: hidden;
    box-sizing: border-box;
    transition: all 0.3s linear;
  }

  /** 高度自适应 */
  .base-cell-comp-field-mobile.is-height-auto {
    white-space: pre-wrap !important;
    height: var(--cmp-height) !important;
    min-height: var(--cmp-height) !important;
    max-height: var(--cmp-height) !important;
  }

  /** 超出边界 */
  .base-cell-comp-field-mobile.is-out-of-range {
    color: #ff4d4f !important;
  }

  /* 禁用态样式 */
  .base-cell-comp-field-mobile.is-disabled {
    border-color: #e0e3eb !important;
    background: #f5f5f5;
    color: rgba(0, 0, 0, 0.35);
  }

  /** 标签模式 */
  .base-cell-comp-field-mobile.is-multiple {
    padding: 2px !important;
  }

  /** 内容区域 */
  .base-cell-comp-field-mobile .content {
    display: inline-flex;
    width: 100%;
    height: 100%;
    flex: 1;
    flex-wrap: nowrap;
    gap: 4px;
    overflow: hidden;
  }

  /** 占位符、渲染值样式 */
  .base-cell-comp-field-mobile .value,
  .base-cell-comp-field-mobile .placeholder {
    overflow: hidden;
    display: inline-block;
    width: 100%;
    max-width: 100%;
    word-break: break-word;
  }

  /* 占位符样式 */
  .base-cell-comp-field-mobile .placeholder {
    color: rgba(0, 0, 0, 0.25);
    text-overflow: ellipsis;
    width: 100%;
  }

  /** 标签样式 */
  .base-cell-comp-field-mobile .tag {
    display: flex;
    align-items: center;
    line-height: 18px;
    padding: 2px 6px;
    border-radius: 4px;
    background: #f5f5f5;
  }

  /** 后缀图标样式 */
  .base-cell-comp-field-mobile .suffix-icon {
    align-self: center;
    margin-left: 4px;
    color: rgba(0, 0, 0, 0.25);
    line-height: 1;
    pointer-events: none;
  }
</style>
