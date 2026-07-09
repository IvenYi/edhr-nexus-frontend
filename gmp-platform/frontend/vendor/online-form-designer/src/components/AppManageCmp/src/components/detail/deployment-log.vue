<template>
  <div class="h-full flex flex-col deployment-log-wrap">
    <div class="flex flex-none pl-16px pr-16px pb-12px pt-12px" style="align-items: center">
      <div
        :class="{
          'change-app-env-item': true,
          'change-app-env-item-active': formState.appEnv === '',
        }"
        @click="changeAppEnv('')"
      >
        {{ t('sys.all') }}
      </div>
      <a-divider type="vertical" />
      <div
        :class="{
          'change-app-env-item': true,
          'change-app-env-item-active': formState.appEnv === EnvEnum.Prod,
        }"
        @click="changeAppEnv(EnvEnum.Prod)"
      >
        {{ t('sys.app.env.prod') }}
      </div>
      <a-divider type="vertical" />
      <div
        :class="{
          'change-app-env-item': true,
          'change-app-env-item-active': formState.appEnv === EnvEnum.Test,
        }"
        @click="changeAppEnv(EnvEnum.Test)"
      >
        {{ t('sys.app.env.test') }}
      </div>
    </div>
    <a-table
      class="h-100px flex-1"
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
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a @click.prevent="handleDetail(record)">{{ t('sys.detail') }}</a>
        </template>
      </template>
    </a-table>
    <publish-detail-modal @register="register" />
  </div>
</template>
<script setup lang="ts" name="deployment-log">
  import { ref, reactive, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { AppDetailTabEnum, EnvEnum, SourceTypeEnum } from '../../constant/interface';
  import type { PublishLogResponse, AppResponse } from '/@/apis/gct-platform/model';
  import {
    getAppPublishLogPageListByAppId,
    getAppPublishLogInfoByAppId,
  } from '/@/apis/gct-platform/AppController';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { useModal } from '/@/components/Modal';
  import PublishDetailModal from '/@app-designer/views/app-deployment/modals/publish-detail-modal.vue';

  interface Props {
    /** 应用id */
    pid?: string;
    tenantId: string;
    tabActiveKey: AppDetailTabEnum;
    detail: AppResponse;
  }

  const props = defineProps<Props>();

  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const formState: {
    appEnv: string;
  } = reactive({
    appEnv: '',
  });

  const loading = ref<boolean>(false);
  const tableData = ref<Array<PublishLogResponse>>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const isImport = computed(() => {
    return props.detail.sourceType === SourceTypeEnum.IMPORT;
  });

  const columns: TableColumnsType = [
    {
      title: isImport.value ? t('sys.app.branch.index') : t('sys.app.version.index'),
      dataIndex: 'appVersion',
      customRender: ({ text, record }) => {
        return isImport.value ? record.seq : text;
      },
    },
    {
      title: t('部署环境'),
      dataIndex: 'env',
      customRender: ({ text }) => {
        return t('sys.app.env.' + text);
      },
    },
    {
      title: t('提交标识'),
      dataIndex: 'commitTag',
      ellipsis: true,
    },
    {
      title: t('发行标识'),
      dataIndex: 'releaseTag',
      ellipsis: true,
    },
    {
      title: t('sys.status'),
      dataIndex: 'state',
      customRender: ({ text }) => {
        return t('sys.app.publish.' + text);
      },
    },
    {
      title: t('发布内容'),
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: t('sys.publishBy'),
      dataIndex: 'createUserName',
      width: 120,
      ellipsis: true,
    },
    {
      title: t('sys.publishTime'),
      dataIndex: 'createTime',
      width: 170,
    },
    {
      align: 'center',
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getAppPublishLogPageListByAppId(
      { appId: props.pid! },
      {
        ...formState,
        pageNo,
        pageSize: pagination.pageSize,
      },
    ).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res!.totalCount;
    tableData.value = res!.data ?? [];
  };

  const changeAppEnv = (env) => {
    formState.appEnv = env;
    getTableData(1);
  };

  getTableData();
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleDetail = async (record: PublishLogResponse) => {
    const res = await getAppPublishLogInfoByAppId(
      {
        appId: props.pid!,
      },
      {
        branchId: record.branchId!,
        publishId: record.id!,
      },
    );
    openModal(true, {
      env: record.env,
      response: res,
    });
  };
</script>

<style lang="less" scoped>
  :deep(.ant-table + .ant-table-pagination.ant-pagination) {
    margin-bottom: 0;
  }

  .deployment-log-wrap {
    :deep(.ant-table-container) {
      border-left: none;
      border-right: none;
      border-bottom: none;
    }

    .change-app-env-item {
      font-weight: 400;
      font-size: 14px;
      color: #797a7d;
      padding: 0 20px;
      cursor: pointer;

      &-active {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
