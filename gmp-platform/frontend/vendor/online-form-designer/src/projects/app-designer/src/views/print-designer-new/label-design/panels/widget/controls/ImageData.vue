<template>
  <div class="image-data__wrapper">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ t('sys.pageDesigner.uploadimage') }}</div>
      <a-upload-dragger :fileList="[]" :custom-request="uploadFile">
        <div class="text-[#C3C3C3] h-47px">
          <i class="iconfont icon-tupian-shili" style="font-size: 32px"></i>
        </div>
        <p class="text-[#797A7D]" style="font-size: 12px">{{
          t('sys.pageDesigner.clickOrDragToUpload')
        }}</p>
        <p class="text-[#C3C3C3]" style="font-size: 12px">{{
          t('sys.pageDesigner.imgUploadTip')
        }}</p>
      </a-upload-dragger>
    </div>

    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ t('sys.pageDesigner.address') }}</div>
      <div class="sub-content">
        <a-input disabled :value="src" :placeholder="t('sys.pageDesigner.autoBroughtOut')" />
      </div>
    </div>
    <!-- <div class="setting-row">
      <div class="sub-content">
        <a-upload :show-upload-list="false" :custom-request="uploadFile">
          <a-button type="primary">{{ t('sys.upload') }}</a-button>
        </a-upload>
      </div>
    </div> -->
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
      createMessage.error($t('sys.printDesigner.imgFormatTip', ['JPG/PNG']));
      return false;
    }
    if (!isLt2M) {
      createMessage.error($t('sys.printDesigner.imgSizeTooLargeTip', [5]));
      return false;
    }
    return true;
  };

  const onUploadImgSuccess = (res) => {
    emit('changeEvent', res);
  };
</script>
<style lang="less" scoped>
  .sub-content {
    :deep(.ant-input-affix-wrapper .ant-input-suffix) {
      display: none;
    }
  }
</style>
