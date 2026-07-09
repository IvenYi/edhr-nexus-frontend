<template>
  <div class="import-file-uploader">
    <a-upload-dragger
      name="file"
      :multiple="false"
      :showUploadList="false"
      :beforeUpload="handleBeforeUpload"
      :customRequest="customRequest"
      accept=".zip"
    >
      <img :src="SvgIcon" />
      <div class="text-[#212528] mt16px">{{ $t('sys.edhr.uploadFileTips') }}</div>
    </a-upload-dragger>
    <div v-if="fileVal" class="import-file-uploader__file">
      <img class="import-file-uploader__file-icon" :src="FileSvgIcon" />
      <div class="flex-grow-1">
        <div class="import-file-uploader__file-name">{{ fileVal.name }}</div>
        <div class="import-file-uploader__file-size">{{ sizeParser(fileVal.size) }}</div>
      </div>
      <i
        @click="doRemove"
        class="import-file-uploader__file-remove gct-iconfont icon-toast_guanbi"
      ></i>
    </div>
  </div>
</template>

<script lang="ts" setup name="import-file-uploader">
  import { reactive, ref, computed } from 'vue';
  import SvgIcon from '/@/assets/svg/pic_upload.svg';
  import FileSvgIcon from '/@/assets/svg/pic_file.svg';
  import { sizeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { message, UploadFile } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      modelValue?: File;
    }>(),
    {
      modelValue: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', modelValue: File): void;
  }>();

  const fileVal = computed({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  const doRemove = () => {
    fileVal.value = undefined;
  };

  const handleBeforeUpload = (file: UploadFile) => {
    console.log('file.type', file.type);
    if (file.name.endsWith('.zip')) {
      return true;
    } else {
      message.error(`只能上传zip格式文件`);
      return false;
    }
  };

  const customRequest = async ({ file }) => {
    fileVal.value = file;
    console.log('file', file);
  };
</script>

<style lang="less" scoped>
  .import-file-uploader {
    :deep(.ant-upload.ant-upload-drag) {
      background: #fff;
      border-radius: 4px;
      &:hover {
        background: rgba(2, 106, 200, 0.06);
      }
      .ant-upload {
        padding: 32px 0;
      }
    }

    &__file {
      background: #f6f8fa;
      border-radius: 4px 4px 4px 4px;
      height: 64px;
      margin-top: 24px;
      display: flex;
      align-items: center;
      &-icon {
        margin: 0 8px 0 12px;
      }
      &-name {
        font-weight: 400;
        font-size: 14px;
        color: #1a1d23;
      }
      &-size {
        font-weight: 400;
        font-size: 12px;
        color: #8b8b8b;
      }
      &-remove {
        cursor: pointer;
        font-size: 14px;
        color: #5a5f6b;
        margin-right: 16px;
      }
    }
  }
</style>
