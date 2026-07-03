<template>
  <div class="i18n-container">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="16">
          <a-form-item name="keywords" :label="t('sys.keywords')">
            <a-input
              v-model:value="formState.keywords"
              :placeholder="t('sys.keywordsPlaceholder')"
              :style="{ width: '360px' }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8" style="text-align: right">
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
          <a-button class="mr-16px" type="primary" @click="handleAddI18n">
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.new') }}
          </a-button>
          <custom-button
            :title="t('sys.import')"
            class="mr-16px"
            @btn-left-click="handleOpenImportModal"
            @btn-right-click="handleDownLoadTemplate"
          >
            <template #left-icon>
              <download-outlined />
            </template>
            <template #right-icon>
              <vertical-align-bottom-outlined />
            </template>
          </custom-button>

          <a-button class="btn" @click="handleExportI18n" :loading="exportLoading">
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
                },
                {
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDelete'),
                    confirm: handleRowDelete.bind(null, record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </BasicTable>
      <I18Modal :lang="langColumns" @register="userRegister" @ok="handleModalOk" />
      <import-modal
        @register="registerImportModal"
        @on-download-template="handleDownLoadTemplate"
        :show-error-msg="true"
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
  import { ref, reactive, onMounted, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { message } from 'ant-design-vue';
  import {
    SearchOutlined,
    UndoOutlined,
    DownloadOutlined,
    UploadOutlined,
    PlusOutlined,
  } from '@ant-design/icons-vue';
  import { useI18n } from 'vue-i18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useLocaleStoreWithOut } from '/@/store/modules/locale';
  import {
    getI18nInfoPageList,
    putI18nInfoByKey,
    postI18nInfo,
    deleteI18nInfo,
    getI18nInfoLangDownload,
    postI18nInfoLangUpload,
  } from '/@/apis/gct-apaas/I18nInfoController';
  import { I18Modal } from '/@/components/I18nSelect/index';
  import { downloadByData } from '/@/utils/file/download';
  import { ImportModal } from '@/components/Import';
  import { CustomButton } from '/@/components/Button/index';

  type ColumType = {
    title: string;
    dataIndex: string;
  };

  interface I18nTableType {
    key: string;
    type: string;
    [key: string]: string;
  }

  const { t } = useI18n();
  const [userRegister, { openModal }] = useModal();
  const [registerImportModal, { openModal: openImportModal }] = useModal();
  const { getEnableLocaleList } = useLocaleStoreWithOut();

  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const formState = reactive({
    keywords: '',
  });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const loading = ref<boolean>(false);

  const exportLoading = ref<boolean>(false);

  const tableData = ref<I18nTableType[]>([]);

  const fixedColumns: ColumType[] = [
    {
      title: t('sys.i18n.resourceIdentification'),
      dataIndex: 'key',
    },

    {
      title: t('sys.operation'),
      dataIndex: 'action',
      width: 120,
    },
  ];

  const langColumns = computed(() => {
    return getEnableLocaleList.map((item) => {
      return {
        title: item.language,
        dataIndex: item.languageTag,
      };
    });
  });

  const columns = computed(() => {
    const _fixedColumns = fixedColumns.slice();
    _fixedColumns.splice(fixedColumns.length - 1, 0, ...langColumns.value);
    return _fixedColumns;
  });

  const getTableData = async (keyword?, current?) => {
    loading.value = true;
    const result = await getI18nInfoPageList({
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      searchKey: keyword,
    });
    loading.value = false;

    if (result && result.data) {
      const rows = result.data.map((item: any) => {
        const infos = JSON.parse(item?.info);
        return {
          key: item.key,
          type: item.type,
          ...Object.fromEntries(infos.map((i) => [i.locale, i.info])),
        };
      });
      pagination.total = result.totalCount;
      tableData.value = rows;
    }
  };

  onMounted(getTableData);

  const handleSearch = () => {
    formRef.value?.validate().then(async () => {
      // 发送网络请求获取数据、
      pagination.current = 1;
      await getTableData(formState.keywords);
    });
  };

  const handleAddI18n = () => {
    openModal();
  };

  const handleOpenImportModal = () => {
    openImportModal(true, 111);
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

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData(formState.keywords);
  };

  const handleRowDelete = async (record) => {
    loading.value = true;
    await deleteI18nInfo({ ids: record.key });
    getTableData();
  };

  const handleRowEdit = async (record) => {
    // 请求接口获取当前多语言的数据
    const data = record;
    openModal(true, data);
  };

  const handleModalOk = async (data, isEdit) => {
    const langInfos = langColumns.value.map((item) => {
      return {
        locale: item.dataIndex,
        info: data[item.dataIndex] ?? '',
      };
    });
    loading.value = true;
    if (isEdit) {
      await putI18nInfoByKey({ key: data.id }, { info: JSON.stringify(langInfos) });
    } else {
      await postI18nInfo({ info: JSON.stringify(langInfos), key: data.id });
    }
    getTableData();
  };
</script>

<style lang="less" scoped>
  .i18n-container {
    padding: 16px;
  }
</style>
