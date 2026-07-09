<template>
  <FieldReadonly
    v-if="readonly"
    :label="readylabel"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <a-date-picker
    v-else
    v-model:value="value"
    v-bind="separatorAttr"
    style="width: 100%"
    @change="onChangeDate"
    :getPopupContainer="PopupContainer"
    dropdownClassName="vxe-table--ignore-clear"
  />
</template>

<script setup lang="ts" name="gct-datepicker">
  import { computed, toRefs, nextTick, onMounted, toRef } from 'vue';
  import { Datepicker } from '/@page-designer/types/web';
  import type { DatePickerProps } from 'ant-design-vue';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { getDisabledDate, getDefaultDate } from '/@page-designer/constant/index';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { get } from 'lodash-es';
  import dayjs from 'dayjs';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Datepicker;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      //getPopupContainer: (triggerNode) => document.body,
    },
  );
  const PopupContainer = getParentPopupContainer(props);
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const { onChange, getValue, setValue, value } = useFormWidget(props, emit);
  const {
    placeholder,
    clearable,
    dateType,
    format,
    range,
    defaultSysDate,
    fieldType,
    field,
    modelKey,
    isFieldModel,
  } = props.widget.props;
  const { readonly } = toRefs(props.widget.props);
  const onChangeDate = async () => {
    await onChange();
    emit('saveTableRow');
  };
  const readylabel = toRef(() => {
    if (value.value) {
      return dayjs(value.value).format(format);
    }
  });
  onMounted(async () => {
    await nextTick();
    const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
    if (!props.formData.id_ && props.formData[field] === undefined && !isFieldModel) {
      emit(
        'update:modelValue',
        getDefaultDate(
          defaultSysDate ?? get(fieldInfo, 'defaultValue.value'),
          DateFormat[dateType].valueFormat,
        ),
      );
    }
  });

  const separatorAttr = computed(() => {
    let attr: DatePickerProps = {
      allowClear: clearable,
      placeholder: placeholder,
      valueFormat: DateFormat[dateType].valueFormat,
      format: format,
      picker: DateFormat[dateType].picker as DatePickerProps['picker'],
      disabledDate: date => {
        if (range === 'DATE_BEFORE') {
          return getDisabledDate(date, 'DATE_BEFORE2');
        }
        if (range === 'DATE_AFTER') {
          return getDisabledDate(date, 'DATE_AFTER2');
        }
        return getDisabledDate(date, range);
      },
    };
    return attr;
  });
  defineExpose({ getValue, setValue });
</script>
<style scoped lang="less"></style>
