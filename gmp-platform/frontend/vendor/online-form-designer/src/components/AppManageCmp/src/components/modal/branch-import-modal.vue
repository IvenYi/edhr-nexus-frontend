<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.app.branch.import')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
  >
    <template #footer>
      <a-button @click="closeModal">{{ t('sys.cancel') }}</a-button>
      <a-button :loading="loading" v-if="currentStep === 0" type="primary" @click="handleNext">{{
        t('sys.app.nextStep')
      }}</a-button>
      <a-button :loading="loading" v-else-if="currentStep === 1" type="primary" @click="handleOk">{{
        t('sys.ok')
      }}</a-button>
    </template>

    <div
      :style="{
        backgroundColor: '#f5f5f5',
      }"
      class="h-50px border-rd-4px flex items-center pl-140px pr-140px mb-20px"
    >
      <a-steps :current="currentStep" size="small">
        <a-step title="上传文件" />
        <a-step title="问题解决" />
      </a-steps>
    </div>

    <a-form
      v-if="currentStep === 0"
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
    >
      <a-form-item :label="t('sys.app.branch.baseline')">
        {{ branch?.seq }}
      </a-form-item>
      <a-form-item :label="t('sys.app.releaseTag')"> {{ branch?.releaseTag }} </a-form-item>
      <a-form-item
        label="导入升级包"
        name="appPkgUrl"
        :rules="[
          {
            required: true,
            message: '请上传升级包',
          },
        ]"
      >
        <a-upload
          accept=".zip"
          :showUploadList="false"
          :beforeUpload="handleBeforeUpload"
          :customRequest="handleCustomRequest"
        >
          <div v-if="formState.appPkgUrl" class="primary-gct flex items-center h-32px">
            <i
              :style="{
                lineHeight: 1,
              }"
              class="iconfont icon-fujian mr-5px"
            ></i
            >{{ fileName }}
          </div>
          <template v-else>
            <a-button type="primary" ghost
              ><UploadOutlined />{{ t('sys.app.branch.import') }}</a-button
            >
            <div
              class="mt-8px"
              :style="{
                color: '#bfbfbf',
              }"
              >支持扩展名：.zip</div
            >
          </template>
        </a-upload>
      </a-form-item>
      <a-form-item
        :label="t('sys.notes')"
        name="description"
        :rules="[
          {
            required: true,
            whitespace: true,
          },
        ]"
      >
        <a-textarea v-model:value="formState.description" :rows="5" show-count :maxlength="120" />
      </a-form-item>
    </a-form>

    <merge-tab-conflict
      v-else-if="currentStep === 1"
      :merge-preview-data="mergePreviewData"
      resolve
    />
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message, UploadFile } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { AppBranchResponse, MergePreviewResponse } from '/@/apis/gct-platform/model';
  import {
    postAppUploadAppPkg,
    postAppImportVersionByAppId,
    getAppImportVersionPreviewByAppId,
  } from '/@/apis/gct-platform/AppController';
  import MergeTabConflict from '../common/merge-tab-conflict.vue';

  const props = defineProps<{
    appId?: string;
    branch?: AppBranchResponse;
  }>();

  const emit = defineEmits(['ok']);
  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, {
      ...data,
    });
  });

  const formRef = ref<FormInstance>();
  const formState: {
    appPkgUrl?: string;
    description?: string;
  } = reactive({
    appPkgUrl: undefined,
    description: undefined,
  });
  const mergePreviewData = ref<MergePreviewResponse>({});

  const currentStep = ref<0 | 1>(0);
  const loading = ref<boolean>(false);

  const fileName = computed(() => {
    if (formState.appPkgUrl) {
      const paths = formState.appPkgUrl.split('/');
      return paths[paths.length - 1];
    }
    return '';
  });

  const handleClose = () => {
    currentStep.value = 0;
    formRef.value?.resetFields();
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

  const handleCustomRequest = async ({ file }) => {
    let formData: any = new FormData();
    formData.append('file', file);
    const res = await postAppUploadAppPkg(formData, {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    });
    formState.appPkgUrl = res;
    formRef.value?.validateFields(['appPkgUrl']);
  };

  const handleNext = async () => {
    changeOkLoading(true);
    loading.value = true;
    try {
      await formRef.value?.validate();
      const res = await getAppImportVersionPreviewByAppId(
        {
          appId: props.appId!,
        },
        {
          appPkgUrl: formState.appPkgUrl!,
        },
        {
          transferToConfig: {
            timeout: 20 * 60 * 1000,
          },
        },
      );
      mergePreviewData.value = res ?? {};
      currentStep.value = 1;
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
      loading.value = false;
    }
  };

  const handleOk = async () => {
    changeOkLoading(true);
    loading.value = true;
    await postAppImportVersionByAppId(
      {
        appId: props.appId!,
      },
      {
        ...formState,
        mergeConflictList: mergePreviewData.value.conflictDetails,
      },
      {
        transferToConfig: {
          timeout: 20 * 60 * 1000,
        },
      },
    ).finally(() => {
      changeOkLoading(false);
      loading.value = false;
    });
    closeModal();
    emit('ok');
    message.success(t('sys.operationSuccess'));
  };
</script>

<style lang="less"></style>
