<template>
  <div class="ocr-history-sider">
    <div class="ocr-history-sider__header">
      OCR{{ $t('sys.pageDesigner.uploadImage') }}
      <i @click="onClose" class="iconfont icon-pad_arrow_right"></i>
    </div>
    <div class="ocr-history-sider__content">
      <div v-for="(image, index) in list" :key="index" class="ocr-history-sider__image-wrapper">
        <a-image
          :width="140"
          :height="100"
          :src="image.url"
          class="ocr-history-sider__image"
          :fallback="ErrorImage"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="ocr-history-sider">
  import { reactive, computed, watch, onMounted, ref } from 'vue';
  import ErrorImage from '/@/assets/svg/pic-error.svg';

  const props = withDefaults(
    defineProps<{
      list?: { url: string }[];
    }>(),
    {
      list: () => [],
    },
  );

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  const onClose = () => {
    emit('close');
  };
</script>

<style lang="less" scoped>
  .ocr-history-sider {
    width: 324px;
    height: 100%;
    background: #ffffff;
    border-left: 1px solid #e0e3eb;
    // z-index: 999;
    box-sizing: content-box;

    &__header {
      width: 324px;
      height: 48px;
      background: #ffffff;
      border-radius: 0px 0px 0px 0px;
      border-bottom: 1px solid #e0e3eb;
      display: flex;
      align-items: center;
      padding-left: 16px;
      font-weight: 400;
      font-size: 14px;
      color: #1a1d23;

      .iconfont {
        margin-left: 8px;
        cursor: pointer;
      }
    }

    &__content {
      padding: 16px 0 16px 16px;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      gap: 12px;
      overflow: auto;
      height: calc(100% - 48px);
    }

    &__image-wrapper {
      width: 140px;
      height: 100px;
      border-radius: 6px 6px 6px 6px;
      overflow: hidden;
    }

    &__image {
      width: 100%;
      height: 100%;
    }

    :deep(.ant-image-error) {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eff1f5;

      .ant-image-img {
        width: 32px;
        height: 32px;
      }
    }
  }
</style>
