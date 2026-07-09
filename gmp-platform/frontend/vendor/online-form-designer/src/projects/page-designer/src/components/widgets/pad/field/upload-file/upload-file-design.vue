<template>
  <div class="w100% mt4px">
    <div v-if="!rowReadonly && !readonly" class="add-btn">
      <i class="gct-iconfont icon-btn_add"></i>
      {{ '上传附件' }}
    </div>
    <!-- <van-button icon="plus" plain :disabled="showDisabled" type="primary" class="add-btn">
      {{ '上传附件' }}
    </van-button> -->
    <van-row>
      <van-col :span="8">
        <div class="progress-wrap mb12px mr12px p12px pr0">
          <div class="svg-cate w40px h40px flex items-center justify-center">
            <SvgIcon size="24" name="doc" />
          </div>

          <div class="progress-box text-sm ml12px mr12px gct-text-overflow">
            <div class="file-name left w-full text-[#1A1D23] text-[15px]">
              <div class="gct-text-overflow">示例内</div>
              <div>容.docx</div>
            </div>
            <div class="size text-[13px] text-[#A6A6A6]">12.65KB</div>
            <!-- <van-progress
          :percentage="88"
          :color="`var(--van-primary-color)`"
          :show-pivot="false"
          track-color="E6E9EF"
        /> -->
          </div>
          <!-- <close-outlined class="mt-3px icon" /> -->
          <div class="preview-delete" v-if="!rowReadonly && !readonly">
            <div class="h16px w16px icon-wrap">
              <van-icon name="cross" />
            </div>
          </div>
        </div>
      </van-col>
    </van-row>
  </div>
</template>

<script name="gct-upload-file" setup lang="ts">
  import { computed, toRefs } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useReadyonly, useDisabled } from '/@page-designer/components/widgets/hooks/useReadyonly';
  import { SvgIcon } from '/@/components/Icon';

  const props = defineProps(widgetProps);
  const { readonly } = toRefs(props.widget.props);
</script>

<style lang="less" scoped>
  .progress-wrap {
    display: flex;
    background: #f9fafb;
    border-radius: 4px;
    .svg-cate {
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #e0e3eb;
    }
    .file-name {
      display: flex;
      justify-content: flex-start;
    }

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
  .add-btn {
    position: absolute;
    z-index: 1;
    top: -20px;
    right: 0;
    color: var(--van-primary-color);
  }
  .preview-delete {
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    .icon-wrap {
      background-color: #a6a6a6;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      .van-icon {
        font-size: 8px;
        color: #fff;
      }
    }
  }
  :deep(.van-cell__value) {
    overflow: visible !important;
  }
</style>
