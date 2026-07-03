<template>
  <div>
    <a-steps :current="props.curStep" size="small">
      <a-step :title="t('sys.license.getLicenseFile')" />
      <a-step :title="t('sys.license.uploadLicenseFile')" />
    </a-steps>
    <div class="tab" v-if="props.curStep === 0">
      <div v-if="!isApplet" class="step-area">
        <div class="code" v-if="appInfo">
          <qr-code :value="appInfoToString" :width="180" :options="options" />
        </div>
        <div class="mt12px mb8px">{{ t('sys.license.scanQrcodeTip') }}</div>
        <div>
          <span>{{ t('sys.license.appletAdress') }}</span> : &nbsp;
          <span class="applet" @click="getApplet"> {{ t('sys.license.clickHere') }}</span>
        </div>
      </div>
      <div class="app-code" v-else>
        <div class="text-[#212528] w100% mb-25px back" @click="getApplet">
          <LeftOutlined /> &nbsp;{{ t('sys.back') }}
        </div>
        <img :src="appCode" alt="" style="width: 180px; height: 180px" />
        <div class="text-[#666666] mt-25px">{{ t('冠骋云PaaS小程序') }}</div>
      </div>
    </div>
    <div class="mt32px py-10px" v-if="props.curStep === 1">
      <a-upload-dragger
        name="file"
        :customRequest="customRequest"
        :showUploadList="false"
        accept=".lic"
        style="padding-top: 24px; padding-bottom: 24px"
      >
        <div>
          <SvgIcon size="56" name="folder" />
        </div>
        <p class="text-[#212528] mt12px">点击或将文件拖拽到这里上传</p>
        <p class="text-[12px] text-[#8F8F8F]"> 支持扩展名为.lic，且文件大小不超过10M </p>
      </a-upload-dragger>
      <div class="progress-box mt8px">
        <div class="progress-item mb-8px w-full" v-for="(item, index) in fileList" :key="index">
          <img src="/@/assets/images/lic.png" style="width: 32px" />
          <div class="progress-item__box pl-10px">
            <div class="progress-item__name">
              <!-- <a-tooltip>
                      <template #title>{{ item.name }}</template>
                    </a-tooltip> -->
              <span class="label" :title="item.name">{{ item.name }}</span>
              <span v-if="item.fileSize" :class="['size', { 'mr-40px': item.status }]">
                {{ fileSizeParser(item.fileSize) }}
              </span>
            </div>
            <a-progress :strokeWidth="4" :percent="item.percentNum" :status="item.status">
              <template #format="percent">
                <span
                  class="error progress-error-info"
                  v-if="item.status === statusEnum.EXCEPTION"
                  :title="item.errorMessge || t('sys.component.upload.uploadError')"
                >
                  <span v-if="formData.fileId" style="color: #8f8f8f">
                    {{ t('sys.pageDesigner.dataValidateErr') }}
                  </span>
                  <span v-if="formData.fileId" style="cursor: pointer">
                    {{ t('sys.pageDesigner.downloadErrorRepport') }}
                  </span>
                  <span v-else>
                    {{ item.errorMessge || t('sys.component.upload.uploadError') }}
                  </span>
                </span>
                <span v-else class="text-[12px]">{{ percent + '%' }}</span>
              </template>
            </a-progress>
          </div>
          <close-outlined class="mt-3px icon" @click.stop="deleteFile" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, ref, watch, reactive } from 'vue';
  import { QrCode } from '/@/components/Qrcode/index';
  import { useI18n } from 'vue-i18n';
  import { SvgIcon } from '/@/components/Icon';
  import { sizeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { message } from 'ant-design-vue';
  import { getLicenseGetAppBasicInfo } from '/@/apis/gct-platform/LicenseController';
  import { statusEnum } from '/@/components/FieldUpload/src/types';
  import { useBasicSetting } from '/@/hooks/platform/useBasicSetting';
  import appCode from '/@/assets/images/xiaochengxu.jpg';

  const props = defineProps<{
    curStep: number;
    appId: string;
  }>();

  const { basicSetting } = useBasicSetting();

  const options = { margin: 1 };

  const { t } = useI18n();

  const appInfo = ref();

  const isApplet = ref(false);

  /** 文件 */
  const fileInfo = ref();

  /** 上传文件 */
  const fileList = ref<object[]>([]);

  const fileSizeParser = computed(() => {
    return (size) => {
      return sizeParser(size);
    };
  });

  const getPlatInfo = () => {
    getLicenseGetAppBasicInfo({ appId: props.appId }).then((res) => {
      appInfo.value = {
        appId: props.appId,
        productType: res.moduleAuth ? 'module' : res?.productType,
        version: res?.version || basicSetting.version,
        machineId: res?.machineId,
        existLicenseIds: res?.existLicenseIds,
      };
    });
  };

  getPlatInfo();

  const deleteFile = () => {
    fileList.value = [];
    fileInfo.value = null;
  };

  const appInfoToString = computed(() => {
    return JSON.stringify(appInfo.value);
  });

  /** 获取小程序地址 */
  const getApplet = () => {
    isApplet.value = !isApplet.value;
  };

  const customRequest = async ({ file }) => {
    const nameArr = file.name.split('.');
    const type = nameArr[nameArr.length - 1];
    if (type !== 'lic') {
      message.warn(`【${file.name}】支持的扩展名为.lic`);
      return Promise.reject();
    }
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > 10) {
      message.warn(`【${file.name}】文件大小不能超过 10MB`);
      return Promise.reject();
    }
    fileList.value = [
      {
        uid: file.uid,
        name: file.name,
        fileSize: file.size,
        path: '',
        percentNum: 0,
        status: statusEnum.ACTIVE,
      },
    ];
    fileList.value[0]['status'] = statusEnum.ACTIVE;

    setTimeout(() => {
      fileList.value[0]['percentNum'] = 100;
      fileList.value[0]['status'] = 'success';
      fileInfo.value = new FormData();
      fileInfo.value.append('file', file);
      console.log(fileInfo.value);
    }, 100);
  };

  defineExpose({
    fileInfo,
  });
</script>
<style lang="less" scoped>
  .step-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .applet {
      cursor: pointer;
      color: var(--ant-primary-color);
    }
  }
  .progress-item {
    display: flex;

    &__box {
      display: flex;
      flex-direction: column;
      align-self: center;
      width: calc(100% - 72px);
      line-height: 22px;

      :deep(.ant-progress) {
        line-height: 0.4;

        .ant-progress-text {
          position: absolute;
          top: -14px;
          right: 0;
          width: auto;
          color: #797a7d;
          font-size: 13px;
        }
      }

      :deep(.ant-progress-show-info .ant-progress-outer) {
        margin-right: 0;
        padding-right: 0;

        .ant-progress-inner {
          background: #e6e9ef;
        }
      }
    }

    &__name {
      display: flex;
      width: 100%;

      .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
          color: var(--ant-primary-color);
        }
      }

      .size {
        margin-left: 16px;
        color: #c3c3c3;
      }
    }

    .icon {
      align-self: center;
      margin-left: 24px;
      color: #212528;
      font-size: 16px;
      justify-items: flex-end;
    }
  }
  .tab {
    margin-top: 5%;
  }
  .app-code {
    display: flex;
    flex-direction: column;

    align-items: center;
    .back {
      cursor: pointer;
      &:hover {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
