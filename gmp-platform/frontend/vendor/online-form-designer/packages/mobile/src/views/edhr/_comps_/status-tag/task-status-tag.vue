<template>
  <div class="edhr-task-status" :class="'edhr-task-status--' + code">
    <img class="h-8px w-8px mr-4px" :src="TaskStatusIconSvg" />
    <span>
      {{ label || code }}
    </span>
  </div>
</template>

<script setup lang="ts">
  import TaskStatusIconSvg from '@mobile/assets/svg/task-status-icon.svg';

  defineProps<{
    code: string;
    label: string;
  }>();
</script>

<style scoped lang="less">
  .edhr-task-status {
    height: 16px;
    min-width: 52px;
    border-radius: 2px;
    color: #fff;
    background: #999999;
    font-size: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;

    &--running {
      background: #026ac8;
    }
    &--finished {
      background: #48c65c;
    }
  }
</style>
