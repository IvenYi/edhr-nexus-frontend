<template>
  <a-popover
    class="icon-tooltip"
    :title="tittle"
    placement="top"
    overlayClassName="icon-tooltip__popover"
  >
    <template #content>
      {{ content }}
    </template>
    <i class="gct-iconfont icon-icon_wenhao icon-tooltip__icon"></i>
  </a-popover>
</template>

<script lang="ts" setup name="icon-tooltip">
  const props = withDefaults(
    defineProps<{
      tittle?: string;
      content: string;
    }>(),
    {},
  );
</script>

<style lang="less" scoped>
  .icon-tooltip {
    &__icon {
      color: #A6A6A6;
      font-size: 14px;
      cursor: pointer;
      &:hover {
        color: #5A5F6B;
      }
    }
  }
</style>

<style lang="less">
  .icon-tooltip__popover {

    .ant-popover-arrow-content {
      background-color: #383838;
    }
    // 背景色
    .ant-popover-inner {
      background: transparent;
    }
    .ant-popover-content {
      box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.1);
      border-radius: 4px 4px 4px 4px;
      overflow: hidden;
      background: #383838;
    }
    // 字体样式
    .ant-popover-title,
    .ant-popover-inner-content {
      color: #ffffff;
      white-space: pre;
      font-weight: 400;
      font-size: 12px;
      line-height: 18px;
      padding: 5px 8px;
    }
    .ant-popover-title {
      border-color: transparent;
      position: relative;
      min-height: 29px;
      &::after {
        content: '';
        width: calc(100% - 16px);
        height: 1px;
        background: #ffffff;
        opacity: 0.2;
        position: absolute;
        bottom: -1px;
        left: 8px;
      }
    }
  }
</style>
