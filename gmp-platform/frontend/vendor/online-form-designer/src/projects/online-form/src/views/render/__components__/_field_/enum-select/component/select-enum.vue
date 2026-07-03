<template>
  <Select
    class="select-select"
    v-model:value="currentValue"
    :options="options"
    optionFilterProp="label"
    showSearch
    v-bind="$attrs"
    :dropdownMatchSelectWidth="false"
  />
</template>

<script setup lang="ts" name="SelectEnum">
  import { computed } from 'vue';
  import { Select } from 'ant-design-vue';

  const props = defineProps<{ value?: any; options: any }>();

  const emit = defineEmits(['update:value']);

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(value) {
      emit('update:value', value);
    },
  });
</script>

<style scoped lang="less">
  .select-select {
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

    &.ant-select-multiple {
      :deep(.ant-select-selection-item) {
        line-height: 22px;
        padding-right: 4px;
        margin-top: -1px;
        margin-bottom: 1px;
      }
      :deep(.ant-select-selection-search) {
        margin-inline-start: 0;
      }
      :deep(.ant-select-selection-placeholder) {
        left: 2px;
      }
    }
  }
</style>
