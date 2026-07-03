<template>
  <div class="flex flex-col h-full">
    <search-form
      :formData="formState"
      :initData="initSearchList.filter((n) => !n.hidden)"
      @on-query="() => getTableData(1)"
    />

    <div class="flex mb-16px">
      <div class="pitch-on" v-if="canBatchDelete && checkedRecords.length">
        <span class="pitch-on-text">
          <span>{{ t('sys.pageDesigner.selected') }}</span>
          <span class="pitch-on-count">{{ checkedRecords.length }}</span>
          <span>{{ t('sys.pageDesigner.row') }}</span>
        </span>
        <span
          class="pitch-on-clear"
          :title="t('sys.pageDesigner.clearSelectedData')"
          @click="clearAllSelected"
        >
          <close-outlined class="iconfont" />
        </span>

        <a-button danger ghost :loading="batchDeleteLoading" @click="batchDelete">
          {{ t('sys.batchDelete') }}
        </a-button>
      </div>

      <a-button
        v-if="canDownloads"
        class="ml-[auto]"
        :disabled="checkedRecords.length === 0"
        type="primary"
        @click="batchExport"
        >{{ t('sys.edhr.batchDownload') }}</a-button
      >
    </div>

    <base-vxe-table
      class="h-100%"
      :tableColumns="columnDefinitions.filter((n) => !n.hidden)"
      :data-source="tableData"
      :loading="loading"
      showPagination
      :action="{ width: 100 }"
      v-model:pagination="pagination"
      @request-table-data="handleTableChange"
      ref="TableRef"
      :events="{
        'checkbox-change': handleCheckboxChange,
        'checkbox-all': handleCheckboxAllChange,
      }"
      :attributes="{
        'checkbox-config': {
          visibleMethod: ({ row }) => row.status === PrintStatusEnum.SUCCEED,
        },
      }"
    >
      <template #custom_item="{ column: { field }, record }">
        <div v-if="field === 'materialNo'">
          <span v-if="isNil(record[field]) || record[field] === ''"> -- </span>
          <div v-else>
            <span>
              {{ record[field] }}
            </span>
            <span class="ml-8px batch-print-tag" v-if="record?.params?.includeSemi">
              {{ t('sys.edhr.entireBatchPrint') }}
            </span>
          </div>
        </div>
      </template>
      <template #operate="{ row }">
        <table-action-auto
          :actions="[
            {
              label: t('sys.download'),
              onClick: () => handleDownload(row),
              ifShow: () => row.status === PrintStatusEnum.SUCCEED && Boolean(canDownload),
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </base-vxe-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onBeforeUnmount, computed, createVNode } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import { message as Message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { TableActionAuto } from '/@/components/Table';
  import type { FileTaskResponse } from '/@/apis/gct-platform/model';
  import {
    deleteFileTaskObject,
    getFileTaskPageList,
    getFileTaskPageListQueryInterface,
    postFileTaskBatchDownload,
  } from '/@/apis/gct-platform/FileTaskController';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { downloadByUrl, downloadByData } from '/@/utils/file/download';
  import SearchForm from '../../components/search-form/index.vue';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { isNil } from 'lodash-es';

  const { t } = useI18n();

  const { appInfo } = useAppInfoStore();

  const isInMedPro = computed(() => appInfo.suiteKey === 'MEDPRO');

  enum PrintTypeEnum {
    EDHR = 'EDHR',
    FORM = 'FORM',
    NOTEBOOK = 'NOTEBOOK',
    EDHR_TMPL = 'EDHR_TMPL',
  }

  enum PrintStatusEnum {
    WAITING = 'WAITING',
    PROCESSING = 'PROCESSING',
    TIMEOUT = 'TIMEOUT',
    SUCCEED = 'SUCCEED',
    FAIL = 'FAIL',
  }

  const props = withDefaults(
    defineProps<{
      canDownload?: boolean;
      canDownloads?: boolean;
      canBatchDelete?: boolean;
      queryParams?: any;
    }>(),
    {
      canDownload: true,
      canDownloads: true,
      canBatchDelete: false,
      queryParams: {},
    },
  );

  const TableRef = ref();

  /** 放行状态 */
  const PrintTypeOptions = Object.keys(PrintTypeEnum).map((item) => {
    return {
      label: t('sys.edhr.printTypeOption.' + item),
      value: item,
    };
  });

  const initSearchList = [
    {
      type: 'select',
      label: t('sys.type'),
      id: 'relationType',
      model: 'relationType',
      options: PrintTypeOptions,
    },
    {
      type: isInMedPro.value ? 'input' : 'lotTableSelect',
      label: t('sys.edhr.lotOrSn'),
      id: 'materialNo',
      model: 'materialNo',
      maxLength: 32,
      selectAttrs: {
        variant: 'select',
        placeholder: t('sys.chooseText'),
      },
    },
    {
      type: 'input',
      label: t('sys.name'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
    {
      type: 'input',
      label: t('sys.edhr.taskName'),
      id: 'formTaskName',
      model: 'formTaskName',
      maxLength: 32,
      hidden: isInMedPro,
    },
  ];

  const columnDefinitions = [
    {
      type: 'checkbox',
      width: 60,
    },
    {
      title: t('sys.type'),
      field: 'relationType',
      minWidth: 120,
      params: { i18nPrefix: 'sys.edhr.printTypeOption' },
      slots: { default: 'value_i18n_render' },
    },
    {
      title: t('sys.edhr.lotOrSn'),
      field: 'materialNo',
      minWidth: 250,
      params: { defaultValueStr: '--' },
      slots: { default: 'custom_render' },
    },
    { title: t('sys.name'), field: 'name', minWidth: 240 },
    { title: t('sys.edhr.taskName'), field: 'title', minWidth: 240, hidden: isInMedPro },
    {
      title: t('sys.status'),
      field: 'status',
      minWidth: 120,
      params: { i18nPrefix: 'sys.edhr.printStatusEnum' },
      slots: { default: 'value_i18n_render' },
    },
    { title: t('sys.createUser'), field: 'createUserName' },
    { title: t('sys.createTime'), field: 'createTime', minWidth: 176 },
    {
      title: t('sys.edhr.failInfo'),
      field: 'failInfo',
      minWidth: 150,
      params: { defaultValueStr: '--' },
    },
  ];

  const formState = reactive<getFileTaskPageListQueryInterface>({
    name: undefined,
    formTaskName: undefined,
    relationType: undefined,
    status: undefined,
    materialNo: undefined,
  });

  const loading = ref<boolean>(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<FileTaskResponse[]>([]);

  // 未结束状态定时器
  let _timer: any = null;
  const _clearTimer = () => {
    _timer && clearTimeout(_timer);
    _timer = null;
  };
  const _setTimer = () => {
    _clearTimer;
    _timer = setTimeout(() => {
      getTableData();
    }, 30 * 1000);
  };

  const getTableData = async (initCurrent = 0) => {
    _clearTimer();
    const usePathQuery = usePathQueryStore();

    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;
    const res = await getFileTaskPageList(
      {
        ...formState,
        ...props.queryParams,
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      },
      { transferToConfig: { headers: { 'App-Tag': usePathQuery.getAid() } } },
    ).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];

    if (
      tableData.value.find((item) =>
        [PrintStatusEnum.WAITING, PrintStatusEnum.PROCESSING].includes(
          item.status as PrintStatusEnum,
        ),
      )
    ) {
      _setTimer();
    }
  };

  const batchDeleteLoading = ref(false);
  const checkedRecords = ref<FileTaskResponse[]>([]);

  const clearAllSelected = () => {
    checkedRecords.value = [];
    TableRef.value.getRef().clearCheckboxRow();
  };

  const batchDelete = async () => {
    try {
      await sureTodo();
      batchDeleteLoading.value = true;
      await deleteFileTaskObject({ ids: checkedRecords.value.map((item) => item.id)?.join(',') });
      clearAllSelected();
      Message.success(t('sys.delSuccess'));
      getTableData();
    } catch (error) {
      console.log(typeof error === 'string' ? t('sys.operationFailed') : 'API Error', error);
    }
    batchDeleteLoading.value = false;
  };

  const batchExport = async () => {
    const appTag = checkedRecords.value[0].appId;
    const params = { appTag, urls: checkedRecords.value.map((item) => item.url) };
    const fileStream = await postFileTaskBatchDownload(params, {
      isTransformResponse: false,
      transferToConfig: {
        responseType: 'blob',
        responseEncoding: 'utf8',
      },
    });

    if (fileStream) {
      downloadByData(fileStream, {
        filename: `${Date.now()}.zip`,
      });
      checkedRecords.value = [];
    }
  };
  const handleCheckboxChange = () => {
    checkedRecords.value = TableRef.value.getRef().getCheckboxRecords();
  };

  const handleCheckboxAllChange = (checked) => {
    checkedRecords.value = checked.records;
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleDownload = (record: FileTaskResponse) => {
    downloadByUrl({
      url: `/minio/${record.appId}/${record.url}`,
    });
  };

  const sureTodo = async () => {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        title: t('sys.confirmExecution'),
        icon: createVNode(ExclamationCircleOutlined),
        async onOk() {
          try {
            resolve(true);
          } catch {
            reject('error');
          }
        },
        onCancel() {
          reject('error');
        },
      });
    });
  };

  onMounted(() => getTableData(1));

  onBeforeUnmount(() => {
    _clearTimer();
  });
</script>

<style lang="scss" scoped>
  .pitch-on {
    display: flex;
    align-items: center;

    &-count {
      color: var(--ant-primary-color);
      margin: 4px;
    }

    &-clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      margin-left: 4px;
      margin-right: 16px;
      border-radius: 50%;
      background-color: rgb(0 0 0 / 25%);
      vertical-align: middle;

      &:hover {
        background-color: rgb(0 0 0 / 45%);
      }

      .iconfont {
        color: #fff;
        font-size: 12px;
      }
    }
  }
  .batch-print-tag {
    border-radius: 4px;
    border: 1px solid var(--ant-primary-color);
    padding: 1px 4px;
    font-size: 12px;
    color: var(--ant-primary-color);
  }
</style>
