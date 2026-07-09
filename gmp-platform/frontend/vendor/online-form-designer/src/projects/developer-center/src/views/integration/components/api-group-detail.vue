<template>
  <div class="h-full flex flex-col">
    <div class="breadcrumb">
      <span class="api-group" @click="emit('goBack')"
        >{{ t('sys.integration.apiGrouping') }} /
      </span>
      <span class="app-name">{{ props.appInfo.name }}</span>
    </div>
    <div class="header">
      <div class="header-title">{{ t('sys.model.basicInformation') }}</div>
    </div>
    <div class="description">
      <a-descriptions class="item">
        <a-descriptions-item :label="t('sys.developer.appCenter.appName')">{{
          detail.name || props.appInfo.name
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.developer.appCenter.appIdent')">
          <copy-module-key :moduleKey="detail.appId" />
        </a-descriptions-item>
        <a-descriptions-item :label="t('sys.integration.protocol')">HTTP</a-descriptions-item>
        <a-descriptions-item :label="t('sys.integration.belongingEnv')">
          {{ t('sys.integration.env.' + detail.env) }}
        </a-descriptions-item>
        <a-descriptions-item
          :span="2"
          :label="t('sys.developer.appCenter.appDesc')"
          :contentStyle="{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inlineBlock',
          }"
        >
          {{ detail.description }}</a-descriptions-item
        >
      </a-descriptions>
    </div>

    <div class="header">
      <div class="header-title">{{ t('sys.menu.apiManagement') }}</div>
    </div>
    <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off" layout="inline">
      <div class="w-full">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item :label="t('sys.model.refModel')" name="modelKey">
              <a-select
                v-model:value="formState.modelKey"
                allowClear
                :placeholder="t('sys.pageDesigner.selectModelTip')"
                @change="() => getTableData(1)"
              >
                <a-select-opt-group
                  v-for="key in Object.keys(modelOptions)"
                  :key="key"
                  :label="t(`sys.model.${key}`)"
                >
                  <a-select-option
                    :value="item.modelKey"
                    v-for="item in modelOptions[key]"
                    :key="item.id"
                    >{{ item.modelName }}</a-select-option
                  >
                </a-select-opt-group>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item :label="t('sys.integration.interfaceIdent')" name="key">
              <a-input v-model:value="formState.key" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item :label="t('sys.integration.interfaceName')" name="name">
              <a-input v-model:value="formState.name" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="6" class="text-right">
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
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'env'">
          {{ t('sys.integration.env.' + record.env) }}
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.viewDetails'),
                onClick: () => handleDetail(record),
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
        <close-outlined
          style="font-size: 16px; margin-left: 12px; color: rgba(0, 0, 0, 0.45)"
          class="api-icon"
          @click.stop="onClose"
        />
      </template>
      <div v-if="markdownStr" class="code-panel drawer-wrap">
        <!-- <div v-html="markdownContent" v-highlight></div> -->
        <div class="title">{{ markdownStr.name }}</div>
        <p class="desc">{{ markdownStr.description }}</p>
        <div class="title">{{ t('sys.integration.request') }}</div>
        <a-table
          :columns="reqColumns"
          :data-source="markdownStr.requestBase"
          :pagination="false"
          :bordered="false"
        />
        <div class="title">{{ t('sys.integration.requestHead') }}</div>
        <a-table
          :columns="reqHeadColumns"
          :data-source="markdownStr.requestHeader"
          :pagination="false"
          :bordered="false"
        />
        <div class="title">{{ t('sys.integration.requestBody') }}</div>
        <a-table
          :columns="reqBodyColumns"
          :data-source="markdownStr.requestBody"
          :pagination="false"
          :bordered="false"
        />
        <template v-if="markdownStr.requestBodyExample">
          <div class="title">{{ t('sys.integration.requestBodyExample') }}</div>
          <div class="example">
            <pre>{{ markdownStr.requestBodyExample }}</pre>
          </div>
        </template>
        <div class="title">{{ t('sys.integration.responseBody') }}</div>
        <a-table
          :columns="resBodyColumns"
          :data-source="markdownStr.responseBody"
          :pagination="false"
          :bordered="false"
        />
        <template v-if="markdownStr.responseBodyExample">
          <div class="title">{{ t('sys.integration.responseBodyExample') }}</div>
          <div class="example">
            <pre>{{ markdownStr.responseBodyExample }}</pre>
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
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { Empty } from 'ant-design-vue';
  import type { OpenapiGroupResponse, OpenapiResponse } from '/@/apis/gct-platform/model/index';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  // import { marked } from 'marked';
  import {
    getOpenapiGroupInfo,
    getOpenapiGroupInfoAssociationModel,
    getOpenapiGroupInfoPageList,
    getOpenapiGroupInfoOpenapiInfo,
  } from '/@/apis/gct-platform/OpenapiGroupController';

  const formRef = ref<FormInstance>();
  const { t } = useI18n();
  const emit = defineEmits(['goBack']);
  const props = defineProps({
    appInfo: {
      type: Object,
      required: true,
    },
  });

  const formState = reactive({
    appTag: props.appInfo.appTag,
    env: 'test', // 环境
    key: undefined, // 接口标识
    modelKey: undefined, // 关联模型
    name: undefined, // 接口名称
  });

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  const tableContainerRef = ref();
  const { scrollHeight, calcScrollHeight } = useAntTableScrollHeight(tableContainerRef);
  // const markdownContent = ref();
  const markdownStr = ref();

  const visible = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const detail = ref<OpenapiGroupResponse>({});
  const tableData = ref<OpenapiResponse[]>([]);
  const modelOptions = ref<any>({});
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  onMounted(() => {
    getDetail();
  });

  const getDetail = async () => {
    const res = await getOpenapiGroupInfo({ id: props.appInfo.id });
    detail.value = res!;
    formState.env = detail.value.env || 'test';
    getModelList(detail.value.env);
    getTableData();
  };

  const getModelList = async (env) => {
    const params = { env, appTag: props.appInfo.appTag, name: '' };
    const res = (await getOpenapiGroupInfoAssociationModel(params)) || {};
    modelOptions.value = res;
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getOpenapiGroupInfoPageList({
      ...formState,
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handlereset = () => {
    formRef.value?.resetFields();
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.integration.interfaceIdent'),
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
    },
    {
      title: t('sys.integration.interfaceName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.integration.interfaceDesc'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('sys.integration.request') + 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: t('sys.model.refModel'),
      dataIndex: 'modelName',
      key: 'modelName',
      ellipsis: true,
    },
    {
      title: t('sys.model.refModel') + 'KEY',
      dataIndex: 'modelKey',
      key: 'modelKey',
      ellipsis: true,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
      ellipsis: true,
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      ellipsis: true,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
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
      title: t('sys.pageDesigner.required'),
      dataIndex: 'required',
      key: 'required',
      ellipsis: true,
    },
    {
      title: t('sys.pageDesigner.remark'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('sys.integration.requestType'),
      dataIndex: 'paramType',
      key: 'paramType',
      ellipsis: true,
    },
  ];

  const reqBodyColumns: TableColumnsType = [
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
      title: t('sys.pageDesigner.required'),
      dataIndex: 'required',
      key: 'required',
      ellipsis: true,
    },
    {
      title: t('sys.pageDesigner.remark'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('sys.integration.requestType'),
      dataIndex: 'paramType',
      key: 'paramType',
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
    // markdownContent.value = null;
  };

  const handleDetail = async (record) => {
    const result = await getOpenapiGroupInfoOpenapiInfo({
      appTag: props.appInfo.appTag,
      env: detail.value.env,
      id: record.id,
    });
    markdownStr.value = result;
    // markdownContent.value = marked(record.content || usage);
    visible.value = true;
  };

  defineExpose({
    calcScrollHeight,
  });
</script>

<style lang="less" scoped>
  .breadcrumb {
    margin-bottom: 20px;
    line-height: 26px;
    .api-group {
      color: #c3c3c3;
      cursor: pointer;
      &:hover {
        color: var(--ant-primary-color);
      }
    }
    .app-name {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .header {
    position: relative;
    padding-left: 10px;
    margin-bottom: 12px;
    line-height: 28px;
    &::before {
      position: absolute;
      content: '';
      left: 0;
      top: 50%;
      width: 2px;
      height: 16px;
      transform: translate(0, -50%);
      background-color: var(--ant-primary-color);
    }
    .header-title {
      font-size: 16px;
    }
  }

  .description {
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #e0e3ea;
    .item {
      padding: 20px 20px 0;
      background-color: #f7f8fa;
      border-radius: 4px;
    }
  }

  :deep(.ant-descriptions-row) {
    .ant-descriptions-item {
      padding-bottom: 20px;
      &:last-child {
        padding-bottom: 0;
      }
      .ant-descriptions-item-container {
        .ant-descriptions-item-label {
          color: #797a7d;
        }
      }
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
    // height: calc(100% - 60px);
    overflow: auto;

    &.drawer-wrap {
      .title {
        position: relative;
        font-weight: 500;
        font-size: 16px;
        color: #212528;
        line-height: 26px;
        padding-left: 10px;
        margin-bottom: 12px;
        &::before {
          position: absolute;
          left: 0;
          top: 50%;
          width: 2px;
          height: 16px;
          content: '';
          transform: translate(0, -50%);
          background-color: var(--ant-primary-color);
        }
      }
      .desc {
        color: #797a7d;
        padding-bottom: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid #e0e3ea;
      }
      .example {
        padding-bottom: 6px;
        margin-bottom: 20px;
        border-bottom: 1px solid #e0e3ea;
        pre {
          padding: 20px;
          background: #f7f8fa;
          border-radius: 4px 4px 4px 4px;
        }
      }
      :deep(.ant-table-wrapper) {
        margin-bottom: 40px;
        .ant-table {
          .ant-table-container {
            border-bottom: none;
          }
        }
      }
    }
  }
</style>
