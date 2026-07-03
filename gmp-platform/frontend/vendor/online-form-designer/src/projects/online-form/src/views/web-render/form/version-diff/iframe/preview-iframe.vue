<template>
  <iframe ref="iframeRef" :key="id" v-if="id" class="preview-iframe" :src="url"></iframe>
</template>

<script lang="ts" setup name="preview-iframe">
  import { computed, ref, reactive, onBeforeUnmount, onMounted } from 'vue';
  import { UNIQUE_KEY } from './util';
  import {
    SpreadSheetEventType,
    SpreadSheetEvents,
  } from '/@online-form/views/designer/hooks/useSpreadSheetEvent';

  const props = withDefaults(
    defineProps<{
      id?: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'sheetChange', value: SpreadSheetEvents[SpreadSheetEventType.SHEET_CHANGE]): void;
  }>();

  const url = computed(() => {
    return `${location.origin}${location.pathname}#/render/online-form-diff-preview-view?versionId=${props.id}`;
  });

  const iframeRef = ref<HTMLIFrameElement | null>(null);

  // 监听来自 iframe 的消息
  const handleMessage = (event: MessageEvent) => {
    // 只处理来自当前 iframe 的消息
    if (event.source !== iframeRef.value?.contentWindow) {
      return;
    }

    if (event.data?.uid !== UNIQUE_KEY) {
      return;
    }

    if (event.data.eventType === 'SHEET_CHANGE') {
      console.log('preview-iframe 接收到 SHEET_CHANGE 事件:', event.data.eventData);
      emit('sheetChange', event.data.eventData);
    }
  };

  onMounted(() => {
    window.addEventListener('message', handleMessage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage);
  });

  const setActiveSheet = (sheetId: string) => {
    iframeRef.value?.contentWindow?.postMessage(
      {
        uid: UNIQUE_KEY,
        eventType: 'SET_ACTIVE_SHEET',
        eventData: {
          sheetId,
        },
      },
      '*',
    );
  };

  defineExpose({
    setActiveSheet,
  });
</script>

<style lang="less" scoped>
  .preview-iframe {
    border: 0;
  }
</style>
