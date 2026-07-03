<template>
  <div class="image-data__wrapper">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">地址</div>
      <div class="sub-content">
        <a-input disabled :value="src" />
      </div>
    </div>
    <div class="setting-row">
      <!-- <div class="sub-title">{{ t('sys.upload') }}</div> -->
      <div class="sub-content">
        <a-upload :show-upload-list="false" :custom-request="uploadFile">
          <a-button type="primary">{{ t('sys.upload') }}</a-button>
        </a-upload>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup name="image-data">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postDesignerCommonUploadLabelImage } from '/@/apis/gct-apaas/DesignerCommonController';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { postFileResourceUpload } from '/@/apis/gct-apaas/FileResourceController';
  import { usePage } from '../../../hooks/usePage';

  const { t } = useI18n();
  const emit = defineEmits(['changeEvent']);
  const { createMessage } = useMessage();
  const { project } = usePage();
  const props = defineProps(['src']);
  const metaData = (src) => {
    let img = new Image();
    img.src = src;
    // todo: 如何获取新图片的长宽？
    if (img.complete) {
    } else {
      img.onload = () => {};
    }
  };
  metaData(props.src);
  const uploadFile = async (data) => {
    if (beforeUpload(data.file)) {
      const form = new FormData();
      form.append('file', data.file);
      // this.onUploadImgSuccess(await uploadFile(form));
      onUploadImgSuccess(
        await postFileResourceUpload(
          form,
          { type: 'LABEL_IMAGE', ...(project.value?.modelKey ? { modelKey: project.value.modelKey } : {}) },
          {
            transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
          },
        ),
      );
    }
  };
  const beforeUpload = (file) => {
    const types = ['image/jpeg', 'image/png'];
    const isJPG = types.includes(file.type);
    const isLt2M = file.size / 1024 / 1024 < 5;

    if (!isJPG) {
      createMessage.error('上传图片只能是 JPG/PNG 格式!');
      return false;
    }
    if (!isLt2M) {
      createMessage.error('上传图片大小不能超过 5MB!');
      return false;
    }
    return true;
  };

  const onUploadImgSuccess = (res) => {
    emit('changeEvent', res);
  };
</script>
