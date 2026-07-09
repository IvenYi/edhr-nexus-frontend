<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="400"
    :title="t('查看迁移数据')"
    centered
    width="640px"
    :maskClosable="false"
    :showOkBtn="false"
    :cancelText="t('sys.closeText')"
    :afterClose="handleClose"
  >
    <a-table
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      @change="handleTableChange"
    />
  </basic-modal>
</template>
<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { getDatasourceMoveDataPageList } from '/@/apis/gct-platform/DatasourceMoveDataController';
  import { DatasourceMoveDataResponse } from '/@/apis/gct-platform/model';

  const { t } = useI18n();
  const id = ref();

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    if (!data) return;
    id.value = data.id;
    getTableData();
  });
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    const res = await getDatasourceMoveDataPageList({
      id: id.value,
      pageNo,
      pageSize: pagination.pageSize,
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
  ];

  const handleClose = () => {
    pagination.current = 1;
    pagination.pageSize = 20;
    pagination.total = 0;
  };
  const tableData = ref<DatasourceMoveDataResponse[]>([]);
</script>
<style lang="less" scoped></style>
