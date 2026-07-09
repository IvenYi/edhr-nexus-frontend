<template>
  <div class="task-manage-designer">
    <SearchPanel :mode="'design'" :widget="widget" />
    <DataTable :mode="'design'" :widget="widget" />
  </div>
</template>

<script setup lang="ts">
  import SearchPanel from '../components/search-panel.vue'
  import DataTable from './data-table/data-table.vue';
  import { ITaskManage } from './schema';

  defineProps<{
    widget: ITaskManage
  }>();
</script>
