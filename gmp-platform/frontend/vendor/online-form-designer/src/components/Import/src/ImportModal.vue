<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="$t(title)"
    :min-height="480"
    centered
    :width="width"
    :showUploadList="false"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    :footer="null"
  >
    <a-upload-dragger
      class="upload"
      v-model:fileList="fileList"
      name="file"
      accept=".xls,.xlsx"
      :multiple="multiple"
      :before-upload="beforeUpload"
      @drop="handleDrop"
      @change="handleChange"
      :showUploadList="false"
      v-bind="uploadExtraProps"
    >
      <div class="icon">
        <i class="iconfont icon-a-Fileupload" style=" color: #0daa9c;font-size: 32px"></i>
      </div>
      <p>{{$t('sys.platform.dragUpload')}}</p>
      <div class="download" v-if="showUploadTemplate"
        >{{$t('sys.platform.onlyAllowedUploadXls')}}，<span @click.stop="handleDownload" style="color: #0daa9c"
          >{{$t('sys.platform.clockDownloadTemp')}}</span
        ></div
      >
      <div v-else class="download"> {{$t('sys.platform.onlyAllowedUploadXls')}} </div>
    </a-upload-dragger>
    <div class="file-list">
      <div class="title">{{$t('sys.platform.fileList')}}</div>
      <template v-if="fileList.length > 0">
        <template v-for="file in fileList" :key="file.uid">
          <div class="file">
            <div class="left flex">
              <div class="icon ml-12px">
                <img src="../../../assets/platform/exc.png" />
              </div>
              <div class="filename ml-12px">{{ file.name }}</div>
            </div>
            <div class="right flex">
              <div class="progress">
                <a-progress
                  type="circle"
                  :percent="file.status === 'error' ? 90 : file.percent"
                  :width="20"
                  :status="file.status === 'error' ? 'exception' : 'success'"
                />
                <div
                  class="ml-8px"
                  :style="{ color: file.status === 'error' ? '#F84949' : '#0DAA9C' }"
                  >{{
                    file.status === 'error'
                      ? $t('sys.component.uploadError')
                      : file.status === 'uploading'
                      ? $t('sys.component.uploading')
                      : $t('sys.component.uploadSuccess')
                  }}</div
                >
              </div>
              <div class="delete">
                <i class="iconfont icon-shanchu" @click="handleDelete(file.uid)"></i>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
    <template v-if="showErrorMsg && errorMsg">
      <a-alert type="warning">
        <template #message>
          <template v-for="err in errorMsg" :key="err">
            <div class="error">
              <i class="iconfont icon-jinggao1 icon" style="color: #faad14"></i>
              {{  $t('sys.platform.rowInfoTip', { sth: err.rowNum, info: err.info }) }}</div
            >
          </template>
        </template>
      </a-alert>
    </template>
  </BasicModal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { UploadProps } from 'ant-design-vue';
  import { UploadChangeParam, UploadFile } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '../../Modal';

  export interface importProps {
    title: string; // 导出模板标题
    width: number; // 弹窗宽度
    multiple: boolean; // 是否批量上传
    showErrorMsg: boolean; // 是否需要展示错误信息
    // 是否显示下载模板按钮
    showUploadTemplate: boolean;
    uploadExtraProps?: UploadProps;
    customRequestApi?: (data, config) => Promise<any>;
  }

  withDefaults(defineProps<importProps>(), {
    title: 'sys.platform.importExcel',
    width: 640,
    multiple: false,
    showErrorMsg: false,
    showUploadTemplate: true,
  });

  const emit = defineEmits(['ok', 'on-download-template', 'update:file']);
  const fileList = ref<UploadFile[]>([]);
  const errorMsg = ref<any>();
  const fileUid = ref('');

  const [registerInner, { closeModal: closeImportModal }] = useModalInner((data) => {
    // errorMsg.value = null;
    data && onDataReceive(data);
  });

  // 打开弹窗需要进行的逻辑回调（回显等）
  const onDataReceive = (data) => {};

  // 上传前对文件进行校验
  const beforeUpload = (file: UploadFile) => {};

  const handleChange = (info: UploadChangeParam) => {
    const { file } = info;
    const status = file.status;
    // 上传失败回调
    if (status === 'error' && file.response) {
      fileUid.value = file.uid;
      const errors: any = [];
      for (const error of file.response) {
        const errInfos = error.errorInfos.map((err) => {
          return {
            rowNum: error.rowNum,
            info: err.message,
          };
        });
        errors.push(errInfos);
      }
      errorMsg.value = errors.flat();
    }
  };

  const handleDrop = (e: DragEvent) => {
    console.log(e);
  };

  const handleDelete = (id: string) => {
    const index = fileList.value.findIndex((item) => (item.uid = id));
    fileList.value.splice(index, 1);
    if (fileUid.value === id) {
      errorMsg.value = null;
    }
  };

  const handleClose = () => {
    // 清空数据
    fileList.value = [];
    errorMsg.value = null;
    closeImportModal();
  };

  const handleDownload = () => {
    emit('on-download-template');
  };

  const handleOk = () => {
    emit('ok');
  };
</script>

<style lang="less" scoped>
  .upload {
    .download {
      font-size: 12px;

      span {
        color: var(--ant-primary-color);
      }
    }
  }

  .file-list {
    overflow: auto;

    .title {
      margin: 16px 0;
    }

    .file {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 60px;
      margin-bottom: 8px;
      border: 1px solid #eaeaea;
      border-radius: 4px;
      background: #f8f9fc;

      &:hover {
        background: #f5f5f5;
      }

      .left {
        display: flex;
        align-items: center;

        .icon {
          width: 36px;
          height: 36px;
        }
      }

      .right {
        display: flex;
        align-items: center;

        .progress {
          display: flex;
          align-items: center;
          margin-right: 24px;
          font-size: 14px;
        }

        .delete {
          margin-right: 16px;
          color: #bfbfbf;

          &:hover {
            color: #ff4d4f;
          }
        }
      }
    }
  }

  .error {
    font-size: 13px;
  }
</style>
