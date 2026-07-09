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
      <template #beforeTable>
        <a-form ref="formRef" :model="formState" autocomplete="off">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item name="roleName" :label="t('sys.nameOfSth', { sth: t('sys.role') })">
                <a-input v-model:value="formState.roleName" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="enabled" :label="t('sys.status')">
                <a-select ref="select" v-model:value="formState.enabled" allow-clear>
                  <a-select-option :value="1">{{ t('sys.enabled') }} </a-select-option>
                  <a-select-option :value="0">{{ t('sys.disabled') }} </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8" style="text-align: right">
              <a-button class="mr-10px" type="primary" @click="handleSearch">
                <template #icon>
                  <search-outlined />
                </template>
                {{ t('sys.queryText') }}
              </a-button>
              <a-button @click="() => formRef?.resetFields()">
                <template #icon>
                  <undo-outlined />
                </template>
                {{ t('sys.reset') }}
              </a-button>
            </a-col>
          </a-row>
        </a-form>
      </template>

      <template #headerTop>
        <a-button v-if="userActions.Insert" type="primary" @click="handleCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ t('sys.new') }}
        </a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'enabled'">
          {{ record.enabled ? t('sys.enabled') : t('sys.disabled') }}
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            v-if="record.sysBuiltin !== 1"
            :actions="[
              {
                label: t('sys.edit'),
                onClick: () => handleEdit(record),
                ifShow: userActions.Update && record.enabled,
              },
              {
                label: t('sys.menu.rolePermissionSetting'),
                onClick: () => handleRoleSetting(record),
                ifShow: userActions.PermissionSetting && record.enabled,
              },
              {
                label: t('sys.enable'),
                ifShow: record.enabled === 0 && userActions.Update,
                popConfirm: {
                  title: t('sys.sureToEnable'),
                  confirm: () => handleStatusChange(record, 1),
                },
              },
              {
                label: t('sys.disable'),
                color: 'error',
                ifShow: record.enabled === 1 && userActions.Update,
                popConfirm: {
                  title: t('sys.sureToDisable'),
                  confirm: () => handleStatusChange(record, 0),
                },
              },
              {
                label: t('sys.delete'),
                color: 'error',
                placement: 'topRight',
                popConfirm: {
                  title: t('sys.sureToDo'),
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
    <role-modal @register="register" @refresh="handleRefresh" />
    <a-drawer
      v-model:visible="drawerVisible"
      width="1000"
      placement="right"
      :closable="false"
      title="权限配置"
      @close="onClose"
      :body-style="{
        padding: 0,
        color: '#212528',
      }"
    >
      <template #extra>
        <close-outlined
          style="font-size: 16px; margin-left: 12px; color: rgba(0, 0, 0, 0.45)"
          class="api-icon"
          @click.stop="onClose"
        />
      </template>
      <role-setting :roleKey="roleKey" />
    </a-drawer>
  </index-layout>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import IndexLayout from './index-layout.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import RoleModal from './modals/role-modal.vue';
  import RoleSetting from './role-setting.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRoleApis } from '/@/views/permission/hooks/useModule';
  import type { RoleResponse } from '/@/apis/gct-platform/model';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicAction, CustomAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { createMessage } = useMessage();
  const [register, { openModal }] = useModal();
  const { t } = useI18n();
  const go = useGo();
  const { deleteRole, getRolePageList, putRoleByIdByEnabled } = useRoleApis();
  const { hasPermission } = usePermission();

  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const formState = reactive({
    roleName: undefined,
    enabled: undefined,
  });

  const userActions = computed(() => {
    return {
      Insert: hasPermission(BasicAction.Insert),
      Update: hasPermission(BasicAction.Update),
      Delete: hasPermission(BasicAction.Delete),
      PermissionSetting: hasPermission(CustomAction.PermissionSetting),
    };
  });

  const tableData = ref<RoleResponse[]>([]);

  const drawerVisible = ref<boolean>(false);
  const roleKey = ref();

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const columns = [
    {
      title: t('sys.nameOfSth', { sth: t('sys.role') }),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('sys.status'),
      dataIndex: 'enabled',
      key: 'enabled',
    },
    {
      title: t('sys.type'),
      dataIndex: 'sysBuiltin',
      key: 'sysBuiltin',
      customRender: ({ text }) => {
        return text ? t('sys.builtin') : t('sys.customize');
      },
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
      minWidth: 170,
      width: 170,
    },
    {
      fixed: 'right',
      width: 250,
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

  const getTableData = async () => {
    const res = await getRolePageList({
      ...formState,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
    pagination.total = res!.totalCount;
    tableData.value = res!.data;
  };
  getTableData();

  const handleCreate = () => {
    openModal(true, { edit: false });
  };

  const handleEdit = (record) => {
    openModal(true, {
      edit: true,
      record,
    });
  };

  const handleSearch = () => {
    getTableData();
  };

  const handleRefresh = () => {
    getTableData();
  };

  const handleRoleSetting = (record) => {
    // go(`/org/permission/role-setting/${record.id}`);
    roleKey.value = record.id;
    drawerVisible.value = true;
  };

  const onClose = () => {
    drawerVisible.value = false;
  };

  /**
   * 状态变更
   */
  const handleStatusChange = async (record, enabled) => {
    await putRoleByIdByEnabled({
      id: record.id,
      enabled,
    });
    createMessage.success(t('sys.operationSuccess'));
    getTableData();
  };

  const handleDelete = async (record) => {
    await deleteRole({
      ids: record.id,
    });
    createMessage.success(t('sys.operationSuccess'));
    getTableData();
  };
</script>

<style></style>
