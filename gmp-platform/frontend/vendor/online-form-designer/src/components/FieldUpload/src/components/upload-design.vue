<template>
  <div class="upload-design">
    <div style="pointer-events: none">
      <a-upload-dragger :fileList="[]" :disabled="disabled">
        <div>
          <SvgIcon size="56" name="folder" />
        </div>
        <p class="ant-upload-text" style="font-size: 14px">点击或将文件拖拽到这里上传</p>
      </a-upload-dragger>
    </div>
    <div class="progress-wrap">
      <SvgIcon size="32" name="doc" />
      <div class="progress-box text-sm">
        <div class="left w-full">
          <span class="label">示例内容.docx</span>
          <span class="size ml-16px text-[#C3C3C3]">88M</span>
        </div>
        <a-progress :strokeWidth="4" :percent="88" />
      </div>
      <close-outlined class="mt-3px icon" />
    </div>
  </div>
</template>

<script name="UploadDesign" setup lang="ts">
  import { SvgIcon } from '/@/components/Icon';

  defineProps<{
    disabled: boolean;
  }>();
</script>

<style lang="less" scoped>
  .progress-wrap {
    display: flex;
    margin-top: 16px;
    .progress-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      line-height: 22px;
      align-self: center;
      :deep(.ant-progress) {
        line-height: 0.4;
        .ant-progress-text {
          position: absolute;
          right: 0;
          top: -14px;
          line-height: 0.6;
          color: #797a7d;
        }
      }
      :deep(.ant-progress-show-info .ant-progress-outer) {
        margin-right: 0;
        padding-right: 0;
        .ant-progress-inner {
          background: #e6e9ef;
        }
      }
    }
    .icon {
      margin-left: 24px;
      font-size: 16px;
      color: #212528 !important;
      align-self: center;
    }
  }
  :deep(.ant-upload.ant-upload-drag) {
    background: #f7f8fa;
  }
  :deep(.ant-upload.ant-upload-drag.ant-upload-disabled) {
    opacity: 0.5;
  }
  :deep(.ant-upload.ant-upload-drag .ant-upload) {
    padding: 40px 0;
  }
</style>
