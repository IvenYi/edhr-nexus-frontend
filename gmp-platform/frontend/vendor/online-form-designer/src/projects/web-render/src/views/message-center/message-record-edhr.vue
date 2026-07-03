<template>
  <basic-page-render>
    <div class="flex flex-col h-full p-16px">
      <search-form
        :formData="formState"
        :initData="initSearchList"
        :transparent="!inEDHRApp"
        :maxLength="initSearchList.length"
        @on-reset="initPushTimeValue"
        @on-query="() => getTableData(1)"
      />

      <base-vxe-table
        class="h-100%"
        :tableColumns="columnDefinitions"
        :data-source="tableData"
        :loading="loading"
        showPagination
        :action="{ visible: false, width: 100 }"
        v-model:pagination="pagination"
        @request-table-data="handleTableChange"
      >
        <template #custom_item="{ column: { field }, record }">
          <a-tag
            v-if="field === 'result'"
            :color="record[field] === 'SUCCEED' ? 'success' : 'error'"
          >
            {{ record[field] === 'SUCCEED' ? t('sys.success') : t('sys.fail') }}
          </a-tag>
          <span v-else-if="field === 'pushType'">{{ getPushTypeList(record[field]) }}</span>
        </template>

        <!-- <template #operate="{ row }">
          <table-action-auto
            :actions="[
              {
                label: inEDHRApp ? '详情' : t('sys.view'),
                onClick: handleRowEdit.bind(null, row),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template> -->
      </base-vxe-table>
    </div>
    <record-modal @register="recordRegister" @ok="handleModalOk" />
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { TableActionAuto } from '/@/components/Table';
  import { getMessageRecordPageList } from '/@/apis/gct-apaas/MessageRecordController';
  import { pushTypeObj, pushTypeList } from './constant/enum';
  import { useModal } from '/@/components/Modal';
  import recordModal from './modal/record-modal.vue';
  import { cloneDeep, omit } from 'lodash-es';
  import dayjs from 'dayjs';

  import SearchForm from '../edhr-application/components/search-form/index.vue';
  import BaseVxeTable from '../edhr-application/components/base-vxe-table/index.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { t } = useI18n();

  const appInfoStore = useAppInfoStore();
  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  const [recordRegister, { openModal }] = useModal();

  const resultList = [
    { label: t('sys.success'), value: 'SUCCEED' },
    { label: t('sys.fail'), value: 'FAILURE' },
  ];

  const initSearchList = [
    {
      type: 'select',
      label: t('sys.message.pushType'),
      id: 'pushType',
      model: 'pushType',
      options: pushTypeList,
    },
    {
      type: 'dateRange2',
      label: t('sys.message.pushTime'),
      required: true,
      id: 'pushTime',
      model: 'pushTime',
      showTime: { format: 'HH:mm:ss' },
      format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      type: 'userSelect',
      label: t('sys.integration.receiveUser'),
      id: 'userId',
      model: 'userId',
      maxLength: 32,
    },
    {
      type: 'select',
      label: t('sys.message.pushResult'),
      id: 'result',
      model: 'result',
      options: resultList,
    },

    {
      type: 'input',
      label: t('sys.onlineForm.formIdent'),
      id: 'formSerialNo',
      model: 'formSerialNo',
      maxLength: 32,
    },
  ];

  const columnDefinitions = [
    {
      title: t('sys.message.messageInfo'),
      field: 'messageInfo',
      minWidth: 200,
      showOverflow: true,
    },
    {
      title: t('sys.message.pushType'),
      field: 'pushType',
      slots: { default: 'custom_render' },
      width: 120,
    },
    { title: t('sys.message.pushTime'), field: 'pushTime', width: 170 },
    { title: t('sys.integration.receiveUser'), field: 'userName', width: 120 },
    {
      title: t('sys.message.pushResult'),
      field: 'result',
      width: 120,
      slots: { default: 'custom_render' },
    },
    {
      title: t('sys.onlineForm.formIdent'),
      field: 'formSerialNo',
      minWidth: 170,
      showOverflow: true,
      formatter: ({ cellValue }) => {
        return cellValue ?? '--';
      },
    },
  ];

  const formState = reactive({
    tmplKey: undefined,
    tmplName: undefined,
    modelName: undefined,
    pushType: undefined,
    result: undefined,
    userName: undefined,
    pushTime: undefined,
  });

  const loading = ref<boolean>(false);

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<any>([]);

  const initPushTimeValue = () => {
    formState.pushTime = [
      dayjs().subtract(1, 'months').format('YYYY-MM-DD 00:00:00'),
      dayjs().format('YYYY-MM-DD 23:59:59'),
    ];
  };

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;
    const res = await getMessageRecordPageList({
      ...omit(formState, 'pushTime'),
      startTime: formState.pushTime?.[0],
      endTime: formState.pushTime?.[1],

      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });

    if (res && res.data) {
      pagination.current = res?.pageNo ?? 1;
      pagination.total = res?.totalCount ?? 0;
      tableData.value = res?.data ?? [];
    }
  };

  onMounted(() => {
    initPushTimeValue();
    getTableData(1);
  });

  const getPushTypeList = (val) => {
    let arr = val?.split(',') || [];
    arr = arr.map((item) => {
      return pushTypeObj[item];
    });
    return arr.join(' / ');
  };

  const handleRowEdit = async (record) => {
    // 请求接口获取当前多语言的数据
    let data = cloneDeep(record);
    data.pushTypeStr = getPushTypeList(record.pushType);
    openModal(true, data);
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };
</script>
