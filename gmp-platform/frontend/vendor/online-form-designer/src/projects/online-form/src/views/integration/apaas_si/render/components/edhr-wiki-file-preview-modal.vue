<template>
  <a-modal
    class="edhr-wiki-file-preview-modal"
    v-model:visible="open"
    :footer="null"
    :closable="false"
    :mask="false"
    destroyOnClose
    :width="modalWidth"
    :wrap-style="{ overflow: 'hidden' }"
    :body-style="{ padding: 0, height: modalHeight + 'px', overflow: 'hidden', position: 'relative' }"
  >
    <template #modalRender="{ originVNode }">
      <div :style="transformStyle">
        <component :is="originVNode" />
      </div>
    </template>

    <template #title>
      <div ref="modalTitleRef" class="edhr-wiki-file-preview-modal__title">
        <span class="edhr-wiki-file-preview-modal__title-text" :title="fileName">{{ fileName }}</span>
        <CloseOutlined class="edhr-wiki-file-preview-modal__close" @click="handleClose" />
      </div>
    </template>

    <div class="edhr-wiki-file-preview-modal__body">
      <template v-if="source">
        <img v-if="fileType === fileTypeEnum.PICTURE" :src="source" class="edhr-wiki-file-preview-modal__image" />
        <div class="loading-box" v-show="source" v-loading="loading"></div>
        <VuePdf
          ref="VuePDFRef"
          v-if="fileType === fileTypeEnum.PDF"
          pdfkey="edhr-wiki-preview"
          :source="source"
          :isFull="false"
          :isClose="false"
        />
        <VideoPlayer
          v-if="fileType === fileTypeEnum.VIDEO"
          :src="(source as string)"
          :loop="false"
          :volume="0.6"
        />
        <iframe
          v-if="fileType === fileTypeEnum.IFRAME"
          :src="(source as string)"
          class="edhr-wiki-file-preview-modal__iframe"
          ref="frameRef"
          @load="hideLoading"
        ></iframe>
      </template>
    </div>
  </a-modal>
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
  import { useDraggable } from '@vueuse/core';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { VuePdf } from '/@/components/VuePdf';
  import { VideoPlayer } from '/@/components/VueVideoPlayer';

  defineOptions({ name: 'EdhrWikiFilePreviewModal' });

  function getFileType(fileName: string): fileTypeEnum | undefined {
    if (!fileName) return undefined;
    const arr = fileName.split('.');
    const type = (arr[arr.length - 1] || 'png').toLowerCase();
    if ([UploadTypeEnum.PNG, UploadTypeEnum.JPG, UploadTypeEnum.JPEG].includes(type as UploadTypeEnum))
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

  const modalWidth = computed(() => props.modalWidth ?? 860);
  const modalHeight = computed(() => props.modalHeight ?? 600);

  const open = ref(false);
  const fileName = ref('');
  const fileType = ref<fileTypeEnum | undefined>();
  const loading = ref(false);
  const resolvedSource = ref<any>(undefined);
  const VuePDFRef = ref();
  const frameRef = ref();

  // 将外部传入的 source 处理为带 minio 前缀的完整路径
  function buildSource(filePath: string): any {
    const minio = (import.meta as any).env?.VITE_MINIO_PATH ?? '';
    const url = /^https?:\/\//.test(filePath)
      ? filePath
      : /^\/w/.test(filePath)
      ? `${minio}${filePath}`
      : `${minio}/${filePath}`;

    if (fileType.value === fileTypeEnum.PDF) {
      return {
        url,
        cMapUrl: '/VuePdf/cmaps/',
        cMapPacked: true,
      };
    }
    return url;
  }

  const source = computed(() => resolvedSource.value);

  watch(
    () => VuePDFRef.value?.pageCount,
    () => {
      setTimeout(() => {
        loading.value = false;
      }, 800);
    },
  );

  // 拖拽逻辑
  const modalTitleRef = ref<HTMLElement | null>(null);
  const { x, y, isDragging } = useDraggable(modalTitleRef);
  const startX = ref(0);
  const startY = ref(0);
  const startedDrag = ref(false);
  const transformX = ref(0);
  const transformY = ref(0);
  const preTransformX = ref(0);
  const preTransformY = ref(0);
  const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 });

  watch([x, y], () => {
    if (!startedDrag.value) {
      startX.value = x.value;
      startY.value = y.value;
      const bodyRect = document.body.getBoundingClientRect();
      const titleRect = modalTitleRef.value?.getBoundingClientRect();
      if (titleRect) {
        dragRect.value.right = bodyRect.width - titleRect.width;
        dragRect.value.bottom = bodyRect.height - titleRect.height;
      }
      preTransformX.value = transformX.value;
      preTransformY.value = transformY.value;
    }
    startedDrag.value = true;
  });

  watch(isDragging, () => {
    if (!isDragging) {
      startedDrag.value = false;
    }
  });

  watchEffect(() => {
    if (startedDrag.value) {
      transformX.value =
        preTransformX.value +
        Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
        startX.value;
      transformY.value =
        preTransformY.value +
        Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
        startY.value;
    }
  });

  const transformStyle = computed<CSSProperties>(() => ({
    transform: `translate(${transformX.value}px, ${transformY.value}px)`,
  }));

  function resetDrag() {
    startX.value = 0;
    startY.value = 0;
    startedDrag.value = false;
    transformX.value = 0;
    transformY.value = 0;
    preTransformX.value = 0;
    preTransformY.value = 0;
    dragRect.value = { left: 0, right: 0, top: 0, bottom: 0 };
  }

  function hideLoading() {
    const iframe = frameRef.value;
    if (iframe) {
      iframe.style.height = `${modalHeight.value - 50}px`;
    }
  }

  function handleClose() {
    open.value = false;
    resolvedSource.value = undefined;
    fileType.value = undefined;
    fileName.value = '';
  }

  /**
   * 打开弹窗预览文件
   * @param filePath 文件路径 (对应 file_path_)
   * @param name 文件名 (对应 name_)
   */
  async function openPreview(filePath: string, name?: string) {
    fileName.value = name ?? filePath.split('/').at(-1) ?? '';
    fileType.value = getFileType(filePath);
    resolvedSource.value = buildSource(filePath);
    if (fileType.value === fileTypeEnum.PDF) {
      loading.value = true;
    }
    resetDrag();
    open.value = true;
    await nextTick();
  }

  defineExpose({ openPreview });
</script>

<style scoped lang="less">
  .edhr-wiki-file-preview-modal {
    :deep(.ant-modal-content) {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    :deep(.ant-modal-header) {
      padding: 12px 16px;
      border-bottom: 1px solid #e8ecf0;
      cursor: move;
      user-select: none;
    }

    :deep(.ant-modal-body) {
      flex: 1;
      overflow: hidden;
    }
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
