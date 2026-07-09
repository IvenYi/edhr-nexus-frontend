<template>
  <FieldSign
    v-model="value"
    :label="showFieldName"
    :disabled="showDisabled || showReadonly"
    :required="showRequired"
    :placeholder="placeholder"
    :signatureType="signatureType"
    :signShowType="signDisplayStyle"
    :signTimeType="signTimeType"
    :signatureNumber="signatureNumber"
    @add="handleAdd"
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
  </FieldSign>
</template>

<script setup lang="ts" name="online-form-sign-field-render">
  import { reactive, ref, computed } from 'vue';
  import dayjs from 'dayjs';
  import {
    SignatureNumberTypeEnum,
    SignatureTimeTypeEnum,
    SignatureTypeEnum,
    useNocodeFormWidget,
    type ISign,
  } from '@gct/nocode-base';
  import { FieldSign, FieldTypeIcon } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';

  const props = defineProps<{
    modelValue?: string;
    widget: ISign;
    formData: any;
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

  const { value, onChange } = useNocodeFormWidget(props, emit);

  const { fieldType, placeholder, showRequired, showDisabled, showReadonly, showFieldName } =
    useMobileAttrs(props.widget);

  const {
    signatureType,
    signDisplayStyle,
    signTimeType,
    signatureNumber = SignatureNumberTypeEnum.SIGNATURE_MULTIPLE,
    populateFields,
  } = reactive(props.widget.props);

  const shouldShowDate = computed(() => signatureType !== SignatureTypeEnum.SIGNATURE_ONLY);

  const handleAdd = (signature: any) => {
    updateDateFields(signature);
    onChange();
  };

  const updateDateFields = (signature: any) => {
    if (
      !shouldShowDate.value ||
      signatureNumber === SignatureNumberTypeEnum.SIGNATURE_MULTIPLE ||
      signTimeType !== SignatureTimeTypeEnum.POPULATE_FIELD
    )
      return;

    const format =
      signatureType === SignatureTypeEnum.SIGNATURE_DATE ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';

    const formattedTime = dayjs(signature.time).format(format);

    populateFields?.forEach(({ field }) => {
      props.formData[field!] = formattedTime;
    });
  };
</script>
