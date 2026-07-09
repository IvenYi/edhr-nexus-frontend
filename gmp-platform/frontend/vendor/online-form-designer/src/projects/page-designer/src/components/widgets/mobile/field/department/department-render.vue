<template>
  <vantField
    :error="hasError"
    :error-message="!fieldValue?.length && hasError ? hasErrorTxt : ''"
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    @click="openView"
    :isLink="!validateField"
    readonly
    clearable
    @clearValue="emit('update:modelValue', null)"
    :formData="formData"
  >
    <template #input v-if="validateField">
      <FieldSelect
        v-bind="separatorAttr"
        v-model:value="fieldValue"
        :maxTagTextLength="readonly ? undefined : attrObj.maxTagTextLength"
      />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-department">
  import { ref, computed, toRefs, toRef, toRaw, nextTick, reactive, onBeforeMount } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Department } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { FieldSelect } from '/@page-designer/components/widgets/mobile/__components__';
  // import taglabel from '../../__components__/taglabel.vue';
  import { createTreePopup } from '@mobile/components/treePopup';
  import { MasterTenant } from '@mobile/stores/loginHooks';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
  import { get } from 'lodash-es';
  import { i18n } from '@mobile/locales/setupI18n';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';

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

  const { getAsyncOptions, options, multiple } = useAsyncOptions(fieldType!);
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
  const hasError = ref<boolean>(false);
  const hasErrorTxt = t('sys.pageDesigner.pleaseSelectFirstSth', { sth: label || fieldName });

  onBeforeMount(async () => {
    getAsyncOptions({ selectType: selectType });
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
      readonly: readonly,
      fieldType: fieldType,
      tagStyle: props.widget.style,
      options: options.value,
      multiple: multiple,
    };
  });

  const fieldText = toRef(() => {
    // const optionList: [] = reactive(tree2list(options.value));
    if (fieldValue.value || defaultValue) {
      const valueArr = fieldValue.value?.length
        ? multiple
          ? fieldValue.value
          : [fieldValue.value]
        : defaultValue?.split(',');
      return options.value
        ?.filter((i: any) => valueArr.includes(i.value))
        .map((val: any) => val.label)
        .join(',');
    } else {
      return '';
    }
  });

  const { openTreePopup } = createTreePopup({
    api: getAsyncOptions,
    options: options,
    title: label || fieldName,
    fieldKey: field,
    modelKey: modelKey,
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

  // 用于表单校验的字段
  const validateField = computed(() => {
    return fieldValue.value && String(fieldValue.value);
  });
  async function changeSelect(v: any) {
    await nextTick();
    let data = getOptionValue(v);
    Event.runEventByName('onChange', props.widget.events, fieldValue.value, data);
    if (!enableAutofill || multiple) return;
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = data?._item?.[fromField];
    });
  }

  /**
   * 获取选中的options
   */
  function getOptionValue(v = fieldValue.value) {
    // const optionList: [] = reactive(tree2list(options.value));
    if (multiple) {
      return options.value.filter((i: any) => v.indexOf(i.value) > -1).map((i) => toRaw(i));
    } else {
      let data = options.value.find((i: any) => i.value === v);
      return toRaw(data);
    }
  }

  function deselect(clearValue) {
    let data = getOptionValue(clearValue);
    Event.runEventByName('afterClear', props.widget.events, clearValue, data);
  }

  function openView() {
    openTreePopup({
      ids: fieldValue.value,
      type: multiple ? 'multiple' : 'single',
      callback(a: any) {
        fieldValue.value = a;
        hasError.value = false;
        !multiple && changeSelect(a);
      },
    });
  }

  defineExpose({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
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
