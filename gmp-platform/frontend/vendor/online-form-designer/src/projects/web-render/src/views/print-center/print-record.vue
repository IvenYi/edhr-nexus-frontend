<template>
  <basic-page-render>
    <div class="h-full flex flex-col p-16px">
      <a-form
        class="flex-none"
        ref="formRef"
        :model="searchData"
        autocomplete="off"
        layout="inline"
      >
        <div class="w-full">
          <a-row :gutter="[20, 12]">
            <a-col :span="8">
              <a-form-item :label="t('sys.webRender.labelName')" name="tagName">
                <a-input v-model:value="searchData.tagName" :placeholder="t('sys.inputText')" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('sys.webRender.printKey')" name="key">
                <a-input v-model:value="searchData.key" :placeholder="t('sys.inputText')" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('sys.webRender.printName')" name="printName">
                <a-input
                  v-model:value="searchData.printName"
                  class="w100%"
                  :placeholder="t('sys.inputText')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :label="t('sys.webRender.printTimeRange')"
                name="rangeTime"
                :rules="[
                  {
                    required: true,
                    message: t('sys.chooseTextTip', { name: t('sys.webRender.printTimeRange') }),
                  },
                ]"
              >
                <a-range-picker
                  v-model:value="searchData.rangeTime"
                  :show-time="{ format: 'HH:mm:ss' }"
                  format="YYYY-MM-DD HH:mm:ss"
                  valueFormat="YYYY-MM-DD HH:mm:ss"
                  :placeholder="[t('sys.startTime'), t('sys.endTime')]"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8" :offset="8" class="text-right">
              <a-button class="mr-12px" @click="() => formRef?.resetFields()">
                {{ t('sys.reset') }}
              </a-button>
              <a-button type="primary" @click="onSearch">
                {{ t('sys.queryText') }}
              </a-button>
            </a-col>
          </a-row>
        </div>
      </a-form>
      <a-table
        class="h-100px mt-10px flex-1 mt-14px"
        row-key="id"
        :columns="columns"
        :data-source="tableData"
        bordered
        :pagination="pagination"
        size="middle"
        ref="tableContainerRef"
        :loading="loading"
        :scroll="{
          y: scrollHeight,
        }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (pagination.current! - 1) * pagination.pageSize! + (index + 1) }}
          </template>
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.download'),
                  color: 'success',
                  onClick: () => handleDownload(record),
                  ifShow: getShouldShow(BasicAction.Download),
                },
                {
                  label: t('sys.webRender.reprint'),
                  onClick: () => handleReprint(record),
                  ifShow: getShouldShow(CustomAction.Reprint),
                },
              ]"
            />
          </template>
        </template>
      </a-table>
    </div>

    <Reprint ref="reprintRef" />
  </basic-page-render>
</template>
<script lang="ts" setup name="print-record">
  import { reactive, ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { TableActionAuto } from '/@/components/Table';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { downloadByData, downloadByBase64 } from '/@/utils/file/download';
  import { PrintTypeEnum } from '/@/projects/developer-center/src/views/integration/enum';
  import { message } from 'ant-design-vue';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import Reprint from './component/reprint.vue';
  import { BasicAction, CustomAction } from '/@/enums/authActionEnum';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import {
    postPrintLogPageList,
    postPrintLogPatchwork,
  } from '/@/apis/gct-apaas/PrintLogController';

  const { t } = useI18n();
  const today = dayjs();

  const tableContainerRef = ref();
  const formRef = ref();
  const reprintRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const searchData = ref<any>({
    printName: '',
    printKey: '',
    resourceName: '',
    rangeTime: [
      dayjs(today.subtract(1, 'month'), 'YYYY-MM-DD HH:mm:ss'),
      dayjs(today, 'YYYY-MM-DD HH:mm:ss'),
    ],
  });
  const loading = ref(false);
  const tableData = ref<any[]>([]);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const columns: TableColumnsType = [
    {
      title: t('sys.webRender.taskLog.grid.index'),
      dataIndex: 'index',
      key: 'index',
      width: 72,
    },
    {
      title: t('sys.webRender.printName'),
      dataIndex: 'printName',
      key: 'printName',
      ellipsis: true,
      width: 240,
    },
    {
      title: t('sys.webRender.printKey'),
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
    },
    {
      title: t('sys.webRender.labelName'),
      dataIndex: 'tagName',
      key: 'tagName',
      ellipsis: true,
    },
    {
      title: t('sys.webRender.printTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      ellipsis: true,
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.webRender.printQty'),
      dataIndex: 'printNumber',
      key: 'printNumber',
      ellipsis: true,
    },
    {
      title: t('sys.webRender.printContent'),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
    },
  ];

  const userActions = computed(() => {
    return {
      [BasicAction.Download]: getPermissionByKey('PrintCenter', BasicAction.Download),
      [CustomAction.Reprint]: getPermissionByKey('PrintCenter', CustomAction.Reprint),
    };
  });

  const getShouldShow = (action) => {
    if (userActions.value[action]) {
      return true;
    }
    return false;
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await postPrintLogPageList({
      key: searchData.value.key ?? undefined,
      printName: searchData.value.printName ?? undefined,
      resourceName: searchData.value.resourceName ?? undefined,
      startTime: dayjs(searchData.value.rangeTime[0]).format('YYYY-MM-DD HH:mm:ss') || undefined,
      endTime: dayjs(searchData.value.rangeTime[1]).format('YYYY-MM-DD HH:mm:ss') || undefined,
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
  };
  getTableData();

  const onSearch = async () => {
    await formRef.value?.validate();
    getTableData(1);
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  // 下载
  const handleDownload = (record) => {
    const isText = [PrintTypeEnum.Zpl, PrintTypeEnum.String, PrintTypeEnum.Btw].includes(
      record.printType as PrintTypeEnum,
    );
    if (isText) {
      downloadByData(record.printContent ?? '', { filename: `${Date.now()}.txt` });
      message.success(t('sys.downloadSuccess'));
      return;
    }
    if ((record.printType as PrintTypeEnum) == PrintTypeEnum.Png) {
      downloadByBase64(`data:image/png;base64,${record.printContent}` ?? '', `${Date.now()}.png`);
      message.success(t('sys.downloadSuccess'));
    }
  };

  // 补打印
  const handleReprint = async (record) => {
    const data = await reprintRef.value?.open();
    reprintFunc({
      printContent: record.printContent,
      printType: record.printType,
      tagName: record.tagName,
      ...data,
    });
  };

  const reprintFunc = async (data) => {
    await postPrintLogPatchwork(data);
    message.success(t('sys.success'));
  };
</script>
<style lang="less" scoped>
  :deep(.ant-form.ant-form-inline .ant-form-item) {
    margin: 0;
  }
</style>
