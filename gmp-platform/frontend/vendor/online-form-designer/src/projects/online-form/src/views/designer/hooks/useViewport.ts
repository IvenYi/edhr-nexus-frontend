import { ref } from 'vue';

const scrollX = ref<number>(0);
const scrollY = ref<number>(0);

export function useViewport() {
  function updateScrollY(y: number) {
    scrollY.value = y;
  }

  function updateScrollX(x: number) {
    scrollX.value = x;
  }

  return {
    scrollY,
    updateScrollY,
    scrollX,
    updateScrollX,
  };
}
