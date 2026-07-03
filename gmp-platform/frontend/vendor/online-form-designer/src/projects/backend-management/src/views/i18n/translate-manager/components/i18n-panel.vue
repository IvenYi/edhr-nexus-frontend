<template>
  <div class="i18n-panel">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item name="keywords" :label="t('sys.searchText')">
            <a-input v-model:value="formState.keywords" />
          </a-form-item>
        </a-col>
        <a-col :span="16" style="text-align: right">
          <a-button @click="() => formRef?.resetFields()">
            <template #icon>
              <undo-outlined />
            </template>
            {{ t('sys.reset') }}
          </a-button>
          <a-button style="margin: 0 8px" type="primary" @click="handleSearch">
            <template #icon>
              <search-outlined />
            </template>
            {{ t('sys.queryText') }}
          </a-button>
        </a-col>
      </a-row>
    </a-form>
    <div class="table-wrap">
      <BasicTable
        :dataSource="tableData"
        :columns="columns"
        :showIndexColumn="false"
        :pagination="pagination"
        :striped="false"
        :bordered="true"
        @change="handleTableChange"
      >
        <template #headerTop>
          <a-button
            v-if="userActions.Import"
            class="btn mr-16px"
            @click="handleOpenImportModal"
            type="primary"
          >
            <template #icon>
              <download-outlined />
            </template>
            {{ t('sys.import') }}
          </a-button>

          <a-button
            v-if="userActions.Export"
            class="btn"
            @click="handleExportI18n"
            :loading="exportLoading"
          >
            <template #icon>
              <upload-outlined />
            </template>
            {{ t('sys.export') }}
          </a-button>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  onClick: handleRowEdit.bind(null, record),
                  ifShow: userActions.Update,
                },
                {
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDelete'),
                    confirm: handleRowDelete.bind(null, record),
                  },
                  ifShow: userActions.Delete,
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </BasicTable>
      <i18n-modal :lang="langColumns" @register="userRegister" @ok="handleModalOk" />
      <import-modal
        @register="registerImportModal"
        @on-download-template="handleDownLoadTemplate"
        :show-error-msg="true"
        :show-upload-template="false"
        :uploadExtraProps="{
          accept:
            '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
          customRequest: handleImportI18n,
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, unref, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { message } from 'ant-design-vue';
  import {
    SearchOutlined,
    UndoOutlined,
    DownloadOutlined,
    UploadOutlined,
    PlusOutlined,
  } from '@ant-design/icons-vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import I18nModal from '../components/i18n-modal.vue';
  import { ImportModal } from '@/components/Import';
  import { useLocaleStoreWithOut } from '/@/store/modules/locale';
  import { I18nTableColumnType } from '../types/i18n';
  import { updateAppointI18nMessage } from '@/locales/setupI18n';
  import { useI18n } from 'vue-i18n';
  import { BasicAction, CustomAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { downloadByData } from '/@/utils/file/download';

  import {
    getI18nInfoLangDownload,
    postI18nInfoLangUpload,
  } from '/@/apis/gct-platform/I18nInfoController';

  export interface I18nTableType {
    key: string;
    type: string;
    [key: string]: string;
  }
  export type ColumType = {
    title: string;
    dataIndex: string;
  };

  interface i18nFormType {
    keywords: string;
  }

  const [userRegister, { openModal }] = useModal();
  const [registerImportModal, { openModal: openImportModal }] = useModal();
  const { getLocaleList, getI18nPageList, I18nDelete, I18nAddOrEdit } = useLocaleStoreWithOut();
  const { t } = useI18n();
  const { hasPermission } = usePermission();
  const exportLoading = ref<boolean>(false);

  const userActions = computed(() => {
    return {
      Insert: hasPermission(BasicAction.Insert),
      Import: hasPermission(BasicAction.Import),
      Export: hasPermission(BasicAction.Export),
      Update: hasPermission(BasicAction.Update),
      Delete: hasPermission(BasicAction.Delete),
      PermissionSetting: hasPermission(CustomAction.PermissionSetting),
    };
  });

  //搜索过滤部分
  const formRef = ref<FormInstance>();

  const formState = reactive<i18nFormType>({
    keywords: '',
  });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const columns = ref<ColumType[]>([
    {
      title: t('sys.i18n.resourceIdentification'),
      dataIndex: 'key',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
    },
  ]);

  const langColumns = ref<ColumType[]>([]);
  onMounted(async () => {
    const localeList = await getLocaleList();
    langColumns.value = (localeList as I18nTableColumnType[])
      .filter((item) => {
        return item.configured !== 0 && item.state !== 0;
      })
      .map((item) => {
        return {
          title: item.language,
          dataIndex: item.languageTag,
        };
      });
    columns.value.splice(columns.value.length - 1, 0, ...langColumns.value);
    getTableData();
  });

  const handleSearch = () => {
    formRef.value?.validate().then(async () => {
      // 发送网络请求获取数据
      await getTableData(1);
    });
  };

  const tableData = ref<I18nTableType[]>([]);
  const getTableData = async (current?) => {
    const { data, totalCount } = await getI18nPageList({
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      searchKey: formState.keywords,
    });
    const rows = reactive<I18nTableType[]>([]);
    for (let i = 0; i < data.length; i++) {
      const row = reactive<I18nTableType>({
        key: data[i].key,
        type: data[i].type,
      });
      const infos = JSON.parse(data[i].info);
      for (let j = 0; j < infos.length; j++) {
        row[infos[j].locale] = infos[j].info;
      }
      rows.push(row);
    }
    pagination.total = totalCount;
    tableData.value = unref(rows);
  };

  const handleModalOk = async (data, isEdit) => {
    // 发送请求
    const infos = reactive<
      {
        locale: string;
        info: string;
      }[]
    >([]);
    const columns = langColumns.value.map((item) => item.dataIndex);
    for (let i = 0; i < columns.length; i++) {
      const info = reactive({
        locale: '',
        info: '',
      });
      const key = columns[i];
      info.locale = key;
      info.info = data[key];
      infos.push(info);
    }
    const infoStr = JSON.stringify(infos);
    const obj = {
      info: infoStr,
    };
    await I18nAddOrEdit(data.id, obj);
    getTableData();
    if (isEdit) {
      updateAppointI18nMessage({ i18nKey: data.id, i18nMessage: data });
    }
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const handleRowDelete = async (record) => {
    await I18nDelete({ ids: record.key });
    getTableData();
  };

  const handleRowEdit = async (record) => {
    // 请求接口获取当前多语言的数据
    const data = record;
    openModal(true, data);
  };

  const requestExportI18nExcel = async (exportData) => {
    const fileStream = await getI18nInfoLangDownload(
      { exportData },
      {
        isTransformResponse: false,
        transferToConfig: {
          responseType: 'blob',
          responseEncoding: 'utf8',
        },
      },
    );
    if (fileStream) {
      downloadByData(fileStream, {
        filename: 'i18nFile.xlsx',
        timestamp: true,
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      return true;
    }
    return false;
  };

  /** 下载国际化模板 */
  const handleDownLoadTemplate = async () => {
    const result = await requestExportI18nExcel(false);
    if (result) {
      message.success(t('sys.i18n.downloadTemplateSuccess'));
    }
  };

  /** 导入国际化 */
  const handleImportI18n = async (data) => {
    let formData: any = new FormData();
    formData.append('file', data.file);
    data.onProgress();
    const res: any = await postI18nInfoLangUpload(
      formData,
      { skipValid: true },
      {
        transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
      },
    );
    if (res) {
      if (res.errs && res.errs.length !== 0) {
        const errsInfos = Object.entries(
          res.errs.reduce((prev, current) => {
            if (!prev[current.rowNum]) {
              prev[current.rowNum] = { rowNum: current.rowNum, errorInfos: [] };
            }
            prev[current.rowNum].errorInfos.push({ message: `${current.name}${current.errorMsg}` });
            return prev;
          }, {}),
        ).map(([_, value]) => value);
        data.onError(null, errsInfos);
      } else {
        data.onSuccess();
        pagination.current = 1;
        await getTableData();
        // message.success(t('sys.importSuccess'));
      }
    } else {
      data.onError();
    }
  };

  /** 导出国际化 */
  const handleExportI18n = async () => {
    exportLoading.value = true;
    const result = await requestExportI18nExcel(true);
    exportLoading.value = false;
    if (result) {
      message.success(t('sys.exportSuccess'));
    }
  };

  const handleOpenImportModal = () => {
    openImportModal(true, 111);
  };
</script>

<style lang="less" scoped>
  .i18n-panel {
    padding: 16px;
  }
</style>
