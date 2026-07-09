<template>
  <div class="simple-collapse">
    <div
      class="simple-collapse__header"
      :class="{
        'simple-collapse__header--bt': !!borderTop,
      }"
      @click="isExpand = !isExpand"
    >
      <span>
        {{ title }}
      </span>

      <DownOutlined
        class="scale-y-80 ml-[auto]"
        :class="{
          'rotate-180': isExpand,
        }"
      />
    </div>
    <div
      class="simple-collapse__body"
      :class="{
        'is-expand': isExpand,
      }"
    >
      <div>
        <div class="p-12px">
          <slot> </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  withDefaults(
    defineProps<{
      title: string;
      borderTop?: boolean; // header 上边框线条
    }>(),
    {
      borderTop: true,
    },
  );

  const isExpand = ref<boolean>(true);
</script>

<style lang="less" scoped>
  .simple-collapse {
    &__header {
      color: #212528;
      font-weight: bold;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      background-color: #f7f7f7;
      user-select: none;
      cursor: pointer;
      font-size: 12px;
      &--bt {
        border-top: 1px solid #e0e3ea;
      }
    }

    &__body {
      display: grid;
      grid-template-rows: 0fr;
      transition: 0.3s ease;

      &.is-expand {
        grid-template-rows: 1fr;
      }

      & > div {
        overflow: hidden;
      }
    }
  }
</style>
