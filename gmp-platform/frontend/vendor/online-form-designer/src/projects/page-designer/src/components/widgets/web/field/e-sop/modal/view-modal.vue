<template>
  <BasicModal
    ref="esopViewModal"
    v-bind="$attrs"
    @register="registerInner"
    :title="fileName"
    centered
    width="800px"
    :maskClosable="false"
    :maskStyle="{ 'z-index': '1038' }"
    :afterClose="handleClose"
    @click.stop
    wrapClassName="sop-view-modal-wrap"
  >
    <div v-if="source" class="w-full">
      <template v-if="!isIframe">
        <img v-if="fileType === fileTypeEnum.PICTURE" :src="source" class="w-full" />
        <VuePdf
          ref="VuePdfRef"
          v-if="fileType === fileTypeEnum.PDF"
          pdfkey="view"
          :source="source"
          :downloadFileName="fileName"
          :isDownload="true"
        />
        <VideoPlayer
          ref="VideoPlayerRef"
          v-if="fileType === fileTypeEnum.VIDEO"
          :src="source"
          :loop="false"
          :volume="0.6"
        />
      </template>
      <iframe
        v-if="isIframe"
        :src="source"
        class="iframe__main"
        ref="frameRef"
        @load="hideLoading"
      ></iframe>
    </div>
    <template #footer></template>
  </BasicModal>
</template>
<script setup lang="ts" name="nodes-modal">
  import { ref, nextTick, watch, onUnmounted, unref } from 'vue';
  import { VuePdf } from '/@/components/VuePdf';
  import { VideoPlayer } from '/@/components/VueVideoPlayer';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { debounce } from 'lodash-es';

  const enum fileTypeEnum {
    PICTURE = 'picture',
    PDF = 'pdf',
    VIDEO = 'video',
  }
  const props = defineProps<{
    fileType: fileTypeEnum;
    source: string | object;
    fileName: string | undefined;
  }>();

  const VuePdfRef = ref();
  const VideoPlayerRef = ref();
  const esopViewModal = ref();
  const frameRef = ref();
  const isIframe = ref<boolean>(false);
  const iframeLoading = ref<boolean>(false);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data?.isIframe) {
      isIframe.value = data?.isIframe;
    }
  });

  function calcHeight() {
    const iframe = unref(frameRef);
    if (!iframe) return;
    iframe.style.height = `800px`;
  }

  function hideLoading() {
    iframeLoading.value = false;
    calcHeight();
  }

  const handleClose = () => {
    isIframe.value = false;
    VideoPlayerRef.value?.handleReload();
    closeModal();
  };

  watch(
    () => esopViewModal.value?.fullScreenRef,
    (val) => {
      console.log(val, new Date().getTime());
      resizeHandler();
    },
  );

  async function resizeHandler() {
    await nextTick();
    if (props.fileType !== fileTypeEnum.PDF) return;
    VuePdfRef.value?.reload();
  }

  window.addEventListener('resize', debounce(resizeHandler, 200));

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
  });
</script>
<style lang="scss">
  .vue-pdf-embed-box {
    width: 100%;
  }
  .video-player {
    width: 100%;
  }
  .sop-view-modal-wrap {
    z-index: 1040;
  }
  .iframe__main {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 0;
  }
  // .sop-masking {
  //   position: fixed;
  //   top: 0;
  //   left: 0;
  //   right: 0;
  //   bottom: 0;
  //   background: rgba(0, 0, 0, 0.05);
  //   z-index: 1039;
  // }
</style>
