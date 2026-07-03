<template>
  <div class="gct-data-source-list">
    <div class="gct-data-source-area">
      <list-left @changeDatasource="changeDatasource" @reset="handleReset" />
      <api-right v-if="curType == DataSourceType.API" :currentDatasource="currentDatasource" />
      <list-right v-else :currentDatasource="currentDatasource" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import listLeft from './left.vue';
  import listRight from './right.vue';
  import ApiRight from './api-right.vue';
  import { ref } from 'vue';
  import { DataSourceType } from '/@bi-designer/enum/database';

  const emit = defineEmits(['reset']);

  const currentDatasource = ref('');
  const curType = ref<DataSourceType>();

  const handleReset = (isEmpty) => {
    emit('reset', isEmpty);
  };
  const changeDatasource = (dataSource: any, type: DataSourceType) => {
    currentDatasource.value = dataSource;
    curType.value = type;
  };
</script>

<style lang="less" scoped>
  .gct-data-source-list {
    // border-top-left-radius: 4px;
    // border-bottom-left-radius: 4px;
    border-radius: 8px;
    padding: 16px;
    height: 100%;

    .gct-data-source-area {
      border-radius: 8px;
      background: #fff;
      display: flex;
      width: 100%;
      height: 100%;
    }
  }
</style>
