import type { App, DirectiveBinding } from 'vue';

type EllipsisTitleElement = HTMLElement & {
  __ellipsisHandler__?: () => void;
  __ellipsisTitleValue__?: string;
};

function normalizeTitle(value: unknown): string {
  return value == null ? '' : String(value);
}

function applyEllipsisTitle(el: EllipsisTitleElement): void {
  // 检测内容是否溢出
  const isOverflowing = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
  const title = el.__ellipsisTitleValue__ ?? '';

  if (isOverflowing && title) {
    el.setAttribute('title', title);
  } else {
    el.removeAttribute('title');
  }
}

export const EllipsisTitle = {
  mounted(el: EllipsisTitleElement, binding: DirectiveBinding<unknown>) {
    el.__ellipsisTitleValue__ = normalizeTitle(binding.value);
    el.__ellipsisHandler__ = () => {
      applyEllipsisTitle(el);
    };

    el.addEventListener('mouseenter', el.__ellipsisHandler__);
  },
  updated(el: EllipsisTitleElement, binding: DirectiveBinding<unknown>) {
    el.__ellipsisTitleValue__ = normalizeTitle(binding.value);
    applyEllipsisTitle(el);
  },
  beforeUnmount(el: EllipsisTitleElement) {
    // 清理事件监听
    if (el.__ellipsisHandler__) {
      el.removeEventListener('mouseenter', el.__ellipsisHandler__);
    }
    delete el.__ellipsisHandler__;
    delete el.__ellipsisTitleValue__;
  },
};

/**内容溢出出现title */
export function setupEllipsisTitleDirective(app: App) {
  app.directive('ellipsis-title', EllipsisTitle);
}
