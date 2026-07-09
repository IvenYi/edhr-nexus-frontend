<template>
  <FieldUpload
    :isDesign="true"
    :modelKey="modelKey"
    :modelValue="defaultFile"
    :readonly="rowReadonly || readonly"
    :disabled="disabled"
    :materialType="widget.materialType"
  />
</template>

<script name="gct-upload-file" setup lang="ts">
  import { toRefs, onBeforeMount, ref } from 'vue';
  import { UploadFile } from '/@page-designer/types/web';

  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { FieldUpload } from '/@/components/FieldUpload';

  const props = defineProps<{ widget: UploadFile; rowReadonly?: boolean }>();
  const { dragger, field, modelKey, readonly, disabled } = toRefs(props.widget.props);

  const { getFileAttrs } = useAsyncFileAttrs();

  const defaultFile = ref('示例内容.docx');

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field.value, modelKey: modelKey.value });
  });
</script>

<style lang="less" scoped></style>
