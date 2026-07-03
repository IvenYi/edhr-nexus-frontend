<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.editSth', { sth: t('sys.pageComp') })"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    :okText="t('sys.designView.save')"
    @ok="handleOk"
  >
    <a-collapse v-model:activeKey="activeKey" ghost>
      <a-collapse-panel key="1" :header="t('sys.basicInfo')">
        <a-form
          ref="formRef"
          :model="formState"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-form-item :label="t('sys.category')" name="categoryId">
            <a-select
              v-model:value="formState.categoryId"
              placeholder="Tags Mode"
              :options="categoryOptions"
              :fieldNames="{ label: 'name', value: 'id' }"
            />
          </a-form-item>
          <a-form-item :label="t('sys.portal.comp') + 'KEY'" name="key">
            {{ formState.key }}
          </a-form-item>
          <a-form-item :label="t('sys.developer.appCenter.client')" name="client">
            {{ formState.client }}
          </a-form-item>
          <a-form-item :label="t('sys.developer.identifier')" name="name">
            <a-tag v-if="formState.tag.includes('common')" :bordered="false" color="blue">
              {{ t('sys.org.common') }}
            </a-tag>
            <a-tag v-if="formState.tag.includes('eDHR')" :bordered="false" color="magenta">
              {{ 'eDHR' + t('sys.org.kit') }}
            </a-tag>

            <a-tag v-if="formState.tag.includes('MEDPRO')" :bordered="false" color="volcano">
              {{ 'MedPro' + t('sys.org.kit') }}
            </a-tag>
          </a-form-item>
          <a-form-item :label="t('sys.developer.codePackage')" name="zipUrl">
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
              <div
                class="progress-item mb-8px w-full"
                v-for="(item, index) in fileList"
                :key="index"
              >
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
              fileList &&
              fileList[0].status !== statusEnum.EXCEPTION &&
              fileList[0].percentNum == 100
            "
          >
            <a-form-item :label="t('sys.widgetName')" name="label">
              <span>
                {{ formState.label }} <a style="cursor: default">{{ formState.version }}</a>
              </span>
            </a-form-item>

            <a-form-item :label="t('sys.portal.comp') + t('sys.appDesigner.icon')" name=" icon ">
              <img style="width: 40px" :src="icon" alt="" />
            </a-form-item>

            <a-form-item
              v-if="formState.screenShot"
              :label="t('sys.portal.comp') + t('sys.appDesigner.screenshot')"
              name="screenShot"
            >
              <a-image
                v-for="item in screenShot"
                :key="item"
                :src="item"
                alt=""
                style="height: 24px"
              >
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
      </a-collapse-panel>
      <a-collapse-panel key="2" :header="t('sys.bpmn.versionStatus.HISTORY')">
        <a-table :dataSource="tableData" :columns="columns" :pagination="false" size="small">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'screenShot'">
              <a-image
                v-for="(item, id) in record.displayScreenShotArr"
                :key="item"
                :src="'/minio/' + item"
                alt=""
                style="height: 24px; margin-right: 4px"
              >
                <template #previewMask>
                  <eye-outlined />
                </template>
              </a-image>
              <a-popover v-if="record.screenShotArr.length > 2" trigger="click">
                <template #content>
                  <a-image
                    v-for="item in record.screenShotArr"
                    :key="item"
                    :src="'/minio/' + item"
                    alt=""
                    style="height: 24px; margin-right: 4px"
                  >
                    <template #previewMask>
                      <eye-outlined />
                    </template>
                  </a-image>
                </template>
                <a>更多</a>
              </a-popover>
            </template>
            <template v-if="column.key === 'action'">
              <table-action-auto
                :actions="[
                  {
                    label: t('sys.download'),
                    onClick: () => handleDownload(record),
                  },
                  {
                    label: t('sys.delete'),
                    color: 'text',
                    ifShow: index,
                    popConfirm: {
                      title: t('sys.confirmExecution'),
                      confirm: () => handleRowDelete(record),
                    },
                  },
                ]"
                :stopButtonPropagation="true"
              />
            </template>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto, BasicColumn } from '/@/components/Table';
  import { SvgIcon } from '/@/components/Icon';
  import { sizeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { statusEnum } from '/@/components/FieldUpload/src/types';
  import { message } from 'ant-design-vue';
  import { getCategoryList } from '/@/apis/gct-platform/CategoryController';
  import {
    postPluginVersionList,
    deletePluginVersion,
  } from '/@/apis/gct-platform/PluginVersionController';

  import {
    postPluginCancelUpload,
    postPluginUploadZip,
    putPluginById,
    getPluginGetImages,
  } from '/@/apis/gct-platform/PluginController';
  import { downloadByData } from '/@/utils/file/download';
  import { getMinioFileDownload } from '/@/apis/gct-platform/FileController';
  import { CategoryResponse, PluginVersionResponse } from '/@/apis/gct-platform/model';

  const { t } = useI18n();

  const formRef = ref();

  const emit = defineEmits(['ok']);

  const columns: BasicColumn[] = [
    {
      title: t('sys.app.version.no'),
      dataIndex: 'version',
      fixed: 'left',
      width: 80,
      ellipsis: true,
    },
    {
      title: t('sys.developer.codePackage'),
      dataIndex: 'packageName',
      width: 80,
      ellipsis: true,
    },
    {
      title: t('sys.developer.versionTip'),
      dataIndex: 'description',
      width: 100,
      ellipsis: true,
    },
    {
      title: t('sys.portal.comp') + t('sys.appDesigner.screenshot'),
      dataIndex: 'screenShot',
      width: 120,
    },
    {
      title: t('sys.creator'),
      dataIndex: 'createUserName',
      width: 80,
      ellipsis: true,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width: 100,
    },
  ];

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
    id: '',
    pluginId: '',
    readMe: '',
    screenShotArr: [],
  });

  let historyFormState = reactive({});
  const activeKey = ref(['1', '2']);

  const tableData = ref<PluginVersionResponse[]>([]);

  const timer = ref();

  const fileList = ref();

  const icon = ref();

  const screenShot = ref([]);

  const categoryOptions = ref<CategoryResponse[]>([]);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (!data) return;
    historyFormState = data;

    Object.assign(
      formState,
      data,
      { pluginId: data.id },
      { screenShotArr: data.screenShot ? data.screenShot.split(',') : [] },
      { client: data?.client?.replaceAll(',', '、') },
    );
    getCategoryOptions();
    getVersionList();
  });

  const handleOk = async () => {
    putPluginById(
      { id: formState.id },
      { ...formState, client: formState?.client?.replaceAll('、', ',') },
    ).then(() => {
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
    postPluginCancelUpload(formState).then((res) => {
      // formRef.value?.resetFields();
      formState = historyFormState;
      icon.value = '';
      screenShot.value = [];
      clearInterval(timer.value);
      fileList.value = undefined;
    });
  };
  const toGuide = () => {
    window.open(`${window.location.origin}${window.location.pathname}#/guideDoc`, '_blank');
  };
  /** 下载行数据 */
  const handleDownload = async (record) => {
    let { data, headers } = await getMinioFileDownload(
      { fileUrl: record.zipUrl },
      {
        isReturnNativeResponse: true,
        transferToConfig: {
          responseType: 'blob',
          responseEncoding: 'utf8',
        },
      },
    );
    //     const attachment = new URLSearchParams(
    //       headers?.['content-disposition'].replace('attachment;', '') || '',
    //     );
    // console.log('attachment',attachment,headers?.['content-disposition']);

    const filename =
      headers?.['content-disposition'].replace('attachment; filename=', '').replaceAll('"', '') ||
      '';
    downloadByData(data, { filename });
  };

  /** 获取版本信息 */
  const getVersionList = () => {
    postPluginVersionList(formState).then((res) => {
      tableData.value =
        res?.map((i) => {
          i.screenShotArr = i.screenShot ? i.screenShot.split(',') : [];
          i.packageName = i.zipUrl.split('/').slice(-1).toString();
          i.displayScreenShotArr = i.screenShot ? i.screenShot.split(',').slice(0, 2) : [];
          return { ...i };
        }) || [];
    });
  };

  /** 删除行数据 */
  const handleRowDelete = (record) => {
    deletePluginVersion({ ids: record.id }).then(() => {
      getVersionList();
      message.success(t('sys.deleteSuccess'));
    });
  };

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
    try {
      const res = await postPluginUploadZip(
        formData,
        {
          categoryId: historyFormState.categoryId,
          version: historyFormState.version,
          client: historyFormState.client,
          key: historyFormState.key,
          name: historyFormState.name,
          id: historyFormState.id,
          tag: historyFormState.tag,
        },
        {
          transferToConfig: {
            timeout: 300 * 1000,
            headers: {
              'Content-Type': 'multipart/form-data;charset=UTF-8',
            },
          },
        },
      );

      formState = Object.assign(formState, res);
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
<style>
  .ant-image {
    margin-right: 4px;
  }
</style>
