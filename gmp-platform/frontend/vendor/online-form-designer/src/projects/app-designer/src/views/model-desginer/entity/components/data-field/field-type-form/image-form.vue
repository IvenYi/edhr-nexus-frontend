<template>
  <a-form-item :name="['specificConfig', 'maxNumber']" :label="`${t('sys.model.limitUploadQty')}`">
    <a-input-number
      v-model:value="formData.specificConfig.maxNumber"
      :min="1"
      :max="50"
      :precision="0"
      :defaultValue="1"
      :placeholder="t('sys.inputText')"
      @blur="
        () => {
          if (!formData.specificConfig.maxNumber) formData.specificConfig.maxNumber = 1;
        }
      "
      style="width: 46% !important"
    />
  </a-form-item>
  <a-form-item :name="['specificConfig', 'fileSize']" :label="`${t('sys.model.limitUploadSize')}`">
    <a-input-number
      v-model:value="formData.specificConfig.fileSize"
      :min="1"
      :max="20"
      :precision="0"
      :placeholder="t('sys.inputText')"
      @blur="
        () => {
          if (!formData.specificConfig.fileSize) formData.specificConfig.fileSize = 20;
        }
      "
      style="width: 46% !important"
    />
    <span class="num-unit">MB</span>
  </a-form-item>
  <a-form-item :name="['specificConfig', 'fileTypes']" :label="t('sys.model.uploadSupportType')">
    <a-select
      v-model:value="formData.specificConfig.fileTypes"
      :placeholder="t('sys.pageDesigner.enterOrSelectDefaultSupportAll')"
      mode="tags"
      allowClear
      showArrow
    >
      <a-select-option v-for="item in uploadType.image" :value="item.type" :key="item.type">{{
        item.type
      }}</a-select-option>
    </a-select>
  </a-form-item>
</template>
<script setup lang="ts" name="image">
  import { PropType, reactive, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { uploadType } from '/@app-designer/views/model-desginer/entity/constant/upload';
  import { FormInstance } from 'ant-design-vue';

  const { t } = useI18n();
  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: () => {} },
    isEdit: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
    boolSupportTree: { type: Boolean, default: false },
  });

  const formData = reactive<FieldFormState>(props.formState);

  const initData = () => {
    return {
      specificConfig: {
        fileSize: 20,
        maxNumber: 1,
        fileTypes: [],
      },
    };
  };

  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  defineExpose({
    initData,
  });
</script>
<style lang="scss" scoped>
  .num-unit {
    color: #999;
    margin-left: 8px;
  }
</style>
