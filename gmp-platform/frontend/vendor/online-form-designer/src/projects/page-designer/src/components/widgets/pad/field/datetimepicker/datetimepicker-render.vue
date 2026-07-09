<template>
  <vantField
    v-model="currentDateTime"
    :props="widget.props"
    :style="widget.style"
    @click="showPopup"
    :placeholder="placeholder"
    clearable
    :isLink="!currentDateTime"
    readonly
    :key="showReadonly"
    :formData="formData"
    :validate-trigger="['onChange', 'onBlur']"
    @clearValue="onClear"
  >
    <template #input v-if="showReadonly">
      <taglabel v-bind="separatorAttr" />
    </template>
  </vantField>
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
  import { dataTimePickerInstance } from '@mobile/InstanceComponent/date-time-picker';

  const props = defineProps<{ modelValue?: string; widget: DateTimepicker; formData: any }>();
  const emit = defineEmits(['update:modelValue']);
  const { onChange, afterClear, getValue, setValue, value } = useFormWidget(props, emit);

  const {
    fieldType,
    placeholder,
    dateType,
    format,
    range,
    defaultSysDate,
    field,
    modelKey,
    isFieldModel,
  } = props.widget.props;

  const { openPicker } = dataTimePickerInstance({ displayFormat: dateType });
  const { readonly, disabled } = toRefs(props.widget.props);
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
    if (!value.value) return;
    return dayjs(value.value).format(format);
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: showReadonly.value ? currentDateTime.value : currentDateTime.value ?? placeholder,
      style: !currentDateTime.value && {
        color: 'var(--van-gray-5)',
        paddingLeft: layout?.value?.inputBg ? '12px' : '',
        fontSize: '16px',
      },
    };
  });

  const showPopup = async () => {
    const datetime = await openPicker({
      value: value.value,
      ...getMobileDateRange(range),
      title: '选择日期时间',
    });
    emit('update:modelValue', datetime);
    onChange(datetime);
  };
  const onClear = () => {
    emit('update:modelValue', null);
    afterClear();
  };
  defineExpose({ getValue, setValue });
</script>
<style scoped lang="less">
  :deep(.van-cell__right-icon) {
    padding: v-bind("layout.inputBg?'10px 0':''");
  }
</style>
