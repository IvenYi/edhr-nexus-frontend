<template>
  <div class="widget-file-form-wrapper">
    <div class="widget-file-form-container">
      <!-- 编辑模式：初始化完成前隐藏、且未达到上限时显示上传区 -->
      <div
        class="widget-file-form-upload"
        v-if="!isReadonly && !isInitializing && uploadedCount < maxCount"
      >
        <div class="widget-file-form-upload-dragger" @click="handleUpload">
          <div>
            <GctIcon size="56" value="icon-platform:folder" />
          </div>
          <p class="widget-file-form-text"> 点击或将文件拖拽到这里上传 </p>
          <p class="widget-file-form-hint">
            支持上传扩展名为 .pdf 的文件，最多 {{ maxCount }} 个
          </p>
        </div>
      </div>

      <!-- 只读模式下无文件时的占位 -->
      <div
        class="no-pdf-placeholder"
        v-else-if="!isInitializing && isReadonly && uploadedCount === 0"
      >
        <p>暂无 PDF 文件</p>
      </div>

      <!-- 有文件时预览区域 -->
      <div class="preview-area" v-else-if="uploadedCount">
        <div class="pdf-viewport">
          <!-- 居中显示的“白纸”容器（可调 pad） -->
          <div class="pdf-sheet" :style="{ '--pad': '0px' }">
            <!-- 编辑模式可删除 -->
            <van-button
              v-if="pdfLoaded && !isReadonly"
              class="delete-btn-overlay"
              @click="removeFile(currentIndex)"
            >
              删除
            </van-button>

            <!-- 加载中遮罩：覆盖在纸张上 -->
            <div v-if="!pdfLoaded" class="loading-overlay">
              <a-spin tip="正在加载 PDF..." />
            </div>

            <!-- 使用 vue-pdf-embed（或改回 iframe） -->
            <PdfImage
              v-if="currentFile.path"
              :url="currentFile.path"
              class="pdf-frame-embed"
              @loaded="onPdfLoaded"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue';
  import { JSSDK } from '@mobile/utils/sdkAdapter';
  import { uuid2 } from '/@/utils/uuid';
  import VuePdfEmbed from 'vue-pdf-embed';
  import { showDialog } from 'vant';
  import PdfImage from '@mobile/views/edhr/_comps_/esop/pdf-image.vue';

  const props = defineProps<{
    modelValue?: string;
    maxCount?: number;
    maxSize?: number;
    isReadonly: boolean;
  }>();
  const emit = defineEmits(['update:modelValue']);

  interface FileItem {
    uid: string;
    name: string;
    path?: string; // 后端存储路径
    blobURL?: string; // 预览用 Blob URL
  }

  const fileList = ref<FileItem[]>([]);
  // 防止初次渲染闪动
  const isInitializing = ref(true);

  const maxCount = computed(() => props.maxCount || 1);
  const isMultiple = computed(() => maxCount.value > 1);
  const acceptList = computed(() => ['pdf']);
  const uploadedCount = computed(() => fileList.value.filter((f) => !!f.path).length);

  const pdfLoaded = ref(false);
  const currentIndex = ref(0);
  const currentFile = computed(() => fileList.value[currentIndex.value] || ({} as FileItem));

  // 双向绑定 modelValue
  const value = computed<string[]>({
    get: () => (props.modelValue ? props.modelValue.split(',') : []),
    set: (val) => emit('update:modelValue', val.join(',')),
  });

  // 根据外部 modelValue 初始化 fileList
  watch(
    () => value.value,
    async (urls) => {
      fileList.value = await Promise.all(
        urls.map(async (url) => {
          const uid = uuid2(16, 16);
          const fullUrl = import.meta.env.VITE_MINIO_PATH + url;
          console.log('fullUrl', fullUrl);
          return {
            uid,
            name: url.split('/').pop()!,
            path: url,
            blobURL: fullUrl,
          };
        }),
      );
      pdfLoaded.value = false;
      currentIndex.value = fileList.value.length - 1;
      isInitializing.value = false;
    },
    { immediate: true },
  );

  // 上传处理
  async function handleUpload() {
    if (uploadedCount.value >= maxCount.value) return;
    JSSDK.run(
      'Uploader',
      {
        maxCount: props.maxSize || 5,
        acceptList: acceptList.value,
        maxSize: props.maxSize,
        success(res) {
          const files = res.map((e) => e.url) || [];
          value.value = value.value.concat(files);
          pdfLoaded.value = false;
        },
        error(message) {
          if (!message.length) return;
          showDialog({
            message: message.join('；'),
          });
        },
      },
      'file',
    );
  }

  // 删除文件
  function removeFile(i: number) {
    fileList.value.splice(i, 1);
    pdfLoaded.value = false;
    if (currentIndex.value >= fileList.value.length) {
      currentIndex.value = fileList.value.length - 1;
    }
    value.value = fileList.value.map((f) => f.path || '');
  }

  // vue-pdf-embed 事件回调
  function onPdfLoaded() {
    // loaded 事件表明 PDFDocumentProxy 已经就绪
    pdfLoaded.value = true;
  }
  function onPdfRendered() {
    // 渲染完毕（可留空或用于埋点）
  }
  function onPdfLoadFailed(err: any) {
    pdfLoaded.value = false;
    console.error('PDF 加载失败：', err);
  }
</script>

<style scoped lang="less">
  .widget-file-form-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-size: 14px;
  }

  .widget-file-form-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .widget-file-form-upload {
    padding: 32px 64px;
  }

  /* 无 PDF 文件时占位 */
  .no-pdf-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #7f8c8d;
    font-size: 16px;
  }

  /* Upload 区域 */
  .widget-file-form-upload-dragger {
    background: #f7f8fa;
    padding: 40px 0;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 2px;
  }

  .widget-file-form-text {
    font-size: 16px;
    margin-bottom: 8px;
    color: #2c3e50;
  }
  .widget-file-form-hint {
    color: #7f8c8d;
    font-size: 14px;
  }

  .preview-area {
    position: relative;
    width: 100%;
    height: 100%;
  }

  /* 外层视口：确保内容居中，支持响应式缩放 */
  .pdf-viewport {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  /* 白纸容器：白底、有阴影、圆角、内边距作为“留白” */
  .pdf-sheet {
    --pad: 0px;
    width: calc(100% - 2 * var(--pad));
    height: calc(100% - 2 * var(--pad));
    background: #fff;
    overflow: hidden;
    position: relative;
  }

  /* PDF 渲染区域（vite-pdf 或 iframe）占满纸张 */
  .pdf-frame-embed {
    width: 100%;
    height: 100%;
    // border: none;
    // display: block;
    // /* padding: 12px; */
    background: #000;
    // overflow: auto;
    // display: flex;
    // align-items: center;
    // flex-direction: column;
    padding-top: 8px;
    padding-bottom: 8px;

    // :deep(.vue-pdf-embed__page) {
    //   margin-bottom: 4px;

    //   canvas {
    //     width: 1140px !important;
    //   }
    // }
  }

  /* 删除按钮放到纸张上面（居中） */
  .delete-btn-overlay {
    position: absolute;
    z-index: 50;
    left: 50%;
    transform: translateX(-50%);
    bottom: 36px; /* 离纸张底部的距离 */
    background: rgba(245, 108, 108, 0.9);
    border: none;
    color: #fff;
    padding: 0 32px;
    border-radius: 4px;
  }

  /* 加载遮罩，覆盖在纸张上方 */
  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.88); /* 近似纸张的半透明遮罩 */
    z-index: 40;
  }
</style>
