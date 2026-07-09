<template>
  <BasicPopup
    v-model:show="show"
    :title="'查看数据变更'"
    :extraStyle="{
      width: '680px',
    }"
    :popupProps="{
      showHeader: true,
      showFooter: false,
    }"
  >
    <div class="flex flex-col h-full w-full operation-log-list-popup">
      <van-loading v-if="loading" size="24px">加载中...</van-loading>
      <table v-else class="custom-table">
        <colgroup>
          <col style="width: 164px" />
          <col style="width: 164px" />
          <col style="width: 164px" />
          <col style="width: 164px" />
        </colgroup>
        <thead>
          <tr>
            <th>字段</th>
            <th>变更前</th>
            <th>变更后</th>
            <th>操作类似</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!_logs.length">
            <td colspan="4">
              <div class="empty-block">
                <gct-icon
                  class="empty-img"
                  value="icon-preset:edhr-ant-empty"
                  color="#C0C4CC"
                  :size="60"
                />
                <div class="empty-text">暂无数据</div>
              </div>
            </td>
          </tr>
          <tr v-for="(item, index) in _logs" :key="index">
            <td>{{ item.fieldName }}</td>
            <td :title="item.beforeValue">
              <ValueShower :value="item.beforeValue" :type="item.fieldType" />
            </td>
            <td :title="item.afterValue">
              <ValueShower :value="item.afterValue" :type="item.fieldType" />
            </td>
            <td>
              <span v-if="!item.subFields">{{ item.operationType }}</span>
              <span :class="['detail']" v-else @click="openSubPopup(item, modelKey)">{{
                item.operationType
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </BasicPopup>
</template>

<script setup lang="ts" name="operation-log-list-popup">
  import { onMounted, ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { OpLogField } from '../../../../../../src/projects/online-form/src/views/integration/apaas_si/render/operation-log/types';
  import { loadDetails, openSubPopup } from './logic';
  import ValueShower from './value-shower.vue';

  const show = ref(true);
  const loading = ref(true);
  const _logs = ref<OpLogField[]>([]);

  const props = defineProps<{
    logs?: OpLogField[];
    traceId?: string;
    modelKey: string;
  }>();

  onMounted(async () => {
    loading.value = true;
    if (props.traceId) {
      _logs.value = await loadDetails(props.traceId, props.modelKey);
    } else {
      _logs.value = props.logs ?? [];
    }
    loading.value = false;
    console.log(props.logs);
  });
</script>

<style lang="less" scoped>
  .operation-log-list-popup {
    padding: 8px;
    .detail {
      cursor: pointer;
      color: #026acb;
    }

    .empty-block {
      color: rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 150px;
    }

    .custom-table {
      width: 100%;
      table-layout: fixed; /* 强制启用固定布局 */
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 2px 2px 0 0;
      border-top: 0;
      min-height: 100px;
      max-height: 400px;
      overflow: auto;
      border-top: 1px solid #eaedf1;
      border-left: 1px solid #eaedf1;
      border-right: 1px solid #eaedf1;
      text-align: left;
      font-size: 14px;

      th,
      td {
        padding: 10px;
        border-bottom: 1px solid #eaedf1;
      }

      thead {
        th {
          position: relative;
          &::before {
            content: '';
            height: 1.6em;
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            transition: background-color 0.3s;
            width: 1px;
            background-color: #e0e3ea !important;
          }
        }
      }

      tbody {
        tr td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: #fff;
        }
      }
    }
  }
</style>
