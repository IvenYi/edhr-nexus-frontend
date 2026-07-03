<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.license.detail')"
    centered
    width="700px"
    :minHeight="100"
    :maskClosable="false"
    :footer="false"
    :afterClose="handleClose"
  >
    <BasicTable
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :pagination="false"
      :columns="columns"
      :dataSource="tableData"
    >
      <template #bodyCell="{ record, column, index }">
        <template v-if="column.dataIndex === 'index'">
          <div>
            {{ index + 1 }}
          </div>
        </template>
        <template v-if="column.dataIndex === 'limitType'">
          <div v-if="record.limitType === 'platUsers'"> 平台用户席位数 </div>
          <div v-if="record.limitType === 'suiteUsers'">套件用户席位数 </div>
          <div v-if="record.limitType === 'users'">并发用户数 </div>
        </template>
        <template v-if="column.dataIndex === 'qty'">
          <div> {{ record.qty ?? '不限制' }} </div>
        </template>
      </template>
    </BasicTable>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const columns = [
    {
      title: t('sys.component.table.index'),
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: t('sys.license.productName'),
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: t('sys.license.limitType'),
      dataIndex: 'limitType',
      key: 'limitType',
    },
    {
      title: t('sys.license.qty'),
      dataIndex: 'qty',
      key: 'qty',
    },
  ];
  const tableData = ref<Array<any>>([]);
  //Modal
  const [registerInner] = useModalInner((data) => {
    if (data) {
      console.log(data.dataList);
      tableData.value = data;
    }
  });
  const handleClose = () => {
    tableData.value = [];
  };
</script>

<style scoped></style>
