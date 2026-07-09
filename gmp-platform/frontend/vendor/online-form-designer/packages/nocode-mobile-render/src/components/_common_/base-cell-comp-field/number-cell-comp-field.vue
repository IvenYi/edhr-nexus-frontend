<template>
  <div
    :class="['number-cell-comp-field-mobile', realFieldId, { 'is-disabled': showDisabled }]"
    role="textbox"
    aria-readonly="true"
  >
    <template v-if="enableStepCounter">
      <span class="step-btn">
        <i class="align-middle iconfont icon-a--"></i>
      </span>
    </template>
    <base-cell-comp-field
      v-model:value="inputValue"
      :show-disabled="showDisabled"
      :real-field-id="realFieldId"
      :placeholder="placeholder"
      :callback="callback"
      v-bind="baseExtraProps"
    >
    </base-cell-comp-field>
    <component :is="renderScript" />
    <template v-if="enableStepCounter">
      <span class="step-btn">
        <i class="align-middle iconfont icon-a-"></i>
      </span>
    </template>
  </div>
</template>

<script setup lang="ts" name="number-cell-comp-field">
  import { computed } from 'vue';
  import BaseCellCompField from './base-cell-comp-field.vue';

  const props = defineProps<{
    baseExtraProps: any;
    value?: string | number | null;
    showDisabled: boolean;
    realFieldId: string | undefined;
    placeholder?: string;
    enableStepCounter?: boolean;
    /** 角标组件 */
    renderScript?: any;
    callback?: Function;
  }>();

  const emit = defineEmits(['update:value']);

  const inputValue = computed({
    get() {
      return props.value;
    },
    set(value: string) {
      emit('update:value', value);
    },
  });
</script>

<style scoped lang="less">
  .number-cell-comp-field-mobile {
    display: inline-flex;
    width: var(--cmp-width, 100%);
    min-width: 30px;
    height: 28px;

    font-size: var(--size, 12px);
    line-height: 1.5715;
    text-align: left;
    color: rgba(0, 0, 0, 0.85);
    word-break: break-word;
    overflow: hidden;
    box-sizing: border-box;
    transition: all 0.3s linear;
  }

  .number-cell-comp-field-mobile.is-disabled {
    background: #f5f5f5 !important;
    color: rgba(0, 0, 0, 0.35);
  }

  .number-cell-comp-field-mobile .step-btn {
    display: inline-flex;
    background: #f0f0f0;
    width: 24px;
    height: 28px;
    border-radius: 2px;
    cursor: pointer;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }
</style>
