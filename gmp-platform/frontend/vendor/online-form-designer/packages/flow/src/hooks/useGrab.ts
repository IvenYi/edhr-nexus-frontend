import { ref } from 'vue';

/**
 * 抓取拖拽
 * @returns
 */
export function useGrab() {
  /**
   * 拖拽状态
   */
  const isGrabbing = ref<boolean>(false);

  /**
   * 拖拽监听器
   * @param ele
   */
  function grabListener(ele: HTMLElement) {
    ele.addEventListener('mousedown', (e) => {
      e.preventDefault();

      if (e.button !== 0) return;
      const posElement = ele.querySelector('.gct-flow--transform');
      if (!posElement) return;

      isGrabbing.value = true;

      // @ts-ignore
      const left = posElement.offsetLeft;
      // @ts-ignore
      const top = posElement.offsetTop;

      const x1 = e.clientX;
      const y1 = e.clientY;

      function onMouseMove(e2) {
        const x2 = e2.clientX;
        const y2 = e2.clientY;

        // @ts-ignore
        posElement.style.left = x2 - x1 + left + 'px';
        // @ts-ignore
        posElement.style.top = y2 - y1 + top + 'px';
      }

      // 鼠标松开事件
      function onMouseUp() {
        // 移除鼠标移动和松开事件监听
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        isGrabbing.value = false;
      }

      // 添加鼠标移动和松开事件监听
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // 支持移动端touch事件
    ele.addEventListener('touchstart', (e) => {
      const posElement = ele.querySelector('.gct-flow--transform');
      if (!posElement) return;

      isGrabbing.value = true;

      // @ts-ignore
      const left = posElement.offsetLeft;
      // @ts-ignore
      const top = posElement.offsetTop;

      const x1 = e.touches[0]?.clientX;
      const y1 = e.touches[0]?.clientY;

      function onTouchMove(e2) {
        const x2 = e2.touches[0]?.clientX;
        const y2 = e2.touches[0]?.clientY;

        // @ts-ignore
        posElement.style.left = x2 - x1 + left + 'px';
        // @ts-ignore
        posElement.style.top = y2 - y1 + top + 'px';
      }

      // 鼠标松开事件
      function onToucnEnd() {
        // 移除鼠标移动和松开事件监听
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onToucnEnd);
        isGrabbing.value = false;
      }

      // 添加鼠标移动和松开事件监听
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onToucnEnd);
    });
  }

  return { grabListener, isGrabbing };
}
