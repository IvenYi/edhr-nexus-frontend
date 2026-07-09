<template>
  <Input
    :class="['cell-trace-input', showRequired && 'is-show-required', realFieldId]"
    v-model:value="currentValue"
    :disabled="showDisabled"
    :placeholder="placeholder"
  />
</template>

<script setup lang="ts" name="trace-input">
  import { computed, watch } from 'vue';
  import { Input } from 'ant-design-vue';
  import { useWidgetStaticAttrs } from '@gct/nocode-base';
  import type { ITrace } from '@gct/nocode-base';

  const props = defineProps<{
    value?: string;
    widget: ITrace;
    realFieldId?: string;
  }>();

  const emit = defineEmits(['update:value']);

  const { placeholder, showRequired, showDisabled } = useWidgetStaticAttrs(props.widget);

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });
</script>

<style scoped lang="less">
  .cell-trace-input {
    width: var(--cmp-width, 100%);
    min-width: 30px;
    height: 28px;
    font-size: var(--size, 12px);
    vertical-align: baseline;
    outline: 0;
    text-align: left;
    padding: 4px;
    border-radius: 2px;
    border: 1px solid #e9e9e9;
    transition: all 0.3s linear;

    border-color: var(--required-border-color, #e9e9e9);
    background-color: var(--required-background-color, transparent);

    &.ant-input-disabled {
      background-color: #f5f5f5;
      color: rgba(0, 0, 0, 0.25);
    }
    &:not(.ant-input-disabled):hover {
      border-color: var(--required-border-hover-color, var(--ant-primary-color));
    }
  }
</style>
