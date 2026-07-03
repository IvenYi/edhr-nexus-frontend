<template>
  <div class="my2">
    <a-select :option="groupData" v-model:value="parameterType" style="width: 33%"></a-select>
  </div>
  <a-table :pagination="false" :data-source="parameterData" :columns="rightCols">
    <template #bodyCell="{ column, index }">
      <template v-if="column.key === 'index'">
        {{ index + 1 }}
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts" name="gct-process-parameter-card">
  import { ref } from 'vue';

  const parameterType = ref('工艺参数卡1');
  const groupData = ref([
    {
      product: '示例产品',
      spec: '示例工艺',
      deviceGroup: '示例设备组',
      name: '工艺参数卡1',
      label: '工艺参数卡1',
      value: '工艺参数卡1',
    },
  ]);
  const parameterData = ref([
    {
      name_: '示例名称',
      value_: '示例值',
      unit_: '示例单位',
    },
  ]);
  const rightCols = ref([
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: '参数卡名称',
      dataIndex: 'name_',
      key: 'name_',
    },
    {
      title: '参数卡属性值',
      dataIndex: 'value_',
      key: 'value_',
    },
    {
      title: '单位',
      dataIndex: 'unit_',
      key: 'unit_',
    },
  ]);
</script>

<style lang="less" scoped></style>
