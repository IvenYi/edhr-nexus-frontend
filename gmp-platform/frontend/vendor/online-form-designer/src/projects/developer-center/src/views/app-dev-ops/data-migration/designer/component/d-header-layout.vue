<template>
  <div class="bg-[#F7F8FA] h100vh ks-column">
    <div class="h54px bg-[#1A1D23] ks-row-center-between text-[#fff] pl16px pr16px flex-shrink-0">
      <div>
        <slot name="left"></slot>
      </div>
      <div class="tabs ks-row-middle">
        <div
          :class="{ active: modelValue === StateEnum.Tab1 }"
          @click="emit('update:modelValue', StateEnum.Tab1)"
        >
          <i class="iconfont icon-a-1quan mr4px"></i>
          <span> 应用选择</span>
        </div>
        <span class="tabs-line"></span>
        <div
          :class="{ active: modelValue === StateEnum.Tab2 }"
          @click="emit('update:modelValue', StateEnum.Tab2)"
        >
          <i class="iconfont icon-a-2quan mr4px"></i>
          <span> 数据配置</span>
        </div>
      </div>
      <div>
        <slot name="right"></slot>
      </div>
    </div>
    <div class="p20px ks-col">
      <slot name="tab1" v-if="modelValue === StateEnum.Tab1"></slot>
      <slot name="tab2"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { StateEnum } from '../const';

  const defProps = defineProps<{
    modelValue: StateEnum;
  }>();
  const emit = defineEmits(['update:modelValue']);
</script>
<style lang="less" scoped>
  .tabs {
    & > div {
      padding: 6px 12px;
      border-radius: 4px;
      color: rgb(255 255 255 / 64%);
    }

    .active {
      background-color: var(--ant-primary-color);
      color: #fff;
    }

    &-line {
      width: 24px;
      height: 2px;
      margin: 0 18px;
      background-color: rgb(255 255 255 / 30%);
    }
  }
</style>
../cosnt
