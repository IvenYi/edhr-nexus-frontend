<template>
  <index-layout>
    <BasicTable
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :columns="columns"
      :dataSource="tableData"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #headerTop>
        <a-button v-if="userActions.Insert" type="primary" @click="handleCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ t('sys.add') }}
        </a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'roles'">
          <a-tag class="role-tag__item" v-for="r in record.roles" :key="r.id">
            {{ r.name }}
          </a-tag>
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.edit'),
                onClick: () => handleEdit(record),
                ifShow: userActions.Update,
              },
              {
                label: t('sys.delete'),
                color: 'error',
                popConfirm: {
                  title: t('sys.sureToDelete'),
                  confirm: () => handleDelete(record),
                },
                ifShow: userActions.Delete,
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </BasicTable>
    <administrator-modal @register="register" @refresh="handleRefresh" />
  </index-layout>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import IndexLayout from './index-layout.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import AdministratorModal from './modals/administrator-modal.vue';
  // import { useGo } from '/@/hooks/web/usePage';
  import { useAdminApis } from '/@/views/permission/hooks/useModule';
  import type { ManagerBean } from '/@/apis/gct-platform/model';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { createMessage } = useMessage();
  const [register, { openModal }] = useModal();
  const { t } = useI18n();
  const { getManagerPageList, deleteUserRole } = useAdminApis();
  const { hasPermission } = usePermission();

  const tableData = ref<ManagerBean[]>([]);

  const userActions = computed(() => {
    return {
      Insert: hasPermission(BasicAction.Insert),
      Update: hasPermission(BasicAction.Update),
      Delete: hasPermission(BasicAction.Delete),
    };
  });

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const columns = [
    {
      title: t('sys.user'),
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: t('sys.role'),
      dataIndex: 'roles',
      key: 'roles',
      ellipsis: false,
    },
    {
      title: t('sys.notes'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('sys.updatePerson'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
    },
    {
      title: t('sys.updateTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
    },
    {
      fixed: 'right',
      width: 150,
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const handleCreate = () => {
    openModal(true, { edit: false });
  };
  const handleEdit = (record) => {
    openModal(true, {
      edit: true,
      record: {
        ...record,
        roleIds: record.roles.map((item) => item.id),
      },
    });
  };

  const getTableData = async () => {
    const res = await getManagerPageList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
    pagination.total = res!.totalCount;
    tableData.value = res!.data;
  };
  getTableData();

  const handleRefresh = () => {
    getTableData();
  };

  const handleDelete = async (record) => {
    await deleteUserRole({
      userId: record.userId,
    });
    createMessage.success(t('sys.operationSuccess'));
    getTableData();
  };
</script>

<style lang="less" scoped>
  .ant-tag.role-tag__item {
    margin: 2px;
  }
</style>
