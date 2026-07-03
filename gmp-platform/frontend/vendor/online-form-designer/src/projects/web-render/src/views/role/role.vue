<template>
  <basic-page-render>
    <div class="p-16px flex flex-col h-full">
      <search-form
        :formData="formState"
        :initData="initSearchList"
        :transparent="!inEDHRApp"
        :maxLength="inEDHRApp ? 2 : initSearchList.length"
        @on-query="() => getTableData(1)"
      />

      <div class="text-right mb16px">
        <a-button v-if="roleUsePerms.Insert" type="primary" @click="handleCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ t('sys.new') }}
        </a-button>
      </div>

      <base-vxe-table
        class="h-100%"
        :tableColumns="columnDefinitions"
        :data-source="tableData"
        :loading="loading"
        showPagination
        :action="{ width: 300 }"
        v-model:pagination="pagination"
        @request-table-data="handleTableChange"
      >
        <template #custom_item="{ column: { field }, record }">
          <span v-if="field === 'enabled'">
            {{ record[field] ? t('sys.enabled') : t('sys.disabled') }}
          </span>
          <span v-else-if="field === 'type'">{{
            record[field] === 'BUILTIN' ? t('sys.builtin') : t('sys.customize')
          }}</span>
        </template>

        <template #operate="{ row: record }">
          <table-action-auto
            v-if="record.sysBuiltin !== 1"
            :actions="[
              {
                label: t('sys.edit'),
                onClick: () => handleEdit(record),
                ifShow: getShouldShow(record.type, BasicAction.Update) && record.enabled === 1,
              },
              {
                label: t('sys.menu.rolePermissionSetting'),
                onClick: () => handleRoleSetting(record),
                ifShow: getShouldShow(record.type, 'Perm') && record.enabled === 1,
              },
              {
                label: t('sys.enable'),
                ifShow: record.enabled === 0 && getShouldShow(record.type, 'EnableDisable'),
                popConfirm: {
                  title: t('sys.sureToEnable'),
                  confirm: () => handleStatusChange(record, 1),
                },
              },
              {
                label: t('sys.disable'),
                color: 'error',
                ifShow: record.enabled === 1 && getShouldShow(record.type, 'EnableDisable'),
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
                ifShow: getShouldShow(record.type, BasicAction.Delete),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </base-vxe-table>

      <role-modal @register="register" @refresh="handleRefresh" />
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { onMounted, ref, reactive, computed } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { TableActionAuto } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import RoleModal from './modals/role-modal.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import type { RoleResponse } from '/@/apis/gct-platform/model';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    deleteRole,
    getRolePageList,
    putRoleByIdByEnabled,
  } from '/@/apis/gct-apaas/RoleController';
  import { getEnv } from '/@/utils';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import PermissionSettingComponent from './permission-setting.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import SearchForm from '../edhr-application/components/search-form/index.vue';
  import BaseVxeTable from '../edhr-application/components/base-vxe-table/index.vue';
  import { usePagePermissions } from '../edhr-application/hooks/usePagePermissions';

  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: t('sys.nameOfSth', { sth: t('sys.role') }),
      id: 'roleName',
      model: 'roleName',
      maxLength: 32,
    },
    {
      type: 'select',
      label: t('sys.status'),
      id: 'enabled',
      model: 'enabled',
      options: [
        { label: t('sys.enabled'), value: 1 },
        { label: t('sys.disabled'), value: 0 },
      ],
    },
  ];

  const columnDefinitions = [
    { title: t('sys.nameOfSth', { sth: t('sys.role') }), field: 'name', minWidth: 300 },
    {
      title: t('sys.status'),
      field: 'enabled',
      slots: { default: 'custom_render' },
    },
    {
      title: t('sys.type'),
      field: 'type',
      minWidth: 140,
      slots: { default: 'custom_render' },
    },

    { title: t('sys.notes'), field: 'description', minWidth: 250 },
    { title: t('sys.updatePerson'), field: 'modifyUserName' },
    { title: t('sys.updateTime'), field: 'modifyTime', minWidth: 170 },
  ];

  const appInfoStore = useAppInfoStore();
  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  const { createMessage } = useMessage();
  const [register, { openModal }] = useModal();

  const go = useGo();
  const roleUsePerms = computed(() => {
    if (inEDHRApp.value) {
      const perms = usePagePermissions('role-management');
      return perms.value;
    }
    return {
      [BasicAction.Insert]: getPermissionByKey('Role', BasicAction.Insert),
      [BasicAction.Update]: getPermissionByKey('Role', BasicAction.Update),
      EnableDisable: getPermissionByKey('Role', BasicAction.Update),
      [BasicAction.Delete]: getPermissionByKey('Role', BasicAction.Delete),
      Perm: getPermissionByKey('PermissionSetting'),
    };
  });

  const formState = reactive({
    roleName: undefined,
    enabled: undefined,
  });

  const loading = ref<boolean>(false);

  const tableData = ref<RoleResponse[]>([]);

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }
    loading.value = true;

    const res = await getRolePageList({
      ...formState,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });

    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  };

  onMounted(() => getTableData(1));

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleCreate = () => {
    openModal(true, { edit: false });
  };

  const handleEdit = (record) => {
    openModal(true, {
      edit: true,
      record,
    });
  };

  const handleRefresh = () => {
    getTableData();
  };

  const handleRoleSetting = (record) => {
    gct.openUtil.drawer(
      PermissionSettingComponent,
      { roleId: record.id },
      {
        title: t('sys.menu.rolePermissionSetting'),
        width: 800,
        class: 'biz-bpmn-runtime-drawer',
      },
    );
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
    getTableData(1);
  };

  const handleDelete = async (record) => {
    await deleteRole({
      ids: record.id,
    });
    createMessage.success(t('sys.operationSuccess'));
    getTableData(1);
  };

  const getShouldShow = (roleType, action) => {
    const env = getEnv();
    if (roleType === 'BUILTIN' && env === 'prod') {
      return false;
    }
    if (roleUsePerms.value[action]) {
      return true;
    }
    return false;
  };
</script>

<style></style>
