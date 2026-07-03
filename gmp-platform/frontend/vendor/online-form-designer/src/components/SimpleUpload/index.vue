<template>
  <div>
    <a-upload
      :file-list="fileList"
      :list-type="listType"
      :accept="accept"
      :beforeUpload="handleBeforeUpload"
      :customRequest="handleCustomRequest"
      @preview="handlePreview"
      @remove="handleRemove"
    >
      <slot></slot>
      <template v-if="listType === 'picture-card'">
        <div v-if="fileList.length < maxCount">
          <plus-outlined />
          <div style="margin-top: 8px">{{ $t('sys.component.upload.imgUpload') }}</div>
        </div>
      </template>
    </a-upload>
    <div class="simple-upload__tip">
      <div v-if="tip">{{ tip }}</div>
      <div v-else>
        <slot name="tip"> </slot>
      </div>
    </div>
    <a-modal
      :visible="previewVisible"
      :title="previewTitle"
      :footer="null"
      class="simple-upload-model"
      @cancel="handleCancel"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { FormInstance, message, Form, UploadFile } from 'ant-design-vue';
  import { UploadOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { uploadApi } from '/@/api/sys/upload';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';

  /**
   * todo list
   * tip slot
   * 多图上传
   * 上传进度
   */
  const props = defineProps({
    file: {
      type: String,
      default: undefined,
    },
    accept: {
      type: String,
      default: '.jpg,.jpeg,.png',
    },
    maxCount: {
      type: Number,
      default: 1,
    },
    tip: {
      type: String,
      default: '',
    },
    // size: 传入大小默认为为KB,
    size: {
      type: Number,
      default: 100,
    },
    // 样式
    listType: {
      type: String,
      default: 'picture-card',
    },
    width: {
      type: Number,
      default: 0,
      immediate: true,
    },
    height: {
      type: Number,
      default: 0,
      immediate: true,
    },
  });

  const { onFieldChange } = Form.useInjectFormItemContext();

  const genUid = () => Math.random().toString(16).substring(2);

  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');

  const fileList = computed(() => {
    const { file } = props;
    if (!file) {
      return [];
    }
    if (typeof file === 'string') {
      return [
        {
          _url_: file,
          url: transformUrl(file),
          status: 'done',
          name: '',
          uid: genUid(),
        },
      ];
    }
    // else if (typeof file === 'object') {
    //   return file.map((item) => {
    //     return {
    //       _url_: item,
    //       url: transformUrl(item),
    //       status: 'done',
    //       name: '',
    //       uid: genUid(),
    //     };
    //   });
    // }
    return [];
  });

  const emit = defineEmits(['update:file']);

  watch(
    () => props.file,
    () => {
      onFieldChange();
    },
  );

  const handleBeforeUpload = (file: UploadFile) => {
    const fileSize = props.size * 1024;
    const fileType = props.accept.split(',').map((item) => {
      return `image/${item.substring(1, item.length)}`;
    });
    // 判断上传是否为image
    if (file.type && !file.type.startsWith('image/')) {
      message.warning('请上传图片文件！');
      return false;
    }
    // 判断上传的图片类型
    if (file.type && !fileType.includes(file.type)) {
      const typeText = props.accept.split(',').reduce((prev, next) => {
        return (prev += `.${next.substring(1, next.length)}/`);
      }, '');
      message.error(`只能上传${typeText}格式文件!`);
      return false;
    }
    // 判断上传的图片是否大于传入所限制的字节
    if (file.size && file.size > fileSize) {
      message.warning(`上传图片大小不能超过${props.size}KB`);
      return false;
    }

    return true;
  };
  const handleCustomRequest = async ({ file }) => {
    const res: any = await uploadApi({ name: 'file', file, filename: file.name });
    emit('update:file', res.data?.data);
    // onFieldChange();
  };

  const handlePreview = (file) => {
    previewImage.value = file.url;
    previewVisible.value = true;
    previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
  };

  const handleCancel = () => {
    previewImage.value = '';
    previewVisible.value = false;
    previewTitle.value = '';
  };

  const handleRemove = (file) => {
    emit('update:file', '');
    // onFieldChange();
  };
</script>

<style lang="less" scoped>
  .simple-upload {
    &__tip {
      color: #999;
      font-size: 12px;
    }
  }

  :deep(.ant-upload.ant-upload-select-picture-card) {
    width: v-bind("(props.width*1.5||104) + 'px'");
    height: v-bind("(props.height*1.5||104) + 'px'");
  }

  :deep(.ant-upload-list-picture-card-container) {
    width: v-bind("(props.width*1.5||104) + 'px'");
    height: v-bind("(props.height*1.5||104) + 'px'");
  }
</style>
