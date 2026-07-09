<template>
  <BasicModal
    v-bind="$attrs"
    class="application-management"
    @register="registerInner"
    :title="title"
    centered
    width="640px"
    :minHeight="100"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      :model="formState"
      autocomplete="off"
      ref="formRef"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 12 }"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        :label="t('sys.tenant.appLogo')"
        name="logoUrl"
        :rules="[{ required: true, trigger: 'change' }]"
      >
        <a-upload
          :file-list="fileList"
          list-type="picture-card"
          accept=".jpg,.jpeg,.png"
          @preview="handlePreview"
          :beforeUpload="handleBeforeUpload"
          :customRequest="uploadLogo"
          @remove="handleRemove"
        >
          <div v-if="!fileList.length">
            <plus-outlined />
            <div class="upload-text">Upload</div>
          </div>
        </a-upload>
        <a-modal
          :visible="previewVisible"
          :title="previewTitle"
          :footer="null"
          @cancel="handleCancel"
        >
          <img style="width: 100%" :src="previewImage" />
        </a-modal>
      </a-form-item>
      <a-form-item
        :label="t('sys.tenant.applicationName')"
        name="applicationName"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.applicationName" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item :label="t('sys.tenant.applicationDesc')" name="description">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.description"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { uploadApi } from '/@/api/sys/upload';
  import { postApp, putAppById } from '/@/apis/gct-platform/AppController';
  import { ApplicationCategory } from '../../types/tenant';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';

  const props = defineProps<{
    tenantId?: string;
  }>();
  const title = ref('');
  const isEdit = ref(false);
  const tenId = ref('');
  const appId = ref('');

  const emit = defineEmits(['refresh']);

  const [registerInner, { closeModal }] = useModalInner((category) => {
    category && onDeactivated(category);
  });

  const onDeactivated = (data) => {
    tenId.value = data.tenantId;
    appId.value = data.id;
    switch (data) {
      case ApplicationCategory.newBlankApplication:
        title.value = t('sys.tenant.newBlankApplication');
        break;
      case ApplicationCategory.newTplApplication:
        title.value = t('sys.tenant.newTplApplication');
        break;
      default:
        title.value = '编辑应用信息';
        formState.logoUrl = data.logo;
        isEdit.value = true;
        formState.applicationName = data.name;
        formState.description = data.description;
        fileList.value.push({
          status: 'done',
          url: transformUrl(data.logo),
        });
    }
  };

  const { t } = useI18n();

  const fileList = ref<any>([]);
  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');
  const formState = reactive({
    logoUrl: '',
    applicationName: '',
    description: '',
  });
  const formRef = ref<FormInstance>();

  function getBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = (await getBase64(file.originFileObj)) as string;
    }
    previewImage.value = file.url || file.preview;
    previewVisible.value = true;
    previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
  };

  //上传图片
  const handleBeforeUpload = async (file) => {
    const fileType = ['image/jpg', 'image/png', 'image/jpeg'];
    if (!fileType.includes(file.type)) {
      message.error('只能上传JPG/PNG/JPEG/GIF格式文件!');
      return false;
    }

    return true;
  };
  const uploadLogo = async ({ file }) => {
    const res: any = await uploadApi({ name: 'file', file, filename: file.name });
    formState.logoUrl = res.data?.data;
    fileList.value = [
      {
        status: 'done',
        url: transformUrl(formState.logoUrl),
      },
    ];
    formRef.value?.clearValidate(['logoUrl']);
  };
  const handleCancel = () => {
    previewVisible.value = false;
    previewTitle.value = '';
  };

  const handleRemove = () => {
    fileList.value = [];
    formState.logoUrl = '';
    formRef.value?.validate(['logoUrl']);
  };

  const handleOk = () => {
    const { applicationName, logoUrl, description } = formState;
    //保存应用
    const params = {
      name: applicationName,
      logo: logoUrl,
      tenantId: props.tenantId,
      description,
    };
    formRef.value?.validate().then(async () => {
      if (isEdit.value) {
        await putAppById({ id: appId.value }, { ...params, tenantId: tenId.value });
        message.success('应用信息修改成功！');
      } else {
        await postApp(params);
        message.success('应用创建成功！');
      }
      closeModal();
      emit('refresh');
    });
  };

  const handleClose = () => {
    fileList.value = [];
    formRef.value?.resetFields();
  };

  const onFinish = () => {};

  const onFinishFailed = (errorInfo) => {
    message.error(errorInfo);
  };

  const handleShow = () => {};
</script>

<style lang="less" scoped></style>
