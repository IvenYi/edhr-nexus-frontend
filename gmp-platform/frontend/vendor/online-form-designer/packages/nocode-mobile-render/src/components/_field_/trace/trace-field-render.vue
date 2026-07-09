<template>
  <component
    :is="comp[fieldType]"
    v-model="value"
    :label="showFieldName"
    :disabled="showDisabled || showReadonly"
    :required="showRequired"
    :placeholder="placeholder"
    ref="traceRef"
    :widget="widget"
    :formData="formData"
    @change="onChange"
    @input="onChange"
    @clearValue="onClear"
  >
    >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
  </component>
</template>

<script setup lang="ts" name="online-form-input-render">
  import { reactive, ref, computed } from 'vue';

  import { useWidgetStaticAttrs, type ITrace, useNocodeFormWidget } from '@gct/nocode-base';
  import { FieldInput, FieldTypeIcon } from '../../_common_';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import TraceSelect from './component/trace-select.vue';
  import TraceRdoSelect from './component/trace-rdo-select.vue';
  import { useMobileAttrs } from '../../../hooks';
  import TraceDate from './component/trace-date.vue';

  const comp = {
    [FIELD_TYPE.MATERIAL_NO]: TraceSelect,
    [FIELD_TYPE.RELATED_LOT_NO]: TraceSelect,
    [FIELD_TYPE.SCRAP_MATERIAL_NO]: TraceSelect,
    [FIELD_TYPE.RECORD_NO]: FieldInput,
    [FIELD_TYPE.ORDER_NO]: FieldInput,
    [FIELD_TYPE.DEVICE]: TraceSelect,
    [FIELD_TYPE.MFG_ORDER]: TraceSelect,
    [FIELD_TYPE.PRODUCT]: TraceRdoSelect,
    [FIELD_TYPE.SCRAP_MATERIAL]: TraceRdoSelect,
    [FIELD_TYPE.TRACE_DATE]: TraceDate,
  };

  const props = defineProps<{
    modelValue?: string;
    widget: ITrace;
    formData: Object;

    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { value, onChange, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { showRequired, showDisabled, fieldType, placeholder, showFieldName, showReadonly } =
    useMobileAttrs(props.widget);

  const onClear = () => {
    value.value = undefined;
    console.log('onClear');
  };
</script>
