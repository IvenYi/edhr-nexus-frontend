<template>
  <div class="p20px">
    <a-table :dataSource="dataSource" :columns="columns" :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <span
            :class="[
              'tag-status',
              { 'success-tag': record.status === '2' },
              { 'error-tag': record.status === '3' },
            ]"
          >
            {{ record.statusStr }}
          </span>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script setup lang="ts">
  import { ref, watchEffect } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getFlowNodeLogByReqId } from '/@/apis/gct-ipaas/IpaasLogController';

  const props = defineProps<{
    id: string;
  }>();

  const { t } = useI18n();

  const dataSource = ref<any[]>([]);
  const loading = ref(false);

  const columns = [
    {
      title: '执行节点',
      dataIndex: 'nodeName',
      key: 'nodeName',
      ellipsis: true,
    },
    {
      title: `${t('sys.integration.timeConsuming')} (ms)`,
      dataIndex: 'processTime',
      key: 'processTime',
      ellipsis: true,
    },
    {
      title: t('sys.status'),
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const getDetail = async () => {
    loading.value = true;
    const res: any = await getFlowNodeLogByReqId({ reqId: props.id });
    loading.value = false;
    dataSource.value = res || [];
  };

  watchEffect(() => {
    getDetail();
  });
</script>
<style lang="less" scoped>
  .tag-status {
    padding: 3px 6px;
    border-radius: 4px;

    &.success-tag {
      color: #309c41;
      background-color: #def8e2;
    }
    &.error-tag {
      color: #f54547;
      background-color: #feecec;
    }
  }
</style>
