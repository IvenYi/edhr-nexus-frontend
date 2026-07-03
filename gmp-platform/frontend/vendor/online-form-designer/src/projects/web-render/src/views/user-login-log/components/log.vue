<template>
  <basic-page-render>
    <div class="p-16px flex flex-col h-full overflow-hidden">
      <search-form :formData="form" :initData="initSearchList" @on-query="() => getTableData(1)" />

      <base-vxe-table
        class="h-100%"
        :tableColumns="columnDefinitions"
        :data-source="tableData"
        :loading="loading"
        showPagination
        :action="{ width: 100 }"
        v-model:pagination="pagination"
        @request-table-data="handleTableChange"
      >
        <template #custom_item="{ column: { field }, record }">
          <span :class="['login-status', record[field]]">{{ Ch_LoginStatus[record[field]] }}</span>

          <a-tooltip>
            <template #title>
              <span>{{ record.description }}</span>
            </template>
            <QuestionCircleOutlined v-if="record[field] === 'FAILURE'" class="ml-4px error-tips" />
          </a-tooltip>
        </template>

        <template #operate="{ row: record }">
          <table-action-auto
            :actions="[
              {
                label: '详情',
                onClick: () => onDetal(record),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </base-vxe-table>
    </div>
  </basic-page-render>
</template>
<script setup lang="ts">
  import { TablePaginationConfig } from 'ant-design-vue';
  import { computed, onMounted, reactive, ref, unref } from 'vue';
  import { TableActionAuto } from '/@/components/Table';
  import { postLoginLogUserLoginLogPage } from '/@/apis/gct-apaas/LoginLogController';
  import { UserLoginLogDTO, UserLoginLogPageRequest } from '/@/apis/gct-apaas/model';
  import Detail from './detail.vue';
  import SearchForm from '../../edhr-application/components/search-form/index.vue';
  import BaseVxeTable from '../../edhr-application/components/base-vxe-table/index.vue';

  const Ch_LoginStatus = {
    SUCCEED: $t('sys.portal.succeed'),
    FAILURE: $t('sys.portal.failure'),
  };

  const statusOptions = Object.keys(Ch_LoginStatus).reduce((list: any[], item) => {
    list.push({
      value: item,
      label: Ch_LoginStatus[item],
    });
    return list;
  }, []);

  const initSearchList = [
    {
      type: 'input',
      label: '姓名',
      id: 'fullname',
      model: 'fullname',
      maxLength: 32,
    },
    {
      type: 'input',
      label: '工号',
      id: 'empNo',
      model: 'empNo',
      maxLength: 32,
    },
    {
      type: 'select',
      label: '登录状态',
      id: 'loginStatus',
      model: 'loginStatus',
      options: statusOptions,
    },
    {
      type: 'input',
      label: '主机IP',
      id: 'ip',
      model: 'ip',
      maxLength: 32,
    },
    {
      type: 'input',
      label: '手机号',
      id: 'mobile',
      model: 'mobile',
      maxLength: 32,
    },
  ];

  const columnDefinitions = [
    { title: '姓名', field: 'fullname', minWidth: 150 },
    { title: '工号', field: 'empNo', minWidth: 180 },
    { title: '手机号', field: 'mobile', minWidth: 140 },
    { title: '主机IP', field: 'ip', minWidth: 140 },
    { title: '浏览器', field: 'browser', minWidth: 140 },
    { title: '操作系统', field: 'os', minWidth: 140 },
    { title: '登录状态', field: 'loginStatus', minWidth: 120, slots: { default: 'custom_render' } },
    { title: '备注', field: 'description', minWidth: 140 },
    { title: '登录时间', field: 'modifyTime', minWidth: 176 },
  ];

  const props = defineProps<{
    isLogIn: boolean;
  }>();

  const form = ref<UserLoginLogPageRequest>({});

  const loading = ref(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<UserLoginLogDTO[]>([]);

  onMounted(() => getTableData(1));

  async function getTableData(initCurrent = 0) {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;

    const res: any = await postLoginLogUserLoginLogPage({
      ...unref(form),
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  }

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const onDetal = async (record) => {
    await gct.openUtil.modal(
      Detail,
      { data: record },
      {
        title: $t('sys.detail'),
        footer: null,
      },
    );
  };
</script>
<style lang="less" scoped>
  .login-status {
    display: inline-block;
    font-size: 14px;
    line-height: 18px;
    border-radius: 2px;
    padding: 2px 6px;
    color: #fff;

    &.SUCCEED {
      background-color: #0dcf8d;
    }

    &.FAILURE {
      background-color: #ff4d4f;
    }
  }
</style>
