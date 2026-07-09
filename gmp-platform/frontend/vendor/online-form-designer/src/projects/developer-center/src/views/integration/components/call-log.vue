<template>
  <div class="h-full flex flex-col call-log-wrapper">
    <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off" layout="inline">
      <div class="w-full">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item :label="t('sys.integration.interfaceIdent')" name="key">
              <a-input v-model:value="formState.key" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.integration.interfaceName')" name="name">
              <a-input v-model:value="formState.name" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.integration.callResult')" name="result">
              <a-select
                allow-clear
                v-model:value="formState.result"
                :placeholder="t('sys.chooseText')"
              >
                <a-select-option :value="item.key" v-for="item in resultOptions" :key="item.key">{{
                  t(item.label)
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.integration.callTime')" name="dataTime">
              <a-range-picker
                style="width: 100%"
                @change="handlechange"
                v-model:value="dataTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                :placeholder="[t('sys.startTime'), t('sys.endTime')]"
                :allowClear="false"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.integration.belongingEnv')" name="env">
              <a-select
                allow-clear
                v-model:value="formState.env"
                :placeholder="t('sys.chooseText')"
                @change="() => getTableData(1)"
              >
                <a-select-option :value="item.key" v-for="item in apiEnvOptions" :key="item.key">{{
                  t(item.i18n)
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.appDesigner.inputContent')" name="body">
              <a-input
                v-model:value="formState.body"
                :max-length="32"
                allow-clear
                :placeholder="t('sys.inputText')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.appDesigner.outContent')" name="response">
              <a-input
                v-model:value="formState.response"
                :max-length="32"
                allow-clear
                :placeholder="t('sys.inputText')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8" :offset="8" class="text-right">
            <a-button class="mr-10px" @click="handlereset">
              {{ t('sys.reset') }}
            </a-button>
            <a-button type="primary" @click="() => getTableData(1)">
              {{ t('sys.queryText') }}
            </a-button>
          </a-col>
        </a-row>
      </div>
    </a-form>

    <a-table
      class="flex-1 h-100px mt-16px"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      @change="handleTableChange"
      :loading="loading"
      size="middle"
      ref="tableContainerRef"
      :scroll="{
        y: scrollHeight,
      }"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.key === 'result'">
          <span :class="['log-tag', record.result == 1 ? 'tag-success' : 'tag-fail']">{{
            record.result == 1 ? t('sys.success') : t('sys.fail')
          }}</span>
        </template>
        <template v-if="column.key === 'env'">
          {{ record.env ? t('sys.integration.env.' + record.env) : '' }}
        </template>
        <template v-if="column.key === 'timeCost'">
          {{ record.timeCost + 'ms' }}
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.detail'),
                onClick: () => handleDetail(record),
              },
              {
                label: t('sys.export'),
                onClick: () => handleExport(record),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </a-table>

    <a-drawer
      width="800"
      :title="t('sys.detail')"
      placement="right"
      :visible="visible"
      :closable="false"
      @close="onClose"
      :bodyStyle="{ padding: '20px' }"
    >
      <template #extra>
        <!-- <download-outlined
          style="font-size: 16px; margin-left: 12px; color: rgba(0, 0, 0, 0.45)"
          @click.stop="onExport"
        /> -->
        <!-- <a-tooltip> -->
        <!-- <template #title>{{ t('sys.logDownloadTip') }}</template> -->
        <span :title="t('sys.logDownloadTip')" class="log-export-txt" @click.stop="onExport">{{
          t('sys.integration.exportLog')
        }}</span>
        <!-- </a-tooltip> -->
        <close-outlined
          style="margin-left: 12px; color: rgb(0 0 0 / 45%); font-size: 16px"
          @click.stop="onClose"
        />
      </template>
      <div v-if="markdownStr" class="code-panel drawer-wrap">
        <div class="title">{{ t('sys.integration.requestHead') + '（Headers）' }}</div>
        <a-table
          :columns="reqHeadColumns"
          :data-source="markdownStr.requestHeader"
          :pagination="false"
          :bordered="false"
        />
        <template v-if="markdownStr.requestBody?.length">
          <div class="title">{{ t('sys.integration.requestBody') + '（Params）' }}</div>
          <a-table
            :columns="reqBodyColumns"
            :data-source="markdownStr.requestBody"
            :pagination="false"
            :bordered="false"
          />
        </template>
        <template v-if="markdownStr.body">
          <div class="title">{{ t('sys.integration.reqBody') + '（Body）' }}</div>
          <div class="example">
            <pre>{{ markdownStr.body }}</pre>
          </div>
        </template>
        <template v-if="markdownStr.response">
          <div class="title">{{ t('sys.integration.responseResult') + '（Response）' }}</div>
          <div class="example">
            <pre>{{ markdownStr.response }}</pre>
          </div>
        </template>
      </div>
      <div v-else class="markdown-empty">
        <a-empty :image="simpleImage" />
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { envOptions } from './../enum';
  import { downloadByUrl, downloadByData } from '/@/utils/file/download';
  import { OpenapiGroupResponse } from '/@/apis/gct-platform/model/index';
  import {
    getInvokeLogPageList,
    getInvokeLogInfo,
    getInvokeLogExport,
  } from '/@/apis/gct-platform/ThirdPartyInvokeLogController';
  import { Empty } from 'ant-design-vue';
  import dayjs from 'dayjs';

  const formRef = ref<FormInstance>();
  const { t } = useI18n();
  const dataTime = ref<[string, string]>(['', '']);

  const formState = reactive({
    key: '', // 接口标识
    name: '', // 接口名称
    result: undefined, // 调用结果
    beginTime: '',
    endTime: '',
    env: undefined, // 环境
    body: undefined, // 请求体
    response: undefined, // 响应体
  });

  const tableContainerRef = ref();
  const { scrollHeight, calcScrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const resultOptions = [
    { key: 1, label: 'sys.success' },
    { key: 0, label: 'sys.fail' },
  ];

  const loading = ref<boolean>(false);
  const tableData = ref<OpenapiGroupResponse[]>([]);
  const apiEnvOptions = envOptions.filter((i) => i.key !== 'dev');
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const markdownStr = ref();
  const visible = ref<boolean>(false);
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  onMounted(async () => {
    const nowTime = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    const startTime = dayjs(nowTime)
      .subtract(7, 'day')
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    dataTime.value = [startTime, nowTime];
    handlechange(dataTime.value);
    await nextTick();
    getTableData();
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const params = Object.assign(formState, { pageNo, pageSize: pagination.pageSize! });
    try {
      const res = await getInvokeLogPageList(params).finally(() => {
        loading.value = false;
      });
      pagination.current = res?.pageNo;
      pagination.total = res?.totalCount;
      tableData.value = res?.data ?? [];
    } catch (e) {
      loading.value = false;
    }
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handlereset = () => {
    formRef.value?.resetFields();
    // formState.env = 'test';
    getTableData();
  };

  const handlechange = (val) => {
    console.log('handlechange', val);
    formState.beginTime = val?.[0] || '';
    formState.endTime = val?.[1] || '';
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.index'),
      dataIndex: 'index',
      key: 'index',
      width: 62,
    },
    {
      title: t('sys.integration.interfaceIdent'),
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
      width: 100,
    },
    {
      title: t('sys.integration.interfaceName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: t('sys.integration.clientIp'),
      dataIndex: 'clientIp',
      key: 'clientIp',
      ellipsis: true,
      width: 150,
    },
    {
      title: t('sys.integration.callTime'),
      dataIndex: 'invokeTime',
      key: 'invokeTime',
      ellipsis: true,
      width: 180,
    },
    {
      title: t('sys.integration.callResult'),
      dataIndex: 'result',
      key: 'result',
      ellipsis: true,
      width: 100,
    },
    {
      title: `${t('sys.integration.timeCost')} (ms)`,
      dataIndex: 'timeCost',
      key: 'timeCost',
      ellipsis: true,
      width: 130,
    },
    {
      title: t('sys.integration.belongingApp'),
      dataIndex: 'appName',
      key: 'appName',
      ellipsis: true,
    },
    {
      title: t('sys.integration.belongingEnv'),
      dataIndex: 'env',
      key: 'env',
      ellipsis: true,
      width: 110,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
    },
  ];

  const reqColumns: TableColumnsType = [
    {
      title: t('sys.model.basicInfo'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
    },
    {
      title: t('sys.integration.example'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  const reqHeadColumns: TableColumnsType = [
    {
      title: t('sys.pageDesigner.name'),
      dataIndex: 'left',
      key: 'left',
      ellipsis: true,
    },
    {
      title: t('sys.integration.paramValue'),
      dataIndex: 'middle',
      key: 'middle',
      ellipsis: true,
    },
    {
      title: t('sys.type'),
      dataIndex: 'right',
      key: 'right',
      ellipsis: true,
    },
  ];

  const reqBodyColumns: TableColumnsType = [
    {
      title: t('sys.pageDesigner.name'),
      dataIndex: 'left',
      key: 'left',
      ellipsis: true,
    },
    {
      title: t('sys.integration.paramValue'),
      dataIndex: 'middle',
      key: 'middle',
      ellipsis: true,
    },
    // {
    //   title: t('sys.pageDesigner.required'),
    //   dataIndex: 'required',
    //   key: 'required',
    //   ellipsis: true,
    // },
    // {
    //   title: t('sys.pageDesigner.remark'),
    //   dataIndex: 'description',
    //   key: 'description',
    //   ellipsis: true,
    // },
    {
      title: t('sys.type'),
      dataIndex: 'right',
      key: 'right',
      ellipsis: true,
    },
  ];

  const resBodyColumns: TableColumnsType = [
    {
      title: t('sys.pageDesigner.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.type'),
      dataIndex: 'type',
      key: 'type',
      ellipsis: true,
    },
    {
      title: t('sys.pageDesigner.remark'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  const onClose = () => {
    visible.value = false;
    markdownStr.value = null;
  };

  const onExport = () => {
    handleExport(markdownStr.value);
  };

  const handleDetail = async (record) => {
    const result =
      (await getInvokeLogInfo({
        id: record.id,
      })) || {};
    markdownStr.value = result;
    markdownStr.value.requestHeader = JSON.parse(result.headers || '[]');
    markdownStr.value.requestBody = JSON.parse(result.params || '[]');
    visible.value = true;
  };

  const handleExport = async (record) => {
    const fileData = await getInvokeLogExport(
      {
        // env: record.env, // 环境
        id: record.id,
      },
      {
        isTransformResponse: false,
        transferToConfig: {
          responseType: 'blob',
          responseEncoding: 'utf8',
        },
      },
    );
    if (fileData) {
      downloadByData(fileData, {
        filename: '.json',
        timestamp: true,
        mime: 'application/json',
      });
    }
  };

  defineExpose({
    calcScrollHeight,
  });
</script>

<style lang="less" scoped>
  .call-log-wrapper .ant-form .ant-form-item {
    margin-right: 0;
  }

  .log-tag {
    padding: 2px 6px;
    border-radius: 4px;
    background: #d6e1fb;
    color: #3168ec;

    &.tag-success {
      background: #def8e2;
      color: #309c41;
    }

    &.tag-fail {
      background: #fef5f5;
      color: #f54547;
    }
  }

  .markdown-empty {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    flex: 1;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .code-panel {
    overflow: auto;

    &.drawer-wrap {
      .title {
        position: relative;
        margin-bottom: 12px;
        padding-left: 10px;
        color: #212528;
        font-size: 16px;
        font-weight: 500;
        line-height: 26px;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          width: 2px;
          height: 16px;
          transform: translate(0, -50%);
          background-color: var(--ant-primary-color);
        }
      }

      .desc {
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e0e3ea;
        color: #797a7d;
      }

      .example {
        margin-bottom: 20px;
        padding-bottom: 6px;
        border-bottom: 1px solid #e0e3ea;

        pre {
          padding: 20px;
          border-radius: 4px;
          background: #f7f8fa;
        }
      }

      :deep(.ant-table-wrapper) {
        margin-bottom: 16px;

        .ant-table {
          .ant-table-container {
            border-bottom: none;
          }
        }
      }
    }
  }
</style>
<style lang="less">
  .ant-drawer-header .ant-drawer-extra {
    .log-export-txt {
      color: var(--ant-primary-color);
      cursor: pointer;
    }
  }
</style>
