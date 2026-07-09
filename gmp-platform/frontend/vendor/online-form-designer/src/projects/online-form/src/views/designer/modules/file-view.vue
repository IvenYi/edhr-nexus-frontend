<template>
  <div class="file-form-upload-wrapper">
    <div class="file-form-upload-design">
      <div style="pointer-events: none">
        <a-upload-dragger :fileList="[]" class="file-form-upload-dragger">
          <div>
            <SvgIcon size="56" name="folder" />
          </div>
          <p class="file-form-upload-text">{{ $t('sys.edhr.uploadFileTips') }}</p>
          <p class="file-form-hint">{{ $t('sys.onlineForm.uploadLimitTip') }}</p>
        </a-upload-dragger>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { SvgIcon } from '/@/components/Icon';
</script>

<style scoped lang="less">
  .file-form-upload-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    .file-form-upload-design {
      padding: 32px 64px;

      .file-form-upload-text {
        font-size: 16px;
        margin-bottom: 8px;
        color: #2c3e50;
      }

      .file-form-hint {
        color: #7f8c8d;
        font-size: 14px;
      }
    }
  }
  :deep(.file-form-upload-dragger.ant-upload.ant-upload-drag) {
    background: #f7f8fa;
  }

  :deep(.file-form-upload-dragger.ant-upload.ant-upload-drag .ant-upload) {
    padding: 40px 0;
  }
</style>
