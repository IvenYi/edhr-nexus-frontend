<template>
  <div class="signature-confirm-designer">
    <a-button type="primary" style="margin-bottom: 8px">添加</a-button>
    <a-table :pagination="false" :dataSource="designData" :columns="designColumns">
      <template #bodyCell="{ column, index, record }">
        <template v-if="column.key === 'index'">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <a>签名验证</a>
          <a class="color-red-600 ml-2">删除</a>
        </template>
        <template v-else>
          <a-input v-model:value="record.key" />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts" name="gct-signature-confirm-designer">
const designData = [
  {
    name: "Jayson",
    passward: "111111"
  },
  {
    name: "Willam",
    passward: "111111"
  }
]

const designColumns = [{
  title: '用户名',
  dataIndex: 'name',
  key: 'name',
},
{
  title: '密码',
  dataIndex: 'passward',
  key: 'passward',
}, 
{
  title: '操作',
  dataIndex: 'operation',
},]
</script>