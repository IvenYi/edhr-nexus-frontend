<template>
  <NocodeField
    :class="['field-upload-image']"
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
      <ImageUpload
        :readonly="false"
        :disabled="showDisabled || showReadonly"
        :maxSize="uploadConfig.maxSize"
        :maxCount="maxCount"
        :accept="uploadConfig.accept"
        :modelKey="modelKey"
        :modelValue="modelValue"
        @update:modelValue="updateValue"
      />
    </template>
  </NocodeField>
</template>

<script setup lang="ts" name="online-form-upload-image-field-render">
  import { reactive, computed } from 'vue';
  import {
    useNocodeFormWidget,
    renderUtils,
    ImageDisplayModeEnum,
    type IUploadImage,
  } from '@gct/nocode-base';
  import { NocodeField, ImageUpload, FieldTypeIcon } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';

  const props = defineProps<{
    modelValue?: string;
    widget: IUploadImage;
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

  const { imageDisplayMode } = reactive(props.widget.props);

  const value = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, true);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, true));
    },
  });

  const isAdaptive = computed(() => imageDisplayMode === ImageDisplayModeEnum.ADAPTIVE);
  const maxCount = computed(() => (isAdaptive.value ? 1 : uploadConfig.maxCount));

  const updateValue = async (fileValue) => {
    value.value = fileValue;
    onChange();
  };
</script>
