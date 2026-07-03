<template>
  <div class="basic-collapse">
    <div class="flex items-center justify-between">
      <div class="flex-1 w-10px">
        <slot name="title"></slot>
      </div>
      <i class="flex-none h-20px w-20px flex items-center justify-center" @click="expand = !expand">
        <van-icon
          name="arrow-down"
          class="transition-300"
          :class="{
            '-rotate-180': expand,
          }"
        />
      </i>
    </div>
    <div
      class="basic-collapse__content"
      :class="{
        'basic-collapse__content--expand': expand,
      }"
    >
      <div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const expand = ref<boolean>(false);
</script>

<style scoped lang="less">
  .basic-collapse {
    &__content {
      display: grid;
      grid-template-rows: 0fr;
      overflow: hidden;
      transition: 0.3s ease;

      &--expand {
        grid-template-rows: 1fr;
      }
      & > div {
        overflow: hidden;
      }
    }
  }
</style>
