<template>
  <basic-page>
    <div class="h-full p-20px flex flex-col">
      <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off">
        <div class="w-full">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :label="t('sys.app.index')" name="appName">
                <a-input
                  v-model:value="formState.appName"
                  :placeholder="t('sys.inputText')"
                  @pressEnter="getTableData(1)"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('sys.integration.env.index')" name="env">
                <a-select v-model:value="formState.env" :placeholder="t('sys.chooseText')">
                  <a-select-option
                    :value="item.key"
                    v-for="item in apiEnvOptions"
                    :key="item.key"
                    >{{ t(item.i18n) }}</a-select-option
                  >
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('sys.model.modelName')" name="modelName">
                <a-input
                  v-model:value="formState.modelName"
                  :placeholder="t('sys.inputText')"
                  @pressEnter="getTableData(1)"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8" :offset="16" style="text-align: right">
              <a-button @click="() => handleReset()">
                <template #icon>
                  <undo-outlined />
                </template>
                {{ t('sys.reset') }}
              </a-button>
              <a-button class="ml-10px" type="primary" @click="() => getTableData(1)">
                <template #icon>
                  <search-outlined />
                </template>
                {{ t('sys.queryText') }}
              </a-button>
            </a-col>
          </a-row>
        </div>
      </a-form>

      <div class="btn-box">
        <a-button type="primary" @click="onClickAdd">
          <template #icon>
            <plus-outlined />
          </template>
          {{ t('sys.newSth', { sth: t('索引') }) }}
        </a-button>
      </div>

      <a-table
        class="flex-1 h-100px mt-14px"
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
            <span>{{ getEnvName(record) }}</span>
          </template>
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  onClick: handleRowEdit.bind(null, record),
                },
                {
                  label: t('sys.delete'),
                  color: 'text',
                  popConfirm: {
                    title: t('sys.sureToDo'),
                    confirm: handleRowDelete.bind(null, record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
    </div>
    <db-ops-modal @register="register" @ok="handleOk" @refresh="handleRefresh" />
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { message } from 'ant-design-vue';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { envOptions } from '../../integration/enum';
  import { useModal } from '/@/components/Modal';
  import DbOpsModal from './modals/db-ops-modal.vue';
  import {
    postDatasourceDevopsPageList,
    deleteDatasourceDevops,
    postDatasourceDevops,
    putDatasourceDevopsById,
  } from '/@/apis/gct-platform/DatasourceDevopsController';
  import type { DatasourceDevopsResponse } from '/@/apis/gct-platform/model';

  const { t } = useI18n();
  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  //modal框
  const [register, { openModal, closeModal }] = useModal();
  const formRef = ref<FormInstance>();
  const loading = ref<boolean>(false);
  const tableData = ref<DatasourceDevopsResponse[]>([]);
  const formState = reactive({
    appName: '',
    env: '',
    modelName: '',
  });

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const apiEnvOptions = computed(() => {
    const list: any[] = envOptions.filter((i) => i.key !== 'dev');
    list.unshift({ key: '', i18n: 'sys.integration.env.all' });
    return list;
  });

  const getEnvName = (record) => {
    const name = envOptions.find((i) => i.key === record.env)?.i18n;
    return name ? t(name) : record.env;
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await postDatasourceDevopsPageList({
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

  onMounted(() => {
    getTableData(1);
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const onClickAdd = () => {
    openModal(true, { edit: false });
  };

  const handleReset = () => {
    formRef.value?.resetFields();
    getTableData(1);
  };

  const handleRowEdit = (record) => {
    openModal(true, { edit: true, info: record });
  };

  const handleRowDelete = async (record) => {
    await deleteDatasourceDevops({ ids: record.id });
    message.success(t('sys.delSuccess'));
    if (tableData.value.length === 1) {
      pagination.current = pagination.current! - 1 || 1;
    }
    getTableData();
  };

  const handleRefresh = async ({ cb }) => {
    await getTableData();
    if (cb && typeof cb === 'function') {
      cb();
    }
  };

  const handleOk = async (data) => {
    if (data?.id) {
      await putDatasourceDevopsById({ id: data.id }, data);
      message.success(t('sys.developer.appCenter.editSuccess'));
    } else {
      await postDatasourceDevops(data);
      message.success(t('sys.createSuccess'));
    }

    closeModal();
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.app.index'),
      dataIndex: 'appName',
      key: 'appName',
      ellipsis: true,
    },
    {
      title: t('sys.integration.env.index'),
      dataIndex: 'env',
      key: 'env',
    },
    {
      title: t('sys.model.modelName'),
      dataIndex: 'modelName',
      key: 'modelName',
      ellipsis: true,
    },
    {
      title: t('sys.app.indexField'),
      dataIndex: 'fieldName',
      key: 'fieldName',
      ellipsis: true,
    },
    {
      title: t('sys.createUser'),
      dataIndex: 'createUserName',
      key: 'createUserName',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      minWidth: 170,
      width: 170,
    },

    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 130,
      fixed: 'right',
    },
  ];
</script>

<style lang="less" scoped>
  .btn-box {
    margin-top: 28px;
    text-align: right;
  }
</style>
