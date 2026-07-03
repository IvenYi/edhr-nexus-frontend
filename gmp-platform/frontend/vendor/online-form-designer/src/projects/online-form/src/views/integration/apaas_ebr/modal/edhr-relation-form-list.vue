<template>
  <div class="px20px py16px">
    <a-table
      class="h552px"
      row-key="id"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
      size="middle"
      :scroll="{
        y: '510px',
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: '查看表单',
                onClick: () => handleView(record),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </a-table>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/index';

  const props = defineProps<{
    data: any[];
    materialNo: string;
  }>();

  const loading = ref(false);
  const columns = [
    {
      title: $t('sys.onlineForm.formIdent'),
      dataIndex: 'serialNo',
    },
    {
      title: $t('sys.edhr.formTmpl'),
      dataIndex: 'tmplName',
    },
    {
      title: $t('sys.onlineForm.formCode'),
      dataIndex: 'ofCode',
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 90,
      fixed: 'right',
    },
  ];
  const { openSingleDrawer } = useApaasEbr();

  const handleView = (record) => {
    openSingleDrawer({
      selfId: record.id,
      keep: false,
      title: $t('sys.onlineForm.formDetail'),
      isViewPage: true,
      params: {
        _gct_nocode_trace_values_: props.materialNo,
      },
      callback: () => {},
    });
  };
</script>
<style lang="less" scoped></style>
