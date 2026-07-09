<template>
  <FieldSelect
    v-model:value="value"
    :design="false"
    :readonly="readonly"
    :selectExtraProps="separatorAttr"
    :fieldType="fieldType"
    :type="widget.type"
    :tagStyle="widget.style"
    :options="selectOptions"
    optionFilterProp="label"
    :getPopupContainer="PopupContainer"
    @change="changeSelect"
    maxTagCount="gct-responsive"
  />
</template>

<script name="gct-transaction" setup lang="ts">
  import { computed, toRaw, toRefs, watch } from 'vue';
  import { Select } from '/@page-designer/types/web';
  import type { SelectProps } from 'ant-design-vue';
  import FieldSelect from '../../__components__/formcomponent/FieldSelect';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ITransactionComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Select;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      //getPopupContainer: (triggerNode) => document.body,
    },
  );
  const emit = defineEmits(['update:modelValue']);
  const PopupContainer = getParentPopupContainer(props);
  const { field, placeholder, fieldType } = toRaw(props.widget.props);
  const { readonly, isCustomField, customFieldFilter } = toRefs(props.widget.props);
  const { getAsyncOptions, options, multiple } = useAsyncOptions(fieldType!);
  const Event = getPageEvent();
  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      allowClear: true,
      showSearch: true,
    };
    return attr;
  });

  const value = computed<any>({
    get() {
      let value = props.modelValue;
      return multiple
        ? Array.isArray(value)
          ? value
          : value?.split(',').filter((i) => i) || []
        : value;
    },
    set(v) {
      emit('update:modelValue', multiple ? v?.join(',') : v);
    },
  });

  getAsyncOptions();

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

  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    if (multiple) {
      return options.value.filter((i) => v.indexOf(i.value) > -1).map((i) => toRaw(i));
    } else {
      let data = options.value.find((i) => i.value === v);
      return toRaw(data);
    }
  }
  /**值发生变化 */
  async function changeSelect(v) {
    Event.runEventByName('onChange', props.widget.events, v, props.formData);
  }
  defineExpose<ITransactionComponentExpose>({
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
