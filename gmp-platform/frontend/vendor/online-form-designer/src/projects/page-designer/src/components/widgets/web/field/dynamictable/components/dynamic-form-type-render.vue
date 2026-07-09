<template>
  <!-- <a-select v-model:value="value" :options="options" @change="changeSelect" class="w100%" /> -->
  <FieldSelect
    v-model:value="value"
    :design="false"
    :readonly="readonly || rowReadonly"
    :fieldType="FIELD_TYPE.REF"
    :type="widget.type"
    :tagStyle="widget.style"
    :options="options"
    :selectExtraProps="separatorAttr"
    @change="changeSelect"
    class="w100%"
  />
</template>

<script name="gct-dynamic-form-type" setup lang="ts">
  import { computed, toRefs, toRaw, nextTick, watch, ref } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Select } from '/@page-designer/types/web';
  import FieldSelect from '../../../__components__/formcomponent/FieldSelect';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import type { SelectProps } from 'ant-design-vue';

  const props = defineProps<{
    modelValue?: string;
    widget: Select;
    formData: Object;
    rowReadonly?: boolean;
  }>();
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const { formData } = toRefs<{ [key: string]: any }>(props);
  const { field, readonly, modeldata } = toRaw(props.widget.props);

  const options = ref([
    {
      label: $t('sys.pageDesigner.dynamicFormType.boolean'),
      value: 'boolean',
    },
    {
      label: $t('sys.pageDesigner.dynamicFormType.decimal'),
      value: 'decimal',
    },
    {
      label: $t('sys.pageDesigner.dynamicFormType.integer'),
      value: 'integer',
    },
    {
      label: $t('sys.pageDesigner.dynamicFormType.string'),
      value: 'string',
    },
    // 暂时注释
    // {
    //   label: '模型对象',
    //   value: 'object',
    // },
    {
      label: $t('sys.pageDesigner.dynamicFormType.user'),
      value: 'user',
    },
    {
      label: $t('sys.pageDesigner.dynamicFormType.user_multi'),
      value: 'user_multi',
    },
    {
      label: $t('sys.pageDesigner.dynamicFormType.org'),
      value: 'org',
    },
    {
      label: $t('sys.pageDesigner.dynamicFormType.date'),
      value: 'date',
    },
    {
      label: $t('sys.pageDesigner.dynamicFormType.date_time'),
      value: 'date_time',
    },
    {
      label: $t('sys.pageDesigner.dynamicFormType.image'),
      value: 'image',
    },
    {
      label: $t('sys.pageDesigner.dynamicFormType.attachment'),
      value: 'attachment',
    },
  ]);
  const filterFieldMap = {
    string: {
      max_decimal_: undefined,
      min_decimal_: undefined,
      validate_range_: undefined,
      min_int_: undefined,
      max_int_: undefined,
      digits_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
    },
    boolean: {
      max_decimal_: undefined,
      min_decimal_: undefined,
      validate_range_: undefined,
      min_int_: undefined,
      max_int_: undefined,
      regex_: undefined,
      digits_: undefined,
      pattern_: undefined,
    },
    decimal: {
      min_int_: undefined,
      max_int_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
      regex_: undefined,
    },
    integer: {
      min_decimal_: undefined,
      max_decimal_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
      regex_: undefined,
    },
    user: {
      max_decimal_: undefined,
      min_decimal_: undefined,
      validate_range_: undefined,
      min_int_: undefined,
      max_int_: undefined,
      digits_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
      regex_: undefined,
      show_type_: undefined,
    },
    user_multi: {
      max_decimal_: undefined,
      min_decimal_: undefined,
      validate_range_: undefined,
      min_int_: undefined,
      max_int_: undefined,
      digits_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
      regex_: undefined,
      show_type_: undefined,
    },
    org: {
      max_decimal_: undefined,
      min_decimal_: undefined,
      validate_range_: undefined,
      min_int_: undefined,
      max_int_: undefined,
      digits_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
      regex_: undefined,
      options_: undefined,
      show_type_: undefined,
    },
    date: {
      max_decimal_: undefined,
      min_decimal_: undefined,
      validate_range_: undefined,
      min_int_: undefined,
      max_int_: undefined,
      digits_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
      regex_: undefined,
      options_: undefined,
      show_type_: undefined,
    },
    date_time: {
      max_decimal_: undefined,
      min_decimal_: undefined,
      validate_range_: undefined,
      min_int_: undefined,
      max_int_: undefined,
      digits_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
      regex_: undefined,
      options_: undefined,
      show_type_: undefined,
    },
    image: {
      max_decimal_: undefined,
      min_decimal_: undefined,
      validate_range_: undefined,
      min_int_: undefined,
      max_int_: undefined,
      digits_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
      regex_: undefined,
      options_: undefined,
      show_type_: undefined,
    },
    attachment: {
      max_decimal_: undefined,
      min_decimal_: undefined,
      validate_range_: undefined,
      min_int_: undefined,
      max_int_: undefined,
      digits_: undefined,
      false_text_: undefined,
      true_text_: undefined,
      validate_true_: undefined,
      validate_false_: undefined,
      pattern_: undefined,
      regex_: undefined,
      options_: undefined,
      show_type_: undefined,
    },
  };
  const value = computed<any>({
    get() {
      let value = props.modelValue;
      return value;
    },
    set(v) {
      formData.value.default_value_ = undefined;
      Object.assign(formData.value, filterFieldMap[v]);
      emit('update:modelValue', v);
    },
  });

  watch(
    [value, () => options.value],
    ([newValue, newOptions]) => {
      if (Array.isArray(newOptions) && newOptions.length !== 0 && newValue) {
        formData.value._OPCT || (formData.value._OPCT = {});
        formData.value._OPCT[field] = getOptionValue(newValue)?._item || {};
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );
  // 新版edhr需要
  const separatorAttr = computed(() => {
    let attr: SelectProps = {};
    if (modeldata && modeldata?.modelType === 'CHECK_LIST') {
      Object.assign(attr, {
        placeholder: $t('sys.pageDesigner.pleaseSelValFieldType'),
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
      });
    }
    return attr;
  });

  const map = computed(() => {
    if (modeldata && modeldata?.modelType === 'CHECK_LIST') {
      console.log('aaaaa');
      return {
        boolean: ['checkbox', 'radio', 'select'],
        decimal: ['input', 'select'],
        integer: ['input', 'select'],
        string: ['input', 'select'],
      };
    }
    return {
      boolean: ['switch', 'radio', 'select'],
      decimal: ['input', 'select'],
      integer: ['input', 'select'],
      string: ['input', 'select'],
    };
  });

  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    let data = options.value.find((i) => i.value === v);
    return toRaw(data);
  }
  async function changeSelect(v) {
    await nextTick();
    let data = getOptionValue(v);
    Event.runEventByName('onChange', props.widget.events, value.value, data);
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = { [value.value]: data.label };
      // 选择后清空显示类型字段
      formData.value.show_type_ = map.value?.[value.value]?.[0] || undefined;
    }
  }

  defineExpose({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
      } else {
        return value.value;
      }
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
