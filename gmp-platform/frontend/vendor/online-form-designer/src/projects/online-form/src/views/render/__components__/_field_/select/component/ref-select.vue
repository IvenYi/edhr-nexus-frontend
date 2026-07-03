<template>
  <Select
    :class="['cell-ref-select', showRequired && 'is-show-required', realFieldId]"
    v-model:value="currentValue"
    :options="state.data"
    :disabled="showDisabled"
    v-bind="separatorAttr"
    @click="handleClick"
    @search="handleSearch"
    @change="changeSelect"
  >
    <template #dropdownRender="{ menuNode: menu }">
      <v-nodes :vnodes="menu" />
      <div
        class="search-more"
        v-if="state.data.length && !loadFinished2Options && !state.hasSearched"
        >{{ $t('sys.onlineForm.searchForMore') }}</div
      >
    </template>
    <template v-if="state.fetching" #notFoundContent>
      <div class="h-120px">
        <a-spin size="small" />
      </div>
    </template>
  </Select>
</template>

<script setup lang="ts" name="ref-select">
  import { computed, reactive, defineComponent, watch, nextTick } from 'vue';
  import { Select, message } from 'ant-design-vue';
  import { useWidgetStaticAttrs, renderUtils, refUtils } from '@gct/nocode-base';
  import { EntityModelCategoryEnum, FIELD_TYPE } from '@gct/runtime';
  import { debounce, isNil } from 'lodash-es';
  import { postModelComprehensiveQueryRefDataByIdsByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import type { SelectProps } from 'ant-design-vue';
  import type { ISelect } from '@gct/nocode-base';

  const VNodes = defineComponent({
    props: {
      vnodes: {
        type: Object,
        required: true,
      },
    },
    render() {
      return this.vnodes;
    },
  });

  const props = defineProps<{
    value?: string;
    widget: ISelect;
    formData: Object;
    realFieldId?: string;
  }>();

  const emit = defineEmits(['update:value']);

  const {
    field,
    modelKey,
    refModelKey,
    placeholder,
    fieldType,
    showRequired,
    showDisabled,
    options: initialOptions,
    loadFinished2Options,
    queryCondition,
    newQueryData,
  } = useWidgetStaticAttrs(props.widget);

  const { quickSearchField, quickSearchExp, autofillRules } = props.widget.props;

  const state = reactive<{
    /** 标记是否进行过搜索 */
    hasSearched: boolean;
    /** 下拉列表数据 */
    data: any;
    /** 请求loading */
    fetching: boolean;
  }>({
    hasSearched: false,
    data: initialOptions,
    fetching: false,
  });

  const isRef = fieldType === FIELD_TYPE.REF || fieldType === FIELD_TYPE.REF_MULTI;
  const isReason =
    fieldType === FIELD_TYPE.NOT_GOOD_REASON || fieldType === FIELD_TYPE.SCRAP_REASON;
  const isDevice = fieldType === FIELD_TYPE.DEVICE_REF || fieldType === FIELD_TYPE.DEVICE_REF_MULTI;
  const isGroup = fieldType === FIELD_TYPE.NOT_GOOD_GROUP || fieldType === FIELD_TYPE.SCRAP_GROUP;
  const multiple = fieldType === FIELD_TYPE.REF_MULTI || fieldType === FIELD_TYPE.DEVICE_REF_MULTI;
  const isWarehouseFields = ['warehouse_id_', 'location_id_'].includes(field);
  const defaultDeviceSearchField = ['name_.like', 'asset_number_.like'];
  const defaultDeviceSearchExp = 'OR(name_.like,asset_number_.like)';

  const searchField =
    isDevice && !quickSearchField?.length ? defaultDeviceSearchField : quickSearchField;
  const searchExp = isDevice && !quickSearchExp ? defaultDeviceSearchExp : quickSearchExp;

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val ? val : null);
    },
  });

  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder || $t('sys.chooseText'),
      dropdownMatchSelectWidth: 180,
      mode: multiple ? 'multiple' : undefined,
      maxTagCount: 'responsive',
      maxTagTextLength: 2,
      dropdownClassName: 'gct-project-select-dropdown vxe-table--ignore-clear',
      allowClear: true,
      showSearch:
        fieldType !== FIELD_TYPE.ROUTING_OPERATION &&
        !isWarehouseFields &&
        ((isReason && queryCondition?.clsReasonDataLinkStatus) || !searchField?.length)
          ? false
          : true, // 数据联动不支持搜索功能
      defaultActiveFirstOption: false,
      filterOption: false,
      notFoundContent: undefined,
    };
    return attr;
  });

  watch(
    () => currentValue.value,
    async () => {
      // if (!loadFinished2Options) {
      //   await checkInitialValue();
      // }
      await checkInitialValue();

      if (!isNil(currentValue.value)) {
        const newLb = JSON.stringify(
          renderUtils.getSelectOptions({
            value: currentValue.value,
            multiple: multiple,
            options: state.data,
            key: 'label',
          }).labels,
        );
        const oldLb = props.formData[`${field}_lb_`];
        if (oldLb !== newLb) {
          props.formData[`${field}_lb_`] = newLb;
        }
      }
    },
    {
      immediate: true,
    },
  );

  const buildQueryParams = ({ keyword, varValue }: { keyword?: string; varValue?: any }) => {
    // 构建变量查询数据
    const buildVarQueryData = () => {
      if (!queryCondition?.dataFilterVarQueryData) return {};
      return Object.keys(queryCondition.dataFilterVarQueryData).reduce((acc, key) => {
        const fieldPath = queryCondition.dataFilterVarQueryData[key].split(':')?.[1];
        acc[key] = props.formData[fieldPath] || undefined;
        return acc;
      }, {});
    };

    const params: any = {};
    const varQueryData = buildVarQueryData();

    if (isWarehouseFields) {
      // 非引用字段的查询参数
      const queryName = `name_.like`;
      Object.assign(params, {
        exp: `OR(${queryName})`,
        queryData: {
          [queryName]: keyword,
          ...(newQueryData || {}),
          ...(queryCondition?.dataFilterFixedQueryData || {}),
          'warehouse_id_.eq': field === 'location_id_' ? varValue : undefined,
        },
      });
    } else if (isRef || isDevice) {
      // 引用字段的查询参数
      const quickQueryData = keyword
        ? refUtils.getQuickQueryDataByKeyWord({ quickSearchField: searchField, keyword })
        : {};
      Object.assign(params, {
        exp: refUtils.splicingExp(queryCondition?.dataFilterExp, keyword ? searchExp : ''),
        queryData: {
          ...(queryCondition?.dataFilterFixedQueryData || {}),
          ...varQueryData,
          ...quickQueryData,
        },
      });
    } else if (isReason && queryCondition?.clsReasonDataLinkStatus) {
      Object.assign(params, {
        dataIds: varValue,
        refModelChain: queryCondition?.clsReasonDataLinkInfo?.refModelChain,
        isLinkQuery: true,
      });
    } else {
      // 非引用字段的查询参数
      const queryName = `name_.like`;
      Object.assign(params, {
        exp: `OR(${queryName})`,
        queryData: { [queryName]: keyword, ...(newQueryData || {}) },
      });
    }

    return params;
  };

  async function loadOptions({
    pageSize,
    keyword,
    varValue,
  }: {
    pageSize: number;
    keyword?: string;
    varValue?: any;
  }) {
    state.fetching = true;
    try {
      const params = buildQueryParams({ keyword, varValue });
      const res = await renderUtils.requestRefOptions({
        modelKey,
        fieldKey: field,
        refModelKey,
        isRdo: false,
        ...params,
        pageSize,
      });
      state.data = res.options || [];
    } catch (e) {
      console.error(e);
      state.data = [];
    } finally {
      state.fetching = false;
      if (!keyword) state.hasSearched = false;
    }
  }

  // 数据联动
  queryCondition?.dataFilterVarFields?.forEach((varField) => {
    watch(
      () => props.formData[varField],
      async (newVal) => {
        if (isRef || isReason) {
          console.log(`字段 ${varField} 变化:`, newVal);
          await loadOptions({ pageSize: 100, varValue: newVal });
        }
      },
      {
        immediate: true,
      },
    );
  });

  watch(
    () => props.formData['warehouse_id_'],
    async (val) => {
      await loadOptions({ pageSize: 99999, varValue: val });
    },
  );

  const handleSearch = (keyword?: string) => {
    state.hasSearched = true;
    state.fetching = true;
    state.data = [];
    debounceSearch(keyword);
  };

  const debounceSearch = debounce(async (keyword) => {
    if (keyword && keyword.trim()) {
      await loadOptions({ pageSize: 9999, keyword });
    }

    if (!keyword) {
      await checkInitialValue();
    }
  }, 300);

  /** 判断是否存在 不存在需要拼接 */
  async function checkInitialValue() {
    const values = multiple
      ? (currentValue.value ?? [])
      : [currentValue.value].filter((v) => !isNil(v));

    const missingIds = values.filter((v) => !initialOptions.some((o) => o.value === v));

    if (missingIds.length) {
      const remoteOptions = await getOptionByIds(missingIds);
      state.data = [...remoteOptions, ...initialOptions];
    } else {
      state.data = initialOptions;
    }

    state.hasSearched = false;
  }

  async function getOptionByIds(ids) {
    const { data = [] } =
      (await postModelComprehensiveQueryRefDataByIdsByModelCategory(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        {
          fieldKey: field,
          modelKey, // 模型 key
          ids, // id 集合
          includeDeleted: true, // 包含删除的数据
          refModelKey, // 引用的模型key
        },
      )) || ({} as any);
    //deleted_ 表示被软删除的数据
    return (
      data?.map((i) => {
        return { disabled: !!i.deleted_, label: i.__LABEL__, value: i.id_ || i.id, _item: i };
      }) ?? []
    );
  }

  async function changeSelect(v, info) {
    // 数据填充
    if (autofillRules && autofillRules.length !== 0) {
      await nextTick();
      autofillRules.forEach(({ fromField, toField }) => {
        props.formData[toField!] = info?._item?.[fromField];
      });
    }

    if (isGroup && queryCondition?.clsGroupDataLinkStatus) {
      props.formData[queryCondition?.clearFieldId] = null;
    }
    if ('warehouse_id_' === field) {
      props.formData['location_id_'] = '';
    }
  }

  async function handleClick() {
    if ((isReason && queryCondition?.clsReasonDataLinkStatus) || field === 'location_id_') {
      const config = queryCondition?.clsReasonDataLinkInfo;
      if (config && !props.formData[config.value]) {
        message.error(
          $t('sys.pageDesigner.pleaseSelectFirstSth', {
            sth: config.label,
          }),
        );
        return;
      }
    }
  }

  defineExpose({
    getOptions: () => {
      return state.data;
    },
  });
</script>

<style scoped lang="less">
  .search-more {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid #e9e9e9;
    color: rgb(0 0 0 / 45%);
    font-size: 14px;
    line-height: 24px;
  }

  .cell-ref-select {
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

    :deep(.ant-select-arrow) {
      right: 4px;
    }

    :deep(.ant-select-clear) {
      right: 4px;
    }

    &.ant-select-multiple {
      :deep(.ant-select-selection-item) {
        margin-top: -1px;
        margin-bottom: 1px;
        padding-right: 4px;
        line-height: 22px;
      }

      :deep(.ant-select-selection-search) {
        margin-inline-start: 0;
      }

      :deep(.ant-select-selection-placeholder) {
        left: 2px;
      }
    }

    &.ant-select-disabled {
      .ant-select-selector {
        background: #f5f5f5;
      }
    }
  }
</style>
