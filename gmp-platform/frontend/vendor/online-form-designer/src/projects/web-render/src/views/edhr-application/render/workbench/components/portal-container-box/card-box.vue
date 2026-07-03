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
      background-color: #fff;
      padding: 0 16px 16px;

      .ant-card-head {
        padding: 0;
        border-bottom: none;
        min-height: 22px;
        margin-bottom: 0;
        flex-shrink: 0;

        .ant-card-head-title {
          line-height: 22px;
          color: #333;
          font-size: 16px;
        }
        .ant-card-extra {
          font-size: 12px;
          font-weight: 400;
          color: var(--ant-primary-color);
          line-height: 22px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .ant-card-body {
        position: relative;
        padding: 0;
        border-radius: 4px;
        overflow: hidden !important;
        flex: 1;
        width: 100%;
        height: 100%;
      }
    }
  }
</style>

<style lang="less" scoped>
  // :deep(.scroll-wrap),
  :deep(.ant-card-body) {
    overflow: overlay;
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera*/
    }

    /* 鼠标悬浮时显示滚动条 */
    &:hover::-webkit-scrollbar {
      display: block; /* Chrome, Safari, Opera*/
    }
  }
</style>
