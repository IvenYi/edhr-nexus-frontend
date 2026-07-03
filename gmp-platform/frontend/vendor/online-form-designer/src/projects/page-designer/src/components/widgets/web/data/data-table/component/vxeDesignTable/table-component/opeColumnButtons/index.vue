<template>
  <opeButtons
    showmore
    :buttonOptions="operateColumn.children"
    :visibleButtons="operateColumn.props.visibleButtons"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, toRaw, computed } from 'vue';
  import { OperateTable, OperateButton } from '/@page-designer/types/web';
  import opeButtons from './opeButtons.vue';

  defineProps<{
    operateColumn: OperateTable;
    row: any;
    index: number;
  }>();
</script>
<style scoped lang="less"></style>
