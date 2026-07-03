<template>
  <basic-page>
    <div class="p-16px">
      <a-form ref="formRef" :model="formState" autocomplete="off">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item name="fullName" :label="t('sys.fullname')">
              <a-input v-model:value="formState.fullName" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="account" :label="t('sys.userName')">
              <a-input v-model:value="formState.account" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="type" :label="t('sys.type')">
              <a-select ref="select" v-model:value="formState.type" allow-clear>
                <a-select-option
                  v-for="item in DeveloperTypeOptions"
                  :value="item.value"
                  :key="item.value"
                >
                  {{ t(item.i18nKey) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
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
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  onClick: () => handleEdit(record),
                  ifShow: userActions.Update,
                },
                {
                  label: t('sys.remove'),
                  ifShow: record.appMemberPOList.length === 0 && userActions.Delete,
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToRemove'),
                    confirm: () => handleRemove(record),
                  },
                },
                {
                  label: t('sys.removeAndHandover'),
                  onClick: () => handleHandover(record),
                  ifShow: record.appMemberPOList.length > 0 && userActions.RemoveAndHandover,
                  color: 'error',
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </BasicTable>
      <developer-modal @register="register" @refresh="handleRefresh" />
      <developer-handover-modal @register="registerHandover" @refresh="handleRefresh" />
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DeveloperModal from './modals/developer-modal.vue';
  import DeveloperHandoverModal from './modals/developer-handover-modal.vue';
  import {
    getTenantDeveloperPageList,
    postTenantDeveloperREmoveAndHandover,
  } from '/@/apis/gct-platform/TenantDeveloperController';
  import type { TenantDeveloperDTO } from '/@/apis/gct-platform/model';
  import { DeveloperTypeOptionsMap, DeveloperTypeOptions } from '/@tenant-center/types';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicAction, CustomAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { createMessage } = useMessage();
  const [register, { openModal }] = useModal();
  const [registerHandover, { openModal: openHandoverModal }] = useModal();
  const { t } = useI18n();
  const { hasPermission } = usePermission();

  const formRef = ref<FormInstance>();
  const formState = reactive({
    account: undefined,
    fullName: undefined,
    type: undefined,
  });

  const tableData = ref<TenantDeveloperDTO[]>([]);

  const userActions = computed(() => {
    return {
      Insert: hasPermission(BasicAction.Insert),
      Update: hasPermission(BasicAction.Update),
      Delete: hasPermission(BasicAction.Delete),
      RemoveAndHandover: hasPermission(CustomAction.RemoveAndHandover),
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
      title: t('sys.fullname'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('sys.userName'),
      dataIndex: 'account',
      key: 'account',
    },
    {
      title: t('sys.phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 136,
    },
    {
      title: t('sys.type'),
      dataIndex: 'type',
      key: 'type',
      customRender: ({ text }) => {
        return t(DeveloperTypeOptionsMap[text].i18nKey);
      },
    },
    {
      title: t('sys.notes'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.createUser'),
      dataIndex: 'createUserName',
      key: 'createUserName',
    },
    {
      fixed: 'right',
      width: 160,
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

  const getTableData = async (pageNo: number = pagination.current!) => {
    const res = await getTenantDeveloperPageList({
      ...formState,
      pageNo: pageNo,
      pageSize: pagination.pageSize,
    });
    pagination.current = res?.pageNo ?? 1;
    pagination.total = res!.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  };
  getTableData();

  const handleSearch = () => {
    getTableData(1);
  };

  const handleRefresh = () => {
    getTableData(1);
  };

  const handleHandover = (record) => {
    openHandoverModal(true, {
      record,
    });
  };

  const handleRemove = async (record) => {
    await postTenantDeveloperREmoveAndHandover({
      id: record.id,
      removeAndHandoverDtoList: [],
    });
    createMessage.success(t('sys.operationSuccess'));
    getTableData(1);
  };

  const handleEdit = (record) => {
    openModal(true, {
      edit: true,
      record,
    });
  };
</script>

<style></style>
