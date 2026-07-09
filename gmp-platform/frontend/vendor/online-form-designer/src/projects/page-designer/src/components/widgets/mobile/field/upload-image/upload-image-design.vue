<template>
  <div
    :style="{
      height: widget.style.height ? `${widget.style.height}px` : 'auto',
    }"
  >
    <van-uploader
      class="app-upload-image"
      :readonly="rowReadonly || readonly"
      :upload-text="'上传图片'"
      :upload-icon="rowReadonly || readonly ? ShiLi : 'plus'"
      :preview-size="103"
      :style="{
        '--van-uploader-text-color': 'var(--van-primary-color)',
      }"
    />
  </div>
</template>

<script name="gct-upload-image" setup lang="ts">
  import { toRefs, computed } from 'vue';
  import { useWidget, widgetProps } from '/@page-designer/hooks/useWidget';
  import ShiLi from '../../../../../assets/tupianshili.svg';

  const props = defineProps(widgetProps);
  const { readonly } = toRefs(props.widget.props);
</script>

<style lang="less" scoped>
  .app-upload-image {
    border: 1px dashed #d9d9d9;
    border-radius: 2px;

    :deep(.van-uploader__upload) {
      .van-icon-plus {
        font-size: 16px;
        color: var(--van-primary-color);
      }
      .van-uploader__upload-text {
        font-size: 14px;
      }
      .van-icon-photo {
        font-size: 40px;
      }
      .van-icon__image {
        width: 40px;
        height: 40px;
      }
    }
  }
</style>
