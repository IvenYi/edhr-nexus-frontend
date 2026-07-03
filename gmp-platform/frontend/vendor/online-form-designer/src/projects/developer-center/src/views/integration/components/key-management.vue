<template>
  <div class="h-full flex flex-col">
    <div class="btn-box">
      <a-button type="primary" @click="onClickAdd">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.new') }}
      </a-button>
    </div>
    <a-table
      class="flex-1 h-100px mt-16px"
      row-key="id"
      ref="tableContainerRef"
      size="middle"
      bordered
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
      :scroll="{
        y: scrollHeight,
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'key'">
          <copy-module-key :moduleKey="record.key" />
        </template>
        <template v-if="column.key === 'secret'">
          <copy-module-key :moduleKey="record.secret" />
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.integration.authorize'),
                onClick: () => handleAuthorize(record),
              },
              {
                label: t('sys.delete'),
                color: 'error',
                popConfirm: {
                  title: t('sys.sureToDo'),
                  confirm: () => handleDelete(record.id),
                },
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </a-table>
  </div>
  <authorize-modal @register="register" @ok="handleOk" />
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, createVNode } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { message, Modal } from 'ant-design-vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { useModal } from '/@/components/Modal';
  import AuthorizeModal from './authorize-modal.vue';
  import {
    getOpenapiKeyGrantPageList,
    postOpenapiKeyGrant,
    deleteOpenapiKeyGrant,
  } from '/@/apis/gct-platform/OpenapiKeyGrantController';
  import { OpenapiKeyGrantResponse } from '/@/apis/gct-platform/model/index';

  const { t } = useI18n();
  const tableContainerRef = ref();
  const { scrollHeight, calcScrollHeight } = useAntTableScrollHeight(tableContainerRef);
  const [register, { openModal }] = useModal();

  const loading = ref<boolean>(false);
  const tableData = ref<OpenapiKeyGrantResponse[]>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getOpenapiKeyGrantPageList({
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
  };

  onMounted(() => {
    getTableData();
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.integration.cipher') + 'KEY',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: t('sys.integration.cipher') + t('sys.appDesigner.value'),
      dataIndex: 'secret',
      key: 'secret',
    },
    {
      title: t('sys.integration.authorizeUser'),
      dataIndex: 'accessUserName',
      key: 'accessUserName',
      width: 150,
      ellipsis: true,
    },
    {
      title: t('sys.createUser'),
      dataIndex: 'createUserName',
      key: 'createUserName',
      width: 150,
      ellipsis: true,
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      ellipsis: true,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
    },
  ];

  const handleAuthorize = (record) => {
    openModal(true, {
      id: record.id,
    });
  };

  const handleDelete = async (id) => {
    await deleteOpenapiKeyGrant({
      ids: id,
    });
    message.success(t('sys.operationSuccess'));
    getTableData();
  };

  const confirm = async () => {
    await postOpenapiKeyGrant({});
    message.success(t('sys.operationSuccess'));
    getTableData();
  };

  const handleOk = (data: any) => {
    message.success(t('sys.operationSuccess'));
    getTableData();
    console.log(data);
  };

  const onClickAdd = () => {
    Modal.confirm({
      title: t('sys.integration.newCipherTip'),
      icon: () =>
        createVNode(
          'span',
          {
            class: 'anticon anticon-exclamation-circle',
          },
          [
            createVNode('i', {
              class: 'iconfont icon-jinggao1',
              style: { position: 'relative', top: '3px', color: '#FF8C4B' },
            }),
          ],
        ),
      okText: t('sys.okText'),
      cancelText: t('sys.cancel'),
      async onOk() {
        await confirm();
      },
    });
  };

  defineExpose({
    calcScrollHeight,
  });
</script>

<style lang="less" scope>
  .btn-box {
    text-align: right;
  }
</style>
