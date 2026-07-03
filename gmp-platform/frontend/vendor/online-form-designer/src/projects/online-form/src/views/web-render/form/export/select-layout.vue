<template>
  <div class="select-layout">
    <div class="select-layout__left"><slot name="left"></slot></div>
    <div class="select-layout__right">
      <div class="select-layout__right-header">{{ title }}</div>
      <div class="select-layout__right-body">
        <a-empty v-if="isEmpty" :description="$t('sys.noData')" :image="EmptyImg" />
        <slot v-else name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="select-layout">
  import EmptyImg from '@/assets/svg/pic_nodata.svg';

  const props = withDefaults(
    defineProps<{
      title: string;
      isEmpty: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string): void;
  }>();
</script>

<style lang="less" scoped>
  .select-layout {
    display: flex;
    gap: 16px;
    padding: 0 24px;

    :deep(.ant-empty) {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .ant-empty-image {
        height: 66px;
        margin-bottom: 12px;
      }
      .ant-empty-description {
        font-weight: 400;
        font-size: 14px;
        color: #a6a6a6;
      }
    }

    &__left {
      flex-grow: 1;
      height: 100%;
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #e0e3eb;
    }
    &__right {
      flex-shrink: 0;
      width: 288px;
      height: 100%;
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #e0e3eb;

      &-header {
        border-bottom: 1px solid #f2f5f8;
        font-weight: 500;
        font-size: 14px;
        color: #1a1d23;
        line-height: 40px;
        padding-left: 16px;
      }
      &-body {
        height: calc(100% - 41px);
        overflow: auto;
      }
    }
  }
</style>
