<template>
  <div class="image-upload-wrapper w-full">
    <UploadDesign v-if="isDesign" :disabled="disabled" :readonly="readonly" />
    <baseUpload
      v-else
      :readonly="readonly"
      :disabled="disabled"
      :maxSize="maxSize"
      :maxCount="maxCount"
      :accept="accept"
      :modelKey="modelKey"
      :modelValue="modelValue"
      :isTable="isTable"
      :beforeUpload="beforeUpload"
      :materialType="materialType"
      :getContainer="getContainer"
      @update:modelValue="updateValue"
      @saveTableRow="saveTableRowData"
    />
  </div>
</template>

<script setup lang="ts" name="ImageUpload">
  import UploadDesign from './components/upload-design.vue';
  import baseUpload from './components/base-upload.vue';
  import { MaterialEnum } from '/@/enums/appEnum';

  const props = defineProps<{
    modelKey?: string;
    modelValue?: string;
    readonly: boolean;
    disabled: boolean;
    /** 设计模式 */
    isDesign: boolean;
    /** 单个文件大小 */
    maxSize?: number;
    /** 最大上传数量 */
    maxCount?: number;
    /** 支持的格式数组 */
    accept?: string[];
    materialType: MaterialEnum;
    /** 表格模式 */
    isTable?: boolean;
    /** 表单校验 */
    beforeUpload?: Function;
    /** 浮层渲染父节点 */
    getContainer?: Function;
  }>();

  const emit = defineEmits(['update:modelValue', 'onBeforeUpload', 'saveTableRow']);

  const updateValue = (value) => {
    return emit('update:modelValue', value);
  };

  const saveTableRowData = () => {
    /**列字段时候触发保存 */
    emit('saveTableRow');
  };
</script>

<style lang="less" scoped></style>
