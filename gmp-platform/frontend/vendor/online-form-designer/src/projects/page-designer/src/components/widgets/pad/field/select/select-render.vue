<template>
  <vantField
    v-model="validateField"
    :error-message="!fieldValue && hasError ? hasErrorTxt : ''"
    :props="widget.props"
    :style="widget.style"
    @click="openView"
    :isLink="!validateField"
    readonly
    clearable
    @clearValue="handleClear"
    :formData="formData"
  >
    <template #input v-if="validateField">
      <FieldSelect
        v-bind="separatorAttr"
        v-model:value="fieldValue"
        :maxTagTextLength="readonly ? undefined : attrObj.maxTagTextLength"
        :labelArr="labelArr"
      />
    </template>
  </vantField>
</template>
<script name="gct-select" setup lang="ts">
  import { ref, computed, toRefs, toRaw, nextTick, toRef, reactive, onMounted, watch } from 'vue';
  import { getPageEvent, type RetrunList } from '/@page-designer/components/widgets/hooks/hooks';
  import { showNotify } from 'vant';
  import { Select } from '/@page-designer/types/web';
  import {
    FieldSelect,
    useFiledLabels,
  } from '/@page-designer/components/widgets/pad/__components__';
  import vantField from '../../__components__/vantField.vue';
  import { useDisabled } from '../../../hooks/useReadyonly';
  import {
    useQueryfilter,
    getQueryDateByKeyWord,
  } from '/@page-designer/components/widgets/hooks/listhook';
  import {
    useSelectByField,
    useLinkageFieldByRule,
  } from '/@page-designer/components/widgets/hooks/useSelectorByFieldHooks';
  import { i18n } from '@mobile/locales/setupI18n';
  import { postModelComprehensiveQueryRefDataByIdsByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { IMobSelectComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';
  import { watchDebounced } from '@vueuse/core';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

  const { t } = i18n.global;
  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Select;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      getPopupContainer: (triggerNode) => triggerNode.parentNode,
    },
  );

  const { labelArr } = useFiledLabels(props);
  /** 关联模型字段 状态exp和筛选项 */
  const bindStateQuery = ref();
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
  const Event = getPageEvent();
  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));
  // 用于表单校验的字段
  const validateField = computed(() => {
    return fieldValue.value && String(fieldValue.value);
  });
  const emit = defineEmits(['update:modelValue']);
  const { formData } = toRefs<{ [key: string]: any }>(props);
  const {
    fieldType,
    field,
    label,
    fieldName,
    autofillRules,
    enableAutofill,
    modelKey,
    bindModelKey,
    searchField,
    exp,
    showSearch,
    valueField,
    rangeField,
    refModelType,
    customdataSource,
    datasourceConfig,
    datafilter,
    modeldata,
    linkageField,
    ruleConfig,
    customMenu,
    customMenuFilter,
    readonly,
    displayFields,
  } = reactive(props.widget.props);

  //父表单获取模型大类型
  const modelCategory = modeldata?.modelCategory || 'entity';
  const queryfilter = useQueryfilter(datafilter);
  const { isLinkageMode, getLinkageFieldByRuleApi, hasErrorTxt, checkedLinkRefData, hasError } =
    useLinkageFieldByRule(props, props.formData, { Event });
  const customApi =
    customdataSource && datasourceConfig?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            formData.value,
            datasourceConfig?.extraParams,
          )
      : undefined;

  const fieldConfig = {
    modelKey,
    fieldKey: field,
    modelCategory,
    fieldType,
    refModelKey: bindModelKey,
    customApi: computed(() => customApi || getLinkageFieldByRuleApi.value),
    customMenuFilter: customMenu && customMenuFilter.length ? customMenuFilter : undefined,
    displayFields,
  };
  /**
   * refModelKey fieldKey=ref_master_id_时，refModelKey值必传
   */
  const { openSelect, multiple, getOptions, getOptionsUseCache, getOptionsByIds } =
    useSelectByField(fieldConfig, {
      title: label || fieldName,
      queryData: {
        query: computed(() => {
          return { ...queryfilter.query, ...bindStateQuery.value?.query };
        }),
        exp: computed(() =>
          queryfilter.getExp(
            bindStateQuery.value?.exp
              ? exp
                ? `AND(${(exp, bindStateQuery.value?.exp)})`
                : bindStateQuery.value?.exp
              : exp
                ? exp
                : '',
          ),
        ),
      },
      searchable: showSearch,
      config: { searchField },
    });

  const checkeOpts = ref<any[]>([]);

  // 数据连接模式下，监控连接项的值。在值变更时清空自身
  if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false)) {
    const key = ruleConfig ? ruleConfig.fieldKey : linkageField?.[0].value;
    // eslint-disable-next-line vue/no-setup-props-destructure
    let val = props.formData[key];
    watch(props.formData, () => {
      if (val != props.formData[key]) {
        val = props.formData[key];
        fieldValue.value = null;
      }
    });
  }

  const separatorAttr = computed(() => {
    return {
      disabled: showDisabled.value,
      readonly: true,
      fieldType: fieldType,
      tagStyle: props.widget.style,
      options: checkeOpts.value,
      multiple: multiple,
      refModelType: refModelType,
    };
  });
  /** 获取关联模型状态字段信息生成查询条件 */
  const getBindModelstate = async () => {
    if (bindModelKey && [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(fieldType)) {
      const bindStateInfo = await FieldSchema.getConfigByModel(bindModelKey);
      if (bindStateInfo && bindStateInfo.specificConfig.operatingStateEnabled) {
        bindStateQuery.value = {
          exp: 'operating_state_.eq',
          query: {
            'operating_state_.eq': true,
          },
        };
      }
    }
  };
  onMounted(async () => {
    await getBindModelstate();
    if (multiple) {
      getmaxTagLength({ fieldKey: field, modelKey: modelKey });
    }

    if ([FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(fieldType)) {
      const { options } = await getOptionsUseCache();
      checkeOpts.value = options;
    }
    if (props.modelValue && props.modelValue.length && getOptionsByIds) {
      getOptionsByIds(props.modelValue.split(',')).then((res) => {
        checkeOpts.value = res;
      });
    }
  });

  const fieldValue = computed<any>({
    get() {
      let value = props.modelValue || undefined;
      return multiple
        ? Array.isArray(value)
          ? value
          : value?.split(',').filter((i) => i) || []
        : value;
    },
    set(value: string[]) {
      emit('update:modelValue', multiple ? value && value?.join(',') : value);
    },
  });

  /**
   * 设置返回的选中options
   */
  function getCheckedOpts() {
    if (multiple) {
      return checkeOpts.value.map((i) => toRaw(i));
    } else {
      return toRaw(checkeOpts.value[0]);
    }
  }

  async function changeSelect(v: any) {
    if (!v || !v.length) {
      deselect(fieldValue.value);
    }
    await nextTick();
    // let data = getOptionValue(v);
    let data: any = getCheckedOpts();
    Event.runEventByName('onChange', props.widget.events, fieldValue.value, data, formData.value);
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = {
        [props.modelValue!]: multiple ? data.map((i: any) => i.label) : data?.label,
      };
    }
    // 自动填充
    if (!enableAutofill || multiple) return;
    const info = await Event.context.$httpBizService(
      {
        action: 'getOne',
        key: bindModelKey!,
        modelCategory: modelCategory,
      },
      {
        query: { 'id_.eq': fieldValue.value },
      },
      {
        includeSubModel: 1,
      },
    );
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = info?.data?.[fromField];
    });
  }

  function deselect(clearValue) {
    // let data = getOptionValue(clearValue);
    let data = getCheckedOpts();
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
    formData.value._OPCT[field] = undefined;
    formData.value._DICT[field] = undefined;
    // handleSearch();
  }

  async function handleClear() {
    emit('update:modelValue', null);
    deselect(fieldValue.value);
    fieldValue.value = multiple ? [] : '';
    await nextTick();
  }

  // 打开选择弹框
  async function openView() {
    if (valueField && rangeField) {
      const valueId = valueField.split('$')[1] || '';
      valueId && Event.context.$ref(valueId)?.setError();
      return;
    }
    await checkedLinkRefData();
    console.log('fieldValue.value', fieldValue.value);
    const { options, values } = await openSelect({
      value: fieldValue.value,
    });
    fieldValue.value = values;
    checkeOpts.value = multiple ? options : [options];
    hasError.value = false;
    changeSelect(values);
  }

  defineExpose<IMobSelectComponentExpose>({
    reload: getOptions,
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getCheckedOpts();
      } else {
        return fieldValue.value;
      }
    },
    setValue(v) {
      fieldValue.value = v;
    },
    async setCheckeByIds(ids: string) {
      const data = await getOptionsByIds(ids.split(','));
      checkeOpts.value = data;
      fieldValue.value = multiple ? ids.split(',') : ids;
    },
    setError() {
      hasError.value = true;
    },
  });
</script>
<style lang="less" scoped>
  :deep(.van-field__control--error::placeholder) {
    color: var(--van-field-placeholder-text-color);
  }
</style>
