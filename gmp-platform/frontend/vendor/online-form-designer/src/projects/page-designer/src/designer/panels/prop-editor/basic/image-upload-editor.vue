<template>
  <a-upload-dragger
    v-if="!propValue"
    name="file"
    accept="image/png,image/jpg,image/jpeg"
    :multiple="false"
    :show-upload-list="false"
    :beforeUpload="beforeImageUpload"
  >
    <div>
      <i class="iconfont icon-tupian-shili"></i>
    </div>
    <p class="ant-upload-text" style="font-size: 14px">{{
      $t('sys.pageDesigner.clickOrDragToUpload')
    }}</p>
    <p class="text-[12px] text-[#c3c3c3]">
      {{ `支持jpg、png图片格式，大小100KB以内` }}
    </p>
  </a-upload-dragger>
  <cropper-free
    v-else
    :uploadApi="uploadApi"
    :style="{
      '--height': '112px',
      '--width': '224px',
    }"
    :aspectRatio="aspectRatio"
    icon="icon-tupian-shili"
    :accept="['jpg', 'png', 'jpeg']"
    :isDrag="true"
    :beforeUpload="beforeFreeUpload"
    :modalTitle="'编辑图片'"
    :uploadText="'重新上传'"
    v-model:value="propValue"
    @change="handleUploadSuccess"
    :key="aspectRatio"
  />
  <!-- 图片编辑弹窗 -->
  <CopperFreeModal
    v-if="!propValue"
    @register="register"
    @upload-success="handleUploadSuccess"
    :uploadApi="uploadApi"
    :aspectRatio="aspectRatio"
    :src="sourceValue"
    :accept="['jpg', 'png', 'jpeg']"
    :title="'编辑图片'"
    :uploadText="'重新上传'"
  />
</template>

<script setup lang="ts" name="image-upload-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { ref, computed, nextTick } from 'vue';
  import { Uploader } from '@/utils/uploader';
  import { message } from 'ant-design-vue';
  import { uploadApi } from '/@/api/sys/upload';
  import { CropperFree } from '/@/components/Cropper';
  import { useModal } from '/@/components/Modal';
  import CopperFreeModal from '/@/components/Cropper/src/CopperFreeModal.vue';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const [register, { openModal: openFreeModal }] = useModal();

  const sourceValue = ref('');

  const beforeImageUpload = (file) => {
    const fileSize = file.size / 1024;
    if (fileSize > 100) {
      message.warning(`【${file.name}】文件大小不能超过 100KB`);
      return Promise.reject();
    }
    if (!['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
      message.warning(`【${file.name}】支持的扩展名为.jpg .png`);
      return Promise.reject();
    }
    const windowURL = window.URL || window.webkitURL;
    const src = windowURL.createObjectURL(file);
    sourceValue.value = src;
    openFreeModal(true);
    return Promise.reject();
  };

  const beforeFreeUpload = (file) => {
    const fileSize = file.size / 1024;
    console.log('file.type', file.type);
    if (fileSize > 100) {
      message.warning(`【${file.name}】文件大小不能超过 100KB`);
      return Promise.reject();
    }
  };

  function handleUploadSuccess({ source, data }) {
    propValue.value = data;
    getBase64ImageSize(source, (size) => {
      const whRadio = size.width / size.height;
      defProps.widget.props.whRadio = whRadio;
      console.log('size', size);
    });
  }

  // 获取图片尺寸
  function getBase64ImageSize(base64, callback) {
    var img = new Image();
    img.onload = () => {
      callback({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      callback(null);
    };
    img.src = base64;
  }

  // const value = computed<string[]>({
  //   get() {
  //     try {
  //       return propValue.value ? propValue.value.split(',') : [];
  //     } catch (error) {
  //       return [];
  //     }
  //   },
  //   set(value) {
  //     propValue.value = value ? value.join(',') : '';
  //   },
  // });

  const aspectRatio = computed(() => {
    return defProps.widget?.props.autoWidth
      ? 0
      : Math.round(
          (Number(defProps.widget?.props.width) / Number(defProps.widget?.props.height)) * 10,
        ) / 10;
  });

  const acceptList = computed(() => {
    const _accept = ['jpeg', 'jpg', 'png'];
    return [
      ...new Set(
        _accept.some((i) => i === 'jpg' || i === 'jpeg')
          ? _accept.concat(['jpg', 'jpeg'])
          : _accept,
      ),
    ].map((i) => '.' + i);
  });

  const fileaccept = computed(() => {
    return acceptList.value + '' || 'image/*';
  });

  async function beforeUpload({ file }) {
    await uploadFile(file);
  }

  async function uploadFile(file: File) {
    try {
      await Uploader.beforeUploadFun(file, {
        maxSize: 5,
        acceptList: acceptList.value,
        beforeUpload: (file) => {},
      });
      const path = await Uploader.uploadByFile(file, true);
      value.value = [path];
      await nextTick();
    } catch (error) {
      message.warn(error);
    }
  }
</script>

<style lang="less" scoped>
  :deep(.ant-upload.ant-upload-drag .ant-upload) {
    padding: 20px 0 !important;
  }

  :deep(.icon-tupian-shili) {
    color: #c3c3c3;
    font-size: 32px;
    line-height: 1.2;
  }

  :deep(.ant-upload.ant-upload-drag p.ant-upload-text) {
    margin: 0;
    color: #797a7d;
    font-size: 12px !important;
  }

  :deep(.ant-upload.ant-upload-drag) {
    background-color: #fbfbfc;
  }
</style>
