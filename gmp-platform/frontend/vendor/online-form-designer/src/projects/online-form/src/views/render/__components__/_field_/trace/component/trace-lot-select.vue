<template>
  <a-popover
    v-model:visible="open"
    trigger="click"
    :placement="popoverPlacement"
    overlayClassName="vxe-table--ignore-clear gct-edhr-custom-popover"
    :overlayStyle="{ maxHeight: wrapperHeight + 32 + 'px', overflow: 'visible' }"
    :autoAdjustOverflow="autoAdjustOverflow"
  >
    <template #content>
      <lot-select-table
        ref="selectTableRef"
        :widget="widget"
        :modelValue="value"
        :extraQuery="newQueryDataRef"
        :wrapperHeight="wrapperHeight"
        @change-select="onChangeSelect"
      />
    </template>

    <a-auto-complete
      :class="['cell-trace-lot-autocomplete', showRequired && 'is-show-required', realFieldId]"
      ref="autoCompleteRef"
      v-model:value="currentValue"
      :options="state.data"
      :disabled="showDisabled"
      v-bind="autoCompleteAttrs"
      @search="searchTable"
      @change="emit('change')"
      @click.capture="openTreeModal"
    />
  </a-popover>
</template>

<script setup lang="ts" name="trace-lot-autocomplete">
  import { computed, reactive, ref, watch } from 'vue';
  import { useWidgetStaticAttrs } from '@gct/nocode-base';
  import { debounce } from 'lodash-es';
  import LotSelectTable from '../common/lot-select-table.vue';
  import type { AutoCompleteProps } from 'ant-design-vue';
  import type { ITrace } from '@gct/nocode-base';
  import { useWrapperHeight } from '../composables/usePopoverWrapperHeight';

  const props = defineProps<{
    value?: string;
    widget: ITrace;
    formData: Object;
    realFieldId?: string;
  }>();

  const emit = defineEmits(['update:value', 'change']);

  const { placeholder, showRequired, showDisabled, newQueryDataRef } = useWidgetStaticAttrs(
    props.widget,
  );

  const open = ref(false);
  const selectTableRef = ref<InstanceType<typeof LotSelectTable> | null>(null);
  const autoCompleteRef = ref();

  const { popoverPlacement, wrapperHeight, autoAdjustOverflow, calculateWrapperHeight } =
    useWrapperHeight(autoCompleteRef);

  const state = reactive<{
    data: Array<{ label: string; value: string }>;
  }>({
    data: [],
  });

  const currentValue = computed<string | undefined>({
    get: () => props.value,
    set: (val) => emit('update:value', val),
  });

  const autoCompleteAttrs = computed<AutoCompleteProps>(() => ({
    placeholder: placeholder || $t('sys.edhr.inputOrSelect'),
    allowClear: true,
    dropdownMatchSelectWidth: 180,
    dropdownClassName: 'gct-project-select-dropdown vxe-table--ignore-clear',
    filterOption: false,
    open: false,
    showArrow: false,
  }));

  const searchTable = debounce((keyword: string) => {
    selectTableRef.value?.search?.(keyword);
  }, 300);

  watch(
    () => newQueryDataRef.value,
    () => {
      // 搜索条件变更时触发一次查询
      searchTable();
    },
  );

  function openTreeModal(event: Event) {
    calculateWrapperHeight();
    if (open.value) {
      event.stopPropagation();
    }
  }

  function onChangeSelect(record: any) {
    const { __VALUE__, __SHOW_LABEL__ } = record || {};
    // 设置当前下拉数据为选中项
    state.data = [
      {
        label: __SHOW_LABEL__,
        value: __VALUE__,
      },
    ];

    if (__VALUE__) {
      emit('update:value', __VALUE__);
    } else {
      emit('update:value', null);
    }

    open.value = false;
    emit('change', record);
  }

  // 暴露方法给外部调用
  defineExpose({
    getOptions: () => state.data,
  });
</script>

<style scoped lang="less">
  .cell-trace-lot-autocomplete {
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
        right: 16px;
        left: 2px;

        > input {
          height: 28px;
        }
      }

      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        padding-right: 12px;
        font-size: var(--size, 12px);
        line-height: 26px;
        text-align: left;
      }
    }

    :deep(.ant-select-arrow),
    :deep(.ant-select-clear) {
      right: 4px;
    }

    &.ant-select-disabled {
      .ant-select-selector {
        background: #f5f5f5;
      }
    }
  }

  :deep(.gct-edhr-custom-popover) {
    .ant-popover-inner {
      overflow: visible;
    }

    .ant-popover-inner-content {
      overflow: visible;
    }
  }
</style>
