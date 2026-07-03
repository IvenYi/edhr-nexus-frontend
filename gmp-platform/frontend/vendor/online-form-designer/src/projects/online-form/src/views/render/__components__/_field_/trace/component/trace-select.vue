<template>
  <ParseSelect
    :class="['cell-trace-select', showRequired && 'is-show-required', realFieldId]"
    v-model:value="currentValue"
    :options="state.data"
    :disabled="showDisabled"
    v-bind="separatorAttr"
    @search="handleSearch"
    @change="changeSelect"
    :formData="formData"
    :widget="widget"
    :allowSwitch="allowSwitch"
    v-model:mode="mode"
    @scan="handleEnter"
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
  </ParseSelect>
</template>

<script setup lang="ts" name="trace-select">
  import { computed, reactive, defineComponent, watch, nextTick } from 'vue';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { useWidgetStaticAttrs, renderUtils } from '@gct/nocode-base';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { debounce, isNil } from 'lodash-es';
  import { postModelComprehensiveQueryRefDataByIdsByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { message, type SelectProps } from 'ant-design-vue';
  import type { ITrace } from '@gct/nocode-base';
  import ParseSelect from '../common/parse-select.vue';
  import { useRuleProps } from '../utils/use-rule-props';

  const searchFieldMap = {
    [FIELD_TYPE.DEVICE]: 'name_',
    [FIELD_TYPE.MFG_ORDER]: 'code_',
  };

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
    widget: ITrace;
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
  } = useWidgetStaticAttrs(props.widget);
  const searchField = searchFieldMap[fieldType] || 'name_';
  const { autofillRules } = props.widget.props;

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
      dropdownClassName: 'gct-project-select-dropdown vxe-table--ignore-clear',
      allowClear: true,
      showSearch: true,
      defaultActiveFirstOption: false,
      filterOption: loadFinished2Options ? onFilterOption : false,
      notFoundContent: undefined,
    };
    return attr;
  });

  function onFilterOption(input: string, option: any) {
    if (option.label) {
      const options = option._item;
      const label = option?.__LABEL__ || options[searchField];
      const code = options['code_'];
      const keyword = input.toLowerCase();
      return [label, code].some((v) =>
        String(v ?? '')
          .toLowerCase()
          .includes(keyword),
      );
    }
    return false;
  }

  watch(
    () => currentValue.value,
    async () => {
      if (!loadFinished2Options) {
        await checkInitialValue();
      }

      if (!isNil(currentValue.value)) {
        const newLb = JSON.stringify(
          renderUtils.getSelectOptions({
            value: currentValue.value,
            multiple: false,
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

  const handleSearch = (keyword?: string) => {
    if (loadFinished2Options) return;
    state.hasSearched = true;
    state.fetching = true;
    state.data = [];
    debounceSearch(keyword);
  };

  const debounceSearch = debounce(async (keyword) => {
    try {
      if (keyword && keyword.trim()) {
        // 本地过滤
        // const localResults = initialOptions.filter((opt) => {
        //   if (opt.label) {
        //     return opt.label.toLowerCase().includes(keyword.toLowerCase());
        //   }
        //   return false;
        // });
        // if (localResults.length > 0) {
        //   state.data = localResults;
        // } else {
        // }
        const queryName = `${searchField}.like`;
        const codeName = 'code_.like';
        const res = await renderUtils.requestRefOptions({
          modelKey,
          fieldKey: field,
          refModelKey,
          isRdo: false,
          exp: `OR(${queryName},${codeName})`,
          queryData: {
            [queryName]: keyword,
            [codeName]: keyword,
            operating_state_:
              _gct?.store?.appInfo?.suiteKey === 'eDHR' && fieldType !== FIELD_TYPE.MFG_ORDER
                ? true
                : undefined,
          },
          pageSize: 30,
        });
        state.data = res.options ?? [];
      }
      if (!keyword) {
        await checkInitialValue();
      }
    } catch (error) {
      console.error('请求失败:', error);
    } finally {
      state.fetching = false;
    }
  }, 300);

  /** 判断是否存在 不存在需要拼接 */
  async function checkInitialValue() {
    if (currentValue.value && !initialOptions.some((o) => o.value === currentValue.value)) {
      const remoteOption = await getOptionByIds([currentValue.value]);
      state.data = [...remoteOption, ...initialOptions];
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
  }

  const { allowSwitch, mode, handleEnter } = useRuleProps({
    props,
    selectByCode: async (code) => {
      const res = await renderUtils.requestRefOptions({
        modelKey,
        fieldKey: field,
        refModelKey,
        isRdo: false,
        exp: `OR(code_.eq)`,
        queryData: {
          ['code_.eq']: code,
          operating_state_:
            _gct?.store?.appInfo?.suiteKey === 'eDHR' && fieldType !== FIELD_TYPE.MFG_ORDER
              ? true
              : undefined,
        },
        pageSize: 30,
      });
      console.log('res', res);
      if (!res.options?.[0]) {
        message.error($t('sys.onlineForm.noCorrespondingDataFound'));
        return false;
      }
      const info = res.options[0];
      currentValue.value = info.value;
      changeSelect(info.value, info);
      return true;
    },
  });

  defineExpose({
    getOptions: () => {
      return state.data;
    },
  });
</script>

<style scoped lang="less">
  .search-more {
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 24px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    border-top: 1px solid #e9e9e9;
    margin-top: 4px;
    padding-top: 4px;
  }

  .cell-trace-select {
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

    &.ant-select-disabled {
      .ant-select-selector {
        background: #f5f5f5;
      }
    }
  }
</style>
