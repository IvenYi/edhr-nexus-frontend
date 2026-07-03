<template>
  <vantField
    v-model="currentDateTime"
    :props="widget.props"
    :style="widget.style"
    @click="showPopup"
    clearable
    readonly
    :isLink="!currentDateTime"
    @clearValue="onClear"
    :key="showReadonly"
    :formData="formData"
    :validate-trigger="['onChange', 'onBlur']"
  >
    <template #input v-if="showReadonly">
      <taglabel v-bind="separatorAttr" />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-timepicker">
  import { ref, computed, reactive, onMounted, nextTick, inject } from 'vue';
  import { Timepicker } from '/@page-designer/types/mobile';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { dataTimePickerInstance } from '@mobile/InstanceComponent/date-time-picker';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import { getDefaultDate } from '/@page-designer/constant/index';
  import dayjs from 'dayjs';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { get } from 'lodash-es';

  const layout: any = inject('form-layout', {});

  const props = defineProps<{ modelValue?: string; widget: Timepicker; formData: any }>();
  const emit = defineEmits(['update:modelValue']);
  const { onChange, getValue, setValue, value, afterClear } = useFormWidget(props, emit);

  const { fieldType, field, modelKey, timeType, format, defaultSysDate, isFieldModel } =
    props.widget.props;
  const { openPicker } = dataTimePickerInstance({ displayFormat: timeType });

  onMounted(async () => {
    await nextTick();
    if (!props.formData.id_ && props.formData[field] === undefined && !isFieldModel) {
      const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
      emit(
        'update:modelValue',
        getDefaultDate(
          defaultSysDate ?? get(fieldInfo, 'defaultValue.value'),
          DateFormat[timeType].valueFormat,
        ),
      );
    }
  });

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: currentDateTime.value ?? '',
    };
  });

  const showPopup = async () => {
    if (showReadonly.value || showDisabled.value) return;
    const time = await openPicker({ value: value.value, title: '选择时间' });
    value.value = time;
    onChange(time);
  };

  const onClear = () => {
    emit('update:modelValue', null);
    afterClear();
  };
  const currentDateTime = computed(() => {
    if (!value.value) return;
    return dayjs(`2000-01-01 ${value.value}`).format(format);
  });
  defineExpose({ getValue, setValue });
</script>
<style scoped lang="less">
  :deep(.van-cell__right-icon) {
    padding: v-bind("layout.inputBg?'10px 0':''");
  }
</style>
