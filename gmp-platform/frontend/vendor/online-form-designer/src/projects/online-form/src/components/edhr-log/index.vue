<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('body')]" v-if="selectedLogId || loading">
      <div :class="[ns.e('body-content')]">
        <OperationLogTimeline v-loading="loading" :logs="logs" :class="[ns.e('timeline')]" />
        <!-- <div v-if="showTable" :class="[ns.e('table')]" class="pl12px">
          <OperationLogDetail :trace-id="selectedLog?.traceId" />
        </div> -->
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
  import { computed, onMounted, ref } from 'vue';
  import OperationLogTimeline from './operation-log-timeline.vue';
  // import OperationLogDetail from './operation-log-detail.vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import LogEmpty from '/@online-form/assets/log-empty.svg';
  import { getDhrLogListByIsntanceId } from '/@/apis/gct-apaas/EdhrLogController';

  const ns = useNamespace('operation-log-wrap');
  // const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      instanceId?: string;
    }>(),
    {},
  );

  const logs = ref<any[]>([]);
  const selectedLogId = ref<string | undefined>();
  const loading = ref(false);
  const selectedLog = computed(() => {
    return logs.value.find((item) => item.id === selectedLogId.value);
  });

  const loadLogs = async () => {
    loading.value = true;
    // const { Cancel } = roleBuiltinBtnPermission.value;
    try {
      const res = await getDhrLogListByIsntanceId({
        isntanceId: props.instanceId!,
      });
      // console.log('logs', res);
      if (res) {
        logs.value = res;
        if (logs.value.length) {
          selectedLogId.value = logs.value[0].id;
        }
      }
      loading.value = false;
    } catch (error) {
      loading.value = false;
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
      padding: 29px 24px;
      height: calc(100vh - 55px);
    }

    @include e(body-title) {
      font-weight: 400;
      font-size: 16px;
      color: #000000;
      height: 30px;
    }

    @include e(body-content) {
      display: flex;
      height: 100%;
    }

    @include e(timeline) {
      flex: 1;
      overflow: auto;
      min-width: 300px;
    }

    @include e(table) {
      // flex: 1;
      overflow: auto;
      width: 528px;
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
