<template>
  <div v-if="rowReadonly || readonly" class="e-sop p-12px bg-[#F9F9F9]">
    <img src="/@page-designer/assets/group.png" class="w-full" />
  </div>
  <div v-else class="e-sop-design">
    <div class="progress-wrap">
      <div class="left-icon w-22px h-26px"></div>
      <div class="progress-box text-sm">
        <div class="flex flex-row justify-start">
          <span class="label">示例内容.png</span>
          <span class="size ml-auto mr-10px text-[#999999]">88M</span>
          <close-outlined class="mt-3px icon" />
        </div>
        <a-progress :strokeWidth="2" :percent="88" />
      </div>
    </div>
    <a-upload-dragger :fileList="[]" :disabled="disabled">
      <p>
        <i class="iconfont icon-shangchuanwenjian esop-icon"></i>
        <!-- <inbox-outlined /> -->
      </p>
      <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
      <p class="ant-upload-hint" v-if="attrObj.acceptStr">
        支持拖拽的文件格式：{{ attrObj.acceptStr }}
      </p>
    </a-upload-dragger>
  </div>
</template>

<script name="gct-e-sop" setup lang="ts">
  import { toRefs, onBeforeMount, inject } from 'vue';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/hooks';
  import { ESOP } from '/@page-designer/types/web';

  const props = defineProps<{ widget: ESOP; rowReadonly?: boolean }>();
  const { field, modelKey, readonly, disabled } = toRefs(props.widget.props);
  const { getFileAttrs, attrObj } = useAsyncFileAttrs();

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field.value, modelKey: modelKey.value });
  });
</script>

<style lang="less" scoped>
  .progress-wrap {
    display: flex;
    .left-icon {
      background: url(/@page-designer/assets/picture.png) no-repeat;
      background-size: 100% 100%;
      margin-right: 8px;
    }
    .progress-box {
      flex: 1;
      .icon {
        color: #999999 !important;
      }
      :deep(.ant-progress) {
        line-height: 0.6;
        .ant-progress-text {
          margin-left: 0;
          line-height: 1.5;
          color: var(--ant-primary-color);
        }
      }
      :deep(.ant-progress-show-info .ant-progress-outer) {
        margin-right: 0;
        padding-right: 0;
        .ant-progress-inner {
          background: #d9d9d9;
        }
      }
    }
  }
  :deep(.ant-upload.ant-upload-drag.ant-upload-disabled) {
    opacity: 0.5;
  }
  .esop-icon {
    font-size: 45px;
    color: var(--ant-primary-color);
  }
</style>
