<template>
  <vantField
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    :formData="formData"
    @click="openView"
    @clearValue="handleClear"
    readonly
    clearable
    :isLink="!validateField"
  >
    <template #input v-if="validateField">
      <FieldSelect
        v-model:value="value"
        :fieldType="fieldType"
        :type="widget.type"
        :tagStyle="props.widget.style"
        readonly
        :options="selectOptions"
      />
    </template>
  </vantField>
</template>

<script name="gct-transaction" setup lang="ts">
  import { toRaw, toRefs, computed, watch, ref, nextTick } from 'vue';
  import { Radio } from '/@page-designer/types/web';
  import vantField from '../../__components__/vantField.vue';
  import { FieldSelect } from '/@page-designer/components/widgets/mobile/__components__';
  import {
    useAsyncOptions,
    getPageEvent,
    RetrunList,
  } from '/@page-designer/components/widgets/hooks/hooks';
  import { IMobTransactionComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { useSelectByField } from '/@page-designer/components/widgets/hooks/useSelectorByFieldHooks';

  const props = defineProps<{ modelValue?: string; widget: Radio; formData: any }>();
  const emit = defineEmits(['update:modelValue']);
  const { formData } = toRefs<{ [key: string]: any }>(props);
  const { field, placeholder, fieldType, label, fieldName, modelKey, modeldata } = toRaw(
    props.widget.props,
  );
  const { readonly, isCustomField, customFieldFilter } = toRefs(props.widget.props);
  const modelCategory = modeldata?.modelCategory;
  const { openSelect } = useSelectByField(
    {
      modelKey,
      fieldKey: field,
      modelCategory,
      fieldType,
      customMenuFilter:
        isCustomField.value && customFieldFilter.value.length ? customFieldFilter.value : undefined,
    },
    {
      title: label || fieldName,
    },
  );

  const Event = getPageEvent();

  const checkeOpts = ref<RetrunList[]>([]);
  const { getAsyncOptions, options, multiple } = useAsyncOptions(fieldType!);

  getAsyncOptions();

  const selectOptions = computed<any>(() => {
    if (isCustomField?.value) {
      const customOption = options.value.filter((item) => {
        return customFieldFilter?.value.includes(item.value);
      });
      return customOption;
    } else {
      return options.value;
    }
  });
  async function getOptionsByquery() {
    const res = await getAsyncOptions({
      fieldKey: field,
    });
    return res.finished;
  }

  const value = computed<any>({
    get() {
      let value = props.modelValue;
      return value;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });
  // 用于表单校验的字段
  const validateField = computed(() => {
    return value.value && String(value.value);
  });
  watch([() => options.value, value], () => {
    if (value.value && options.value && readonly?.value) {
      const info = getOptionValue() || {};
      let i18nList: any = [];
      if (Array.isArray(info)) {
        i18nList = info.map((item) => item.label);
      } else {
        i18nList = [info.label];
      }
      if (!props.formData._DICT) {
        props.formData._DICT = {};
      }
      props.formData._DICT[field] = { [value.value]: i18nList };
    }
  });

  // 打开选择弹框
  async function openView() {
    const res = await openSelect({ value: value.value });
    value.value = res.values;
    checkeOpts.value = res.options;

    changeSelect(res.values);
  }

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

  function deselect(clearValue) {
    // let data = getOptionValue(clearValue);
    let data = getCheckedOpts();
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
    formData.value._OPCT[field] = undefined;
    formData.value._DICT[field] = undefined;
    getOptionsByquery();
  }
  /**值发生变化 */
  async function changeSelect(v) {
    if (!v || !v.length) {
      deselect(value.value);
    }
    await nextTick();
    let data: any = getCheckedOpts();
    Event.runEventByName('onChange', props.widget.events, value.value, props.formData);
    !!formData.value._DICT || (formData.value._DICT = {});

    if (checkeOpts.value) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = {
        [props.modelValue!]: multiple
          ? checkeOpts.value.map((i: any) => i.label)
          : checkeOpts.value?.label,
      };
    }
  }
  /**
   * 获取选中的options
   */
  function getOptionValue() {
    let data = options.value.find((i) => i.value === value.value);
    return toRaw(data);
  }
  async function handleClear() {
    emit('update:modelValue', null);
    deselect(value.value);
    value.value = '';
    await nextTick();
  }
  defineExpose<IMobTransactionComponentExpose>({
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
<style lang="less" scoped>
  :deep(.van-field__control--error::placeholder) {
    color: var(--van-field-placeholder-text-color);
  }
</style>
