<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.appDesigner.modelTrace')"
    centered
    width="1000px"
    :min-height="600"
    :maskClosable="false"
    :footer="null"
  >
    <div class="trace-log-table">
      <a-table
        :columns="traceLogColumns"
        :data-source="traceLogs"
        row-key="id"
        :pagination="false"
        @expand="onExpand"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'masterOperationType'">
            <span>{{ operationTypeMap.get(record.masterOperationType) }}</span>
          </template>
        </template>
        <template #expandedRowRender>
          <a-table :columns="traceDetailColumns" :data-source="logDetails" :pagination="false">
            <template #headerCell="{ column }">
              <template v-if="column.key === 'fieldName'">
                <a-row :gutter="24">
                  <a-col :span="8">{{ t('sys.pageDesigner.field') }}</a-col>
                  <a-col :span="8">{{ t('sys.appDesigner.beforeUpdate') }}</a-col>
                  <a-col :span="8">{{ t('sys.appDesigner.afterUpdate') }}</a-col>
                </a-row>
              </template>
            </template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'fieldName'">
                <div v-for="item in record.recordFieldJson" :key="item.field">
                  <a-row :gutter="24">
                    <a-col :span="8"> {{ item.fieldName }}</a-col>
                    <a-col :span="8">{{ item.oldData }}</a-col>
                    <a-col :span="8">{{ item.newData }}</a-col>
                  </a-row>
                </div>
              </template>
              <template v-if="column.key === 'operationType'">
                <span>{{ operationTypeMap.get(record.operationType) }}</span>
              </template>
            </template>
          </a-table>
        </template>
      </a-table>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ModelMetaResponse } from '/@/apis/gct-apaas/model';
  import { getTraceLogPageList } from '/@/apis/gct-apaas/TraceLogController';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { traceLogColumns, traceDetailColumns } from '../constants/columns';
  import { getTraceLogDetailsInfoTree } from '/@/apis/gct-apaas/TraceLogDetailsController';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const traceLogs = ref<any[]>([]);
  const logDetails = ref<any[]>([]);
  const operationTypeMap = new Map([
    ['update', t('sys.update')],
    ['insert', t('sys.insert')],
    ['delete', t('sys.delText')],
  ]);

  const [registerInner] = useModalInner((data: ModelMetaResponse) => {
    getTracelog(data);
  });

  // 获取主表日志
  const getTracelog = async (data: ModelMetaResponse) => {
    const traceLogRes = await getTraceLogPageList({ modelKey: data?.key ?? '' });
    traceLogs.value = traceLogRes?.data ?? [];
  };

  // 获取子表信息
  const getTracelogDetail = async (traceLogId: string) => {
    const logDetailsRes = await getTraceLogDetailsInfoTree({ traceLogId });
    logDetails.value = logDetailsRes || [];
  };

  const onExpand = (expanded, record) => {
    if (expanded && !record.children) {
      getTracelogDetail(record.id); // 在展开子表格时异步请求数据
    }
  };
</script>

<style lang="less">
  .trace-log-table {
    max-height: 80%;
  }
</style>
