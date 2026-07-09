<template>
  <search-form
    class="pt-0! pb-0! mt-2"
    :formData="form"
    :initData="filterInitSearchList"
    @on-query="() => getTableData(1)"
  />

  <div class="ks-col h-full ks-column overflow-hidden">
    <div class="text-right mb16px">
      <a-button v-if="canAddForm || canAddDhr" type="primary" @click="onAdd">
        {{
          $t('sys.addSth', {
            sth:
              props.type === documentControlType.spec_document
                ? $t('sys.pageDesigner.form')
                : 'DHR',
          })
        }}
      </a-button>
    </div>
    <div class="ks-col h-full overflow-hidden">
      <base-vxe-table
        class="h-100%"
        :tableColumns="filterColumnList"
        :data-source="tableData"
        :loading="loading"
        :attributes="{
          treeConfig: {
            rowField: 'id',
            childrenField: 'children',
          },
        }"
        showPagination
        v-model:pagination="pagination"
        @request-table-data="handleTableChange"
      >
        <template #operate="{ row }">
          <table-action-auto
            :actions="[
              {
                ifShow: canConfig,
                label: t('sys.config'),
                onClick: () => onConfig(row),
              },
              {
                ifShow: canDelete,
                label: t('sys.delete'),
                color: 'error',
                popConfirm: {
                  title: t('sys.sureToDo'),
                  confirm: () => onDelete(row),
                },
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </base-vxe-table>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, onMounted, reactive, ref, unref } from 'vue';
  import { message, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import TmplModal from '/@/projects/page-designer/src/components/widgets/web/field/tmpl-tree-select/component/tmpl-modal.vue';
  import SearchForm from '/@/projects/web-render/src/views/edhr-application/components/search-form/index.vue';
  import BaseVxeTable from '/@/projects/web-render/src/views/edhr-application/components/base-vxe-table/index.vue';
  import {
    getControlConfigSpecialPageList,
    postControlConfig,
    deleteControlConfig,
  } from '/@/apis/gct-apaas/ControlConfigController';
  import {
    ControlStatusEnum,
    ApprovalControlStatusEnum,
  } from '/@/projects/app-designer/src/views/online-form/constants';

  import { documentControlType } from '../enums';

  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: (type) =>
        type === documentControlType.spec_document
          ? t('sys.onlineForm.formName')
          : t('sys.nameOfSth', { sth: 'DHR' }),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
    {
      type: 'input',
      label: $t('sys.edhr.no'),
      id: 'code',
      model: 'code',
      maxLength: 32,
    },
  ];

  const columnDefinitions = [
    {
      title: (type) =>
        type === documentControlType.spec_document
          ? t('sys.onlineForm.formName')
          : t('sys.nameOfSth', { sth: 'DHR' }),
      field: 'name',
      minWidth: 300,
    },
    { title: t('sys.appDesigner.version'), field: 'version', minWidth: 250 },
    {
      title: (type) =>
        type === documentControlType.spec_document ? $t('sys.edhr.formNo') : $t('sys.edhr.dhrNo'),
      field: 'code',
      minWidth: 150,
    },
    { title: t('sys.modifier'), field: 'modifyUserName' },
    { title: t('sys.modifyTime'), field: 'modifyTime', minWidth: 176 },
  ];

  const props = defineProps<{
    type: documentControlType;
    canConfig?: boolean;
    canDelete?: boolean;
    canAddForm?: boolean;
    canAddDhr?: boolean;
  }>();

  const emit = defineEmits(['on-config']);

  const form = ref<any>({});

  const loading = ref(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<any[]>([]);

  const filterInitSearchList = computed(() => {
    return initSearchList.map((item) => {
      if (typeof item.label === 'function') {
        return {
          ...item,
          label: item.label(props.type),
        };
      }
      return item;
    });
  });

  const filterColumnList = computed(() => {
    return columnDefinitions.map((item) => {
      if (typeof item.title === 'function') {
        return {
          ...item,
          title: item.title(props.type),
        };
      }
      return item;
    });
  });

  onMounted(() => getTableData(1));

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }
    loading.value = true;
    const res = await getControlConfigSpecialPageList({
      ...unref(form),
      type: props.type,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });

    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const onAdd = async () => {
    const res = await gct.openUtil.modal(
      TmplModal,
      {
        moduleType:
          props.type === documentControlType.spec_edhr ? 'edhr_module' : 'online_form_module',
        queryParams: {
          operatingState: undefined,
          controlStatus: ControlStatusEnum.UNCONTROLLED,
          approveStatus: ApprovalControlStatusEnum.UN_AUDITED,
        },
        checkFunc: (row) => {
          if (row.hasConfig || !row.baseId) return false;
          return true;
          // return row?.controlStatus === ControlStatusEnum.UNCONTROLLED;
        },
        configured: true,
      },
      {
        title: t('sys.addSth', { sth: t('sys.pageDesigner.form') }),
        width: '800px',
        height: 700,
        okText: t('sys.okText'),
      },
    );
    if (res.ok && res.params?.selected) {
      const { baseId, id } = res.params!.selected;
      const refId = baseId ? `${baseId}:${id}` : id;
      await postControlConfig({ refId, type: props.type });
      message.success(t('添加表单成功'));
      getTableData(1);
    }
  };

  const onConfig = async (record) => {
    emit('on-config', record);
  };

  const onDelete = async (record) => {
    await deleteControlConfig({ ids: record.id });
    message.success(t('sys.delSuccess'));
    getTableData(1);
  };

  defineExpose({
    getTableData,
  });
</script>

<style lang="scss">
  .temp-audit-process-search-form {
    margin-bottom: 10px;
  }
</style>
