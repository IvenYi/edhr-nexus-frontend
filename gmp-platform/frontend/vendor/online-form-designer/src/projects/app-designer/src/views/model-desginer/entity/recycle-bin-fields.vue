<template>
  <a-table
    class="h-full"
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
      <template v-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.editor.recover'),
              popConfirm: {
                title: t('sys.model.fieldRecoverMessage'),
                confirm: () => handleRecover(record),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import {
    getFieldMetaPageGetRecycledList,
    putFieldMetaPageRecycledRestoreByFieldId,
  } from '/@/apis/gct-apaas/FieldMetaController';
  import type { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { TableActionAuto } from '/@/components/Table';

  const { t } = useI18n();
  const { createMessage } = useMessage();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const loading = ref<boolean>(false);
  const tableData = ref<FieldMetaDTO[]>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  onMounted(() => {
    getTableData();
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getFieldMetaPageGetRecycledList({
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res!.totalCount;
    tableData.value = res!.data ?? [];
  };
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('字段名称'),
      dataIndex: 'name',
    },
    {
      title: t('字段KEY'),
      dataIndex: 'key',
    },
    {
      title: t('字段类型'),
      dataIndex: 'type',
      customRender: ({ text }) => {
        return t(`sys.pageDesigner.fieldCmp.${text}`);
      },
    },
    {
      title: t('所属模型'),
      dataIndex: 'modelName',
    },
    {
      title: t('所属模型KEY'),
      dataIndex: 'modelKey',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const handleRecover = (record: FieldMetaDTO) => {
    putFieldMetaPageRecycledRestoreByFieldId({
      fieldId: record.id!,
    }).then(() => {
      createMessage.success(t('sys.operationSuccess'));
      getTableData(1);
    });
  };
</script>

<style lang="less" scoped></style>
