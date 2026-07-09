<template>
  <vantField
    v-model="currentDate.showDateValue"
    :props="widget.props"
    :style="widget.style"
    @click="showPopup"
    :placeholder="placeholder"
    clearable
    :isLink="!currentDate.showDateValue"
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
    <van-date-picker
      v-model="currentDate.compDateValue"
      @confirm="onConfirm"
      @cancel="onCancel"
      v-bind="datePickerAttr"
    />
  </van-popup>
</template>

<script setup lang="ts" name="gct-datepicker">
  import { ref, computed, toRefs, onMounted, nextTick, inject } from 'vue';
  import { Datepicker } from '/@page-designer/types/mobile';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { getMobileDateRange, getDefaultDate } from '/@page-designer/constant/index';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import dayjs from 'dayjs';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { get } from 'lodash-es';

  const layout: any = inject('form-layout', {});

  const props = defineProps<{ modelValue?: string; widget: Datepicker; formData: any }>();
  const emit = defineEmits(['update:modelValue']);

  const { onChange, afterClear, getValue, setValue, value } = useFormWidget(props, emit);

  const {
    fieldType,
    placeholder,
    separator,
    dateType,
    format,
    range,
    defaultSysDate,
    field,
    modelKey,
    isFieldModel,
  } = props.widget.props;
  const { readonly, disabled } = toRefs(props.widget.props);
  const show = ref(false);

  const showReadonly = computed(() => useReadyonly(readonly.value));

  const showDisabled = computed(() => useDisabled(disabled.value));

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

  const currentDate = computed(() => {
    if (!value.value) {
      return {
        showDateValue: value.value,
        compDateValue: [],
      };
    }
    const date = dayjs(value.value).format(format);
    return {
      showDateValue: date,
      compDateValue: date.split(separator),
    };
  });

  const datePickerAttr = computed(() => {
    return {
      columnsType: DateFormat[dateType].columnsType,
      ...getMobileDateRange(range),
    };
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: showReadonly.value
        ? currentDate.value.showDateValue ?? ''
        : currentDate.value.showDateValue ?? placeholder,

      style: !currentDate.value.showDateValue && {
        color: 'var(--van-gray-5)',
        paddingLeft: layout?.value?.inputBg ? '12px' : '',
        fontSize: '16px',
      },
    };
  });

  const showPopup = () => {
    show.value = true;
  };

  const onConfirm = ({ selectedValues }) => {
    const val = dayjs(selectedValues.join()).format(DateFormat[dateType].valueFormat);
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
