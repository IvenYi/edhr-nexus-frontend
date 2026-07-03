<template>
  <Textarea
    :class="['cell-basic-textarea-warp', showRequired && 'is-show-required', realFieldId]"
    v-model:value="currentValue"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :disabled="showDisabled"
    @focus="$attrs.onFocus"
    @blur="$attrs.onBlur"
  />
</template>

<script setup lang="ts" name="CellTextarea">
  import { computed, reactive } from 'vue';
  import { Textarea } from 'ant-design-vue';

  import type { ITextarea } from '@gct/nocode-base';

  const props = defineProps<{
    value?: string;
    widget: ITextarea;
    showDisabled: boolean;
    showRequired: boolean;
    realFieldId: string;
    placeholder: string;
  }>();
  const emit = defineEmits(['update:value']);

  const { maxlength } = reactive(props.widget.props);

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  // autoSize: { minRows: 2, maxRows: 2 },
</script>

<style scoped lang="less">
  .cell-basic-textarea-warp {
    width: var(--cmp-width) !important;
    min-width: 30px;
    padding: 4px;
    border-radius: 2px;
    font-size: var(--size, 12px);

    height: var(--cmp-height) !important;
    min-height: var(--cmp-height) !important;
    max-height: var(--cmp-height) !important;
    resize: none;

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
