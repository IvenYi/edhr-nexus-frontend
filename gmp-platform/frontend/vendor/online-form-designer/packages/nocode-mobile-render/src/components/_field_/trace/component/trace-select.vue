<template>
  <NocodeField
    :class="['field-select']"
    @click-input="openPopup"
    v-model="value"
    v-bind="$attrs"
    :placeholder="_placeholder"
    :label="label"
  >
    <template #label-left>
      <slot name="label-left"></slot>
    </template>
    <template v-if="props.modelValue" #input2>
      <div class="w-full flex justify-end items-center text-right">
        {{ labelValue }}
      </div>
    </template>
  </NocodeField>
</template>

<script setup lang="ts" name="trace-select">
  import { computed, reactive, defineComponent, watch, ref } from 'vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { useWidgetStaticAttrs, renderUtils } from '@gct/nocode-base';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { debounce, isNil } from 'lodash-es';
  import type { ITrace } from '@gct/nocode-base';
  import { NocodeField } from '../../../_common_';
  import { i18n } from '@mobile/locales/setupI18n';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import type { optionType } from '/@page-designer/components/widgets/mobile/__components__/listPopup/src/typing';
  import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
  import {
    getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveQueryRefDataByIdsByModelCategory,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const { t } = i18n.global;

  const searchFieldMap = {
    [FIELD_TYPE.MATERIAL_NO]: 'material_no_',
    [FIELD_TYPE.RELATED_LOT_NO]: 'related_lot_no_',
    [FIELD_TYPE.SCRAP_MATERIAL_NO]: 'material_no_',
    [FIELD_TYPE.DEVICE]: 'name_',
    [FIELD_TYPE.MFG_ORDER]: 'code_',
  };

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      multiple: boolean;
      widget: ITrace;
      formData: Object;
      label?: string;
      placeholder?: string;
    }>(),
    {
      multiple: false,
    },
  );

  const emit = defineEmits(['update:modelValue', 'change']);

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  const _placeholder = computed(() => {
    return props.placeholder ?? t('sys.pleaseSelectSth', { sth: props.label ?? '' });
  });

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

  /** 下拉组件的选项 */
  const popupSelectOpts = ref<any[]>([]);
  const checkedOpts = ref<any[]>([]);

  const labelValue = computed(() => {
    return checkedOpts.value
      .filter((i) => selectedIds.value.includes(i.value))
      .map((i) => i.label)
      .join(',');
  });

  const selectedIds = computed<any>({
    get() {
      let value = props.modelValue;
      if (!value) {
        return [];
      }
      return props.multiple ? value.split(',').filter((i) => i) : [value];
    },
    set(value?: string[] | string) {
      if (!value) {
        emit('update:modelValue', undefined);
      }
      emit(
        'update:modelValue',
        props.multiple ? (value as string[])!.join(',') : (value as string),
      );
    },
  });

  async function fetch(params: { keyword?: string; pageNo: number; pageSize: number }) {
    const queryName = `${searchFieldMap[fieldType]}.like`;
    if (
      [FIELD_TYPE.MATERIAL_NO, FIELD_TYPE.RELATED_LOT_NO, FIELD_TYPE.SCRAP_MATERIAL_NO].includes(
        fieldType,
      )
    ) {
      const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'gct_edhr_instance',
          bsKey: 'listByPage',
        },
        {
          query: {
            'instance_status_.ne': 'ARCHIVED',
            [queryName]: params.keyword ? params.keyword : undefined,
          },
          pageSize: props.pageSize,
          pageNo: props.pageNo,
        },
      );
      res.data = res.data?.map((i) => {
        i.__LABEL__ = i.material_no_;
        i.id_ = i.material_no_;
        return i;
      });
      return res;
    } else {
      return postModelDataQueryRefData({
        fieldKey: field,
        modelKey,
        pageSize: params.pageSize,
        pageNo: params.pageNo,
        refModelKey,
        query: { [queryName]: params.keyword },
        exp: `OR(${queryName})`,
      });
    }
  }

  /** 查询选项 */
  async function fetchOptions(params: {
    keyword?: string;
    pageNo: number;
    pageSize: number;
  }): Promise<{
    data: optionType[];
    totalPage: number;
  }> {
    const res = await fetch(params);
    console.log('res dddd', res);
    return {
      data: (res.data ?? []).map((i) => {
        return {
          label: i.__LABEL__,
          value: i.id_,
          _item: i,
        };
      }),
      totalPage: res.totalPage,
    };
  }

  /**下拉框异步请求统一入口 */
  const searchVal = ref<string>();
  async function getOptionsByQuery(
    params: {
      keyword?: string;
      pageNo?: number;
    } = {},
  ) {
    console.log('getOptionsByQuery', params);
    const { keyword, pageNo } = params;
    if (searchVal.value !== keyword) {
      popupSelectOpts.value = [];
    }
    searchVal.value = keyword;
    const res = await fetchOptions({
      keyword,
      pageNo,
      pageSize: 30,
    });
    if (!res) {
      return;
    }
    const valueList = res.data!;
    const finished = res.totalPage <= pageNo;
    valueList.forEach((i: any) => {
      if (!popupSelectOpts.value.find((j) => j.value === i.value)) {
        popupSelectOpts.value.push(i);
      }
    });
    return finished;
  }

  const { openListPopup } = createListPopup({
    api: getOptionsByQuery,
    options: popupSelectOpts,
    title: '选择',
    remote: true,
    lazy: true,
    showSearch: true,
    multiple: props.multiple,
    selectedOptions: checkedOpts,
  })!;

  const openPopup = () => {
    openListPopup({
      ids: props.multiple ? selectedIds.value : selectedIds.value[0],
      callback({ a, checkOptions }) {
        console.log('popup close', a, checkOptions);
        selectedIds.value = a;
        checkedOpts.value = [...checkOptions];
        emit('change');
      },
    });
  };

  async function getOptionByIds(ids: string[]) {
    if (
      [FIELD_TYPE.MATERIAL_NO, FIELD_TYPE.RELATED_LOT_NO, FIELD_TYPE.SCRAP_MATERIAL_NO].includes(
        fieldType,
      )
    ) {
      return props.modelValue
        ? [
            {
              label: props.modelValue,
              value: props.modelValue,
            },
          ]
        : [];
    } else {
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
  }

  watch(
    () => selectedIds.value,
    async (val) => {
      const opts = [...popupSelectOpts.value, ...checkedOpts.value];
      const ids = val;
      if (ids.length && ids.some((e) => !opts.find((f) => f.value === e))) {
        checkedOpts.value = await getOptionByIds(ids);
      }
    },
    { immediate: true },
  );
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
    :deep(.ant-select-arrow) {
      right: 4px;
    }

    :deep(.ant-select-clear) {
      right: 4px;
    }

    &.ant-select-disabled {
      .ant-select-selector {
        background: #f5f5f5;
      }
    }
  }
</style>
