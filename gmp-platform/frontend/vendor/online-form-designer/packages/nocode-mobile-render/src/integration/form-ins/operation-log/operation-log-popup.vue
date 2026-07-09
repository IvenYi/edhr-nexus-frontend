<template>
  <BasicPopup
    v-model:show="show"
    title="操作日志信息"
    :extraStyle="{
      width: '680px',
    }"
  >
    <div class="flex flex-col h-full w-full add-form-ins-popup p-10px">
      <OperationLogTimeline
        v-if="logs.length > 0"
        :items="items"
        class="timeline"
        @click="handleClickItem"
      />
      <div v-else class="operation-log-empty-area">
        <img :src="LogEmpty" class="empty-img" />
      </div>
    </div>
  </BasicPopup>
</template>

<script setup lang="ts" name="add-form-ins-popup">
  import { computed, onMounted, ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { OnlineFormLogResponse } from '/@/apis/gct-apaas/model';
  import { getOnlineFormLogList } from '/@/apis/gct-apaas/OnlineFormLogController';
  import LogEmpty from '/@/projects/online-form/src/assets/log-empty.svg';
  import { ProcDefType } from './types';
  import OperationLogTimeline from './operation-log-timeline.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import OperationLogListPopup from './operation-log-list-popup.vue';

  const { t } = i18n.global;

  const show = ref(true);

  const props = withDefaults(
    defineProps<{
      tmplId: string;
      instanceId?: string;
      procDefType?: ProcDefType;
      modelKey: string;
    }>(),
    {
      procDefType: ProcDefType.OF_APPROVE,
    },
  );

  const logs = ref<OnlineFormLogResponse[]>([]);

  const loadLogs = async () => {
    const res = await getOnlineFormLogList({
      instanceId: props.instanceId!,
      tmplId: props.tmplId!,
      procDefType: props.procDefType,
    });
    console.log('logs', res);
    if (res) {
      logs.value = res;
    }
  };

  onMounted(() => {
    loadLogs();
  });

  const items = computed(() => {
    return logs.value.map((item) => {
      console.log('log', item);
      let title = '未知';
      let color = 'var(--ant-primary-color)';
      if (item.buttonConfig) {
        const json = JSON.parse(item.buttonConfig);
        title = json.title;
        color = json.color;
      }
      return {
        id: item.id!,
        color: color,
        title: title,
        data: item,
        changeType: item.btnType,
      };
    });
  });

  const handleClickItem = (item) => {
    console.log('item', item);
    GctPopup.open(OperationLogListPopup, {
      traceId: item.data.traceId,
      modelKey: props.modelKey,
    });
  };
</script>

<style lang="less" scoped>
  .add-form-ins-popup {
    .tips {
      background: #e7f1fb;
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #87bbfe;
      color: #5a5f6b;
      font-size: 14px;
      padding: 10px 12px;
      display: flex;
      .tips-icon {
        margin-right: 8px;
      }
    }

    .operation-log-empty-area {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      > img {
        height: 40vh;
      }
    }
  }
</style>
