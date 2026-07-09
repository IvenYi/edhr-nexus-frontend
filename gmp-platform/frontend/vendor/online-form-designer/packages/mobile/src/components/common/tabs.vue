<template>
  <div
    class="gct-mobile-tabs md:px-3"
    :class="[
      isAlignLeft ? 'is-align-left' : '',
      options.length > 4 ? 'gradient-side' : '',
      props.class,
    ]"
  >
    <van-tabs :active="active" @change="handleChange">
      <van-tab v-for="o in options" :key="o.value" :name="o.value" :title="o.label" />
      <!-- <van-tab name="1" title="应用名称很长很长很长很长很长很长" />
      <van-tab name="2" title="2tab name" />
      <van-tab name="3" title="3tab name" />
      <van-tab name="4" title="4tab name" />
      <van-tab name="5" title="5tab name" /> -->
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
  export interface ITabOption {
    label: string;
    value: string | number;
  }

  const props = defineProps<{
    options: ITabOption[];
    active: string | number;
    class?: string;
    isAlignLeft?: boolean;
  }>();

  const emit = defineEmits(['change']);

  const handleChange = (val: string | number) => {
    emit('change', val);
  };
</script>

<style scoped lang="less">
  .gct-mobile-tabs {
    position: relative;
    z-index: 0;
    border-bottom: 1px solid #e8ebf0 !important;

    &.gradient-side::before,
    &.gradient-side::after {
      content: '';
      display: none;
      position: absolute;
      z-index: 10;
      top: 0;
      width: 1rem;
      height: 100%;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 0)
      );
    }

    &.gradient-side::before {
      left: 0;
    }

    &.gradient-side::after {
      right: 0;
      transform: rotate(180deg);
    }

    &.is-align-left::before,
    &.is-align-left::after {
      display: block;
    }

    &.is-align-left :deep(.van-tab) {
      flex: none;
      padding: 0 1rem;
    }
    &.is-align-left :deep(.van-tab .van-tab__text) {
      display: block;
    }
    :deep(.van-tabs__nav) {
      padding-bottom: 0;
      background-color: transparent;
    }
    :deep(.van-tab__text) {
      max-width: 106px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.875rem;
      font-size: 500;
      color: black;
    }
    :deep(.van-tab--active .van-tab__text) {
      color: var(--van-primary-color);
    }
    :deep(.van-tabs__line) {
      bottom: 0;
      width: 1.5rem;
      height: 0.125rem;
    }
  }
</style>
