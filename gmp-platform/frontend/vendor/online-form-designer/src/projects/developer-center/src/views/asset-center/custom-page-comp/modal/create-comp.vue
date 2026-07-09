<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.newSth', { sth: t('sys.pageComp') })"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    :okText="t('sys.designView.save')"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item :label="t('sys.category')" name="categoryId">
        <a-select
          v-model:value="formState.categoryId"
          placeholder="Tags Mode"
          :options="categoryOptions"
          :fieldNames="{ label: 'name', value: 'id' }"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.developer.codePackage')"
        name="zipUrl"
        :rules="[{ required: true, trigger: 'sumbit' }]"
      >
        <a-upload-dragger
          name="file"
          :customRequest="customRequest"
          :showUploadList="false"
          accept=".zip"
        >
          <div>
            <SvgIcon size="56" name="folder" />
          </div>
          <p class="text-[#212528] mt12px">点击或将文件拖拽到这里上传</p>
          <p class="text-[12px] text-[#8F8F8F]">
            压缩包格式.zip，仅支持上传一个文件，文件大小 10M 以内
          </p>
        </a-upload-dragger>
        <div class="mt-8px">
          为保证代码导入顺利，建议您先阅读
          <a
            href="https://gct-china.yuque.com/org-wiki-gct-china-wm8s5d/dly39v/gycv4ymyc6saymtu?singleDoc"
            target="_blank"
            >本地开发指南</a
          >
        </div>
        <div class="progress-box mt8px">
          <div class="progress-item mb-8px w-full" v-for="(item, index) in fileList" :key="index">
            <SvgIcon class="svg-icon" :size="32" name="folder" />
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
                  >
                    {{ t('sys.component.upload.uploadError') }}
                  </span>
                  <span v-else class="text-[12px]">{{ percent + '%' }}</span>
                </template>
              </a-progress>
            </div>
            <close-outlined class="mt-3px icon" @click.stop="deleteFile" />
          </div>
        </div>
      </a-form-item>
      <div
        v-if="
          fileList && fileList[0].status !== statusEnum.EXCEPTION && fileList[0].percentNum == 100
        "
      >
        <a-form-item :label="t('sys.widgetName')" name="name">
          <span>
            {{ formState.name }} <a style="cursor: default">{{ formState.version }}</a>
          </span>
        </a-form-item>
        <a-form-item :label="t('sys.portal.comp') + 'KEY'" name="key">
          {{ formState.key }}
        </a-form-item>
        <a-form-item :label="t('sys.portal.comp') + t('sys.appDesigner.icon')" name="icon">
          <img style="width: 40px" :src="icon" alt="" />
        </a-form-item>
        <a-form-item :label="t('sys.developer.appCenter.client')" name="client">
          {{ formState.client }}
        </a-form-item>
        <a-form-item :label="t('sys.developer.identifier')" name="tag">
          <a-tag
            v-if="formState.tag.includes('eDHR')"
            class="mr-4px"
            :bordered="false"
            color="magenta"
          >
            {{ 'eDHR' + t('sys.org.kit') }}
          </a-tag>
          <a-tag v-if="formState.tag.includes('common')" :bordered="false" color="blue">
            {{ t('sys.org.common') }}
          </a-tag>
          <a-tag v-if="formState.tag.includes('MEDPRO')" :bordered="false" color="volcano">
            {{ 'MedPro' + t('sys.org.kit') }}
          </a-tag>
        </a-form-item>
        <a-form-item
          v-if="formState.screenShot"
          :label="t('sys.portal.comp') + t('sys.appDesigner.screenshot')"
          name="screenShot"
        >
          <a-image v-for="item in screenShot" :key="item" :src="item" alt="" style="height: 90px">
            <template #previewMask>
              <eye-outlined />
            </template>
          </a-image>
        </a-form-item>
        <a-form-item
          v-if="formState.description"
          :label="t('sys.developer.versionTip')"
          name="description"
        >
          {{ formState.description }}
        </a-form-item>
      </div>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getCategoryList } from '/@/apis/gct-platform/CategoryController';
  import {
    postPlugin,
    postPluginCancelUpload,
    postPluginUploadZip,
    getPluginGetImages,
  } from '/@/apis/gct-platform/PluginController';
  import { SvgIcon } from '/@/components/Icon';
  import { sizeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { statusEnum } from '/@/components/FieldUpload/src/types';
  import { message } from 'ant-design-vue';
  import { CategoryResponse } from '/@/apis/gct-platform/model';

  const { t } = useI18n();

  const formRef = ref();

  let formState = reactive({
    key: '',
    categoryId: '',
    client: '',
    description: '',
    icon: '',
    label: '',
    name: '',
    tag: '',
    version: '',
    zipUrl: '',
    tmpPath: '',
    screenShot: '',
    readMe: '',
  });

  const categoryOptions = ref<CategoryResponse[]>([]);

  const timer = ref();

  const fileList = ref();

  const emit = defineEmits(['ok']);

  const icon = ref();

  const screenShot = ref([]);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (!data) return;
    formState.categoryId = data.categoryId;
    getCategoryOptions();
  });

  /** 获取分类 */
  const getCategoryOptions = async () => {
    const res = await getCategoryList({
      assetsModule: 'CUS_PAGE_COMP',
    });
    categoryOptions.value = res!;
  };

  const customRequest = async ({ file }) => {
    const nameArr = file.name.split('.');
    const type = nameArr[nameArr.length - 1];
    if (type !== 'zip') {
      message.warn(`【${file.name}】支持的扩展名为.zip`);
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
    timer.value = setInterval(() => {
      if (fileList.value[0]['percentNum'] < 95) {
        fileList.value[0]['percentNum']++;
      }
    }, 100);
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('categoryId', formState.categoryId);
    try {
      const res = await postPluginUploadZip(
        formData,
        { categoryId: formState.categoryId },
        {
          transferToConfig: {
            timeout: 300 * 1000,
            headers: {
              'Content-Type': 'multipart/form-data;charset=UTF-8',
            },
          },
        },
      );

      formState = Object.assign(formState, res, {
        key: res?.name,
        name: res?.label,
        client: res?.client?.replaceAll(',', '、'),
      });
      fileList.value[0]['percentNum'] = 100;
      fileList.value[0]['status'] = '';
      getImg(res);
    } catch (error) {
      fileList.value[0]['percentNum'] = 100;
      fileList.value[0]['status'] = statusEnum.EXCEPTION;
      clearInterval(timer.value);
    }
  };

  const getImg = async (res) => {
    if (res?.icon) {
      const image = await getPluginGetImages(
        { imageUrl: res?.icon },
        {
          isReturnNativeResponse: true,
          transferToConfig: {
            responseType: 'blob',
          },
        },
      );

      icon.value = URL.createObjectURL(image.data);
    }
    if (res?.screenShot) {
      screenShot.value = [];
      const shotArr = res?.screenShot.split(',');
      shotArr.forEach(async (i) => {
        const image = await getPluginGetImages(
          { imageUrl: i },
          {
            isReturnNativeResponse: true,
            transferToConfig: {
              responseType: 'blob',
            },
          },
        );
        screenShot.value.push(URL.createObjectURL(image.data));
      });
    }
  };

  const fileSizeParser = computed(() => {
    return (size) => {
      return sizeParser(size);
    };
  });

  const handleOk = async () => {
    if (!fileList.value) {
      message.warn('请先上传代码包');
      return;
    }
    postPlugin({ ...formState, client: formState?.client?.replaceAll('、', ',') }).then((res) => {
      formRef.value?.resetFields();
      icon.value = '';
      formState.version = '';
      screenShot.value = [];
      clearInterval(timer.value);
      fileList.value = undefined;
      message.success(t('sys.saveSuccess'));
      closeModal();
      emit('ok');
    });
  };

  const handleClose = () => {
    if (fileList.value) {
      deleteFile();
    }
    formRef.value?.resetFields();
    icon.value = '';
    formState.version = '';
    screenShot.value = [];
    fileList.value = undefined;
  };

  /** 取消或删除文件时调用取消上传接口 */
  const deleteFile = () => {
    if ((fileList.value[0]['status'] = statusEnum.EXCEPTION)) {
      fileList.value = undefined;
    } else {
      postPluginCancelUpload(formState).then((res) => {
        formRef.value?.resetFields();
        icon.value = '';
        formState.version = '';
        screenShot.value = [];
        clearInterval(timer.value);
        fileList.value = undefined;
      });
    }
  };
  const toGuide = () => {
    window.open(`${window.location.origin}${window.location.pathname}#/guideDoc`, '_blank');
  };
</script>

<style lang="less" scoped>
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
  }
  .icon {
    align-self: center;
    margin-left: 24px;
    color: #212528;
    font-size: 16px;
    justify-items: flex-end;
  }
  :deep(.ant-image) {
    margin-right: 4px;
  }
</style>
