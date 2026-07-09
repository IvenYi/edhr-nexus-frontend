<template>
  <Select
    class="cell-input-number-select"
    v-model:value="currentValue"
    :disabled="showDisabled"
    :dropdownMatchSelectWidth="false"
    v-bind="separatorAttr"
  />
</template>

<script setup lang="ts" name="CellInputNumberSelect">
  import { computed, reactive } from 'vue';
  import { Select } from 'ant-design-vue';

  import type { IInputNumber } from '@gct/nocode-base';

  const props = defineProps<{
    value?: string;
    widget: IInputNumber;
    showDisabled: boolean;
    showRequired: boolean;
    realFieldId: string;
  }>();

  const { placeholder, optionString } = reactive(props.widget.props);

  const emit = defineEmits(['update:value']);

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', Number(val));
    },
  });

  const separatorAttr = computed(() => {
    const cmpClass: string[] = [props.showRequired ? 'is-show-required' : '', props.realFieldId];

    return {
      placeholder,
      options: optionString
        ? optionString.split(',').map((d) => {
            return {
              label: d,
              value: d,
            };
          })
        : [],
      allowClear: true,
      class: cmpClass,
    };
  });
</script>

<style scoped lang="less">
  .cell-input-number-select {
    width: var(--cmp-width, 100%);
    min-width: 30px;
    vertical-align: middle;
    :deep(.ant-select-selector) {
      height: 28px;
      padding: 0 2px;
      border-radius: 2px !important;

      border-color: var(--required-border-color, #e9e9e9);
      background-color: var(--required-background-color, transparent);
      &:hover {
        border-color: var(--required-border-hover-color, var(--ant-primary-color));
      }

      .ant-select-selection-search {
        left: 2px;
        right: 16px;
        > input {
          height: 28px;
        }
      }
      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 26px;
        padding-right: 12px;
        font-size: var(--size, 12px);
        text-align: left;
      }
    }
    :deep(.ant-select-arrow) {
      right: 4px;
    }

    :deep(.ant-select-clear) {
      right: 4px;
    }
  }
</style>
