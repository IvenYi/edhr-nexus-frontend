<template>
  <vantField
    v-model="currentTime.showTimeValue"
    :props="widget.props"
    :style="widget.style"
    @click="showPopup"
    clearable
    readonly
    :isLink="!currentTime.showTimeValue"
    @clearValue="onClear"
    :key="showReadonly"
    :formData="formData"
  >
    <template #input v-if="showReadonly">
      <taglabel v-bind="separatorAttr" />
    </template>
  </vantField>

  <van-popup v-model:show="show" position="bottom">
    <van-time-picker
      v-model="currentTime.compTimeValue"
      @confirm="onConfirm"
      @cancel="onCancel"
      v-bind="timePickerAttr"
    />
  </van-popup>
</template>

<script setup lang="ts" name="gct-timepicker">
  import { ref, computed, reactive, onMounted, nextTick, inject } from 'vue';
  import { Timepicker } from '/@page-designer/types/mobile';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';

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

  const show = ref(false);

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

  const currentTime = computed(() => {
    if (!value.value) {
      return {
        showTimeValue: value.value,
        compTimeValue: [],
      };
    }

    const time = value.value.split(':').slice(0, format.split(':').length);

    return {
      showTimeValue: time.join(':'),
      compTimeValue: time,
    };
  });

  const timePickerAttr = computed(() => {
    return {
      title: '选择时间',
      columnsType: DateFormat[timeType].columnsType,
    };
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: currentTime.value.showTimeValue ?? '',
    };
  });

  const showPopup = () => {
    if (showReadonly.value || showDisabled.value) return;
    show.value = true;
  };

  const onConfirm = ({ selectedValues }) => {
    const val = dayjs(
      `2000-01-01 ${selectedValues.slice(0, format.split(':').length).join(':')}`,
    ).format(DateFormat[timeType].valueFormat);
    emit('update:modelValue', val);
    show.value = false;
    onChange(val);
  };

  const onCancel = () => {
    show.value = false;
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
