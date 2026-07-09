import { ref, watch, Ref } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { debounce } from 'lodash-es';

const INITIAL_WRAPPER_HEIGHT = 360;
const MIN_WRAPPER_HEIGHT = 150; // 最小高度，至少显示一行数据
const POPOVER_PADDING = 16; // Popover 内边距
const SAFE_MARGIN = 16; // 安全边距

export function useWrapperHeight(triggerRef: Ref<any>) {
  const wrapperHeight = ref(INITIAL_WRAPPER_HEIGHT);
  const popoverPlacement = ref<'bottomLeft' | 'topLeft'>('bottomLeft');
  const popoverMaxInnerHeight = INITIAL_WRAPPER_HEIGHT + POPOVER_PADDING * 2 + SAFE_MARGIN;

  const autoAdjustOverflow = ref(document.body.clientHeight > 800);
  const calcAutoAdjustOverflow = debounce(() => {
    autoAdjustOverflow.value = document.body.clientHeight > 800;
  }, 200);

  const { height: windowHeight } = useWindowSize();

  function calculateWrapperHeight() {
    if (!triggerRef.value?.$el) {
      wrapperHeight.value = INITIAL_WRAPPER_HEIGHT;
      popoverPlacement.value = 'bottomLeft';
      return;
    }

    const rect = triggerRef.value.$el.getBoundingClientRect();
    const spaceTop = rect.top;
    const spaceBottom = windowHeight.value - rect.bottom;

    // 优先使用下方空间
    if (spaceBottom >= popoverMaxInnerHeight) {
      wrapperHeight.value = INITIAL_WRAPPER_HEIGHT;
      popoverPlacement.value = 'bottomLeft';
    }
    // 其次尝试上方空间
    else if (spaceTop >= popoverMaxInnerHeight) {
      wrapperHeight.value = INITIAL_WRAPPER_HEIGHT;
      popoverPlacement.value = 'topLeft';
    }
    // 上下都不够，选择空间较大的一侧并使用压缩高度
    else {
      const useBottom = spaceBottom >= spaceTop;
      const availableSpace = useBottom ? spaceBottom : spaceTop;

      // 减去安全边距和 Popover 的额外空间
      wrapperHeight.value = Math.max(
        availableSpace - POPOVER_PADDING * 2 - SAFE_MARGIN,
        MIN_WRAPPER_HEIGHT,
      );

      popoverPlacement.value = useBottom ? 'bottomLeft' : 'topLeft';
    }
    console.log('[Wrapper Height]', {
      calculated: wrapperHeight.value,
      spaceBottom,
      spaceTop,
      placement: popoverPlacement.value,
    });
  }

  const debouncedCalculate = debounce(calculateWrapperHeight, 100);

  watch(windowHeight, () => {
    if (triggerRef.value?.$el) {
      debouncedCalculate();
      calcAutoAdjustOverflow();
    }
  });
  return {
    autoAdjustOverflow,
    wrapperHeight,
    popoverPlacement,
    calculateWrapperHeight,
  };
}
