<template>
  <FieldReadonly
    v-if="readonly"
    :label="readylabel"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <a-time-picker
    v-else
    v-model:value="value"
    v-bind="separatorAttr"
    style="width: 100%"
    :style="style"
    @change="onChangeDate"
    :getPopupContainer="PopupContainer"
    dropdown-class-name="vxe-table--ignore-clear"
  />
</template>

<script setup lang="ts" name="gct-timepicker">
  import { computed, reactive, nextTick, onMounted, toRef, toRefs } from 'vue';
  import { Timepicker } from '/@page-designer/types/web';
  import type { TimePickerProps } from 'ant-design-vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import { getDefaultDate } from '/@page-designer/constant/index';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { get } from 'lodash-es';
  import dayjs from 'dayjs';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Timepicker;
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
    timeType,
    format,
    defaultSysDate,
    fieldType,
    isFieldModel,
    modelKey,
    field,
  } = reactive(props.widget.props);
  const onChangeDate = async () => {
    await onChange();
    emit('saveTableRow');
  };
  const { readonly } = toRefs(props.widget.props);
  const valueFormat = DateFormat[timeType].valueFormat;

  onMounted(async () => {
    await nextTick();
    const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
    if (!props.formData.id_ && props.formData[field] === undefined && !isFieldModel) {
      emit(
        'update:modelValue',
        getDefaultDate(defaultSysDate ?? get(fieldInfo, 'defaultValue.value'), valueFormat),
      );
    }
  });
  const style = computed(() => {
    const styleProp = props.widget.style;
    return {
      textAlign: styleProp.contentFont?.align || 'left',
      textAlignLast: styleProp.contentFont?.align || 'left',
    };
  });
  const readylabel = toRef(() => {
    const dataTime = value.value;
    if (dataTime) {
      if (dayjs(dataTime).isValid()) {
        return dayjs(dataTime).format(format);
      }
      if (dayjs(dataTime, format).isValid()) {
        return dayjs(dataTime, format).format(format);
      }
    }
  });
  const separatorAttr = computed(() => {
    let attr: TimePickerProps = {
      allowClear: clearable,
      placeholder,
      valueFormat,
      format,
    };
    return attr;
  });

  defineExpose({ getValue, setValue });
</script>
<style scoped lang="less"></style>
