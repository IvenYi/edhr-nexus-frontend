<template>
  <div class="">
    <div
      :style="{
        'padding-left': `calc(${paper.padding.l}mm + var(--gap-left))`,
        transform: `translateX(${scrollX * -1}px)`,
      }"
    >
      <context-menu type="x">
        <table ref="PaperXTableRef" cellpadding="0" cellspacing="0">
          <colgroup>
            <col
              v-for="(col, colIndex) in paper.cols"
              :key="colIndex + 1"
              :data-x="colIndex + 1"
              :width="col.width"
            />
          </colgroup>
          <thead>
            <tr>
              <td
                v-for="(col, colIndex) in paper.cols"
                :key="colIndex + 1"
                :class="{
                  highlight: isSelected(colIndex + 1),
                }"
                :data-x="colIndex + 1"
                @mousedown="handleClick"
              >
                <div class="title-x">{{ NumColMap[colIndex + 1] }}</div>
                <div class="resize-x" @mousedown.stop="resizeCol"></div>
              </td>
            </tr>
          </thead>
        </table>
      </context-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { NumColMap } from '/@online-form/views/designer/constants';
  import ContextMenu from '/@online-form/views/designer/modules/base/context-menu.vue';
  import { useViewport } from '/@online-form/views/designer/hooks/useViewport';

  const { paper, selection, resizeCol, selectCol } = useSpreadSheet();
  const { scrollX } = useViewport();
  const isSelected = (colNum: number) => {
    return colNum >= selection.l && colNum <= selection.r;
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();

    let currentCell = e.currentTarget as HTMLElement;
    const x1 = Number(currentCell.dataset.x);

    // 右键点击已经选中的列，时不会变更选中
    if (e.button === 2 && isSelected(x1)) {
      return;
    }

    // 先选中点击的列
    selectCol(x1);

    function handleMouseMove(e2) {
      if (e2.target === currentCell) return;
      const pathList = e2.path || (e2.composedPath && e2.composedPath());
      const node = pathList.find((path) => path?.nodeName === 'TD');
      if (!node) return;

      currentCell = node;
      const x2 = Number(node.dataset.x);

      if (Number.isNaN(x2)) return;

      selectCol(Math.min(x1, x2), Math.max(x1, x2));
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    // 鼠标左击才监听拖拽
    if (e.button === 0) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };
</script>

<style></style>
