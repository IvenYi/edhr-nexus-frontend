<template>
  <a-popover
    :content="tooltip"
    placement="top"
    overlayClassName="icon-button__popover"
    :align="align"
  >
    <div class="icon-button">
      <icon-next class="icon-button__icon" :value="icon" :size="14" />
    </div>
  </a-popover>
</template>

<script lang="ts" setup name="icon-button">
  import { reactive } from 'vue';
  import IconNext from '/@/components/Icon/src/IconNext.vue';

  const align = reactive({ offset: [0, 2] });

  const props = withDefaults(
    defineProps<{
      tooltip: string;
      icon: string;
    }>(),
    {},
  );
</script>

<style lang="less" scoped>
  .icon-button {
    border-radius: 4px 4px 4px 4px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
      background: #f2f5f8;
    }

    &__icon.icon-next {
      color: #026ac8;
      font-size: 14px;
      cursor: pointer;
    }
  }
</style>

<style lang="less">
  .icon-button__popover {
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
  }
</style>
