<template>
  <DiffSheet ref="sheetRef" class="preview-router" :tmpl="tmpl" @sheet-change="onSheetChange" />
</template>

<script lang="ts" setup name="preview-router">
  import { useRoute } from 'vue-router';
  import { reactive, computed, watch, onMounted, ref, onBeforeUnmount } from 'vue';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import DiffSheet from '../sheet/diff-sheet.vue';
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import { UNIQUE_KEY } from './util';

  const route = useRoute();
  const loading = ref(true);
  const tmpl = ref<OnlineFormTmplResponse>();
  const sheetRef = ref<any>();

  onMounted(async () => {
    if (!route.query.versionId) {
      throw new Error($t('sys.onlineForm.publishVersionPreview.tip1'));
    }
    loading.value = true;
    const res = await getOnlineFormTmplGetVersionById({ id: route.query.versionId as string });
    if (!res) {
      throw new Error(
        $t('sys.onlineForm.publishVersionPreview.tip2', {
          id: route.query.versionId,
        }),
      );
    }
    console.log('查询出来的version信息', res);
    tmpl.value = res;
    loading.value = false;
  });

  const onSheetChange = (e): void => {
    window.parent.postMessage(
      {
        uid: UNIQUE_KEY,
        eventType: 'SHEET_CHANGE',
        eventData: e,
      },
      '*',
    );
    console.log('preview-router onSheetChange', e);
  };

  // 监听来自 iframe 的消息
  const handleMessage = (event: MessageEvent) => {
    // 只处理来自当前 iframe 的消息
    if (event.source !== window.top) {
      return;
    }

    if (event.data?.uid !== UNIQUE_KEY) {
      return;
    }

    if (event.data.eventType === 'SET_ACTIVE_SHEET') {
      console.log('preview-iframe 接收到 SET_ACTIVE_SHEET 事件:', event.data.eventData);
      sheetRef.value?.setActiveSheet(event.data.eventData.sheetId);
    }
  };

  onMounted(() => {
    window.addEventListener('message', handleMessage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage);
  });
</script>

<style lang="less" scoped>
  .preview-router {
    min-width: unset !important;
    height: 100%;
  }
</style>
