<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :annotationInfo="annotationInfo"
    :callback="readonlyCallback"
  >
    <base-cell-comp-field
      v-model:value="value"
      :show-suffix-icon="true"
      :show-disabled="showDisabled"
      :real-field-id="realFieldId"
      :placeholder="placeholder || '请选择'"
      :callback="readonlyCallback"
    >
      <template #suffixIcon>
        <i class="iconfont icon-pad_arrow_down text-14px"></i>
      </template>
    </base-cell-comp-field>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-select-render">
  import { computed, reactive, watch } from 'vue';
  import { isNil } from 'lodash-es';
  import { EntityModelCategoryEnum, FIELD_TYPE } from '@gct/runtime';
  import {
    useNocodeFormWidget,
    useWidgetStaticAttrs,
    PlatformEnum,
    renderUtils,
    type ISelect,
  } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import BaseCellCompField from '../../_common_/base-cell-comp-field/base-cell-comp-field.vue';
  import { postModelComprehensiveQueryRefDataByIdsByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{
    modelValue?: string;
    widget: ISelect;
    formData: any;
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const {
    field,
    fieldType,
    modelKey,
    refModelKey,
    showDisabled,
    placeholder,
    dataRelationShip,
    options: initialOptions,
    loadFinished2Options,
  } = useWidgetStaticAttrs(props.widget);

  const multiple = fieldType === FIELD_TYPE.REF_MULTI || fieldType === FIELD_TYPE.DEVICE_REF_MULTI;

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

  const value = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, multiple);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, multiple));
    },
  });

  watch(
    () => value.value,
    async () => {
      if (!loadFinished2Options) {
        await checkInitialValue();
      }

      if (!isNil(value.value)) {
        const newLb = JSON.stringify(
          renderUtils.getSelectOptions({
            value: value.value,
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

  /** 判断是否存在 不存在需要拼接 */
  async function checkInitialValue() {
    const values = multiple ? value.value ?? [] : [value.value].filter((v) => !isNil(v));

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

  const readonlyCallback = (val) => {
    if (dataRelationShip?.platformType === PlatformEnum.INTEGRATION_PAAS_DP) {
      return val;
    }
    return renderUtils.getLabJsonValue(props.formData, field);
  };
</script>
