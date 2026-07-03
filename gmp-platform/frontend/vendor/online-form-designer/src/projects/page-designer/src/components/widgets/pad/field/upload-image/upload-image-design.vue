<template>
  <div
    :style="{
      height: widget.style.height ? `${widget.style.height}px` : 'auto',
    }"
  >
    <div v-if="!rowReadonly && !readonly" class="add-btn">
      <i class="gct-iconfont icon-btn_add"></i>
      {{ '上传图片' }}
    </div>

    <div
      class="img-add ks-column justify-center items-center"
      :class="[showDisabled && 'disbaled']"
      v-if="rowReadonly || readonly"
    >
      <img :src="PicReadonly" alt="" class="w32px h32px" />
    </div>
    <!-- <van-uploader
      class="app-upload-image"
      :readonly="rowReadonly || readonly"
      :upload-text="'上传图片'"
      :upload-icon="rowReadonly || readonly ? ShiLi : 'plus'"
      :preview-size="103"
      :style="{
        '--van-uploader-text-color': 'var(--van-primary-color)',
      }"
    /> -->
  </div>
</template>

<script name="gct-upload-image" setup lang="ts">
  import { toRefs, reactive, computed } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import PicReadonly from '/@/assets/svg/pic_default.svg';
  import { useDisabled } from '../../../hooks/useReadyonly';

  const props = defineProps(widgetProps);
  const { readonly } = toRefs(props.widget.props);
  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));
</script>

<style lang="less" scoped>
  .img-add {
    width: 120px;
    height: 120px;
    border: 1px dashed #b7bcc6;
    border-radius: 4px;
    // color: var(--van-primary-color);
    background-color: #f3f5f7;
    cursor: pointer;
    margin-bottom: 8px;
    margin-right: 8px;
    box-sizing: border-box;

    &.disbaled {
      color: #c3c3c3;
    }
  }
  .add-btn {
    position: absolute;
    z-index: 1;
    top: -20px;
    right: 0;
    color: var(--van-primary-color);
  }
  :deep(.van-cell__value) {
    overflow: visible !important;
  }
</style>
