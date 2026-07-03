<template>
  <!-- <a-popover
    v-model:visible="visible"
    trigger="click"
    :overlayStyle="{ width: '402px' }"
    :overlayClassName="'upload-field-con'"
  >
    <template #content>
      <ImageUpload
        :isDesign="true"
        :readonly="readonly"
        :disabled="disabled"
        :materialType="widget.materialType"
      />
    </template> -->
  <div class="table-field-box">
    <PlusOutlined v-show="!readonly" class="icon-color pr-8px" />
    <span v-show="readonly" class="img-icon flex">
      <img :src="PicReadonly" class="w24px h24px" />
    </span>
  </div>
  <!-- </a-popover> -->
</template>

<script name="gct-upload-image" setup lang="ts">
  import { toRefs, onBeforeMount, toRef } from 'vue';
  import { UploadFile } from '/@page-designer/types/web';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  // import { ImageUpload } from '/@/components/ImageUpload';
  import PicReadonly from '/@/assets/svg/pic_default.svg';

  const props = defineProps<{ widget: UploadFile; rowReadonly?: boolean }>();
  const { field, modelKey } = toRefs(props.widget.props);
  const readonly = toRef(() => props.rowReadonly || props.widget.props.readonly);
  const { getFileAttrs } = useAsyncFileAttrs();
  // const visible = ref<boolean>(false);

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field.value, modelKey: modelKey.value });
  });
</script>

<style lang="less" scoped>
  .table-field-box {
    display: flex;
    align-items: center;
    width: 100%;

    .icon-color {
      color: var(--ant-primary-color);
      font-size: 16px;
    }

    .img-icon {
      align-items: center;
      justify-content: center;
      background: #eff2f5;
      width: 32px;
      height: 32px;
      border-radius: 4px;
    }
  }

  .upload-field-con {
    .ant-popover-inner-content {
      padding: 16px;
    }
  }
</style>
