<template>
  <taglabel v-bind="separatorAttr" class="ell" />
</template>

<script setup lang="ts" name="gct-date-table">
  import { ref, computed, toRefs, onMounted, nextTick, inject } from 'vue';
  import { Datepicker } from '/@page-designer/types/mobile';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { getDefaultDate } from '/@page-designer/constant/index';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import dayjs from 'dayjs';
  import taglabel from '../../__components__/taglabel.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { get } from 'lodash-es';

  const layout: any = inject('form-layout', {});

  const props = defineProps<{ modelValue?: string; widget: Datepicker; formData: any }>();
  const emit = defineEmits(['update:modelValue']);

  const { getValue, setValue, value } = useFormWidget(props, emit);

  const {
    fieldType,
    placeholder,
    dateType,
    format,
    defaultSysDate,
    field,
    modelKey,
    isFieldModel,
  } = props.widget.props;
  const { readonly, disabled } = toRefs(props.widget.props);

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
    if (!value.value) return;
    return dayjs(value.value).format(format);
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: showReadonly.value ? (currentDate.value ?? '') : (currentDate.value ?? placeholder),
      style: !currentDate.value && {
        color: 'var(--van-gray-5)',
        paddingLeft: layout?.value?.inputBg ? '12px' : '',
        fontSize: '16px',
      },
    };
  });

  defineExpose({ getValue, setValue });
</script>
