<template>
  <div ref="domRef" class="drag-placeholder"></div>
</template>

<script lang="ts" setup name="drag-placeholder">
  import { reactive, computed, watch, onMounted, ref } from 'vue';

  const props = withDefaults(
    defineProps<{
      draggable?: boolean;
      wrapperClass?: string;
    }>(),
    {
      draggable: false,
      wrapperClass: 'ant-modal-wrap',
    },
  );

  const domRef = ref<HTMLElement>();

  function findParent(el: HTMLElement, className: string) {
    let parent = el.parentElement;
    while (parent) {
      if (parent.classList.contains(className)) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  const drag = (wrap: any) => {
    if (!wrap) return;
    const dialogHeaderEl = wrap.querySelector('.ant-modal-header');
    const dragDom = wrap.querySelector('.ant-modal');

    if (!dialogHeaderEl || !dragDom) return;

    dialogHeaderEl.style.cursor = 'move';

    const getStyle = (dom: any, attr: any) => {
      return getComputedStyle(dom)[attr];
    };

    dialogHeaderEl.onmousedown = (e: any) => {
      if (!e) return;
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX;
      const disY = e.clientY;
      const screenWidth = document.body.clientWidth; // body当前宽度
      const screenHeight = document.documentElement.clientHeight; // 可见区域高度(应为body高度，可某些环境下无法获取)

      const dragDomWidth = dragDom.offsetWidth; // 对话框宽度
      const dragDomheight = dragDom.offsetHeight; // 对话框高度

      const minDragDomLeft = dragDom.offsetLeft;

      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth;
      const minDragDomTop = dragDom.offsetTop;
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomheight;
      // 获取到的值带px 正则匹配替换
      const domLeft = getStyle(dragDom, 'left');
      const domTop = getStyle(dragDom, 'top');
      let styL = +domLeft;
      let styT = +domTop;

      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (domLeft.includes('%')) {
        styL = +document.body.clientWidth * (+domLeft.replace(/%/g, '') / 100);
        styT = +document.body.clientHeight * (+domTop.replace(/%/g, '') / 100);
      } else {
        styL = +domLeft.replace(/px/g, '');
        styT = +domTop.replace(/px/g, '');
      }

      document.onmousemove = function (e) {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX;
        let top = e.clientY - disY;

        // 边界处理
        if (-left > minDragDomLeft) {
          left = -minDragDomLeft;
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft;
        }

        if (-top > minDragDomTop) {
          top = -minDragDomTop;
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop;
        }

        // 移动当前元素
        dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`;
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  };

  const init = (el: HTMLElement) => {
    if (!props.draggable) {
      return;
    }
    const wrapDom = findParent(el, props.wrapperClass);
    if (!wrapDom) {
      console.warn('未找到父元素');
      return;
    }
    drag(wrapDom);
  };

  watch(domRef, (el) => {
    if (el) {
      init(el);
    }
  });
</script>

<style lang="less" scoped>
  .drag-placeholder {
    display: none;
  }
</style>
