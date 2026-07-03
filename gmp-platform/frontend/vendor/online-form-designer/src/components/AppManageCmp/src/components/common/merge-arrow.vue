<template>
  <div class="merge-arrow"></div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
  .merge-arrow {
    height: 4px;
    width: 50px;
    position: relative;
    top: 14px;
    --width: 12px;
    --height: 16px;
    --height-half: calc(var(--height) / 2);
    &::before {
      content: '';
      top: 0;
      left: 0;
      height: 100%;
      position: absolute;
      width: calc(100% - var(--width));
      background-color: var(--ant-primary-color);
    }
    &::after {
      content: '';
      right: 0;
      top: calc((var(--height) - 4px) / 2 * -1);
      height: var(--height);
      position: absolute;
      border-left: var(--width) solid var(--ant-primary-color);
      border-top: var(--height-half) solid transparent;
      border-bottom: var(--height-half) solid transparent;
      width: 0;
      box-sizing: border-box;
    }
  }
</style>
