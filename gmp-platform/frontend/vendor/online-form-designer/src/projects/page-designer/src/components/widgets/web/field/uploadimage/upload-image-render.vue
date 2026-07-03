<template>
  <div
    :style="{
      height: widget.style.height ? `${widget.style.height}px` : 'auto',
      overflowY: 'auto',
    }"
  >
    <ImageUpload
      :modelKey="modelKey"
      :modelValue="modelValue"
      :isDesign="false"
      :readonly="readonly"
      :disabled="disabled"
      :maxSize="attrObj.maxSize"
      :maxCount="attrObj.maxCount"
      :accept="attrObj.accept"
      :materialType="widget.materialType"
      :beforeUpload="beforeUpload"
      @update:modelValue="updateValue"
    />
  </div>
</template>

<script name="gct-upload-image" setup lang="ts">
  import { reactive, computed, ref, nextTick, onBeforeMount } from 'vue';
  import { Form } from 'ant-design-vue';
  import { UploadFile } from '/@page-designer/types/web';
  import { getPageEvent, useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { ImageUpload } from '/@/components/ImageUpload';

  const Event = getPageEvent();
  const formItemContext = Form.useInjectFormItemContext();
  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<{ modelValue?: string; widget: UploadFile; formData: Object }>();
  const { disabled, readonly, field, modelKey } = reactive(props.widget.props);
  const formData = ref(props.formData);
  const { getFileAttrs, attrObj } = useAsyncFileAttrs();

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field, modelKey: modelKey });
  });

  const value = props.widget.props.field
    ? computed<string[]>({
        get() {
          try {
            return props.modelValue ? props.modelValue.split(',') : [];
          } catch (error) {
            return [];
          }
        },
        set(value) {
          if (value?.length > 0) {
            emit('update:modelValue', value ? value.join(',') : '');
          } else {
            emit('update:modelValue', '');
          }
          formItemContext.onFieldChange();
        },
      })
    : ref([]);

  const updateValue = async (fileValue) => {
    value.value = fileValue;
    await nextTick();
    // if (enableAutofill) {
    //   /**多个文件只选第一个文件数据填充 */
    //   autofillRules.forEach(({ fromField, toField }) => {
    //     formData.value[toField] = fileList.value[fileList.value.length - 1]?.[fromField];
    //   });
    // }
    Event.runEventByName('onChange', props.widget.events, props.modelValue, formData.value);
  };

  const beforeUpload = (file) => {
    return Event.runEventByName('onValidator', props.widget.events, file, formData.value);
  };
</script>

<style lang="less" scoped>
  .image-upload {
    width: 100px;
    height: 100px;
  }

  .imgitem {
    display: inline-block;
    width: 100px;
    height: 100px;
    border: 1px dashed #f1f1f1;
  }
</style>
