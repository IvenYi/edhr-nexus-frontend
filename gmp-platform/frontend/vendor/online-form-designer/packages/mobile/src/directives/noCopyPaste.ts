import type { App } from 'vue';

export const NoCopyPaste = {
  mounted(el, binding) {
    const input = el.querySelector('input') || el;
    // 禁止粘贴
    input.addEventListener('paste', (e) => {
      e.preventDefault();
    });

    // 禁止复制
    input.addEventListener('copy', (e) => {
      e.preventDefault();
    });

    // 禁止剪切
    input.addEventListener('cut', (e) => {
      e.preventDefault();
    });

    input.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  },
};

export function setupNoCopyPasteDirective(app: App) {
  app.directive('no-copy-paste', NoCopyPaste);
}
