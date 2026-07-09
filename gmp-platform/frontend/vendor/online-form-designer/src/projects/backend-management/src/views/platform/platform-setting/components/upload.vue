<template>
  <a-upload
    :file-list="fileList"
    list-type="picture-card"
    accept=".jpg,.png"
    @preview="handlePreview"
    :beforeUpload="handleBeforeUpload"
    :customRequest="uploadLogo"
    @remove="handleRemove"
  >
    <div v-if="!fileList.length">
      <plus-outlined />
      <div class="upload-text">{{ t('sys.platform.imageUpload') }}</div>
    </div>
  </a-upload>
  <div class="tips"><slot name="tip"></slot></div>
  <a-modal :visible="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
    <img style="width: 100%" :src="previewImage" />
  </a-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';

  const fileList = ref([]);
  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');

  const getBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // 预览
  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = (await getBase64(file.originFileObj)) as string;
    }
    previewImage.value = file.url || file.preview;
    previewVisible.value = true;
    previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
  };

  // 上传
  const handleBeforeUpload = (file) => {
    const fileType = ['image/jpg', 'image/png'];
    if (!fileType.includes(file.type)) {
      message.error('只能上传JPG/PNG格式文件!');
      return false;
    }
    return true;
  };

  const uploadLogo = () => {};

  const handleRemove = () => {};

  const handleCancel = () => {};
</script>

<style lang="less">
  .tips {
    color: #999999;
    font-size: 12px;
  }
</style>
