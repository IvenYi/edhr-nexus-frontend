<template>
  <div class="btn-wrap">
    <div class="ks-col" :class="{ ml8px: !!i }" v-for="(el, i) in showBtnList" :key="el.id">
      <vantButtonDesign
        :widget="el"
        :parentWidget="parentWidget"
        :parentList="children"
        block
        :key="el.id"
      />
    </div>
    <!-- more button -->
    <van-popover
      v-if="isExistDropdownButtons"
      ref="popoverRef"
      v-model:show="popoverVisible"
      placement="bottom-end"
      class="collapsable-button-popover rounded-xl"
      :duration="0"
      :showArrow="false"
    >
      <!-- collpase button -->
      <template #reference>
        <div class="ml8px flex items-center">
          <div v-show="dropdownButtons.length" class="collapsable-button-container">
            <vantButtonDesign
              :parentList="children"
              :parentWidget="parentWidget"
              :widget="collpaseBtn[0]"
              :key="collpaseBtn[0].id"
              block
            />
          </div>
          <MoreButton v-bind="collpaseBtn[0].props" />
        </div>
      </template>
      <!-- button list -->
      <div class="more-list" ref="popoverContentRef">
        <vantButtonDesign
          :parentList="children"
          :parentWidget="parentWidget"
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
  import { computed, ref, watch } from 'vue';
  import vantButtonDesign from './button-design.vue';
  import { BaseButton } from '/@/projects/page-designer/src/types/mobile';
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
    parentWidget: {
      type: Object,
    },
  });
  const isExistDropdownButtons = computed(() => defProps.children.length > defProps.visibleButtons);
  const popoverVisible = ref(false);

  const popoverRef = ref(null);

  const popoverContentRef = ref(null);

  /** 不折叠按钮 */
  const showBtnList = computed(() =>
    defProps.children.slice(
      0,
      isExistDropdownButtons.value ? defProps.visibleButtons - 1 : defProps.visibleButtons,
    ),
  );

  /** 折叠按钮 */
  const collpaseBtn = computed(() =>
    defProps.children.slice(defProps.visibleButtons - 1, defProps.visibleButtons),
  );

  /** 下拉按钮 */
  const dropdownButtons = computed(() => defProps.children.slice(defProps.visibleButtons));

  // 点击外部关闭
  onClickOutside(
    () => {
      popoverVisible.value = false;
    },
    {
      ignore: [popoverContentRef, '.gct-designer-view-content__panel'], // 忽略这个元素的点击
    },
  );
</script>
<style lang="scss" scoped>
  .btn-wrap {
    display: flex;
    align-items: center;
    padding: 0 8px;
  }

  .btn-more {
    width: 60px;
    color: #026ac8;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
  }

  .more-list {
    --van-button-primary-color: #{getCssVar('color-text', 1)};
  }

  .gct-default {
    :deep(.van-button--default) {
      height: var(--van-button-default-height);
      padding: var(--van-button-normal-padding);
      border: none;
      font-size: var(--van-button-normal-font-size);
    }
  }

  :deep(.van-button) {
    .van-button__text {
      white-space: wrap;
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
<style>
  .gct-van-design-popup {
    position: absolute !important;
    transition: none;
  }
</style>
