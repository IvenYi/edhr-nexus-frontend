<template>
  <vantField
    v-model="currentDateTime.showDateTimeValue"
    :props="widget.props"
    :style="widget.style"
    @click="showPopup"
    :placeholder="placeholder"
    clearable
    :isLink="!currentDateTime.showDateTimeValue"
    readonly
    @clearValue="onClear"
    :key="showReadonly"
    :formData="formData"
  >
    <template #input v-if="showReadonly">
      <taglabel v-bind="separatorAttr" />
    </template>
  </vantField>

  <van-popup v-model:show="show" position="bottom">
    <van-picker-group :tabs="['选择日期', '选择时间']" @confirm="onConfirm" @cancel="onCancel">
      <van-date-picker v-model="currentDateTime.compDateValue" v-bind="datePickerAttr" />
      <van-time-picker v-model="currentDateTime.compTimeValue" v-bind="timePickerAttr" />
    </van-picker-group>
  </van-popup>
</template>

<script setup lang="ts" name="gct-datetimepicker">
  import { ref, computed, toRefs, onMounted, inject, nextTick } from 'vue';
  import { DateTimepicker } from '/@page-designer/types/mobile';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { getMobileDateRange, getDefaultDate } from '/@page-designer/constant/index';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import dayjs from 'dayjs';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { get } from 'lodash-es';

  const props = defineProps<{ modelValue?: string; widget: DateTimepicker; formData: any }>();
  const emit = defineEmits(['update:modelValue']);
  const { onChange, getValue, setValue, value } = useFormWidget(props, emit);

  const {
    fieldType,
    placeholder,
    dateType,
    format,
    range,
    separator,
    defaultSysDate,
    field,
    modelKey,
    isFieldModel,
  } = props.widget.props;

  const { readonly, disabled } = toRefs(props.widget.props);
  const show = ref(false);
  const layout: any = inject('form-layout', {});

  onMounted(async () => {
    await nextTick();
    const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
    if (
      props.formData &&
      !props.formData.id_ &&
      props.formData[field] === undefined &&
      !isFieldModel
    ) {
      emit(
        'update:modelValue',
        getDefaultDate(
          defaultSysDate ?? get(fieldInfo, 'defaultValue.value'),
          DateFormat[dateType].valueFormat,
        ),
      );
    }
  });

  const showReadonly = computed(() => useReadyonly(readonly.value));

  const showDisabled = computed(() => useDisabled(disabled.value));

  const currentDateTime = computed(() => {
    if (!value.value) {
      return {
        showDateTimeValue: value.value,
        compDateValue: [],
        compTimeValue: [],
      };
    }

    const datetime = dayjs(value.value).format(format);
    const date = dayjs(value.value).format(`YYYY${separator}MM${separator}DD`);
    const time = datetime.replace(date, '');
    return {
      showDateTimeValue: datetime,
      compDateValue: date.split(separator),
      compTimeValue: time.split(':'),
    };
  });

  const datePickerAttr = computed(() => {
    return {
      ...getMobileDateRange(range),
    };
  });

  const timePickerAttr = computed(() => {
    return {
      columnsType: DateFormat[dateType].columnsType,
    };
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: showReadonly.value
        ? (currentDateTime.value.showDateTimeValue ?? '')
        : (currentDateTime.value.showDateTimeValue ?? placeholder),
      style: !currentDateTime.value.showDateTimeValue && {
        color: 'var(--van-gray-5)',
        paddingLeft: layout?.value?.inputBg ? '12px' : '',
        fontSize: '16px',
      },
    };
  });

  const showPopup = () => {
    show.value = true;
  };
  const onClear = () => {
    emit('update:modelValue', null);
    afterClear();
  };
  const onConfirm = ([
    { selectedValues: dateSelectValues },
    { selectedValues: timeSelectValues },
  ]) => {
    const datetime = dayjs(`${dateSelectValues.join('-')} ${timeSelectValues.join(':')}`).format(
      DateFormat[dateType].valueFormat,
    );
    emit('update:modelValue', datetime);
    show.value = false;
    onChange(datetime);
  };

  const onCancel = () => {
    show.value = false;
  };

  defineExpose({ getValue, setValue });
</script>
<style scoped lang="less">
  :deep(.van-cell__right-icon) {
    padding: v-bind("layout.inputBg?'10px 0':''");
  }
</style>
