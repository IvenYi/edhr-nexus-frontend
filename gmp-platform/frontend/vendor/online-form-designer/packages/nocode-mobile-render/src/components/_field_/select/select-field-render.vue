<template>
  <NocodeField
    :class="['field-select']"
    @click-input="handleClick"
    v-model="value"
    :required="showRequired"
    :disabled="showDisabled || showReadonly"
    :placeholder="placeholder"
    :label="showFieldName"
    @clearValue="onClear"
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
    <template v-if="props.modelValue" #input2>
      <div class="w-full flex justify-end items-center text-right">
        {{ labelValue }}
      </div>
    </template>
  </NocodeField>
</template>

<script setup lang="ts" name="online-form-input-field-render">
  import { computed, nextTick, reactive, ref, watch } from 'vue';
  import {
    useNocodeFormWidget,
    type ISelect,
    useWidgetStaticAttrs,
    refUtils,
    renderUtils,
  } from '@gct/nocode-base';
  import { FieldTypeIcon, NocodeField } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';
  import { FetchApi, useSelect } from './logic';
  import { EntityModelCategoryEnum, FIELD_TYPE } from '@gct/runtime';
  import { isNil } from 'lodash-es';
  import { showNotify } from 'vant';

  const props = defineProps<{
    modelValue?: string;
    widget: ISelect;
    formData: Object;
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

  const { value, onChange } = useNocodeFormWidget(props, emit);

  const {
    showRequired,
    showDisabled,
    placeholder,
    showFieldName,
    fieldType,
    showReadonly,
    queryCondition,
    newQueryData,
    field,
    modelKey,
    refModelKey,
    options: initialOptions,
  } = useMobileAttrs(props.widget);

  const { quickSearchField, quickSearchExp, autofillRules } = props.widget.props;

  // 数据联动
  const varValueRef = computed(() => {
    let val;
    if (isRef || isReason) {
      queryCondition?.dataFilterVarFields?.find((varField) => {
        val = props.formData[varField];
        return !!val;
      });
    }
    return val;
  });

  const onClear = () => {
    emit('update:modelValue', undefined);
    onChange();
  };

  const isRef = fieldType === FIELD_TYPE.REF || fieldType === FIELD_TYPE.REF_MULTI;
  const isReason =
    fieldType === FIELD_TYPE.NOT_GOOD_REASON || fieldType === FIELD_TYPE.SCRAP_REASON;
  const isGroup = fieldType === FIELD_TYPE.NOT_GOOD_GROUP || fieldType === FIELD_TYPE.SCRAP_GROUP;
  const multiple = ref(
    fieldType === FIELD_TYPE.REF_MULTI || fieldType === FIELD_TYPE.DEVICE_REF_MULTI,
  );

  const selectedIds = computed<any>({
    get() {
      let value = props.modelValue;
      if (!value) {
        return [];
      }
      return multiple.value ? value.split(',').filter((i) => i) : [value];
    },
    set(value?: string[] | string) {
      if (!value) {
        emit('update:modelValue', undefined);
      }
      emit(
        'update:modelValue',
        multiple.value ? (value as string[])!.join(',') : (value as string),
      );
    },
  });

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

    if (isRef) {
      // 引用字段的查询参数
      const quickQueryData = keyword
        ? refUtils.getQuickQueryDataByKeyWord({ quickSearchField, keyword })
        : {};

      Object.assign(params, {
        exp: refUtils.splicingExp(queryCondition?.dataFilterExp, keyword ? quickSearchExp : ''),
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

  const fetchApi: FetchApi = async (opts) => {
    const { keyword, pageNo, pageSize } = opts;
    const varValue = varValueRef.value;
    const params = buildQueryParams({ keyword, varValue });
    const res = await renderUtils.requestRefOptions({
      modelKey,
      fieldKey: field,
      refModelKey,
      isRdo: false,
      ...params,
      pageSize,
      pageNo,
    });

    console.log('对对对res', res);
    return {
      data: res.options,
      finished: res.finished,
    };
  };

  async function onSelectChange(options) {
    const info = options?.[0];
    // 数据填充
    if (autofillRules && autofillRules.length !== 0) {
      await nextTick();
      autofillRules.forEach(({ fromField, toField }) => {
        props.formData[toField!] = info?._item?.[fromField];
      });
    }

    if (isGroup && queryCondition?.clsGroupDataLinkStatus) {
      props.formData[queryCondition?.clearFieldId] = undefined;
    }

    onChange();
  }

  const { openPopup, labelValue, checkedOpts } = useSelect({
    selectedIds,
    fetchApi,
    multiple,
    initialOptions,
    onSelectChange,
  });

  async function handleClick() {
    if (isReason && queryCondition?.clsReasonDataLinkStatus) {
      const config = queryCondition?.clsReasonDataLinkInfo;
      if (config && !props.formData[config.value]) {
        showNotify({ type: 'warning', message: `请先选择：${config.label}` });
        return;
      }
    }
    openPopup();
  }

  watch(
    () => props.modelValue,
    async (val) => {
      if (!isNil(val)) {
        const newLb = JSON.stringify(
          renderUtils.getSelectOptions({
            value: val,
            multiple: multiple,
            options: checkedOpts.value,
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
</script>
