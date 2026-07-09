<template>
  <van-popover
    v-model:show="show"
    placement="bottom-end"
    teleport="body"
    class="pad-search-more-option-popover"
    :actions="columns"
    @select="onSelect"
    v-if="!!moreOptions?.length"
    trigger="manual"
    @mouseenter="handlePopoverMouseEnter"
    @mouseleave="handlePopoverMouseLeave"
  >
    <template #reference>
      <div class="pad-search-more-option-reference" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <van-button
          type="default"
          size="small"
          class="ml6px"
          :class="{ checkedMoreOption: !!useMore, more_button: true }"
          @click="handleButtonClick"
        >
          <span class="gct-iconfont icon-shaixuan-Pad"></span>
        </van-button>
      </div>
    </template>
    <template #action="{ action }">
      <div :class="{ 'primary-gct ': action.value === useMore }" class="ks-row-middle w100%">
        <div class="ks-col"> {{ action.text }}</div>
        <van-icon name="success" class="text-18px primary-color" v-if="action.value === useMore" />
      </div>
    </template>
  </van-popover>
</template>

<script setup lang="ts" name="gct-timepicker">
  import { ref, computed, watch } from 'vue';
  import { useEventListener, useWindowSize, watchDebounced } from '@vueuse/core';
  import { useI18n } from '@mobile/utils/useI18n';
  import { SEARCH_TYPE } from '/@page-designer/schema/common';

  const { t } = useI18n();

  const props = defineProps<{ useMore; moreOptions; ope; fieldType }>();

  const emit = defineEmits(['update:ope', 'update:useMore', 'change', 'clear']);

  const show = ref(false);
  const isFixed = ref(false);
  const isHoveringPopover = ref(false);
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;

  // 监听滚动和窗口大小变化，关闭 popover
  const closePopover = () => {
    if (show.value) {
      show.value = false;
      isFixed.value = false;
      isHoveringPopover.value = false;
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
    }
  };

  // 使用 @vueuse/core 监听滚动事件
  useEventListener(window, 'scroll', closePopover, { capture: true });

  // 使用 @vueuse/core 监听窗口大小变化
  const { width, height } = useWindowSize();
  watchDebounced([width, height], closePopover, { debounce: 100 });

  const columns = computed(() => {
    return props.moreOptions.map((key) => {
      return {
        text: t(`sys.model.${key}`),
        value: key,
      };
    });
  });

  const handleMouseEnter = () => {
    if (isFixed.value) return; // 已固定状态不响应hover
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      show.value = true;
    }, 200);
  };

  const handleMouseLeave = () => {
    if (isFixed.value) return; // 已固定状态不响应hover
    if (hoverTimer) clearTimeout(hoverTimer);
    // 延迟检查是否进入了popover区域
    hoverTimer = setTimeout(() => {
      if (!isHoveringPopover.value) {
        show.value = false;
      }
    }, 200);
  };

  const handlePopoverMouseEnter = () => {
    isHoveringPopover.value = true;
    if (hoverTimer) clearTimeout(hoverTimer);
  };

  const handlePopoverMouseLeave = () => {
    isHoveringPopover.value = false;
    if (isFixed.value) return; // 已固定状态不收起
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      show.value = false;
    }, 200);
  };

  const handleButtonClick = () => {
    if (isFixed.value) {
      // 已固定状态下点击，收起popover并取消固定
      show.value = false;
      isFixed.value = false;
    } else {
      // 未固定状态下点击，固定popover
      show.value = true;
      isFixed.value = true;
    }
  };

  const onSelect = (action) => {
    if (props.useMore === action.value) {
      emit('update:ope', [...(SEARCH_TYPE[props.fieldType!].default || [])]);
      emit('update:useMore', '');
    } else {
      emit('update:ope', [action.value]);
      emit('update:useMore', action.value);
      emit('clear');
    }
    emit('change');
    // 选择完成后收起popover并取消固定
    show.value = false;
    isFixed.value = false;
    isHoveringPopover.value = false;
  };
</script>
<style scoped lang="less">
  .pad-search-more-option-reference {
    display: inline-block;
    transform: translateY(-1px);
  }

  .more_button {
    border-color: var(--gct-color-border);

    &:hover {
      background-color: var(--gct-color-bg-3);
    }
  }
  .checkedMoreOption {
    background: hsl(from var(--van-primary-color) h s 96%);
    color: var(--van-primary-color);
  }
</style>
