<template>
  <NocodeField
    :class="['field-upload-file']"
    :label="showFieldName"
    :required="showRequired"
    :placeholder="placeholder"
    :clearable="false"
    :disabled="showDisabled || showReadonly"
    label-align="top"
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
    <template #input>
      <FileUpload
        :readonly="false"
        :disabled="showDisabled || showReadonly"
        :maxSize="uploadConfig.maxSize"
        :maxCount="uploadConfig.maxCount"
        :accept="uploadConfig.accept"
        :modelValue="modelValue"
        :modelKey="modelKey"
        @update:modelValue="updateValue"
      />
    </template>
  </NocodeField>
</template>

<script setup lang="ts" name="online-form-upload-file-field-render">
  import { computed } from 'vue';
  import { useNocodeFormWidget, renderUtils, type IUploadFile } from '@gct/nocode-base';
  import { NocodeField, FileUpload, FieldTypeIcon } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';

  const props = defineProps<{
    modelValue?: string;
    widget: IUploadFile;
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

  const { onChange } = useNocodeFormWidget(props, emit);

  const {
    showRequired,
    showDisabled,
    showReadonly,
    uploadConfig,
    placeholder,
    showFieldName,
    fieldType,
    modelKey,
  } = useMobileAttrs(props.widget);

  const value = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, true);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, true));
    },
  });

  const updateValue = async (fileValue) => {
    value.value = fileValue;
    onChange();
  };
</script>
