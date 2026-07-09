import { watch } from 'vue';
import type { Ref } from 'vue';

export function useDragX(container: Ref<HTMLElement | null>, content: Ref<HTMLElement | null>) {
  const distX = ref<number>(0);
  let fromX: number = 0;
  let lastX: number = 0;

  const onTouchStart = (e) => {
    fromX = e.touches[0].clientX;
    lastX = distX.value;
    console.log('touch fromX', fromX);
    e.stopPropagation();
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  };

  const onTouchMove = (e) => {
    const toX = e.touches[0].clientX;
    distX.value = lastX + toX - fromX;
    e.stopPropagation();
  };

  const onTouchEnd = () => {
    const innerSize = content.value!.getBoundingClientRect().width;
    const outerSize = container.value!.getBoundingClientRect().width;
    if (innerSize <= outerSize) {
      distX.value = 0;
    } else if (distX.value > 0) {
      distX.value = 0;
    } else if (distX.value < outerSize - innerSize) {
      distX.value = outerSize - innerSize;
    }
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };

  watch(
    container,
    (val) => {
      if (!val) return;
      val.addEventListener('touchstart', onTouchStart);
    },
    {
      immediate: true,
    },
  );

  return {
    distX,
  };
}
