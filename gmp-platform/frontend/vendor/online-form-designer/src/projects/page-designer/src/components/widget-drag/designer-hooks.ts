import { useElementBounding, useMutationObserver, watchOnce } from '@vueuse/core';
import {
  defineComponent,
  computed,
  ref,
  watch,
  unref,
  nextTick,
  onUnmounted,
  onMounted,
} from 'vue';
/**
 * 悬浮公共
 * @param param0 rootRef 组件dom   positionRef可视组件
 * @returns
 */
export function useSuspensionBar({ rootRef, positionRef }) {
  const hidden = ref(false);
  const { top, right, update } = useElementBounding(rootRef);
  useMutationObserver(
    rootRef,
    () => {
      update();
    },
    {
      attributes: true,
    },
  );

  async function readyIntersectionObserver() {
    await nextTick();
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(async (entry) => {
        hidden.value = !entry.isIntersecting;
      });
    });
    observer.observe(unref(positionRef));
    onUnmounted(() => {
      observer.disconnect();
    });
  }

  return {
    top,
    right,
    update,
    readyIntersectionObserver,
    hidden,
  };
}

/**更条件匹配父节点 */
function getScrollParentByCallback(element) {
  while (element) {
    if (element.role === 'gct-design-modal' && hasVerticalScrollbar(element)) {
      /**模态框内部特殊逻辑 */
      return element;
    }
    element = element.parentNode;
  }
  return document.body;
}

/**动态识别是否有滚动条 */
function hasVerticalScrollbar(element) {
  return element.scrollHeight > element.clientHeight;
}
