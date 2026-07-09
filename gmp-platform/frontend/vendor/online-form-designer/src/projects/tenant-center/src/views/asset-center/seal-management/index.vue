<template>
  <basic-page>
    <div class="p-24px h-full flex flex-col overflow-y-auto">
      <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off" layout="inline">
        <div class="w-full">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item :label="t('sys.tenant.assetCenter.sealManagement.sealName')" name="name">
                <a-input
                  v-model:value="formState.name"
                  :placeholder="t('sys.inputText')"
                  @pressEnter="getTableData(1)"
                  @change="handleNameChange"
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item :label="t('sys.tenant.assetCenter.sealManagement.sealType')" name="type">
                <a-select v-model:value="formState.type">
                  <a-select-option
                    v-for="item in [{ label: t('sys.all'), value: '' }, ...sealTypeOptions]"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ t(item.label) }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12" class="text-right">
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

      <div class="flex justify-end">
        <a-button
          v-if="hasPermission(BasicAction.Insert)"
          type="primary"
          @click="openFormModal(true, {})"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          {{ t('sys.appDesigner.new') }}
        </a-button>
      </div>

      <a-table
        bordered
        class="h-100px flex-1 mt-16px"
        row-key="id"
        size="middle"
        ref="tableContainerRef"
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        :scroll="{
          y: scrollHeight,
        }"
        @change="handleTablePageChange"
        @resizeColumn="handleResizeColumn"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'sealImage'">
            <div class="flex justify-center items-center w-32px h-32px">
              <img :src="getSealImageUrl(record.sealImage)" class="max-w-full max-h-full" />
            </div>
          </template>
          <template v-if="column.key === 'name'">
            <div
              :key="record.name"
              class="seal-name-button-trigger max-w-full ell text-left cursor-pointer"
              :style="{ color: 'var(--ant-primary-color)' }"
              v-ellipsis-title="record.name"
              @click="handleDetailShow(record)"
            >
              {{ record.name }}
            </div>
          </template>
          <template v-if="column.key === 'type'">
            {{ t(sealTypeMap[record.type]) }}
          </template>
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="[
                {
                  ifShow: hasPermission(BasicAction.Update),
                  label: t('sys.edit'),
                  onClick: () => {
                    openFormModal(true, { edit: true, record });
                  },
                },
                {
                  ifShow: hasPermission(CustomAction.ChangeSealPassword),
                  label: t('sys.changePassword'),
                  onClick: () => {
                    openPasswordModal(true, { record });
                  },
                },
                {
                  ifShow: hasPermission(BasicAction.Delete),
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDo'),
                    confirm: () => handleDelete(record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
    </div>

    <SealFormModal @register="registerForm" @ok="getTableData" />

    <ChangePasswordModal @register="registerPassword" @ok="getTableData" />

    <SealDetailDrawer
      ref="detailDrawerRef"
      :visible="detailDrawerVisible"
      :seal="activeDetailRecord"
      :onClose="() => (detailDrawerVisible = false)"
    />
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import {
    postSealManagementPageList,
    deleteSealManagement,
  } from '/@/apis/gct-platform/SealManagementController';
  import { OpenapiGroupResponse } from '/@/apis/gct-platform/model/index';
  import { useModal } from '/@/components/Modal';
  import SealFormModal from './seal-form-modal.vue';
  import ChangePasswordModal from './change-password-modal.vue';
  import { sealTypeOptions, sealTypeMap, getSealImageUrl } from './util';
  import { useMessage } from '/@/hooks/web/useMessage';
  import SealDetailDrawer from './seal-detail-drawer.vue';
  import { onClickOutside } from '@vueuse/core';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { CustomAction, BasicAction } from '/@/enums/authActionEnum';
  import { debounce } from 'lodash-es';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const { hasPermission } = usePermission();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerPassword, { openModal: openPasswordModal }] = useModal();

  const formState = reactive({
    name: '',
    type: '',
  });

  const formRef = ref<FormInstance>();
  const nameCache = ref('');
  const loading = ref<boolean>(false);
  const tableData = ref<OpenapiGroupResponse[]>([]);
  const tableContainerRef = ref();
  const activeDetailRecord = ref();
  const detailDrawerVisible = ref(false);
  const detailDrawerRef = ref(null);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30'],
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const params = Object.assign(formState, { pageNo, pageSize: pagination.pageSize! });
    const res = await postSealManagementPageList(params).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];

    setTimeout(() => {
      const height = `${scrollHeight.value}px`;

      (document.querySelector('.ant-table-body') as any).style.height = height;

      const placeholderTr: any = document.querySelector('.ant-table-placeholder');

      if (placeholderTr) {
        placeholderTr.style.height = height;
      }
    }, 1);
  };

  const getDebouncedTableData = debounce(getTableData, 200);

  const handleNameChange = (e: any) => {
    const val = e.target.value;

    if (!val || val.length < nameCache.value.length) {
      getDebouncedTableData(1);
    }

    nameCache.value = val;
  };

  const handleTablePageChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleResizeColumn = (w, col) => {
    col.width = w;
  };

  const handleReset = () => {
    formRef.value?.resetFields();
    getTableData(1);
  };

  const handleDetailShow = (record) => {
    activeDetailRecord.value = record;
    detailDrawerVisible.value = true;
  };

  const handleDelete = async (record) => {
    await deleteSealManagement({
      ids: record.id,
    });
    createMessage.success(t('sys.deleteSuccess'));
    getTableData(1);
  };

  const columns: TableColumnsType = ref([
    {
      title: t('sys.index'),
      dataIndex: 'index',
      key: 'index',
      width: 62,
      fixed: 'left',
    },
    {
      title: t('sys.tenant.assetCenter.sealManagement.sealImage'),
      dataIndex: 'sealImage',
      key: 'sealImage',
      width: 100,
      fixed: 'left',
    },
    {
      title: t('sys.tenant.assetCenter.sealManagement.sealName'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
    },
    {
      title: t('sys.tenant.assetCenter.sealManagement.sealType'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      ellipsis: true,
    },
    {
      title: t('sys.createName'),
      dataIndex: 'createUserName',
      key: 'createUserName',
      width: 120,
      ellipsis: true,
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
      width: 120,
      ellipsis: true,
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
    },
  ]);

  onMounted(() => {
    getTableData();
  });

  onClickOutside(detailDrawerRef, (e: any) => {
    const isButton = [...e.target.classList].includes('seal-name-button-trigger');
    const drawerContent = document.querySelector('.ant-drawer-content');

    if (isButton || !drawerContent || drawerContent.contains(e.target)) {
      return;
    }

    detailDrawerVisible.value = false;
  });
</script>
<style lang="less" scoped>
:deep(.ant-form .ant-form-item){
  margin-bottom: 16px;
}
</style>
