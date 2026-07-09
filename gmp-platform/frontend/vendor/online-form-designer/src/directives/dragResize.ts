import { App, Directive } from 'vue';

const dragResizeDirective: Directive = {
  mounted(el, binding) {
    if (!binding.value) return false;
    binding.instance?.$nextTick(() => {
      const minWidth = binding.value;
      const dragDom = el as HTMLDivElement;
      const resizeElL = document.createElement('div');
      dragDom.appendChild(resizeElL);
      resizeElL.style.cursor = 'col-resize';
      resizeElL.style.position = 'absolute';
      resizeElL.style.height = '100%';
      resizeElL.style.width = '5px';
      resizeElL.style.right = '0px';
      resizeElL.style.top = '0px';
      resizeElL.style.background = 'rgba(255, 0, 0, 0);';
      resizeElL.onmousedown = (e) => {
        const elW = dragDom.clientWidth;
        const clientX = e.clientX;
        document.onmousemove = function (e) {
          e.preventDefault();
          const l = e.clientX - clientX;
          let nw = elW + l;
          nw = nw < minWidth ? minWidth : nw;
          dragDom.setAttribute('style', `width:${nw}px !important;`);
          // 触发自定义事件 - 调整大小过程中
          const resizeEvent = new CustomEvent('drag-resize-width', {
            detail: { width: nw, resizing: true },
          });
          el.dispatchEvent(resizeEvent);
        };
        // 拉伸结束
        document.onmouseup = function (e) {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    });
  },
};

export function setupdragResizeDirective(app: App) {
  app.directive('dragResize', dragResizeDirective);
}

export default dragResizeDirective;
