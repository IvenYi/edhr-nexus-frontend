import { App, Directive } from 'vue';
import hljs from 'highlight.js/lib/core';

export function setupHighlightDirective(app: App) {
  // 自定义命令v-highlight
  app.directive('highlight', function (el) {
    const blocks = el.querySelectorAll('pre code');
    blocks.forEach((block) => {
      hljs.highlightElement(block);
    });
  });
}
