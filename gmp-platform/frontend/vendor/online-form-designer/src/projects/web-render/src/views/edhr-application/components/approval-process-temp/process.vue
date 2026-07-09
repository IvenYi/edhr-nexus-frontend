<template>
  <div class="process-wrap ks-column overflow-hidden">
    <a-collapse v-model:activeKey="activeKey" ghost expand-icon-position="right" v-if="processId">
      <a-collapse-panel key="1">
        <template #header>
          <div class="title">{{ $t('sys.edhr.flowPathInfo') }}</div>
        </template>
        <div class="rounded-8px bg-[#FAFAFA] px16px pt16px">
          <a-descriptions
            layout="vertical"
            :colon="false"
            :column="2"
            :label-style="{ color: '#737E87' }"
            :content-style="{ color: '#252525' }"
          >
            <a-descriptions-item :label="$t('sys.edhr.flowPathName')">
              {{ processInfo.name_ }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('sys.edhr.field.createTime')">
              {{ processInfo.create_time_ }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('sys.edhr.flowPathDesc')">
              {{ processInfo.description_ }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <div class="title px16px py12px">{{ $t('sys.edhr.flowPath') }}</div>
    <div class="ks-col overflow-hidden">
      <ProcessPath
        :ofInstId="instId"
        modelKey="gct_edhr_instance"
        :api="getProcessPathFindAllByProcessInstanceId"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import ProcessPath from '@/components/BpmnRuntime/form/index.vue';
  import { getProcessPathFindAllByProcessInstanceId } from '@/apis/gct-apaas/ProcessPathController';
  import { ref, watch } from 'vue';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{
    instId: string;
    processId: string;
  }>();

  const activeKey = ref('1');
  const processInfo = ref<any>({});

  watch(
    () => props.processId,
    (id) => {
      if (id) getProcessInfo();
    },
    {
      immediate: true,
    },
  );

  async function getProcessInfo() {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_process',
        bsKey: 'getById',
        modelCategory: 'entity',
      },
      { id: props.processId },
    );
    processInfo.value = res?.data || {};
  }
</script>
<style lang="less" scoped>
  .process-wrap {
    height: calc(100vh - 55px);

    .title {
      font-weight: 500;
      display: flex;
      align-items: center;
      margin-top: 4px;
      color: #212528;

      &::before {
        content: ' ';
        display: inline-block;
        width: 2px;
        height: 14px;
        background-color: var(--ant-primary-color);
        margin-right: 8px;
        vertical-align: middle;
      }
    }
  }

  :deep(th.ant-descriptions-item) {
    padding-bottom: 0;
    line-height: 24px;
  }
  :deep(.ant-collapse-content-box) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
</style>
