<template>
  <div
    class="floating-btns absolute right-8px top-8px"
    :class="{
      'is-expand': isExpand,
    }"
  >
    <div
      class="floating-btns__dynamic-area"
      :class="{
        'floating-btns__dynamic-area--visible': isExpand,
      }"
    >
      <div>
        <div
          class="flex flex-col items-center pt-24px pb-24px"
          v-for="(btn, index) in allBtns"
          :key="index"
          @click="handleBtnClick(btn)"
        >
          <img class="h-40px w-40px" v-if="btn.svg" :src="btn.svg" />
          <div class="h-40px w-40px bg-[#eeeeee]" v-else> </div>
          <div class="text-14px mt-8px whitespace-nowrap">{{ btn.name }}</div>
        </div>
      </div>
    </div>
    <div
      class="h-40px flex items-center justify-center color-[#919398]"
      @click="isExpand = !isExpand"
    >
      <gct-icon
        value="icon-park:to-bottom-one"
        :size="28"
        :class="{
          'rotate-x-180': isExpand,
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import GctIcon from '@mobile/components/icon/index.vue';
  import type { IBtn } from './type.ts';

  const props = defineProps<{
    btns: IBtn[];
  }>();

  const isExpand = ref<boolean>(true);
  const allBtns = computed(() => {
    return [...props.btns].filter((item) => item.hidden !== true);
  });

  const handleBtnClick = (btn: IBtn) => {
    const { callback } = btn;
    if (callback && typeof callback === 'function') {
      callback();
    }
  };
</script>
<style scoped lang="less">
  .floating-btns {
    background: #ffffff;
    box-shadow: 0px 4px 4px 0px rgba(115, 122, 135, 0.2);
    border-radius: 8px;
    border: 1px solid #eaecef;

    &__dynamic-area {
      display: grid;
      grid-template-rows: 0fr;
      overflow: hidden;
      transition: 0.3s ease;
      background-color: #fff;
      width: 40px;

      &--visible {
        grid-template-rows: 1fr;
        width: 104px;
      }
      & > div {
        overflow: hidden;
      }
    }
  }
</style>
