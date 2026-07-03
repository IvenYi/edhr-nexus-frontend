<template>
  <div class="txn-data-collection">
    <file-list ref="fileListRef" :file-data="fileData" :is-design="true" />
  </div>
</template>

<script setup lang="ts" name="gct-txn-data-collection">
  import { ref } from 'vue';
  import FileList from './components/file-list.vue';

  const fileData = ref([
    {
      name: '数据采集1',
      type: 'dataCollection',
      status: 'initial',
    },
    {
      name: '数据采集2',
      type: 'dataCollection',
      status: 'submitted',
    },
    {
      name: '电子表单1',
      type: 'onlineForm',
      status: 'stash',
    },
  ]);
</script>

<style lang="less" scoped>
  .txn-data-collection {
  }
</style>
