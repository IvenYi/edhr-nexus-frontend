<template>
  <BasicPopup
    v-model:show="show"
    :title="'查看数据变更'"
    :extraStyle="{
      width: '570px',
    }"
    :popupProps="{
      showHeader: true,
      showFooter: false,
    }"
  >
    <div class="flex flex-col h-full w-full operation-log-list-popup">
      <table class="custom-table">
        <thead>
          <tr>
            <th v-for="(value, key) in logs[0]" :key="key">{{ key }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in logs" :key="index">
            <td v-for="(value, key) in item" :key="key">{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </BasicPopup>
</template>

<script setup lang="ts" name="operation-log-list-popup">
  import { ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { OpLogField } from './types';

  const show = ref(true);

  defineProps<{
    logs: OpLogField[];
  }>();
</script>

<style lang="less" scoped>
  .operation-log-list-popup {
    .custom-table {
      width: 100%;
      border-collapse: collapse;
      min-height: 100px;
      max-height: 400px;
      overflow: auto;

      th,
      td {
        border: 1px solid #e4e7ed;
        padding: 8px 12px;
        text-align: left;
        font-size: 14px;
      }

      thead {
        background-color: #f5f7fa;

        th {
          position: sticky;
          top: 0;
          z-index: 1;
        }
      }
    }
  }
</style>