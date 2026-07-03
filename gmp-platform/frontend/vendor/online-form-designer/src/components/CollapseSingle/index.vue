<template>
  <div class="collapse-single">
    <div class="collapse-single__header flex items-center justify-between">
      <div class="flex items-center text-color cursor-pointer" @click="isExpand = !isExpand">
        <DownOutlined
          class="scale-y-80 transition"
          :class="{
            'rotate-x-180': isExpand,
          }"
        />
        <span class="ml-10px text-16px font-500">{{ title }}</span>
      </div>
      <div>
        <slot name="buttons"></slot>
      </div>
    </div>
    <div class="collapse-single__body p-20px mt-12px" :style="bodyStyle">
      <slot name="always"></slot>
      <div
        class="collapse-single__body-dynamic"
        :class="{
          'is-expand': isExpand,
        }"
      >
        <div>
          <slot name="dynamic"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { StyleValue, onMounted, ref } from 'vue';

  const props = defineProps<{
    title: string;
    bodyStyle?: StyleValue;
    defaultExpand?: boolean;
  }>();

  const isExpand = ref<boolean>(false);

  onMounted(() => {
    if (props.defaultExpand) isExpand.value = true;
  });
</script>

<style lang="less" scoped>
  .text-color {
    color: #212528;
  }
  .transition {
    transition: all 0.3s;
  }

  .collapse-single {
    &__body {
      background-color: #f7f8fa;
      border-radius: 4px;

      &-dynamic {
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
  }
</style>
