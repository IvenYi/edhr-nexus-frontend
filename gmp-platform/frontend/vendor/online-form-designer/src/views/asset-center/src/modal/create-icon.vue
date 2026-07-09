<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="
      (module === ModuleEnum.ICON ? t('sys.appDesigner.icon') : t('sys.appDesigner.appLogoImage')) +
      t('sys.upload')
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="CategoryFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="
          (module === ModuleEnum.ICON
            ? t('sys.appDesigner.icon')
            : t('sys.appDesigner.appLogoImage')) + t('sys.category')
        "
        name="categoryId"
        :rules="[
          {
            required: true,
            message:
              '请选择' +
              (module === ModuleEnum.ICON
                ? t('sys.appDesigner.icon')
                : t('sys.appDesigner.appLogoImage')) +
              '分类',
          },
        ]"
      >
        <a-select v-model:value="formState.categoryId" placeholder="请选择分类" style="width: 80%">
          <a-select-option v-for="item in categoryList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="
          (module === ModuleEnum.ICON
            ? t('sys.appDesigner.icon')
            : t('sys.appDesigner.appLogoImage')) + t('sys.upload')
        "
        name="file"
        :rules="[
          {
            required: true,
            message:
              '请上传' +
              (module === ModuleEnum.ICON
                ? t('sys.appDesigner.icon')
                : t('sys.appDesigner.appLogoImage')),
          },
        ]"
      >
        <a-upload
          :file-list="fileList"
          :accept="accept"
          list-type="picture-card"
          :class="[module === ModuleEnum.ICON ? 'icon-upload' : 'pic-upload']"
          :beforeUpload="handleBeforeUpload"
          :customRequest="handleCustomRequest"
          @preview="handlePreview"
          @remove="handleRemove"
        >
          <slot></slot>
          <template v-if="module === ModuleEnum.ICON">
            <div v-if="!fileList.length">
              <plus-outlined />
              <div style="margin-top: 8px">图标上传</div>
            </div>
            <!-- <img v-else :src="imageUrl" /> -->
          </template>
          <template v-else>
            <div v-if="!fileList.length">
              <plus-outlined />
              <div style="margin-top: 8px">图片上传</div>
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
      </a-form-item>
    </a-form>
  </basic-modal>
</template>
<script setup lang="ts">
  import { reactive, ref, inject, Ref, computed, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { CategoryResponse } from '/@/apis/gct-platform/model';
  import { ModuleEnum } from '../enum';
  import { FormInstance, message, UploadFile } from 'ant-design-vue';
  import { postAssetsUploadByCategoryId } from '/@/apis/gct-platform/AssetsController';
  import { getCategoryList } from '/@/apis/gct-platform/CategoryController';

  const module = inject('module') as string;
  const fileType = ['gif', 'jpg', 'jpeg', 'png'];
  const { t } = useI18n();
  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const emit = defineEmits(['ok']);

  const categoryList = ref<CategoryResponse[]>([]);
  const CategoryFormRef = ref<FormInstance>();

  const formState = reactive({
    categoryId: '',
    file: '',
  });
  const fileList = ref([]);
  const tip = computed(() => {
    if (module === ModuleEnum.ICON) {
      return '支持svg图标格式，大小100KB以内';
    } else {
      return '支持jpg、png、gif图片格式，大小4M以内';
    }
  });

  const loadCategoryList = async () => {
    const res = await getCategoryList({
      assetsModule: module,
    });
    categoryList.value = res!;
  };
  loadCategoryList();

  const accept = computed(() => {
    if (module === ModuleEnum.ICON) {
      return '.svg';
    } else {
      return 'image/png, image/jpeg, image/jpg, image/gif';
    }
  });
  const imageUrl = ref();

  const handleRemove = () => {
    fileList.value = [];
    formState.file = '';
  };

  const handleBeforeUpload = (file: File) => {
    // const fileSize = props.size * 1024;
    // const fileType = props.accept.split(',').map((item) => {
    //   return `image/${item.substring(1, item.length)}`;
    // });
    // // 判断上传是否为image
    // if (file.type && !file.type.startsWith('image/')) {
    //   message.warning('请上传图片文件！');
    //   return false;
    // }
    // // 判断上传的图片类型
    // if (file.type && !fileType.includes(file.type)) {
    //   const typeText = props.accept.split(',').reduce((prev, next) => {
    //     return (prev += `.${next.substring(1, next.length)}/`);
    //   }, '');
    //   message.error(`只能上传${typeText}格式文件!`);
    //   return false;
    // }
    // // 判断上传的图片是否大于传入所限制的字节
    // if (file.size && file.size > fileSize) {
    //   message.warning(`上传图片大小不能超过${props.size}KB`);
    //   return false;
    // }
    const fileSize = file.size / 1024;
    if (module === ModuleEnum.IMAGE && fileSize / 1024 > 4) {
      message.error(`图片大小不能超过4MB`);
      return false;
    }
    if (module === ModuleEnum.ICON && fileSize > 100) {
      message.error(`图标大小不能超过100KB`);
      return false;
    }
    const limitFileType = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

    if (module === ModuleEnum.IMAGE && !fileType.includes(limitFileType)) {
      message.error(`只能上传${fileType.join('、')}格式文件!`);
      return false;
    } else if (module === ModuleEnum.ICON && !file.name.endsWith('.svg')) {
      message.error(`只能上传svg格式文件!`);
      return false;
    }

    return true;
  };

  /** 预览 */
  const handlePreview = (file) => {
    previewImage.value = file.url;
    previewVisible.value = true;
    previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
  };
  /** 删除 */

  const handleCancel = () => {
    previewImage.value = '';
    previewVisible.value = false;
    previewTitle.value = '';
  };

  const handleCustomRequest = ({ file }) => {
    fileList.value = [
      {
        uid: file.uid,
        name: file.name,
        fileSize: file.size,
        url: URL.createObjectURL(file),
      },
    ];

    imageUrl.value = URL.createObjectURL(file);
    formState.file = file;
    setTimeout(() => {
      CategoryFormRef.value?.validateFields(['file']);
    });
  };

  const handleOk = () => {
    CategoryFormRef.value?.validate().then(async () => {
      let formData: any = new FormData();
      formData.append('file', formState.file);
      await postAssetsUploadByCategoryId({ categoryId: formState.categoryId }, formData, {
        transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
      });
      emit('ok');
      closeModal();
    });
  };

  const handleClose = () => {
    CategoryFormRef.value?.resetFields();
    fileList.value = [];
  };
  const onDataReceive = (data) => {
    Object.assign(formState, { categoryId: data.categoryId });
  };
</script>
<style lang="less" scoped>
  .pic-upload {
    :deep(.ant-upload.ant-upload-select-picture-card),
    :deep(.ant-upload-list-picture-card-container) {
      width: 160px;
      height: 90px;
      img {
        width: 100%;
        height: 100%;
        object-fit: fill;
      }
    }
  }
  .simple-upload__tip {
    color: #8f8f8f;
  }
  :deep(.ant-form-item-has-error .ant-upload.ant-upload-select-picture-card) {
    border-color: #f54547;
  }
</style>
