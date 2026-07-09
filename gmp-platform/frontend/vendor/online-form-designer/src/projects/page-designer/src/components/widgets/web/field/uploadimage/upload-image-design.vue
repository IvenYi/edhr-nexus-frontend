<template>
  <!-- <tagelabel
    v-if="rowReadonly || readonly"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="true"
  />
  <a-upload-dragger v-if="!readonly && dragger">
    <p class="ant-upload-drag-icon">
      <inbox-outlined />
    </p>
    <p class="ant-upload-text">将图片拖到此处，或者点击上传</p>
    <p class="ant-upload-hint" v-if="attrObj.acceptStr">
      支持拖拽图片件格式：{{ attrObj.acceptStr }}
    </p>
  </a-upload-dragger>
  <a-button v-else-if="!readonly && !dragger" type="dashed" class="image-upload">
    <div> <plus-outlined /></div>
    上传
  </a-button> -->
  <ImageUpload
    :isDesign="true"
    :modelKey="modelKey"
    :readonly="rowReadonly || readonly"
    :disabled="disabled"
    :materialType="widget.materialType"
  />
</template>

<script name="gct-upload-image" setup lang="ts">
  import { toRefs, onBeforeMount } from 'vue';
  import { UploadFile } from '/@page-designer/types/web';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { ImageUpload } from '/@/components/ImageUpload';

  const props = defineProps<{ widget: UploadFile; rowReadonly?: boolean }>();
  const { field, modelKey, readonly, disabled } = toRefs(props.widget.props);

  const { getFileAttrs } = useAsyncFileAttrs();

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field.value, modelKey: modelKey.value });
  });
</script>

<style lang="less" scoped></style>
