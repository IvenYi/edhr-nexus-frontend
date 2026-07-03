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
        <a-button class="mr-16px" type="primary" @click="handleAdd" v-if="userActions.Insert">
          <template #icon>
            <plus-outlined />
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
        :action="{ width: 200 }"
        v-model:pagination="pagination"
        @request-table-data="handleTableChange"
      >
        <template #custom_item="{ column: { field }, record, rowIndex }">
          <span v-if="field === 'type'">
            {{
              record[field] === 'BUILTIN' ? t('sys.model.functionSysBuiltin') : t('sys.customize')
            }}
          </span>
          <span v-else-if="field === 'pushType'">{{ getPushTypeList(record[field]) }}</span>
          <div v-else-if="field === 'index'"> {{ getPageIndex(rowIndex) }}</div>
          <div v-else-if="field === 'custom'">
            {{ record.custom ? t('sys.customize') : t('sys.model') }}
          </div>
        </template>

        <template #operate="{ row }">
          <table-action-auto
            :actions="[
              {
                ifShow: !!userActions.Update,
                color: 'success',
                label: t('sys.edit'),
                onClick: clickEditRow.bind(null, row),
              },
              {
                label: t('sys.test'),
                ifShow: !!userActions.Test,
                onClick: clickTestRow.bind(null, row),
              },
              {
                label: t('sys.delete'),
                color: 'text',
                ifShow: !!userActions.Delete && row.type === 'USER_DEFINED',
                popConfirm: {
                  title: t('sys.sureToDelete'),
                  confirm: handleRowDelete.bind(null, row),
                },
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </base-vxe-table>
    </div>
    <template-modal @register="templateRegister" @ok="handleModalOk" />
    <SelectUserModal ref="selectUserModalRef" @ok="handleOk" />
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from 'vue-i18n';
  import { TableActionAuto } from '/@/components/Table';
  import {
    getMessageTmplPageList,
    postMessageTmpl,
    putMessageTmplById,
    deleteMessageTmpl,
    postMessageTmplSend,
  } from '/@/apis/gct-apaas/MessageTmplController';
  import templateModal from '/@/projects/app-designer/src/views/message-center/modal/template-modal.vue';
  import SelectUserModal from '/@page-designer/components/widgets/web/field/range-user/component/select-user-modal.vue';
  import { pushTypeObj } from './constant/enum';
  import { message } from 'ant-design-vue';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import SearchForm from '../edhr-application/components/search-form/index.vue';
  import BaseVxeTable from '../edhr-application/components/base-vxe-table/index.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const selectUserModalRef = ref();

  const { t } = useI18n();

  const appInfoStore = useAppInfoStore();
  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  const initSearchList = [
    {
      type: 'input',
      label: t('sys.message.templateKey'),
      id: 'key',
      model: 'key',
      maxLength: 32,
    },
    {
      type: 'input',
      label: t('sys.message.templateName'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
    {
      type: 'input',
      label: t('sys.message.relationModal'),
      id: 'modelName',
      model: 'modelName',
      maxLength: 32,
    },
    {
      type: 'select',
      label: t('sys.type'),
      id: 'type',
      model: 'type',
      options: [
        { label: t('sys.model.functionSysBuiltin'), value: 'BUILTIN' },
        { label: t('sys.customize'), value: 'USER_DEFINED' },
      ],
    },
  ];
  const getPageIndex = (index) => {
    const { current, pageSize } = pagination;
    return pageSize * (current - 1) + index + 1;
  };
  const columnDefinitions = [
    {
      title: t('sys.pageDesigner.index'),
      field: 'index',
      width: 72,
      fixed: 'left',
      slots: { default: 'custom_render' },
    },
    { title: t('sys.message.templateName'), field: 'name', minWidth: 250, fixed: 'left' },
    { title: t('sys.message.templateKey'), field: 'key', minWidth: 300 },
    {
      title: t('sys.integration.dataSource'),
      field: 'custom',
      slots: { default: 'custom_render' },
    },
    { title: t('sys.message.relationModal'), field: 'modelName', minWidth: 150 },
    {
      title: t('sys.message.pushType'),
      field: 'pushType',
      minWidth: 140,
      slots: { default: 'custom_render' },
    },
    {
      title: t('sys.type'),
      field: 'type',
      minWidth: 140,
      slots: { default: 'custom_render' },
    },
    {
      title: t('sys.creator'),
      field: 'createUserName',
    },
    {
      title: t('sys.createTime'),
      field: 'createTime',
      minWidth: 176,
    },
    { title: t('sys.modifier'), field: 'modifyUserName' },
    { title: t('sys.modifyTime'), field: 'modifyTime', width: 170 },
  ];

  const [templateRegister, { openModal }] = useModal();

  const userActions = computed(() => {
    return {
      [BasicAction.Insert]: getPermissionByKey('MessageTemplate', BasicAction.Insert),
      [BasicAction.Update]: getPermissionByKey('MessageTemplate', BasicAction.Update),
      [BasicAction.Delete]: getPermissionByKey('MessageTemplate', BasicAction.Delete),
      [BasicAction.Test]: getPermissionByKey('MessageTemplate', BasicAction.Test),
    };
  });

  const formState = reactive({
    key: undefined,
    name: undefined,
    modelName: undefined,
    opened: undefined,
  });

  const loading = ref<boolean>(false);

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref([]);
  const currentRow = ref();

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;
    const result = await getMessageTmplPageList({
      ...formState,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });

    pagination.current = result?.pageNo ?? 1;
    pagination.total = result?.totalCount ?? 0;
    tableData.value = result?.data ?? [];
  };

  onMounted(() => getTableData(1));

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const getPushTypeList = (val) => {
    let arr = val?.split(',') || [];
    arr = arr.map((item) => {
      return pushTypeObj[item];
    });
    return arr.join(' / ');
  };

  const handleAdd = () => {
    openModal(true, {});
  };

  const handleRowDelete = async (record) => {
    loading.value = true;
    await deleteMessageTmpl({ ids: record.id });
    message.success(t('sys.delSuccess'));
    getTableData(1);
  };

  const clickEditRow = async (record) => {
    // 请求接口获取当前多语言的数据
    const data = record;
    openModal(true, { info: data, isEdit: true });
  };

  const clickTestRow = async (record) => {
    // 请求接口获取当前多语言的数据
    const data = record;
    currentRow.value = data;
    selectUserModalRef.value.open({ selectedValue: '', title: t('sys.message.object') });
  };

  const handleModalOk = async (data, isEdit, closeModal) => {
    if (isEdit) {
      await putMessageTmplById({ id: data.key }, data);
      message.success(t('sys.developer.appCenter.editSuccess'));
    } else {
      await postMessageTmpl(data);
      message.success(t('sys.createSuccess'));
    }
    getTableData(1);
    closeModal();
  };

  const handleOk = async (params) => {
    const data = { key: currentRow.value.key, rangUser: params.toString() };
    await postMessageTmplSend(data);
    message.success(t('sys.operationSuccess'));
  };
</script>
