<template>
  <van-popover
    v-if="collapseAll"
    v-model:show="popoverVisible"
    placement="bottom-end"
    class="collapsable-button-popover rounded-xl"
    :duration="0"
    :showArrow="false"
  >
    <template #reference>
      <div class="flex justify-center items-center w-9 h-9 cursor-pointer">
        <i class="icon gct-iconfont icon-ziduan-biaodananniu-quanbuzhedie text-lg"></i>
      </div>
    </template>
    <!-- button list -->
    <div @click="popoverVisible = false">
      <div v-for="btn in buttons" :key="btn.id" class="popover-button">
        <slot :widget="btn"></slot>
      </div>
    </div>
  </van-popover>

  <div v-else class="collapsable-button-container flex items-center">
    <!-- first button -->
    <slot :widget="firstButton"></slot>
    <van-popover
      v-model:show="popoverVisible"
      ref="popoverRef"
      placement="bottom-end"
      class="collapsable-button-popover rounded-xl"
      :duration="0"
      :showArrow="false"
    >
      <!-- more button -->
      <template #reference>
        <MoreButton v-bind="firstButton.props" />
      </template>
      <!-- button list -->
      <div @click="popoverVisible = false" ref="popoverContentRef">
        <div v-for="btn in otherButtons" :key="btn.id" class="popover-button">
          <slot :widget="btn" :isMoreMenu="true"></slot>
        </div>
      </div>
    </van-popover>
  </div>
</template>

<script setup lang="ts">
  import MoreButton from './more-button.vue';
  import { ref, onMounted, toRef, computed } from 'vue';
  import { onClickOutside } from '@vueuse/core';

  const props = defineProps<{
    buttons: any[];
    rowIndex?: number;
    collapseAll?: boolean;
  }>();

  // 解决第一次点击显示偏移问题：强制显示第一行的 popover
  const popoverVisible = ref(!props.rowIndex);

  const popoverRef = ref(null);

  const popoverContentRef = ref(null);

  const firstButton = computed(() => {
    return props.buttons[0];
  });

  const otherButtons = computed(() => {
    const list = props.buttons.slice(1);
    for (let item of list) {
      item.props['isMoreMenu'] = true;
    }
    return list;
  });

  // 解决第一次点击显示偏移问题：然后立即设为隐藏
  onMounted(() => {
    popoverVisible.value = false;
  });

  // 点击外部关闭
  onClickOutside(
    popoverRef,
    () => {
      popoverVisible.value = false;
    },
    {
      ignore: [popoverContentRef, '.gct-designer-view-content__panel'], // 忽略这个元素的点击
    },
  );
</script>

<style scoped lang="less">
  // 表格中按钮
  .collapsable-button-container {
    :deep(> div button) {
      border-right: none;
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
  }

  // popover 中按钮
  .collapsable-button-popover {
    overflow: unset;
    box-shadow: 0 0 32px rgb(0 0 0 / 15%);

    :deep(button) {
      width: 160px;
      height: 48px;
      padding: 0 12px;
      border: none;
      background-color: #fff;

      .van-button__content {
        justify-content: start;

        .van-button__icon {
          // display: none;
        }

        .van-button__text {
          overflow: hidden;
          // color: #1a1d23;
          font-size: 14px;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .popover-button + .popover-button {
      border-top: 1px solid #e0e3eb;
    }
  }
</style>
<style lang="less">
  .collapsable-button-popover .popover-button .gct-pad-button .van-button {
    color: #000000d9 !important;
    &.btn-bg-style {
      background: transparent !important;
      color: #000000d9 !important;
    }
    &.btn-font-color,
    &.link {
      color: #000000d9 !important;
      padding-left: 16px !important;
    }
    &.btn-border-style {
      border-color: transparent !important;
      background: transparent;
    }
  }
</style>
