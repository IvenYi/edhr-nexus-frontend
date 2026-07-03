<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('header')]">
      <a-button @click="handleCloseLog" type="link">
        <left-outlined class="mr-4px align-middle" />
        {{ t('sys.onlineForm.backToForm') }}
      </a-button>
    </div>
    <div :class="[ns.e('body')]" v-if="selectedLogId">
      <div :class="[ns.e('body-title')]">{{ t('sys.menu.operationLog') + t('sys.detail') }}</div>
      <div :class="[ns.e('body-content')]">
        <OperationLogTimeline
          v-model:selected-id="selectedLogId"
          :logs="logs"
          :class="[ns.e('timeline')]"
        />
        <div v-if="showTable" :class="[ns.e('table')]">
          <OperationLogDetail :trace-id="selectedLog?.traceId" :model-key="modelKey" />
        </div>
      </div>
    </div>
    <div v-else class="operation-log-empty-area">
      <a-empty
        description=""
        :image="LogEmpty"
        :image-style="{
          height: '40vh',
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="operation-log-wrap">
  import { useNamespace } from '@gct/runtime';
  import { computed, onMounted, ref, inject, Ref } from 'vue';
  import OperationLogTimeline from './operation-log-timeline.vue';
  import OperationLogDetail from './operation-log-detail.vue';
  import { OnlineFormLogResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getOnlineFormLogList } from '/@/apis/gct-apaas/OnlineFormLogController';

  import LogEmpty from '/@online-form/assets/log-empty.svg';
  import { ProcDefType } from './types';

  const ns = useNamespace('operation-log-wrap');
  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      tmplId: string;
      instanceId?: string;
      procDefType?: ProcDefType;
      showTable?: boolean;
      modelKey?: string;
    }>(),
    {
      procDefType: ProcDefType.OF_APPROVE,
      showTable: true,
    },
  );

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  const logs = ref<OnlineFormLogResponse[]>([]);
  const selectedLogId = ref<string | undefined>();
  const selectedLog = computed(() => {
    return logs.value.find((item) => item.id === selectedLogId.value);
  });
  const handleCloseLog = () => {
    emit('close');
  };

  const loadLogs = async () => {
    const res = await getOnlineFormLogList({
      instanceId: props.instanceId!,
      tmplId: props.tmplId!,
      procDefType: props.procDefType,
    });
    console.log('logs', res);
    if (res) {
      logs.value = res;
      if (logs.value.length) {
        selectedLogId.value = logs.value[0].id;
      }
    }
  };

  onMounted(() => {
    loadLogs();
  });
</script>

<style lang="scss" scoped>
  $operation-log-wrap: ();

  @include b(operation-log-wrap) {
    @include set-component-css-var(operation-log-wrap, $operation-log-wrap);
    position: relative;
    height: 100%;
    width: 100%;

    // 日志样式
    @include e(header) {
      padding-top: 13px;
      padding-bottom: 16px;
      padding-left: 8px;
    }

    @include e(body) {
      padding: 0 24px 29px;
      height: calc(100% - 61px);
    }

    @include e(body-title) {
      font-weight: 400;
      font-size: 16px;
      color: #000000;
      height: 30px;
    }

    @include e(body-content) {
      display: flex;
      height: calc(100% - 30px);
    }

    @include e(timeline) {
      flex: 1;
      overflow: auto;
      min-width: 300px;
    }

    @include e(table) {
      // flex: 1;
      overflow: auto;
      width: 728px;
    }
  }
</style>

<style lang="less" scoped>
  .operation-log-empty-area {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 62px);
  }
</style>
