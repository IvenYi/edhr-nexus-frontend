<template>
  <span class="call-type-tag" :class="'call-type-tag--' + type">{{ type }}</span>
</template>

<script setup lang="ts">
  defineProps<{
    type: 'API' | 'SDK';
  }>();
</script>

<style lang="less" scoped>
  .call-type-tag {
    width: 45px;
    height: 18px;
    line-height: 18px;
    font-size: 12px;
    border-radius: 4px;
    display: block;
    text-align: center;

    &--API {
      color: #1a76ff;
      background: #e8f3fe;
    }

    &--SDK {
      color: #00a8ad;
      background: #defafc;
    }
  }
</style>
