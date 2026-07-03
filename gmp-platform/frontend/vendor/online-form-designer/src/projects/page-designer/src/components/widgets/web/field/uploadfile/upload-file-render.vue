<template>
  <FieldUpload
    :modelKey="modelKey"
    :modelValue="modelValue"
    :isDesign="false"
    :readonly="readonly"
    :maxSize="attrObj.maxSize"
    :maxCount="attrObj.maxCount"
    :accept="attrObj.accept"
    :beforeUpload="beforeUpload"
    @update:modelValue="updateValue"
  />
</template>

<script name="gct-upload-file" setup lang="ts">
  import { reactive, computed, ref, nextTick, onBeforeMount, toRefs, watch } from 'vue';
  import { UploadFile } from '/@page-designer/types/web';
  import { Form } from 'ant-design-vue';
  import { getPageEvent, useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { FieldUpload } from '/@/components/FieldUpload';
  import { postFileResourceList } from '/@/apis/gct-apaas/FileResourceController';
  import { sizeParser } from '/@/components/FieldUpload/src/hooks/hooks';

  const formItemContext = Form.useInjectFormItemContext();
  const Event = getPageEvent();
  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<{ modelValue?: string; widget: UploadFile; formData: Object }>();
  const { field, modelKey, enableAutofill, autofillRules } = reactive(props.widget.props);
  const { readonly } = toRefs(props.widget.props);
  const { getFileAttrs, attrObj } = useAsyncFileAttrs();

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field, modelKey: modelKey });
  });

  const { formData } = toRefs(props);

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

  const getFileList = async () => {
    const ids = value.value.map((i) => {
      const arr = i.split('/');
      return arr[2] === modelKey ? arr[3] : arr[2];
    });
    const list = (await postFileResourceList({ ids })) || [];
    return list.map((item) => {
      return {
        path: import.meta.env.VITE_MINIO_PATH + item.url,
        name: item.name,
        size: sizeParser(item.size) || item.size?.toString(),
        type: item.type,
        uploader: item.createUserId,
        uploadTime: item.createTime,
      };
    });
  };

  const fileList = computed(() =>
    value.value.map((i) => ({
      path: import.meta.env.VITE_MINIO_PATH + i,
      name: i.split('/').at(-1),
    })),
  );

  const updateValue = async (fileValue) => {
    value.value = fileValue;
    await nextTick();
    if (enableAutofill) {
      /**多个文件只选第一个文件数据填充 */
      const files = (await getFileList()) || [];
      autofillRules.forEach(({ fromField, toField }) => {
        formData.value[toField] = files[files?.length - 1]?.[fromField];
      });
    }
    Event.runEventByName('onChange', props.widget.events, props.modelValue, formData.value);
  };

  const beforeUpload = (file) => {
    return Event.runEventByName('onValidator', props.widget.events, file, formData.value);
  };
</script>

<style lang="less">
  .upload-file-wrapper {
    width: 100%;
  }
</style>
