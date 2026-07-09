<template>
  <div class="btn-wrap">
    <div :class="{ ml8px: !!i }" class="ks-col" v-for="(el, i) in showBtnList" :key="el.id">
      <AsyncGctComponents :widget="el" block class="w100%" />
    </div>
    <!-- more button -->
    <div
      v-if="isExistDropdownButtons"
      v-show="dropdownButtons.length"
      class="collapsable-button-container ml8px"
      @click="popoverVisible = false"
    >
      <AsyncGctComponents :widget="collpaseBtn[0]" :key="collpaseBtn[0].id" block />
    </div>
    <van-popover
      v-if="isExistDropdownButtons"
      ref="popoverRef"
      v-model:show="popoverVisible"
      placement="bottom-end"
      class="collapsable-button-popover rounded-xl"
      :duration="0"
      :showArrow="false"
      close-on-click-outside
    >
      <!-- collpase button -->
      <template #reference>
        <MoreButton v-bind="collpaseBtn[0].props" />
      </template>
      <div class="more-list" @click="popoverVisible = false">
        <AsyncGctComponents
          :widget="w"
          v-for="w in dropdownButtons"
          :key="w.id"
          block
          type="default"
          class="gct-default"
          :danger="false"
        />
      </div>
    </van-popover>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { BaseButton } from '/@/projects/page-designer/src/types/mobile';
  import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
  import AsyncGctComponents from '/@web-render/render/widget/widget-pad-async.vue';
  import MoreButton from '../more-button.vue';
  import { onClickOutside } from '@vueuse/core';

  const defProps = defineProps({
    children: {
      type: Array<BaseButton>,
      default: () => [],
    },

    visibleButtons: {
      type: Number,
      default: 2,
    },
    rowDisabled: {
      type: Boolean,
    },
  });

  const popoverVisible = ref(false);

  const popoverRef = ref(null);

  const list = useDependencyToShowList(defProps.children);

  const isExistDropdownButtons = computed(() => list.value.length > defProps.visibleButtons);
  const showBtnList = computed(() =>
    list.value.slice(
      0,
      isExistDropdownButtons.value ? defProps.visibleButtons - 1 : defProps.visibleButtons,
    ),
  );

  /** 折叠按钮 */
  const collpaseBtn = computed(() =>
    list.value.slice(defProps.visibleButtons - 1, defProps.visibleButtons),
  );

  const dropdownButtons = computed(() => list.value.slice(defProps.visibleButtons));

  // 点击外部关闭
  onClickOutside(popoverRef, () => {
    popoverVisible.value = false;
  });
</script>
<style lang="scss" scoped>
  .btn-wrap {
    display: flex;
    align-items: center;
    // padding: 0 8px;
  }

  .btn-more {
    width: 60px;
    color: #026ac8;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
  }

  .more-list {
    display: flex;
    flex-direction: column;
  }

  .gct-default {
    display: block;

    :deep(.van-button--default) {
      height: var(--van-button-default-height);
      padding: var(--van-button-normal-padding);
      border: none;
      font-size: var(--van-button-normal-font-size);
    }
  }

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
          display: none;
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
