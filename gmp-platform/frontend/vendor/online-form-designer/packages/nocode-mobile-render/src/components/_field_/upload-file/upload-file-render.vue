<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :annotationInfo="annotationInfo"
  >
    <image-cell-comp-field
      v-if="!modelValue"
      :show-disabled="showDisabled"
      :real-field-id="realFieldId"
      label="添加附件"
    />

    <FileUpload
      v-else
      :disabled="showDisabled"
      :readonly="true"
      :modelValue="modelValue"
      :maxSize="uploadConfig.maxSize"
      :maxCount="uploadConfig.maxCount"
      :accept="uploadConfig.accept"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-upload-file-render">
  import { useNocodeFormWidget, useWidgetStaticAttrs, type IUploadFile } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import { FileUpload } from '../../_common_';
  import ImageCellCompField from '../../_common_/base-cell-comp-field/image-cell-comp-field.vue';

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

  const { realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { showDisabled, uploadConfig } = useWidgetStaticAttrs(props.widget);
</script>
