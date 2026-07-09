<template>
  <basic-page>
    <div class="h-full flex flex-col">
      <div class="p-16px" v-if="!inEDHRApp">
        <h2 class="text-16px lh-[24px] color-[#000] font-500 mb-4px">{{
          t('sys.menu.dataSourceManagement')
        }}</h2>
        <p class="text-14px lh-[18px] color-[#797A7D] mb-0">{{
          t('sys.integration.dataSourceManagementTip')
        }}</p>
      </div>
      <div class="h-1px bg-[#E0E3EA]" v-if="!inEDHRApp"></div>

      <div class="p-16px flex-1 flex flex-col overflow-hidden">
        <div class="content-top" :class="[inEDHRApp ? 'bg-[#F7F8FA] p16px' : null]">
          <a-form
            class="flex-none"
            ref="formRef"
            :model="formState"
            autocomplete="off"
            layout="inline"
          >
            <div class="w-full">
              <a-row :gutter="[16, 16]">
                <a-col :span="8">
                  <a-form-item
                    :label="t('sys.nameOfSth', { sth: t('sys.integration.dataSource') })"
                    name="name"
                  >
                    <a-input
                      v-model:value="formState.name"
                      :placeholder="
                        t('sys.inputTextTip', {
                          name: t('sys.nameOfSth', { sth: t('sys.integration.dataSource') }),
                        })
                      "
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item
                    :label="t('sys.typeOfSth', { sth: t('sys.integration.dataSource') })"
                    name="type"
                  >
                    <a-select
                      v-model:value="formState.type"
                      allow-clear
                      :placeholder="
                        t('sys.pleaseSelectSth', {
                          sth: t('sys.typeOfSth', { sth: t('sys.integration.dataSource') }),
                        })
                      "
                    >
                      <a-select-option
                        :value="item.key"
                        v-for="item in DataSourceEnvOptions"
                        :key="item.key"
                        >{{ t(item.i18n) }}</a-select-option
                      >
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8" class="text-right">
                  <a-button class="mr-10px" @click="handleReset">
                    {{ t('sys.reset') }}
                  </a-button>
                  <a-button type="primary" @click="() => getTableData(1)">
                    {{ t('sys.queryText') }}
                  </a-button>
                </a-col>
              </a-row>
            </div>
          </a-form>
        </div>

        <div style="text-align: right" v-if="canCreate">
          <a-button class="mt-16px mb-16px" type="primary" @click="handleNew">
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.new') }}
          </a-button>
        </div>
        <div class="base-vxe-table-wrapper">
          <div class="base-vxe-table-area">
            <vxe-grid
              class="gct-edhr-vxetable"
              :column-config="{
                minWidth: 100,
                useKey: true,
                resizable: true,
              }"
              :row-config="{ isHover: true, useKey: true, isCurrent: true }"
              :scroll-y="{ enabled: true, scrollToTopOnChange: true, oSize: 5, gt: 30 }"
              min-height="88"
              height="100%"
              ref="xTable"
              :data="tableData"
              :loading="loading"
              :columns="columns"
              :auto-resize="true"
            >
              <template #default="{ column: { field }, row: record }">
                <span>
                  {{ record[field] }}
                </span>
              </template>

              <template #status_render="{ column: { field }, row: record }">
                <span class="status-tag" v-if="record.detailList[0].enabled === 1">{{
                  t('sys.enabled')
                }}</span>
                <span class="status-tag status-tag__disabled" v-else>{{ t('sys.disabled') }}</span>
              </template>

              <template #value_i18n_render="{ column: { field, params }, row: record }">
                <span>
                  {{ t(`${params.i18nPrefix}.${record[field]}`) }}
                </span>
              </template>

              <template #action="{ row: record }">
                <table-action-auto
                  :actions="[
                    {
                      ifShow: Boolean(canEdit),
                      label: t('sys.edit'),
                      onClick: () => handleEdit(record),
                    },
                    {
                      label: t('sys.enable'),
                      ifShow: record.detailList[0].enabled === 0 && Boolean(canEdit),
                      popConfirm: {
                        title: t('sys.sureToEnable'),
                        confirm: () => handleChangeStatus(record),
                      },
                    },
                    {
                      label: t('sys.disable'),
                      ifShow: record.detailList[0].enabled === 1 && Boolean(canEdit),
                      color: 'error',
                      popConfirm: {
                        title: t('sys.sureToDisable'),
                        confirm: () => handleChangeStatus(record),
                      },
                    },
                    {
                      ifShow: Boolean(canDelete),
                      label: t('sys.delete'),
                      color: 'error',
                      popConfirm: {
                        title: t('sys.integration.ds.deleteWarningMessage'),
                        confirm: () => handleDelete(record),
                      },
                    },
                  ]"
                  :stopButtonPropagation="true"
                />
              </template>

              <template #empty>
                <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
              </template>
            </vxe-grid>
          </div>
          <div class="text-right mt10px">
            <a-pagination
              class="pagination-total-left"
              v-bind="pagination"
              @change="onSizeChange"
            />
          </div>
        </div>
      </div>
    </div>
    <data-source-modal @register="register" @ok="() => getTableData(1)" />
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Empty, message } from 'ant-design-vue';
  import type { FormInstance, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DataSourceModal from './modals/data-source-modal.vue';
  // import { getDataSourcePageList } from '/@/apis/gct-platform/DataSourceController';
  import {
    getDataSourcePageList,
    deleteDataSource,
    putDataSourceEnabled,
  } from '/@/apis/gct-platform/DataSourceController';
  import type { DataSourceMainResponse } from '/@/apis/gct-platform/model';
  import { cloneDeep } from 'lodash-es';
  import { DataSourceEnvOptions } from './enum';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { t } = useI18n();

  const columns = [
    {
      title: t('sys.nameOfSth', { sth: t('sys.integration.dataSource') }),
      field: 'name',
      showOverflow: true,
    },
    {
      title: t('sys.typeOfSth', { sth: t('sys.integration.dataSource') }),
      field: 'type',
      showOverflow: true,
      params: { i18nPrefix: 'sys.integration.db' },
      slots: { default: 'value_i18n_render' },
    },
    {
      title: t('sys.descriptionOfSth', { sth: t('sys.integration.dataSource') }),
      field: 'description',
      showOverflow: true,
    },
    {
      title: t('sys.status'),
      field: 'status',
      showOverflow: true,
      slots: {
        default: 'status_render',
      },
    },
    {
      title: t('sys.createUser'),
      field: 'createUserName',
      showOverflow: true,
    },
    {
      title: t('sys.createTime'),
      field: 'createTime',
      showOverflow: true,
      minWidth: 170,
      width: 170,
    },
    {
      field: 'action',
      title: t('sys.operation'),
      width: 200,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ];

  withDefaults(
    defineProps<{
      canCreate?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
    }>(),
    {
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  );

  const [register, { openModal }] = useModal();
  const appInfoStore = useAppInfoStore();
  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  const formRef = ref<FormInstance>();

  const formState = reactive({
    name: undefined,
    type: undefined,
  });

  const loading = ref<boolean>(false);
  const tableData = ref<DataSourceMainResponse[]>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '40', '50'],
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;
    const res = await getDataSourcePageList({
      ...formState,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
  };

  onMounted(() => getTableData(1));

  const onSizeChange = (current, pageSize) => {
    Object.assign(pagination, { current, pageSize });
    getTableData();
  };

  const handleNew = () => {
    openModal(true, {});
  };

  const handleEdit = (record: DataSourceMainResponse) => {
    const data: DataSourceMainResponse = cloneDeep(record);
    data.detailList?.forEach((item) => {
      item.password = undefined;
    });
    openModal(true, {
      edit: true,
      record: data,
    });
  };

  const handleChangeStatus = async (record: DataSourceMainResponse) => {
    await putDataSourceEnabled({
      key: record.key,
      enabled: record.detailList![0].enabled === 0 ? 1 : 0,
    });
    message.success(t('sys.doSuccess'));
    getTableData(1);
  };

  const handleDelete = async (record: DataSourceMainResponse) => {
    await deleteDataSource({
      keys: record.key!,
    });
    message.success(t('sys.doSuccess'));
    getTableData(1);
  };

  const handleReset = () => {
    formRef.value?.resetFields();
    getTableData(1);
  };
</script>

<style lang="less" scoped>
  .status-tag {
    display: inline-block;
    height: 22px;
    padding: 0 6px;
    border-radius: 4px;
    background: #def8e2;
    color: #309c41;
    line-height: 22px;

    &__disabled {
      background: #e8ebf0;
      color: #c3c3c3;
    }
  }
</style>
<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }

  .base-vxe-table-wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;

    .base-vxe-table-area {
      flex: 1;
      overflow: hidden;
    }
  }
</style>
