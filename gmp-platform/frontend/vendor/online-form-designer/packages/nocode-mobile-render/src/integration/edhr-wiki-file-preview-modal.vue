<template>
  <basic-popup
    v-model:show="open"
    class="edhr-wiki-file-preview-modal"
    :popup-props="{
      closeable: true,
    }"
    :showFooter="false"
    :title="fileName"
    :extra-style="{
      width: '100vw',
      maxWidth: '100vw',
      top: 0,
      margin: 0,
      transform: 'none',
    }"
  >
    <div class="edhr-wiki-file-preview-modal__body">
      <template v-if="source">
        <img
          v-if="fileType === fileTypeEnum.PICTURE"
          :src="source"
          class="edhr-wiki-file-preview-modal__image"
        />
        <div class="loading-box" v-show="source" v-loading="loading"></div>

        <VuePdfMobile ref="VuePDFRef" v-if="fileType === fileTypeEnum.PDF" :source="source" />

        <VideoRender class="w-full" v-else-if="fileType === fileTypeEnum.VIDEO" :src="source" />

        <iframe
          v-if="fileType === fileTypeEnum.IFRAME"
          :src="source"
          class="iframe__main"
          ref="frameRef"
          @load="hideLoading"
        ></iframe>
      </template>
    </div>
  </basic-popup>
</template>

<script lang="ts">
  export enum UploadTypeEnum {
    JPG = 'jpg',
    JPEG = 'jpeg',
    PNG = 'png',
    PDF = 'pdf',
    MP4 = 'mp4',
  }

  export enum fileTypeEnum {
    PICTURE = 'picture',
    PDF = 'pdf',
    VIDEO = 'video',
    IFRAME = 'iframe',
  }
</script>

<script setup lang="ts">
  import { ref, computed, watch, CSSProperties, nextTick, watchEffect } from 'vue';
  import BasicPopup from '../base/basic-popup.vue';
  import { VuePdfMobile } from '@mobile/components/vue-pdf/vue-pdf-mobile';
  import VideoRender from '@mobile/components/video-render.vue';
  import { serverAddress } from '@mobile/stores/sessionHooks';

  defineOptions({ name: 'EdhrWikiFilePreviewModal' });

  function getFileType(fileName: string): fileTypeEnum | undefined {
    if (!fileName) return undefined;
    const arr = fileName.split('.');
    const type = (arr[arr.length - 1] || 'png').toLowerCase();
    if (
      [UploadTypeEnum.PNG, UploadTypeEnum.JPG, UploadTypeEnum.JPEG].includes(type as UploadTypeEnum)
    )
      return fileTypeEnum.PICTURE;
    if (type === UploadTypeEnum.PDF) return fileTypeEnum.PDF;
    if (type === UploadTypeEnum.MP4) return fileTypeEnum.VIDEO;
    return fileTypeEnum.IFRAME;
  }

  const props = defineProps<{
    source?: string;
    modalWidth?: number | string;
    modalHeight?: number;
  }>();
  const modalHeight = computed(() => props.modalHeight ?? 600);

  const open = ref(false);
  const fileName = ref('');
  const fileType = ref<fileTypeEnum | undefined>();
  const loading = ref(false);
  const VuePDFRef = ref();
  const frameRef = ref();

  const source = ref();

  watch(
    () => VuePDFRef.value?.pageCount,
    () => {
      setTimeout(() => {
        loading.value = false;
      }, 800);
    },
  );

  function hideLoading() {
    const iframe = frameRef.value;
    if (iframe) {
      iframe.style.height = `${modalHeight.value - 50}px`;
    }
  }

  const getSource = (url) => {
    const minio = (import.meta as any).env?.VITE_MINIO_PATH ?? '';
    const path = /^https?:\/\//.test(url)
      ? url
      : /^\/w/.test(url!)
      ? `${minio}${url}`
      : `${serverAddress.value || (import.meta as any).env.VITE_GLOBAL_HOST}/${minio}/${url}`;
    if (fileType.value === fileTypeEnum.PDF) {
      return {
        url: path,
        _url: url,
        cMapUrl: '/VuePdf/cmaps/',
        cMapPacked: true,
      };
    } else {
      return path;
    }
  };

  const openPreview = async (filePath: string, name?: string) => {
    fileName.value = name ?? filePath.split('/').at(-1) ?? '';
    fileType.value = getFileType(filePath);
    source.value = getSource(filePath);
    if (fileType.value === fileTypeEnum.PDF) {
      loading.value = true;
    }
    open.value = true;
    await nextTick();
  };

  defineExpose({ openPreview });
</script>

<style scoped lang="less">
  .edhr-wiki-file-preview-modal {
  }

  .edhr-wiki-file-preview-modal__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: move;
    user-select: none;
  }

  .edhr-wiki-file-preview-modal__title-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 600;
    color: #252525;
    margin-right: 8px;
  }

  .edhr-wiki-file-preview-modal__close {
    flex-shrink: 0;
    cursor: pointer;
    color: #8f8f8f;
    font-size: 14px;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: #252525;
      background: #f0f0f0;
    }
  }

  .edhr-wiki-file-preview-modal__body {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .edhr-wiki-file-preview-modal__image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .edhr-wiki-file-preview-modal__iframe {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .loading-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }
</style>
