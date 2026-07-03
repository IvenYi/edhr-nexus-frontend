<template>
  <a-card :class="`${prefixCls}__card-wrap`" :bordered="false" v-bind="cardExtraProps">
    <template #title>
      <slot name="title"></slot>
    </template>
    <template v-if="needExtra" #extra>
      <slot name="extra">
        <a href="#">{{ t('sys.seeMore') }}</a
        ><right-outlined />
      </slot>
    </template>
    <slot name="card-body"></slot>
  </a-card>
</template>
<script setup lang="ts" name="portal-container-box">
  import type { CardProps } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';

  interface Props {
    cardExtraProps: CardProps;
    needExtra?: boolean;
  }

  const { t } = useI18n();
  const { prefixCls } = useDesign('portal-container-box');

  defineProps<Props>();
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-portal-container-box';

  .@{prefix-cls} {
    &__card-wrap {
      width: 100%;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      background-color: transparent;

      .ant-card-head {
        padding: 0 24px;
        border-bottom: none;
        min-height: 22px;
        margin-bottom: 0;
        flex-shrink: 0;
        background-color: transparent;

        .ant-card-head-title {
          padding: 16px 0 4px 0;
          line-height: 22px;
          font-size: 16px;
          font-weight: 600;
        }
        .ant-card-extra {
          margin-right: -4px;
          padding: 16px 0 4px 0;
          font-size: 14px;
          font-weight: 400;
          height: 42px;
          overflow: visible;
          // color: var(--ant-primary-color);
          line-height: 22px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .ant-card-body {
        position: relative;
        padding: 0;
        border-radius: 8px;
        margin-top: 8px;
        overflow: hidden !important;
        flex: 1;
        width: 100%;
        height: 100%;
        background-color: #fff;

        // flex-grow: 1;

        // display: flex;
        // flex-direction: column;
      }
    }
  }
</style>

<style lang="less" scoped>
  // :deep(.scroll-wrap),
  :deep(.ant-card-body) {
    // overflow: overlay;
    height: calc(100% - 76px);
    padding: 0 0 16px 0;
    overflow: hidden;
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera*/
    }

    /* 鼠标悬浮时显示滚动条 */
    &:hover::-webkit-scrollbar {
      display: block; /* Chrome, Safari, Opera*/
    }
  }
</style>
