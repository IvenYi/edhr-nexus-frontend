<template>
  <div class="custom-btn-container">
    <div class="btn-left" @click.stop="$emit('btn-left-click')">
      <slot name="left-icon"></slot>
      <div class="btn-left-title">{{ title }}</div>
    </div>
    <div class="btn-right" @click.stop="$emit('btn-right-click')">
      <slot name="right-icon"></slot>
    </div>
  </div>
</template>
<script setup lang="ts" name="custom-button">
  interface Props {
    title?: string;
  }
  defineProps<Props>();

  defineEmits(['btn-left-click', 'btn-right-click']);
</script>
<style scoped lang="less">
  .custom-btn-container {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    line-height: 1.5715;
    position: relative;
    font-weight: 400;
    white-space: nowrap;
    text-align: center;
    background-image: none;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    user-select: none;
    touch-action: manipulation;
    height: 32px;
    font-size: 14px;
    border-radius: 4px;
    color: #fff;
    border-color: var(--ant-primary-color);
    background: var(--ant-primary-color);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
    vertical-align: top;

    .btn-left {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      padding: 4px 12px;
      margin-right: 1px;

      &-title {
        margin-left: 4px;
        line-height: 22px;
      }

      &:hover {
        color: #fff;
        border-color: var(--ant-primary-color-hover);
        background: var(--ant-primary-color-hover);
      }
    }

    .btn-right {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      height: 32px;
      padding: 4px 12px;
      margin-left: 2px;

      &::before {
        content: '';
        position: absolute;
        width: 1px;
        height: 14px;
        background-color: #fff;
        left: -2px;
      }

      &:hover {
        color: #fff;
        border-color: var(--ant-primary-color-hover);
        background: var(--ant-primary-color-hover);
      }
    }
  }
</style>
