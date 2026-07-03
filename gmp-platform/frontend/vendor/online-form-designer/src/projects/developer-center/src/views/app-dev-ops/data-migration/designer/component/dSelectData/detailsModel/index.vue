<template>
  <div class="p24px">
    <a-table
      class="w100% h100%"
      ref="tableContainerRef"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      size="middle"
      @change="pageList"
      v-model:expandedRowKeys="defaultExpandedRowKeys"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, reactive } from 'vue';
  import { modelTable, SysPageEnum } from './config';

  const defProps = defineProps<{
    nameKey: SysPageEnum;
    id: string;
    configByHeaders: object;
  }>();
  const defaultExpandedRowKeys = ref([]);
  const pagination: any = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => $t('sys.component.table.total', { total }),
  });

  const tableConfig = modelTable[defProps.nameKey];
  const columns = computed(() =>
    tableConfig.tableColumns.map((i) => {
      const width = i.width || i.name.length * 20;
      return {
        dataIndex: i.key,
        title: i.name,
        width: width < 80 ? 80 : width,
        customRender: i.customRender,
        ellipsis: i.ellipsis,
      };
    }),
  );
  const tableData = ref([]);
  async function pageList() {
    const { pageSize, current } = pagination;
    const { data, totalCount } = await tableConfig.http(
      { pageSize, pageNo: current },
      defProps.id,
      defProps.configByHeaders,
    );
    pagination.total = totalCount;
    tableData.value = data;
    defaultExpandedRowKeys.value = data.map((i) => i.id);
  }
  onMounted(() => {
    pageList();
  });
</script>
<style scoped lang="less"></style>
