<template>
  <vantField
    :error-message="!fieldValue?.length && hasError ? hasErrorTxt : ''"
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    @click="openView"
    :isLink="!validateField"
    readonly
    clearable
    @clearValue="deselect"
    :formData="formData"
  >
    <template #input v-if="validateField">
      <tagFields
        :multiple="multiple"
        v-bind="separatorAttr"
        :valueOptions="valueOptions"
        :maxTagTextLength="readonly ? undefined : attrObj.maxTagTextLength"
      >
        <template #prefix>
          <span class="gct-iconfont icon-ziduan-bumen primary-gct"></span>
        </template>
      </tagFields>
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-department">
  import { ref, computed, toRefs, watch, toRaw, nextTick, reactive, onBeforeMount } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Department } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { tagFields, useFiledLabels } from '/@page-designer/components/widgets/pad/__components__';
  // import taglabel from '../../__components__/taglabel.vue';
  import { createTreePopup } from '@mobile/components/treePopup';
  import { MasterTenant } from '@mobile/stores/loginHooks';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
  import { get } from 'lodash-es';
  import { i18n } from '@mobile/locales/setupI18n';
  import { useSelectByField } from '/@page-designer/components/widgets/hooks/useSelectorByFieldHooks';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';

  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
  const { t } = i18n.global;
  const props = defineProps<{ modelValue?: string; widget: Department; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const { formData } = toRefs(props);
  const {
    selectType,
    label,
    fieldName,
    autofillRules,
    enableAutofill,
    modelKey,
    field,
    fieldType,
    defaultValue,
    defaultMain,
    isFieldModel,
    readonly,
  } = props.widget.props;
  const { labelArr, dictArr } = useFiledLabels(props);
  const selectOptions = ref([]);
  const valueOptions = computed(() => {
    if (selectOptions.value.length) {
      return selectOptions.value;
    }
    return labelArr.value.map((label, index) => {
      return {
        label,
      };
    });
  });

  const { openSelect, multiple, getOptionsByIds } = useSelectByField(
    {
      modelKey,
      fieldKey: field,
      fieldType,
    },
    { title: label || fieldName },
  );
  const hasError = ref<boolean>(false);
  const hasErrorTxt = t('sys.pageDesigner.pleaseSelectFirstSth', { sth: label || fieldName });

  onBeforeMount(async () => {
    if (multiple) {
      getmaxTagLength({ fieldKey: field, modelKey: modelKey });
    }

    if (
      MasterTenant.value &&
      !props.formData.id_ &&
      props.formData[field] === undefined &&
      !isFieldModel
    ) {
      const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);

      const _defaultMain = defaultMain ?? get(fieldInfo, 'defaultValue.value');
      if (_defaultMain === FieldSysVarDefaultValueEnum.CURRENT_ORG) {
        emit('update:modelValue', MasterTenant.value.masterOrgId);
      }
    }
  });

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const separatorAttr = computed(() => {
    return {
      disabled: showDisabled.value,
      fieldType: fieldType,
      tagWidgetStyle: props.widget.style,
    };
  });

  const fieldValue = computed<any>({
    get() {
      let value = props.modelValue;
      return multiple ? value?.split(',').filter((i) => i) || [] : value || undefined;
    },
    set(value: string[]) {
      emit('update:modelValue', multiple ? value?.join(',') : value);
    },
  });
  function getCheckedOpts() {
    if (multiple) {
      return selectOptions.value.map((i) => toRaw(i));
    } else {
      return toRaw(selectOptions.value[0]);
    }
  }
  // 用于表单校验的字段
  const validateField = computed(() => {
    return fieldValue.value && String(fieldValue.value);
  });
  async function changeSelect(v: any, options) {
    selectOptions.value = multiple ? options : [options];
    await nextTick();
    Event.runEventByName('onChange', props.widget.events, fieldValue.value, options);
    !!formData.value._DICT || (formData.value._DICT = {});
    const data = getCheckedOpts();
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = {
        [props.modelValue!]: multiple ? data.map((i: any) => i.label) : data?.label,
      };
    }
    if (!enableAutofill || multiple) return;
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = data?._protoValue?.[fromField];
    });
  }

  function deselect(clearValue) {
    emit('update:modelValue', null);
    Event.runEventByName('afterClear', props.widget.events, clearValue, selectOptions.value);
    fieldValue.value = [];
    formData.value._DICT[field] = undefined;
  }

  function openView() {
    openSelect({
      value: fieldValue.value,
    }).then(({ options, values }) => {
      fieldValue.value = values;
      changeSelect(values, options);
      hasError.value = false;
    });
  }
  watch(
    () => fieldValue.value,
    async (val) => {
      const ids = multiple ? val : val ? [val] : [];
      if (
        ids.length &&
        ids.some((e) => !selectOptions.value.find((f) => f.value === e)) &&
        !dictArr.value?.length
      ) {
        selectOptions.value = await getOptionsByIds(ids);
      }
    },
    { immediate: true },
  );

  defineExpose({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return selectOptions.value;
      } else {
        return fieldValue.value;
      }
    },
    setValue(v) {
      fieldValue.value = v;
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
