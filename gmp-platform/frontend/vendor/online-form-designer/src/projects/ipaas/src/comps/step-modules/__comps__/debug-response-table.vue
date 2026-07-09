<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      :scroll="{
        y: 440,
        x: columns.length * 100,
      }"
      size="middle"
      @change="handleTableChange"
    />
  </div>
</template>
<script setup lang="ts">
  import { TableProps } from 'ant-design-vue';
  import { computed, onMounted, reactive, ref, watch } from 'vue';

  const props = defineProps<{
    data: any[];
  }>();

  const loading = ref(false);
  const dataSource = ref<any[]>([]);

  const columns = computed(() => {
    if (!props.data || !props.data.length) return [];
    const keys = Object.keys(props.data[0]);
    return keys.map((k) => {
      return {
        title: k,
        dataIndex: k,
        key: k,
        ellipsis: true,
        width: 100,
      };
    });
  });

  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    size: 'small',
  });

  // const dataSource = computed(() => {
  //   if (!props.data || !props.data.length) return [];
  //   const { current, pageSize } = pagination;
  //   return (props.data ?? []).slice((current - 1) * pageSize, current * pageSize - 1);
  // });

  watch(
    () => props.data?.length,
    (val) => {
      pagination.total = val || 0;
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {
    getTableData();
  });

  const getTableData = () => {
    const { current, pageSize } = pagination;
    dataSource.value = (props.data ?? []).slice((current - 1) * pageSize, current * pageSize);
  };

  const handleTableChange: TableProps['onChange'] = (paginationInfo) => {
    loading.value = true;
    Object.assign(pagination, paginationInfo);
    getTableData();
    setTimeout(() => {
      loading.value = false;
    }, 200);
  };
</script>
<style lang="less" scoped></style>
