<template>
  <a-upload-dragger
    v-if="!readonly"
    :class="disabled ? 'upload-disabled' : ''"
    :fileList="[]"
    :disabled="disabled"
  >
    <div>
      <i class="iconfont icon-tupian-shili"></i>
    </div>
    <p class="ant-upload-text" style="font-size: 14px">{{
      $t('sys.pageDesigner.clickOrDragToUpload')
    }}</p>
  </a-upload-dragger>
  <div class="upload-readonly" v-else>
    <i class="iconfont icon-tupian-shili"></i>
  </div>
</template>

<script name="UploadDesign" setup lang="ts">
  defineProps<{
    disabled: boolean;
    readonly: boolean;
  }>();
</script>

<style lang="less" scoped>
  .icon-tupian-shili {
    line-height: 56px;
    font-size: 56px;
    color: var(--ant-primary-color);
  }
  .upload-disabled {
    .icon-tupian-shili {
      color: #c3c3c3;
    }
  }
  :deep(.ant-upload.ant-upload-drag.upload-disabled p.ant-upload-text) {
    color: #c3c3c3;
  }
  :deep(.ant-upload.ant-upload-drag) {
    background: #f7f8fa;
  }
  :deep(.ant-upload.ant-upload-drag.ant-upload-disabled) {
    opacity: 1;
  }
  :deep(.ant-upload.ant-upload-drag .ant-upload) {
    padding: 40px 0;
  }
  .upload-readonly {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    text-align: center;
    background: #f7f8fa;
    border: 1px dashed #d9d9d9;
    & > .icon-tupian-shili {
      line-height: 80px;
      font-size: 40px;
      color: #c3c3c3;
    }
  }
</style>
