const eventTypes = ['click', 'touchstart', 'mousedown', 'mouseup', 'wheel', 'pointerup', 'pointerdown'] as const;

/**
 * 拦截并销毁接下来的一系列用到的 Event 事件
 * 用于解决 pointerup/touchstart 触发 UI 更新后，随后的幽灵 Event 导致的意外触发
 *
 * @export
 * @param {number} [timeout=300] 拦截的最长有效期，默认 300ms
 */
export function suppressNextEvent(timeout = 300): void {
  const killEvent = (e: Event) => {
    // 阻止冒泡和默认行为
    e.stopImmediatePropagation();
    e.preventDefault();

    // 成功拦截后立即移除自己
    window.removeEventListener(e.type as keyof WindowEventMap, killEvent, true);
  };

  eventTypes.forEach((type) => {
    window.addEventListener(type, killEvent, true);
  });

  // 如果在规定时间内没有 click 触发（可能浏览器没派发），也需要释放监听器
  setTimeout(() => {
    eventTypes.forEach((type) => {
      window.removeEventListener(type, killEvent, true);
    });
  }, timeout);
}
