<template>
  <div class="edhr-task-type" :class="'edhr-task-type--' + code">{{ label || code }} </div>
</template>

<script setup lang="ts">
  defineProps<{
    code: string;
    label?: string;
  }>();
</script>

<style scoped lang="less">
  .edhr-task-type {
    height: 22px;
    width: 48px;
    border-radius: 2px;
    color: #fff;
    background: #ccc;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &--FORM {
      background: rgba(2, 106, 200, 0.12);
      color: #026ac8;
    }
    &--EDHR {
      background: rgba(65, 147, 137, 0.12);
      color: #419389;
    }
  }
</style>
