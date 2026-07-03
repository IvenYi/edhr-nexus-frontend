<template>
  <div :class="['ant-popover', $attrs.class]">
    <van-popover :overlay-class="overlayClassName" :placement="vanPlacementMap[placement]">
      <template #reference>
        <slot></slot>
      </template>
      <template #default>
        <slot name="content"></slot>
      </template>
    </van-popover>
  </div>
</template>

<script lang="ts" setup name="ant-popover">
  import { i18n } from '@mobile/locales/setupI18n';

  const vanPlacementMap = {
    top: 'top',
    topLeft: 'top-start',
    topRight: 'top-end',
    right: 'right',
    rightTop: 'right-start',
    rightBottom: 'right-end',
    bottom: 'bottom',
    bottomLeft: 'bottom-start',
    bottomRight: 'bottom-end',
    left: 'left',
    leftTop: 'left-start',
    leftBottom: 'left-end',
  };

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      placement?: string;
      overlayClassName?: string;
    }>(),
    {},
  );
</script>

<style lang="less" scoped>
  .ant-popover {
    line-height: 0;
  }
</style>
