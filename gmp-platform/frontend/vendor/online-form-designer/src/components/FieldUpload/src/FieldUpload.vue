<template>
  <div class="field-upload-wrapper w-full">
    <FileList
      v-if="readonly && fileList.length"
      :isDesign="isDesign"
      :hideSwitch="!!hideSwitch"
      :fileList="fileList"
      :materialType="materialType"
      :showType="showType"
      :nameClick="nameClick"
      :hasSize="hasSize"
      @update:showType="updateType"
    />
    <template v-if="!readonly">
      <UploadDesign v-if="isDesign" :disabled="disabled" />
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
        @update:modelValue="updateValue"
        @saveTableRow="saveTableRowData"
      />
    </template>
  </div>
</template>

<script setup lang="ts" name="FieldUpload">
  import { computed, ref, toRef } from 'vue';
  import UploadDesign from './components/upload-design.vue';
  import baseUpload from './components/base-upload.vue';
  import FileList from './components/file-list.vue';
  import { MaterialEnum } from '/@/enums/appEnum';
  import { isArray, isString } from '/@/utils/is';

  const props = defineProps<{
    modelKey?: string;
    modelValue?: string | any[];
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
    /** 名字点击事件*/
    nameClick?: Function;
    /** 是否隐藏切换按钮 */
    hideSwitch?: boolean;
  }>();

  const showType = ref<'Card' | 'List'>('List');

  const emit = defineEmits(['update:modelValue', 'onBeforeUpload', 'saveTableRow']);

  const hasSize = computed(() => {
    if (isArray(props.modelValue)) {
      return false;
    }
    return true;
  });

  const fileList = toRef(() => {
    if (isArray(props.modelValue)) {
      return props.modelValue;
    } else if (isString(props.modelValue)) {
      const fileValues = props.modelValue ? props.modelValue.split(',') : [];
      return fileValues.map((val) => ({
        path: val,
        name: val.split('/').at(-1),
        size: props.isDesign ? 88000000 : 0,
      }));
    }
    return props.modelValue || [];
  });

  const updateValue = (value) => {
    return emit('update:modelValue', value);
  };

  const updateType = (value) => {
    showType.value = value;
  };

  const saveTableRowData = () => {
    /**列字段时候触发保存 */
    emit('saveTableRow');
  };
  defineExpose({
    getShowType() {
      return showType.value;
    },
  });
</script>

<style lang="less" scoped></style>
