<template>
  <van-popup
    class="form-drawer-wrapper"
    v-model:show="drawerVisible"
    destroy-on-close
    :close-on-click-overlay="false"
    position="center"
    :duration="0"
    :style="{ width: '100%', height: '100%' }"
    :teleport="teleport"
    @close="afterClose"
  >
    <div class="popup-container">
      <div class="popup-title ks-row-middle pl-16px pr-16px">
        <div class="ks-col">{{ drawerTitle }}</div>
        <i class="gct-iconfont icon-guanbi-Paddanchuang" @click="onClose"></i>
      </div>
      <div class="ks-col relative popup-content">
        <iframe v-if="url" class="h-full w-full" :src="url" frameborder="0"></iframe>
        <!-- <span class="absolute bottom-70px right-20px w-600px break-words">{{ url }}</span> -->
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';
  import { TypeNames } from './types';
  import { useIframeUrl } from './useIframeUrl';
  import { postOnlineFormInstanceDataCollectionUpdateStatus } from '/@/apis/gct-apaas/MedProFormInstanceController';

  const props = defineProps<{
    collectionItem: any;
    callback?: (btnType: string) => void;
  }>();

  const { teleport } = usePadTeleport();

  const drawerVisible = ref<boolean>(false);
  const url = ref('');

  const drawerTitle = computed(() => TypeNames[props.collectionItem?.type] || '表单操作');

  const onOpen = async (ofInstanceId?: string) => {
    drawerVisible.value = true;
    const { url: webUrl } = useIframeUrl('tmp-mobile-form-filling', {
      ofInstanceId: ofInstanceId ?? props.collectionItem?.online_form_id_ ?? '',
      isViewPage: 'false',
      keep: 'false',
      isDataCollect: 'false',
    });
    url.value = webUrl.value;
  };

  const onClose = () => {
    drawerVisible.value = false;
    url.value = '';
  };

  /** 调用回调方法 */
  const doCallback = (btn) => {
    if (props.callback && typeof props.callback === 'function') {
      props.callback(btn);
    }
  };

  const afterClose = async () => {};

  async function onIframeMessage(event) {
    const { type, cmd, payload } = event.data || {};
    if (cmd === 'TMP_MOBILE_FORM_BUTTON_ACTION') {
      await postOnlineFormInstanceDataCollectionUpdateStatus({
        taskId: props.collectionItem?.online_form_id_,
      });
      onClose();
    }
    doCallback(payload);
  }

  onMounted(() => {
    window.addEventListener('message', onIframeMessage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('message', onIframeMessage);
  });

  defineExpose({ onOpen, onClose });
</script>

<style scoped lang="less">
  .form-drawer-wrapper {
    max-width: 100%;

    .popup-container {
      display: flex;
      position: absolute;
      top: 0;
      bottom: 0;
      flex-direction: column;
      width: 100%;

      .popup-title {
        height: 56px;
        border-bottom: 1px solid #e0e3eb;
        color: #1a1d23;
        font-size: 17px;
        font-weight: 600;
      }
      .popup-content {
        flex: 1;
        overflow: hidden;
        color: #1a1d23;
      }
    }
  }
</style>
