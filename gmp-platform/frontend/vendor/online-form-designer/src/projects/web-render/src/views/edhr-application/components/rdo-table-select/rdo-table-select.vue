<template>
  <a-popover
    v-model:visible="open"
    trigger="click"
    placement="bottomLeft"
    overlayClassName="vxe-table--ignore-clear gct-edhr-custom-popover"
    @visibleChange="visibleChange"
  >
    <template #content>
      <rdo-table-dropdown
        ref="selectTableRef"
        :fetch="getRdoAsyncOptions"
        :modelValue="currentValue"
        :parentToDefault="parentToDefault"
        @change-select="onChangeSelect"
      />
    </template>
    <a-select
      class="rdo-table-select"
      v-model:value="currentValue"
      style="width: 100%"
      :searchValue="searchValue"
      :options="state.data"
      v-bind="separatorAttr"
      @search="searchTable"
      @click.capture="openTreeModal"
    >
      <template #clearIcon>
        <close-circle-filled @mousedown.stop="onClear" @click.stop />
      </template>
    </a-select>
  </a-popover>
</template>

<script setup lang="ts" name="rdo-table-select">
  import { computed, onMounted, ref, reactive, watch, h } from 'vue';
  import { debounce } from 'lodash-es';
  import { useAsyncOptions } from './hooks';
  import RdoTableDropdown from './rdo-table-dropdown.vue';
  import type { TreeSelectProps } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      modelCategory?: string;
      modelKey: string;
      placeholder?: string;
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault?: boolean;
      /** 当产品只有一个的版本时，是否隐藏版本号 */
      hideSingleVersion?: boolean;
      disabled?: boolean;
    }>(),
    {
      placeholder: $t('sys.appDesigner.pleaseSelect'),
      modelCategory: 'entity',
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault: true,
      /** 当产品只有一个的版本时，是否隐藏版本号 */
      hideSingleVersion: true,
    },
  );

  const emit = defineEmits(['update:modelValue']);

  const open = ref(false);
  const searchValue = ref();
  const selectTableRef = ref<InstanceType<typeof RdoTableDropdown> | null>(null);

  const state = reactive<{ data: Array<{ label: string; value: string } | any> }>({
    data: [],
  });

  const { getChildrenByIds, getRdoAsyncOptions, makeFullPath } = useAsyncOptions({
    bindModelKey: props.modelKey,
    modelCategory: props.modelCategory,
    hideSingleVersion: props.hideSingleVersion,
  });

  const currentValue = computed<string | undefined>({
    get() {
      return (props.modelValue ?? undefined) as string | undefined;
    },
    set(val: string | undefined) {
      emit('update:modelValue', val ?? null);
    },
  });

  const separatorAttr = computed<TreeSelectProps>(() => ({
    placeholder: props.placeholder || $t('sys.appDesigner.pleaseSelect'),
    dropdownClassName: 'hidden',
    allowClear: true,
    showSearch: true,
    virtual: false,
    open: false,
    showArrow: false,
    filterTreeNode: false,
    disabled: props.disabled,
    optionLabelProp: 'full_path',
  }));

  watch(
    () => currentValue.value,
    async (newVal) => {
      // 补全 option
      await checkInitialValue(newVal);
    },
    { immediate: true },
  );

  const searchTable = debounce((keyword: string) => {
    searchValue.value = keyword;
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
      emit('update:modelValue', null);
    }
  };

  function visibleChange(visible) {
    if (!visible) {
      onClearSearchValue();
    }
  }

  /** 判断是否存在 不存在需要拼接 */
  async function checkInitialValue(value?: string | undefined) {
    const val = value ?? currentValue.value;
    if (!val) {
      return;
    }

    // 如果已经存在就不拉取
    if (state.data?.some((o) => o?.value === val)) return;

    const remoteChildren = await getChildrenByIds(val);

    if (remoteChildren && remoteChildren.length) {
      // 把补全的放在前面，保持可选项展示
      state.data = [...remoteChildren, ...(state.data || [])];
    }
  }

  function openTreeModal(event: Event) {
    if (open.value) {
      event.stopPropagation();
    }
  }

  function onChangeSelect(record: any) {
    const { id_, __VALUE__, __DEFAULT__, __HAS_ONE_CHILD__, __SHOW_LABEL__, __VERSION_NAME__ } =
      record || {};

    const value = __VALUE__ || id_ || null;

    let showValue;
    let showLabel;
    let showFullPath;

    const shouldHideName = props.hideSingleVersion && __HAS_ONE_CHILD__;

    // 选择了父版本
    if (__DEFAULT__) {
      if (props.parentToDefault) {
        showLabel = shouldHideName
          ? __SHOW_LABEL__
          : `${__SHOW_LABEL__}:${__DEFAULT__.__VERSION_NAME__}`;
        showFullPath = makeFullPath(showLabel);
        showValue = `${value}:${__DEFAULT__.id_}`;
      } else {
        showLabel = __SHOW_LABEL__;
        showFullPath = makeFullPath(__SHOW_LABEL__, true);
        showValue = value;
      }
    } else {
      showLabel = shouldHideName ? __SHOW_LABEL__ : `${__SHOW_LABEL__}:${__VERSION_NAME__}`;
      showFullPath = makeFullPath(showLabel);
      showValue = value;
    }

    // 设置当前下拉数据为选中项
    state.data = [
      {
        label: showLabel,
        value: showValue,
        full_path: showFullPath,
      },
    ];

    emit('update:modelValue', showValue);

    // 关闭 popover 并通知变更
    open.value = false;
    onClearSearchValue();
  }
</script>

<style scoped lang="less">
  .rdo-table-select {
    :deep(.ant-select-selector) {
      .ant-select-selection-search {
        z-index: 1;
      }
    }
  }
</style>
