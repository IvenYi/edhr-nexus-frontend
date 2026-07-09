<template>
  <div class="h-full">
    <template v-if="!fileMeta">
      <div class="h-full w-full ks-column justify-center items-center">
        <img :src="NoData" alt="" class="w200px h200px" />
        <div class="color-[#999999]">暂无数据</div>
      </div>
    </template>
    <template v-else>
      <img
        class="h-full w-full object-contain"
        v-if="sourceFileType === FileTypeEnum.PICTURE"
        :src="sourceFileUrl"
      />
      <!-- <VuePdf
        v-else-if="sourceFileType === FileTypeEnum.PDF"
        ref="VuePDFRef"
        pdfkey="view"
        :source="sourceFileUrl"
      /> -->
      <!-- <PdfRender v-els÷e-if="sourceFileType === FileTypeEnum.PDF" :sourceFileUrl="sourceFileUrl" /> -->
      <!-- <PdfIframe v-else-if="sourceFileType === FileTypeEnum.PDF" :url="sourceFileUrl?._url" /> -->
      <PdfImage
        ref="pdfRef"
        class="h-full w-full"
        v-else-if="sourceFileType === FileTypeEnum.PDF"
        :url="sourceFileUrl?._url"
      />

      <VideoRender
        class="h-full w-full"
        v-else-if="sourceFileType === FileTypeEnum.VIDEO"
        :src="sourceFileUrl"
      />

      <canvas ref="CanvasRef" style="display: none"></canvas>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import NoData from '@mobile/assets/image/no-app.png';
  import { VuePdf } from '/@/components/VuePdf';
  import PdfRender from './pdf-render.vue';
  import PdfIframe from './pdf-iframe.vue';
  import PdfImage from './pdf-image.vue';
  import VideoRender from './video-render.vue';
  import type { IContainerOperationEsop } from './type';
  import { showImagePreview } from 'vant';

  enum UploadTypeEnum {
    JPG = 'jpg',
    JPEG = 'jpeg',
    PNG = 'png',
    PDF = 'pdf',
    MP4 = 'mp4',
  }

  enum FileTypeEnum {
    PICTURE = 'picture',
    PDF = 'pdf',
    VIDEO = 'video',
    IFRAME = 'iframe',
  }

  const props = defineProps<{
    fileMeta?: IContainerOperationEsop;
  }>();

  const VideoRef = ref();
  const CanvasRef = ref();
  const pdfRef = ref();

  const getFileType = (fileName: string) => {
    const arr = fileName.split('.');
    const type: any = arr[arr.length - 1] || 'png';
    if ([UploadTypeEnum.PNG, UploadTypeEnum.JPG, UploadTypeEnum.JPEG].includes(type))
      return FileTypeEnum.PICTURE;
    if ([UploadTypeEnum.PDF].includes(type)) return FileTypeEnum.PDF;
    if ([UploadTypeEnum.MP4].includes(type)) return FileTypeEnum.VIDEO;
  };

  const getFileUrl = (url: string) => {
    const path = /^https?:\/\//.test(url)
      ? url
      : /^\/w/.test(url!)
        ? `${MOBILE_MINIO_PATH.value}${url}`
        : `${MOBILE_MINIO_PATH.value}/${url}`;
    if (sourceFileType.value === FileTypeEnum.PDF) {
      return {
        url: path,
        _url: url,
        // url: 'http://qa-test.alpha.gct-paas.com/minio/edhral3/bNDQ9kWufQLAOIY4/%E5%A4%A7%E7%96%86.pdf',
        cMapUrl: '/VuePdf/cmaps/',
        cMapPacked: true,
      };
    } else {
      return path;
    }
  };

  const sourceFileUrl = computed(() => {
    return props.fileMeta ? getFileUrl(props.fileMeta?.file ?? props.fileMeta?.url) : undefined;
  });

  const sourceFileType = computed(() => {
    return props.fileMeta ? getFileType(props.fileMeta.file) : undefined;
  });

  const handleLoadedData = () => {
    CanvasRef.value.width = VideoRef.value.videoWidth;
    CanvasRef.value.height = VideoRef.value.videoHeight;
    const ctx = CanvasRef.value.getContext('2d');
    ctx!.drawImage(VideoRef.value, 0, 0, CanvasRef.value.width, CanvasRef.value.height);
    const imageDataURL = CanvasRef.value.toDataURL('image/png');
    VideoRef.value.setAttribute('poster', imageDataURL);
  };

  const emit = defineEmits<{
    (e: 'exitFullScreen'): void;
  }>();

  function fullScreen() {
    if (![FileTypeEnum.PICTURE, FileTypeEnum.PDF].includes(sourceFileType.value)) {
      return false;
    }
    const images =
      sourceFileType.value === FileTypeEnum.PICTURE
        ? [sourceFileUrl.value]
        : pdfRef.value.getImages();
    showImagePreview({
      images: images,
      onClose: () => {
        emit('exitFullScreen');
      },
    });
    return true;
  }

  defineExpose({
    fullScreen,
  });
</script>

<style scoped lang="less"></style>
