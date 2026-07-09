<template>
  <div class="ks-column import-template h100%">
    <div class="ks-col" style="height: calc(100% - 65px); overflow: scroll">
      <div v-if="curStep !== 2">
        <div class="step mt-40px">
          <a-steps :current="curStep">
            <a-step :title="t('sys.uploadFile')" />
            <a-step :title="t('sys.component.upload.previewData')" />
            <a-step :title="t('sys.component.upload.importSuccess')" />
          </a-steps>
        </div>

        <div class="text-[#212528]">
          <div class="step-area" v-if="curStep === 0">
            <div>
              <div class="title">{{ t('sys.pageDesigner.downloadUploadTemp') }}</div>
              <div class="margin">{{ t('sys.pageDesigner.downloadUploadTempTip') }}</div>
              <span @click="downloadTemp">
                <SvgIcon class="svg-icon" :size="16" name="xlsx" />
                <a>{{ modelTempName }}</a>
              </span>
            </div>
            <div>
              <div class="title">{{ t('sys.uploadFile') }}</div>
              <a-upload-dragger
                name="file"
                :customRequest="customRequest"
                :showUploadList="false"
                :accept="defProps.batchImport ? '.zip' : '.xlsx'"
                class="select-none"
              >
                <div class="py-10">
                  <div>
                    <SvgIcon size="56" name="folder" />
                  </div>
                  <p class="text-[#212528] mt12px">{{ t('sys.ipaas.clickOrDragToUploadTip') }}</p>
                  <p class="text-[12px] text-[#8F8F8F]">
                    {{
                      defProps.batchImport
                        ? t('sys.component.upload.supportZipFile', [100])
                        : t('sys.component.upload.supportXlsFile', [10])
                    }}
                  </p>
                </div>
              </a-upload-dragger>
              <div class="progress-box mt8px">
                <div
                  class="progress-item mb-8px w-full"
                  v-for="(item, index) in fileList"
                  :key="index"
                >
                  <SvgIcon
                    class="svg-icon"
                    :size="32"
                    :name="defProps.batchImport ? 'zip' : 'xlsx'"
                  />
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
                          <span
                            v-if="formData.fileId"
                            style="cursor: pointer"
                            @click="exportExcel()"
                          >
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
          <div v-if="curStep === 1" class="step-area">
            <div class="preview-tip">
              <span>{{ t('sys.component.upload.previewDefaultShow', [5]) }}</span>
              <span>{{ t('sys.component.upload.totalRows', [total]) }}</span>
            </div>
            <vxe-grid
              ref="vxeTableRef"
              v-bind="gridOptions"
              :columns="columns"
              :class="['vxetable', 'default']"
            >
              <template #default="{ column: { field: i }, row }">
                <span v-if="!permissionField.includes(i)" style="color: #8f8f8f">
                  {{ row[i] }}
                </span>
                <span v-else> {{ row[i] }}</span>
              </template>
              <template #header="{ column: { params: i, field } }">
                <span v-if="!permissionField.includes(field)" style="color: #8f8f8f">
                  {{ i.aliasName || i.name }}
                </span>
                <span v-else>{{ i.aliasName || i.name }}</span>
                &nbsp;
                <a-tooltip>
                  <template #title>{{ t('sys.pageDesigner.noPermission') }}</template>
                  <InfoCircleOutlined
                    v-if="!permissionField.includes(field)"
                    style="color: #f54547; font-size: 14px"
                  />
                </a-tooltip>
              </template>
            </vxe-grid>
            <div class="tabs-wrap">
              <span class="model-name">{{ modelName }}</span>
            </div>
            <div class="title"> {{ t('sys.pageDesigner.importConfig') }}</div>
            <a-form
              :model="formData"
              :label-col="{ span: 3 }"
              :wrapper-col="{ span: 12 }"
              autocomplete="off"
            >
              <a-form-item :label="t('sys.pageDesigner.importMode')" name="duplicateKeyUpdate">
                <a-select v-model:value="formData.duplicateKeyUpdate" :options="duplicateoptions" />
                <a-row v-if="formData.duplicateKeyUpdate && formData.duplicateKeyUpdate > 0">
                  <a-col :span="3" />
                  <a-col>
                    <a-checkbox v-model:checked="formData.updateStrategy" class="invalidate-tip">
                      {{ t('sys.pageDesigner.emptyDateCover') }}
                    </a-checkbox>
                  </a-col>
                </a-row>
              </a-form-item>

              <a-form-item
                :label="t('sys.appDesigner.importPolicy')"
                name="importInvalidate"
                class="importInvalidate"
              >
                <a-radio-group v-model:value="formData.importInvalidate" name="radioGroup">
                  <a-radio :value="0">{{ t('sys.pageDesigner.allUnsuccessful') }}</a-radio>
                  <a-radio :value="2">{{ t('sys.pageDesigner.stopUponError') }}</a-radio>
                  <a-radio :value="1">{{ t('sys.pageDesigner.ignoringErrorsContinuing') }}</a-radio>
                </a-radio-group>
                <div class="invalidate-tip">
                  <InfoCircleOutlined v-if="invalidateTip" />{{ invalidateTip }}
                </div>
              </a-form-item>
            </a-form>
          </div>
          <div v-if="curStep === 2"></div>
        </div>
      </div>
      <div v-else class="import-container">
        <div>
          <a-progress
            type="circle"
            :percent="schedule"
            :success="
              loading
                ? { percent: schedule, strokeColor: '#3168EC' }
                : isSuccess
                  ? { percent: schedule, strokeColor: '#48C65C' }
                  : { percent: schedule, strokeColor: '#FF792E' }
            "
            :status="isComplete ? 'normal' : isSuccess ? 'success' : 'exception'"
          >
            <template #format="percent">
              <span v-if="loading" style="color: #212528">{{ percent }}%</span>
              <svg
                v-if="!loading && !isSuccess"
                width="112"
                height="111"
                viewBox="0 0 112 111"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M57.527 37.6607H53.9591V64.4196H57.527V37.6607ZM57.6579 74.2574V70.3923H53.7927V74.2574H57.6579Z"
                  fill="#FF792E"
                />
              </svg>
              <svg
                v-if="!loading && isSuccess"
                width="114"
                height="113"
                viewBox="0 0 114 113"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M71.0855 43.4557L73.8662 46.2364L52.2619 67.8406L38.7723 54.3511L41.553 51.5704L52.2619 62.2792L71.0855 43.4557Z"
                  fill="#48C65C"
                />
              </svg>
            </template>
          </a-progress>
        </div>
        <div class="export-title">
          {{
            loading ? t('sys.component.upload.importing') : t('sys.component.upload.importSuccess')
          }}
        </div>

        <div v-if="loading" class="text-[#8f8f8f]">
          {{ t('sys.component.upload.importCloseModalTip') }}
        </div>
        <div v-if="isComplete && !isSuccess && importConfirmInfo.error" class="export-download">
          <a @click="exportExcel()">{{ t('sys.component.upload.clickDownload') }}</a>
          &nbsp;
          {{ t('sys.component.upload.checkImportContent') }}
        </div>
        <div v-if="isComplete" style="margin-top: 64px">
          <div>{{ t('sys.pageDesigner.importDetail') }}：</div>
          <div v-for="(item, index) in importConfirmInfo.resultReport" :key="index">
            <div style="color: #8f8f8f">
              {{ index + 1 }}.【{{ item.name }}】 {{ t('sys.component.upload.rowImportSuccess', [item.total]) }}
              {{ item.succeed }} {{ t('sys.component.upload.row') }}，{{ t('sys.component.upload.importFail') }}
              <span :style="{ color: item.errNumber ? '#F54547' : '#8f8f8f' }">{{
                item.errNumber
              }}</span>
              {{ t('sys.component.upload.row') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <a-button v-show="curStep === 0" @click="cacncel">{{ t('sys.cancelText') }}</a-button>
      <a-button v-show="curStep === 2" @click="finish">
        {{ t('sys.closeText') }}
      </a-button>
      <a-button v-show="curStep === 1" @click="prev" class="ml10px">
        {{ t('sys.editor.prev') }}
      </a-button>
      <a-button
        v-show="curStep !== 2"
        type="primary"
        @click="next"
        class="ml10px"
        :disabled="
          (curStep === 0 && fileList.length && fileList[0]['status'] !== '') || !fileList.length
        "
      >
        {{ t('sys.app.nextStep') }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch, reactive } from 'vue';
  import { IModal } from '@gct/runtime';
  import {
    getExcelDataDoImport,
    getExcelDataPreview,
    getExcelDataReport,
  } from '/@/apis/gct-apaas/ExcelController';
  import { getExcelTmplInfo } from '/@/apis/gct-apaas/ExcelTmplController';
  import { useI18n } from 'vue-i18n';
  import { message } from 'ant-design-vue';
  import { statusEnum } from '/@/components/FieldUpload/src/types';
  import { sizeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { SvgIcon } from '/@/components/Icon';
  import { downloadByData } from '/@/utils/file/download';

  interface getExcelDataDoImportQueryInterface {
    duplicateKeyUpdate?: number; // 数据重复时的导入策略 1 新增及更新/0 忽略重复数据/2仅更新数据
    fileId: string; // 文件id
    importInvalidate?: number; // 数据校验不通过时是否导入
    updateStrategy?: boolean; // 空值是否更新
    ref_master_id_?: string;
    ref_field_key_?: string;
    batchImport?: boolean;
  }

  const defProps = defineProps<{
    modal: IModal;
    importFun: (file: File, isMasterTable: number) => Promise<any>;
    downloadTemplate: () => void;
    onSuccess: (data) => void;
    onError: () => void;
    tmplKey: string;
    ref_master_id_?: string;
    ref_field_key_?: string;
    batchImport?: boolean;
  }>();
  const { t } = useI18n();

  /** 主表导入还是主子表一起导入，主表导入为1，主子表一起导入为2 */
  const isMasterTable = ref<number>(1);

  const curStep = ref(0);

  const timer = ref();

  const loading = ref<boolean>(false);

  const schedule = ref<number>(0);

  let temInfo = reactive([]);

  const fileInfo = ref();

  const isSuccess = ref<boolean>(true);

  const invalidateTip = ref<string>();

  /** 预览表格数据 */
  const tableData = ref([]);

  const total = ref<number>(0);

  const modelName = ref<string>();

  /** 导入模式选项 */
  const duplicateoptions = ref([]);

  /** 导入配置 */
  const formData = ref<getExcelDataDoImportQueryInterface>({
    fileId: '',
    ref_master_id_: defProps.ref_master_id_,
    ref_field_key_: defProps.ref_field_key_,
  });

  /** 上传文件 */
  const fileList = ref<object[]>([]);

  // 是否导入完成
  const isComplete = ref<boolean>(false);

  const modelTempName = ref<string>();

  /** 列头 */
  let columns = reactive<any>([]);

  /** 有权限的字段 */
  let permissionField = reactive([]);

  /** 二次导入返回值 */
  let importConfirmInfo = ref<{
    error: boolean;
    resultReport: Array<{
      name: String;
      succeed: Number;
      errNumber: Number;
      total: Number;
    }>;
  }>();

  const duplicateKeyOptions = [
    {
      label: t('sys.app.importMode.0'),
      value: 0,
    },
    {
      label: t('sys.app.importMode.2'),
      value: 2,
    },
    {
      label: t('sys.app.importMode.1'),
      value: 1,
    },
  ];

  const gridOptions = reactive<{
    data: object[];
    columnConfig: Object;
    editConfig: Object;
  }>({
    data: [],
    columnConfig: {
      resizable: true,
      slots: {
        header: 'header',
        default: 'default',
      },
    },
    editConfig: {
      trigger: 'click',
    },
  });

  function cacncel() {
    defProps.modal.dismiss({ ok: true });
  }

  function prev() {
    curStep.value -= 1;
  }

  async function next() {
    if (curStep.value === 0) {
      formData.value.importInvalidate = 1;

      columns = [
        { type: 'seq', title: '序号', width: 60 },
        ...temInfo[0].columns.map((item) => {
          return {
            width: item.width,
            params: item,
            dataIndex: isMasterTable.value === 2 ? item.id.replace('$', '.') : item.key,
            field: isMasterTable.value === 2 ? item.id.replace('$', '.') : item.key,
            slots: {
              header: 'header',
              default: 'default',
            },
          };
        }),
      ];
      if (isMasterTable.value === 2) {
        temInfo.forEach((i, idx) => {
          if (idx) {
            columns = [
              ...columns,
              {
                title: temInfo[idx].relationColumnName + '（子表）',
                children: [
                  ...temInfo[idx].columns.map((item) => {
                    return {
                      width: item.width,
                      params: item,
                      dataIndex: item.id.replace('$', '.'),
                      field: item.id.replace('$', '.'),
                      slots: {
                        header: 'header',
                        default: 'default',
                      },
                    };
                  }),
                ],
              },
            ];
          }
        });
      }

      formData.value.duplicateKeyUpdate = temInfo[0].duplicateKeyUpdate[0];
      duplicateoptions.value = duplicateKeyOptions.filter((item) =>
        temInfo[0].duplicateKeyUpdate.includes(item.value),
      );
      curStep.value += 1;
      const res = (await getExcelDataPreview({ fileId: formData.value.fileId })) as any;
      tableData.value = res.data;
      console.log('tableData', res.data);
      gridOptions.data = res.data;
      permissionField = res.hasPermissionFieldList;
      modelName.value = res.sheetName;
      return;
    }

    if (curStep.value === 1) {
      curStep.value += 1;
      const data = { ...formData.value };
      nextDataDoImport(data);
    }
  }

  /**第二次導入 */
  async function nextDataDoImport(data: getExcelDataDoImportQueryInterface) {
    const time = setInterval(() => {
      schedule.value += +(Math.random() * 10).toFixed(0);
    }, 300);
    loading.value = true;
    defProps.modal.setOptions({ canFullscreen: false });
    isSuccess.value = true;
    try {
      const res = (await getExcelDataDoImport(data)) as any;
      if (res.resultReport.length) {
        schedule.value = 100;
        importConfirmInfo.value = res as any;
        res.resultReport.forEach((element) => {
          if (element.errNumber > 0) {
            importConfirmInfo.value = { ...importConfirmInfo.value, error: true };
          }
        });
      } else {
        schedule.value = 100;
        importConfirmInfo.value = {
          error: !!res?.errNumber,
          resultReport: [
            {
              name: modelName.value as string,
              errNumber: res?.errNumber,
              total: res.total,
              succeed: res.succeed,
            },
          ],
        };
      }

      if (importConfirmInfo.value?.error) {
        isSuccess.value = false;
      }
      await defProps.onSuccess({ ...res, ...formData.value });
    } catch (error) {
      isSuccess.value = false;
      await defProps.onError();
    } finally {
      isComplete.value = true;
      loading.value = false;
      clearInterval(time);
      schedule.value = 100;
    }
  }

  /**获取模版详情 */
  function getTemplateInfo(id: string) {
    // getExcelTmplInfo({ key: id });
  }

  /** 下载模板 */
  async function downloadTemp() {
    await defProps.downloadTemplate();
  }

  function finish() {
    cacncel();
  }

  watch(
    () => formData.value.importInvalidate,
    (val) => {
      switch (val) {
        case 1:
          invalidateTip.value = t('sys.pageDesigner.importDesc.three');
          break;
        case 2:
          invalidateTip.value = t('sys.pageDesigner.importDesc.two');
          break;
        default:
          invalidateTip.value = t('sys.pageDesigner.importDesc.one');
      }
    },
  );

  const customRequest = async ({ file }) => {
    const nameArr = file.name.split('.');
    const type = nameArr[nameArr.length - 1];
    const allowedTypes = defProps.batchImport ? ['zip'] : ['xls', 'xlsx'];
    const typeMessage = defProps.batchImport ? '.zip' : '.ls .xlsx';
    if (!allowedTypes.includes(type)) {
      message.warn(`【${file.name}】支持的扩展名为${typeMessage}`);
      return Promise.reject();
    }
    const fileSize = file.size / 1024 / 1024;
    const maxSize = defProps.batchImport ? 100 : 10;
    if (fileSize > maxSize) {
      message.warn(`【${file.name}】文件大小不能超过 ${maxSize}MB`);
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
    try {
      const res = await defProps.importFun(file, isMasterTable.value);

      fileInfo.value = res;
      fileList.value[0]['percentNum'] = 100;
      fileList.value[0]['status'] = '';
      if (res.error) {
        fileList.value[0]['status'] = statusEnum.EXCEPTION;
      }

      formData.value['fileId'] = res.fileId;
      total.value = res.succeed;
    } catch (error) {
      fileList.value[0]['percentNum'] = 100;
      formData.value['fileId'] = '';
      fileList.value[0]['status'] = statusEnum.EXCEPTION;
      fileList.value[0]['errorMessge'] = error;
      clearInterval(timer.value);
      await defProps.onError();
    }
  };

  /** 删除选中文件 */
  const deleteFile = () => {
    fileList.value = [];
    if (timer.value) clearInterval(timer.value);
  };

  const fileSizeParser = computed(() => {
    return (size) => {
      return sizeParser(size);
    };
  });

  /** 下载导入失败结果 */
  async function exportExcel() {
    try {
      let { data, headers } = await getExcelDataReport(
        {
          fileId: formData.value.fileId,
        },
        {
          isReturnNativeResponse: true,
          transferToConfig: { responseType: 'blob', timeout: 20000 },
        },
      );
      if (data) {
        const attachment = new URLSearchParams(
          headers?.['content-disposition'].replace('attachment;', '') || '',
        );

        const filename = attachment.get('filename') || '';
        downloadByData(data, { filename });
      }
    } catch (error) {}
  }

  onMounted(async () => {
    const res = await getExcelTmplInfo({ key: defProps.tmplKey });
    temInfo = Array.isArray(JSON.parse(res?.configJson))
      ? JSON.parse(res?.configJson)
      : [JSON.parse(res?.configJson)];
    isMasterTable.value = temInfo.length === 1 ? 1 : 2;
    modelTempName.value = res.name;
  });
  defineExpose({});
</script>

<style lang="less" scoped>
  .import-template {
    padding-bottom: 65px;
  }

  .tabs-wrap {
    width: 100%;
    height: 38px;
    padding-top: 4px;
    border: 1px solid var(--vxe-table-border-color);
    border-top: 0;
    border-radius: 0 0 4px 4px;
    background-color: #fbfbfc;
  }

  .step {
    padding: 36px 148px;
  }

  .step-area {
    padding: 0 80px;

    .margin {
      margin: 8px 0;
    }

    .title {
      margin: 16px 0;
      color: #212528;
      font-weight: 600;

      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 14px;
        margin-right: 8px;
        border-radius: 2px;
        background: var(--ant-primary-color);
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

    .preview-tip {
      display: flex;
      justify-content: space-between;
      padding: 6px 8px;
    }
  }

  .model-name {
    display: inline-block;
    max-width: 360px;
    padding: 8px;
    overflow: hidden;
    border-bottom: 2px solid var(--ant-primary-color);
    color: var(--ant-primary-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .progress-error-info {
    display: inline-block;
    overflow: hidden;
    color: #f54547;
    text-overflow: ellipsis;
  }

  .invalidate-tip {
    margin-top: 8px;
    color: #8f8f8f;
    font-size: 12px;
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 16px;
    border-top: 1px solid #e0e3ea;
    background-color: #fff;
    text-align: right;
  }

  .import-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    line-height: 22px;

    .export-title {
      margin: 16px 0 8px;
      color: #212528;
      font-size: 16px;
      font-weight: 700;
    }

    .export-number {
      color: #8f8f8f;
    }

    .export-download {
      margin-top: 12px;
      color: #8f8f8f;
    }
  }

  .importInvalidate .ant-form-item-control {
    margin-top: 4px;
  }
  .ant-radio-wrapper {
    line-height: 32px;
  }
  :deep(.vxe-table--render-default.vxe-editable .vxe-body--column) {
    height: 36px !important;
    background: none;
  }
</style>
