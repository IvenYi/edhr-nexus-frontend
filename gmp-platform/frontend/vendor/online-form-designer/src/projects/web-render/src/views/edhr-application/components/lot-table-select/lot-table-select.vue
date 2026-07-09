<template>
  <a-popover
    v-model:visible="open"
    trigger="click"
    placement="bottomLeft"
    overlayClassName="vxe-table--ignore-clear gct-edhr-custom-popover"
    @visibleChange="visibleChange"
    :autoAdjustOverflow="autoAdjustOverflow"
  >
    <template #content>
      <lot-table-dropdown
        ref="selectTableRef"
        :modelValue="value"
        :rowSelectionMode="rowSelectionMode"
        :fetch="getLotAsyncOptions"
        :tableColumns="tableColumns"
        :pageAttr="pageAttr"
        @change-select="onChangeSelect"
      />
    </template>

    <a-select
      v-if="variant === 'select'"
      class="lot-table-select"
      ref="selectRef"
      v-model:value="currentValue"
      style="width: 100%"
      :searchValue="searchValue"
      :options="state.data"
      v-bind="compAttrs"
      @search="searchTable"
      @deselect="onDeselect"
      @click.capture="openTreeModal"
    >
      <template #clearIcon>
        <close-circle-filled @mousedown.stop="onClear" @click.stop />
      </template>
    </a-select>

    <a-auto-complete
      v-else
      v-model:value="currentValue"
      style="width: 100%"
      :options="state.data"
      v-bind="compAttrs"
      @search="searchTable"
      @click.capture="openTreeModal"
    />
  </a-popover>
</template>

<script setup lang="ts" name="lot-table-select">
  import { computed, reactive, ref, watch } from 'vue';
  import { debounce, isNil, uniqBy, uniq } from 'lodash-es';
  import LotTableDropdown from './lot-table-dropdown.vue';
  import { useAsyncOptions } from './hooks';

  const props = withDefaults(
    defineProps<{
      value?: string | string[];
      placeholder?: string;
      /** 是否忽略封存状态 */
      ignoreArchived?: boolean;
      disabled?: boolean;
      variant?: 'select' | 'auto';
      rowSelectionMode?: 'single' | 'multiple';
      // 兼容【DHR变更】
      tableColumns?: string[];
      customFetch?: Function;
      pageAttr?: any;
    }>(),
    {
      placeholder: $t('sys.inputText'),
      ignoreArchived: true,
      disabled: false,
      variant: 'auto',
      rowSelectionMode: 'single',
    },
  );

  const emit = defineEmits(['update:value']);
  const autoAdjustOverflow = document.body.clientHeight > 800;
  const open = ref(false);
  const searchValue = ref<string | undefined>(undefined);
  const selectTableRef = ref<InstanceType<typeof LotTableDropdown> | null>(null);
  const selectRef = ref();

  const state = reactive<{
    data: Array<{ label: string; value: string }>;
  }>({
    data: [],
  });

  const { getLotAsyncOptions, fetchMissingOption } = useAsyncOptions({
    ignoreArchived: props.ignoreArchived,
    customFetch: props.customFetch,
  });

  const isMultiple = computed(() => props.rowSelectionMode === 'multiple');

  const currentValue = computed<string | string[] | undefined>({
    get: () => props.value,
    set: (val) => emit('update:value', val),
  });

  const compAttrs = computed(() => ({
    placeholder: props.placeholder,
    mode: isMultiple.value ? 'multiple' : undefined,
    allowClear: true,
    showSearch: true,
    filterOption: false,
    disabled: props.disabled,
    open: isMultiple.value ? true : false,
    dropdownClassName: isMultiple.value ? 'hidden' : '',
    showArrow: false,
  }));

  async function checkInitialValue(value?: string | string[] | null) {
    const val = value ?? currentValue.value;

    const values = isMultiple.value
      ? (val ?? []).filter((v) => !isNil(v))
      : [val].filter((v) => !isNil(v));

    if (Array.isArray(values) && values.length === 0) {
      return;
    }
    const missingIds = values.filter((v) => !state.data?.some((o) => o.value === v));

    if (!missingIds.length) return;

    if (typeof fetchMissingOption === 'function') {
      const remoteChildren = await fetchMissingOption(values);
      if (remoteChildren && remoteChildren.length) {
        state.data = [...remoteChildren, ...(state.data || [])];
      }
    }
  }

  watch(
    () => currentValue.value,
    async (newVal) => {
      await checkInitialValue(newVal);
    },
    { immediate: true },
  );

  const searchTable = debounce((keyword: string) => {
    if (props.variant === 'select') {
      searchValue.value = keyword;
    }
    selectTableRef.value?.search?.(keyword);
  }, 300);

  const onClearSearchValue = () => {
    if (searchValue.value && String(searchValue.value).trim()) {
      searchValue.value = undefined;
      selectTableRef.value?.search?.('');
      return false;
    }
    return true;
  };

  const onClear = () => {
    if (onClearSearchValue()) {
      if (isMultiple.value) {
        emit('update:value', []);
        selectTableRef.value?.getRef?.()?.getRef?.()?.clearCheckboxRow?.();
      } else {
        emit('update:value', null);
      }
    }
  };

  function visibleChange(visible) {
    if (!visible && props.variant === 'select') {
      onClearSearchValue();
    }
  }

  function onDeselect(value) {
    const data = selectTableRef.value?.getRef?.()?.getRef?.()?.data;
    const row = data.find((i) => i.__VALUE__ === value);
    selectTableRef.value?.getRef?.()?.getRef?.()?.toggleCheckboxRow(row);
  }

  function onChangeSelect(record: any, isChecked?: boolean) {
    if (isMultiple.value) {
      const newData = record?.map(({ __VALUE__, __SHOW_LABEL__ }) => {
        return {
          label: __SHOW_LABEL__,
          value: __VALUE__,
        };
      });
      state.data = uniqBy([...newData, ...(state.data || [])], 'value');

      let values = [...(currentValue.value || [])];
      const recordValues = record.map((r) => r.__VALUE__);

      if (isChecked) {
        values = uniq([...values, ...recordValues]);
      } else {
        values = values.filter((val) => !recordValues.includes(val));
      }
      emit('update:value', values);
      onClearSearchValue();
    } else {
      const { __VALUE__, __SHOW_LABEL__ } = record || {};
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
      onClearSearchValue();
    }
  }

  function openTreeModal(event: Event) {
    if (open.value) {
      selectRef.value?.focus();
      const target = event.target as HTMLElement;
      if (target.closest('.ant-select-selection-item-remove')) {
        // 点击了移除图标，不阻止传播
        return;
      }
      event.stopPropagation();
    }
  }
</script>

<style scoped lang="less">
  .lot-table-select {
    :deep(.ant-select-selector) {
      .ant-select-selection-search {
        z-index: 1;
      }
    }
  }
</style>
