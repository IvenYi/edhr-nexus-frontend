<template>
  <a-card
    :title="tableName"
    style="width: 265px"
    :bodyStyle="{ padding: 0, height: '190px', overflowY: 'auto' }"
  >
    <p v-for="item in field_list" :key="`${tableName}${item.key}`">
      <span>{{ item.key }}</span>
      <span>{{ item.name }}</span>
    </p>
  </a-card>
</template>

<script lang="ts" setup>
  import { inject, onMounted, ref } from 'vue';
  import { FieldMetaBase } from '/@/apis/gct-apaas/model';

  const getNode = inject('getNode') as Function;
  // const getGraph = inject("getGraph") as Function;
  const field_list = ref<FieldMetaBase[]>([]);
  const tableName = ref('');
  const node = getNode();
  onMounted(() => {
    const { fieldList, modelKey, name } = node.getData();
    field_list.value = fieldList;
    tableName.value = `${name}(${modelKey})`;
    //   node.on("change:data", ({ current }) => {
    //     console.log(current)
    //     const { table } = current;
    //     tableKey = table;
    //   });
    // console.log(field_list, table_name);
  });
</script>

<style lang="less" scoped>
  :deep(.ant-card-head) {
    border-top: 4px solid var(--ant-primary-color);
    height: 40px;
    padding: 10px 15px;
    background: #f5f5f5;
    font-size: 14px;
    font-weight: 600;
    font-family: PingFangSC-Semibold, PingFang SC;
    display: flex;
  }

  .field-box {
    height: 200px;
  }

  p {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;
    margin: 0;
    height: 32px;
    align-items: center;
    padding: 0 13px;
  }
</style>
