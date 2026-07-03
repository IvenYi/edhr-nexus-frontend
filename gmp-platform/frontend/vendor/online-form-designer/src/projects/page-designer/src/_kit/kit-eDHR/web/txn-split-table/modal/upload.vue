<template>
  <div class="sn-upload-modal">
    <a-form
      :model="formState"
      ref="formRef"
      :label-col="{ style: { width: '80px' } }"
      :labelAlign="'right'"
    >
      <a-upload-dragger
        v-model:fileList="fileList"
        name="file"
        :multiple="false"
        maxCount="1"
        accept=".xls,.xlsx"
        :before-upload="beforeUpload"
        :customRequest="customUpload"
      >
        <p class="ant-upload-drag-icon">
          <inbox-outlined />
        </p>
        <p class="ant-upload-text">
          {{ $t('sys.edhr.dragUpload') }}
        </p>
        <p class="ant-upload-hint">
          {{ $t('sys.edhr.onlyAllowedUploadXls') }}
          <a @click.stop="downloadTemplate">{{ $t('sys.edhr.clockDownloadTemp') }}</a>
        </p>
      </a-upload-dragger>
    </a-form>

    <div v-if="modal" class="absolute bottom-0px left-0px p16px border-top w-full text-right">
      <a-button style="margin-right: 8px" @click="onCancel">{{ $t('sys.cancelText') }}</a-button>
      <a-button type="primary" :loading="loading" @click="onSubmit">{{
        $t('sys.okText')
      }}</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { message as Message } from 'ant-design-vue';
  import { IModal, ResultEnum } from '@gct/runtime';
  import { InboxOutlined } from '@ant-design/icons-vue';
  import { defHttp } from '/@/utils/http/axios';
  import {
    getExcelTmplDetail,
    getExcelTmplDownloadById,
  } from '/@/apis/gct-apaas/ExcelTmplController';
  import { downloadByData, downloadByUrl } from '/@/utils/file/download';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { Uploader } from '@/utils/uploader';

  const defProps = defineProps<{
    modal: IModal;
    data: any;
  }>();

  const loading = ref(false);
  const formRef = ref();
  const formState = ref({});
  const fileList = ref<any[]>([]);

  async function beforeUpload(file) {
    const isXls = file.type === 'application/vnd.ms-excel';
    const isXlsx =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isXls && !isXlsx) {
      Message.warn($t('sys.edhr.onlyAllowedUploadXls'));
      return false;
    }
    return true;
  }

  async function customUpload({ file }) {
    try {
      const path = await Uploader.uploadByFile(file, true);
      fileList.value.forEach((item) => {
        item.path = path;
        item.status = 'done';
      });
    } catch {
      fileList.value.forEach((item) => {
        item.status = 'error';
      });
    }
  }

  async function postAction(file) {
    const formData = new FormData();
    formData.append('file', file as File);
    formData.append('headerRowIndex', '3');
    formData.append('startRowIndex', '4');
    const origin = window.location.origin;
    return defHttp.uploadFile(
      {
        url: `${origin}/${defProps.data.actionUrl ?? 'gct-apaas/api/edhr/upload/excel'}`,
        method: 'POST',
      },
      {
        name: 'file',
        file: file as File,
        data: {
          headerRowIndex: '3',
          startRowIndex: '4',
        },
      },
      {},
    );
  }

  async function onSubmit() {
    await formRef.value.validate();
    try {
      const file = fileList.value?.[0]?.originFileObj;
      loading.value = true;
      const res = await postAction(file);
      const { data: resData } = res;
      const { data, code, message, subMessage } = resData;
      const hasSuccess = resData && Reflect.has(resData, 'code') && code === ResultEnum.SUCCESS;
      if (!hasSuccess) {
        throw subMessage || message;
      }
      loading.value = false;
      defProps.modal.dismiss({
        ok: true,
        data,
      });
    } catch (error) {
      typeof error === 'string' && Message.error(error);
      loading.value = false;
    }
  }

  function onCancel() {
    defProps.modal.dismiss();
  }

  async function downloadTemplate(useGetExcelTmplDownloadById?: boolean) {
    try {
      const modelKey = defProps.data?.bindModelKey || 'em_sn';
      const tmplKey = defProps.data?.templateKey || 'import_sn_mryi';
      if (useGetExcelTmplDownloadById) {
        const { data, headers } = await getExcelTmplDownloadById(
          { id: `${modelKey}$${tmplKey}` },
          {
            isReturnNativeResponse: true,
            transferToConfig: { responseType: 'blob', timeout: 20000 },
          },
        );
        const attachment = new URLSearchParams(
          headers?.['content-disposition'].replace('attachment;', '') || '',
        );

        const filename = attachment.get('filename') || '';
        downloadByData(data, { filename });
      } else {
        const { filePath, name: fileName } = (await getExcelTmplDetail({
          modelKey,
          key: tmplKey,
        })) as any;
        const url = transformUrl(filePath);
        downloadByUrl({ url, fileName: fileName + '.xlsx' });
      }
    } catch (error) {
      /* empty */
    }
  }
</script>

<style lang="less" scoped>
  .sn-upload-modal {
    padding: 16px;
    margin-bottom: 48px;
  }
</style>
