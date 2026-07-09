<template>
  <Select
    class="switch-select"
    v-model:value="currentValue"
    :options="options"
    v-bind="$attrs"
    :dropdownMatchSelectWidth="false"
  />
</template>

<script setup lang="ts" name="SelectSwitch">
  import { computed } from 'vue';
  import { Select } from 'ant-design-vue';
  import { isNil } from 'lodash-es';

  const props = defineProps<{ value?: any; options: any }>();

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
  .switch-select {
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
