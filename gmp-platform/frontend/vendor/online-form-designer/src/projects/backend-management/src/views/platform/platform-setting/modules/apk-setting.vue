<template>
  <div class="apk-setting">
    <BasicTable
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :columns="columns"
      :dataSource="tableData"
      :pagination="false"
    >
      <template #headerTop>
        <a-upload
          name="file"
          accept=".apk"
          :show-upload-list="false"
          :beforeUpload="handleBeforeUpload"
          :customRequest="handleCustomRequest"
        >
          <a-button class="ant-btn ant-btn-primary">
            <template #icon>
              <upload-outlined />
            </template>
            {{ t('sys.upload') }}
          </a-button>
        </a-upload>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'apkActive'">
          <span>
            <a-tag :color="record.apkActive === 1 ? '#0dcf8d' : '#d2d2d2'">{{
              record.apkActive === 1
                ? t('sys.platform.activeEnable')
                : t('sys.platform.activeUnEnable')
            }}</a-tag>
          </span>
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.platform.apkDown'),
                onClick: () => handleDownload(record),
                ifShow: true,
              },
              {
                label: t('sys.platform.apkActive'),
                ifShow: record.apkActive == 0,
                // color: 'error',
                popConfirm: {
                  title: t('sys.sureToActive'),
                  confirm: () => handleActivate(record),
                },
              },
              {
                label: t('sys.delete'),
                ifShow: record.apkActive == 0,
                color: 'error',
                popConfirm: {
                  title: t('sys.sureToDelete'),
                  confirm: () => handleDelete(record),
                },
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </BasicTable>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { UploadFile, Form, message } from 'ant-design-vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  // import { downloadByOnlineUrl } from '/@/utils/file/download';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    getApkList,
    deleteApk,
    putApkById,
    postApkUploadApk,
  } from '/@/apis/gct-platform/ApkController';
  import { downloadByData } from '/@/utils/file/download';
  import { getMinioFileDownload } from '/@/apis/gct-platform/FileController';
  // import { async } from '@antv/x6/lib/registry/marker/async';
  // import {ApkResponse} from '/@/apis/gct-platform/model';

  const { t } = useI18n();

  const props = defineProps({
    file: {
      type: String,
      default: undefined,
    },
    accept: {
      type: String,
      default: '.apk',
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
  });

  const { createMessage } = useMessage();
  const { onFieldChange } = Form.useInjectFormItemContext();
  const emit = defineEmits(['checked-change', 'keyword-change', 'upload-success']);
  watch(
    () => props.file,
    () => {
      onFieldChange();
    },
  );

  const columns = [
    {
      title: t('sys.name'),
      dataIndex: 'apkName',
      key: 'apkName',
    },
    {
      title: t('sys.platform.apkVersion'),
      dataIndex: 'apkVersion',
      key: 'apkVersion',
    },
    {
      title: t('sys.status'),
      dataIndex: 'apkActive',
      key: 'apkActive',
    },
    // {
    //   title: t('sys.notes'),
    //   dataIndex: 'description',
    //   key: 'description',
    // },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: t('sys.createUser'),
      dataIndex: 'createUserName',
      key: 'createUserName',
    },
    {
      fixed: 'right',
      width: 200,
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const tableData = ref<any[]>([]);
  const getTableData = async () => {
    const list = await getApkList({
      ...getApkList(),
    });
    tableData.value = list ?? [];
  };
  getTableData();

  const handleBeforeUpload = (file: UploadFile) => {
    // const fileSize = props.size * 1024;
    // // 判断上传是否为apk
    // if (file.type && !file.type.startsWith('application/vnd.android.package-archive')) {
    //   message.warning('请上传apk文件！');
    //   return false;
    // }
    // // 判断上传的图片是否大于传入所限制的字节
    // if (file.size && file.size > fileSize) {
    //   message.warning(`上传apk大小不能超过${props.size}KB`);
    //   return false;
    // }
    return true;
  };

  const handleCustomRequest = async ({ file }) => {
    let formData: any = new FormData();
    formData.append('file', file);
    await postApkUploadApk(formData, {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    });
    emit('upload-success');
    createMessage.success(t('sys.operationSuccess'));
    getTableData();
  };
  const handleDownload = async (record) => {
    let { data, headers } = await getMinioFileDownload(
      { fileUrl: record.apkUrl },
      {
        isReturnNativeResponse: true,
        transferToConfig: {
          responseType: 'blob',
          responseEncoding: 'utf8',
        },
      },
    );
    const filename = headers?.['filename'];
    downloadByData(data, { filename });
  };
  const handleActivate = async (record) => {
    await putApkById({
      id: record.id,
    });
    createMessage.success(t('sys.operationSuccess'));
    getTableData();
  };
  const handleDelete = async (record) => {
    await deleteApk({
      ids: record.id,
    });
    createMessage.success(t('sys.operationSuccess'));
    getTableData();
  };
</script>

<style lang="less" scoped>
  .apk-setting {
    padding: 16px;
  }
</style>
