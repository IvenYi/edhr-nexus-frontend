<template>
  <vantField
    :error-message="!fieldValue && hasError ? hasErrorTxt : ''"
    v-model="fieldValue"
    :props="widget.props"
    :style="widget.style"
    :is-link="!fieldText"
    readonly
    clearable
    @click="openView"
    @clearValue="handleClear"
    :formData="formData"
  >
    <template #input v-if="fieldText">
      <taglabel v-bind="separatorAttr" />
      <div v-if="selectValue?.children?.length" class="default-tag">
        {{ $t('sys.default') }}
      </div>
    </template>
  </vantField>
</template>

<script name="gct-rdo-select" setup lang="ts">
  import { ref, computed, watch, toRaw, toRef, nextTick, toRefs, inject, onBeforeMount } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Select } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { useQueryfilter } from '/@page-designer/components/widgets/hooks/listhook';
  import { IMobRdoSelectComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import {
    useSelectByField,
    useLinkageFieldByRule,
  } from '/@page-designer/components/widgets/hooks/useSelectorByFieldHooks';
  import { useFiledLabels } from '/@page-designer/components/widgets/pad/__components__';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

  const layout: any = inject('form-layout', {});
  const props = defineProps<{ modelValue?: string; widget: Select; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const {
    field,
    label,
    fieldName,
    autofillRules,
    enableAutofill,
    modelKey,
    bindModelKey,
    fieldType,
    datafilter,
    exp,
    modeldata,
    showSearch,
    searchField,
    rdoVersion,
    customdataSource,
    datasourceConfig,
    ruleConfig,
    linkageField,
    displayFields,
  } = toRaw(props.widget.props);

  const { formData } = toRefs(props);
  const { isLinkageMode, getLinkageFieldByRuleApi, hasErrorTxt, checkedLinkRefData, hasError } =
    useLinkageFieldByRule(props, props.formData, {
      Event,
    });
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
  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));
  const queryfilter = useQueryfilter(datafilter);
  // 父表单获取模型大类型
  const modelCategory = modeldata?.modelCategory;
  /** 关联模型字段 状态exp和筛选项 */
  const bindStateQuery = ref();
  const { labelArr } = useFiledLabels(props);
  const fieldConfig = {
    modelKey,
    fieldKey: field,
    fieldType,
    modelCategory,
    refModelKey: bindModelKey,
    customApi: computed(() => customApi || getLinkageFieldByRuleApi.value),
    displayFields,
  };

  // 新的选择器功能
  const { openSelect, getOptionsByIds } = useSelectByField(fieldConfig, {
    searchable: showSearch,
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
    config: { searchField },
  });

  const selectValue = ref<any>({});
  const fieldText = toRef(() => {
    if (selectValue.value.__LABEL__) {
      return selectValue.value.__LABEL__;
    }
    // 确保 labelArr.value 是数组
    const arr = Array.isArray(labelArr.value) ? labelArr.value : [];
    return arr.join(',');
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: fieldText.value || '',
    };
  });

  async function handleClear() {
    emit('update:modelValue', null);
    deselect(fieldValue.value);
    fieldValue.value = '';
  }

  const fieldValue = computed<any>({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  function deselect(clearValue) {
    selectValue.value = {};
    Event.runEventByName('afterClear', props.widget.events, clearValue, selectValue.value);
    formData.value._OPCT[field] = undefined;
    formData.value._DICT[field] = undefined;
  }

  async function changeNode(value) {
    !!formData.value._DICT || (formData.value._DICT = {});
    if (fieldText.value) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = { ...formData.value._DICT[field], [value]: fieldText.value };
    }
    console.log('formData.value', formData.value);
    if (!enableAutofill) return;
    //数据填充
    const info = await Event.context.$httpBizService(
      {
        action: 'rdoGetVersionById',
        key: bindModelKey!,
        modelCategory: modelCategory,
      },
      {
        id: value,
        includeSubModel: 1,
      },
    );
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = info?.data?.[fromField];
    });
  }

  async function openView() {
    await checkedLinkRefData();
    // 使用新的选择器
    openSelect({
      value: fieldValue.value,
      refVersion: rdoVersion,
    }).then(async ({ options, values }) => {
      fieldValue.value = values;
      selectValue.value = options;
      await nextTick();
      // 触发选择后事件
      await Event.runEventByName(
        'afterSelect',
        props.widget.events,
        fieldValue.value,
        options,
        formData.value,
      );
      // 触发变更事件
      Event.runEventByName(
        'onChange',
        props.widget.events,
        fieldValue.value,
        options,
        formData.value,
      );
      // 处理数据填充
      await changeNode(fieldValue.value);
    });
  }

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
  /** 获取关联模型状态字段信息生成查询条件 */
  const getBindModelstate = async () => {
    if (bindModelKey) {
      const bindStateInfo = await FieldSchema.getConfigByModel(bindModelKey);
      if (bindStateInfo && bindStateInfo.specificConfig.operatingStateEnabled) {
        bindStateQuery.value = {
          exp: 'operating_state_.eq',
          query: {
            'operating_state_.eq': true,
          },
        };
        console.log('bindStateInfo', bindStateInfo, bindStateQuery.value);
      }
    }
  };
  onBeforeMount(async () => {
    await getBindModelstate();
    if (props.modelValue) {
      getOptionsByIds([props.modelValue]).then((res) => {
        selectValue.value = res[0];
        console.log('selectValue.value', selectValue.value);
      });
    }
  });
  defineExpose<IMobRdoSelectComponentExpose>({
    getValue() {
      return fieldValue.value;
    },
    setValue(v) {
      fieldValue.value = v;
      getOptionsByIds([v]).then((res) => {
        selectValue.value = res[0];
      });
    },
    setError() {
      hasError.value = true;
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-item) {
    .version {
      display: none;
    }
  }

  .ant-select-tree-title {
    .name {
      display: none;
    }
  }
</style>
<style lang="less" scoped>
  .rdo-select-wrap {
    &::after {
      content: ' ';
      position: absolute;
      right: var(--van-padding-md);
      bottom: 0;
      left: var(--van-padding-md);
      box-sizing: border-box;
      transform: scaleY(0.5);
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
  }

  :deep(.van-cell__right-icon) {
    padding: v-bind("layout.inputBg?'10px 0':''");
    line-height: inherit;
  }
  .default-tag {
    flex-shrink: 0;
    height: 20px;
    margin-left: 6px;
    padding: 2px 6px;
    border: 1px solid var(--gct-color-border);
    background-color: var(--gct-color-bg-2);
    border-radius: 4px;
    color: var(--gct-color-text-4);
    font-size: 12px;
    line-height: 16px;
  }
</style>
