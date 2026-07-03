<template>
  <div v-if="!showReadonly" class="w100% mt4px">
    <van-button icon="plus" plain :disabled="showDisabled" type="primary">
      {{ '上传附件' }}
    </van-button>
    <div class="progress-wrap mb12px mt20px">
      <SvgIcon size="24" name="doc" />
      <div class="progress-box text-sm ml8px">
        <div class="left w-full">
          <span class="label">示例内容.docx</span>
          <span class="size ml-16px text-[#C3C3C3]">88M</span>
        </div>
        <!-- <van-progress
          :percentage="88"
          :color="`var(--van-primary-color)`"
          :show-pivot="false"
          track-color="E6E9EF"
        /> -->
      </div>
      <!-- <close-outlined class="mt-3px icon" /> -->
      <van-icon name="cross" class="mt-3px icon" />
    </div>
  </div>
  <div v-else class="w100%">
    <div class="progress-wrap mb12px mt16px">
      <SvgIcon size="24" name="doc" />
      <div class="progress-box text-sm">
        <div class="left w-full ml8px">
          <span class="label">示例内容.docx</span>
          <span class="size ml-16px text-[#C3C3C3]">88M</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script name="gct-upload-file" setup lang="ts">
  import { computed } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useReadyonly, useDisabled } from '/@page-designer/components/widgets/hooks/useReadyonly';
  import { SvgIcon } from '/@/components/Icon';

  const props = defineProps(widgetProps);

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));
  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));
</script>

<style lang="less" scoped>
  .progress-wrap {
    display: flex;
    .progress-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      line-height: 22px;
      align-self: center;
      :deep(.ant-progress) {
        line-height: 0.4;
        .ant-progress-text {
          position: absolute;
          right: 0;
          top: -14px;
          line-height: 0.6;
          color: #797a7d;
        }
      }
      :deep(.ant-progress-show-info .ant-progress-outer) {
        margin-right: 0;
        padding-right: 0;
        .ant-progress-inner {
          background: #e6e9ef;
        }
      }
    }
    .icon {
      margin-left: 24px;
      font-size: 16px;
      color: #212528 !important;
      align-self: center;
    }
  }

  :deep(.van-button) {
    padding: 0 16px;
    border-color: #e8ebf0;
    .van-button__icon {
      font-size: 16px;
    }
    .van-button__text {
      font-size: 16px;
      margin-left: 8px;
    }
  }
</style>
