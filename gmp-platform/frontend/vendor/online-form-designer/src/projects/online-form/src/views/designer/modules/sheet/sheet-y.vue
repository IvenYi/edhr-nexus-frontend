<template>
  <div>
    <div
      :style="{
        'padding-top': `calc(${paper.padding.t}mm + var(--gap-top))`,
        transform: `translateY(${scrollY * -1}px)`,
      }"
    >
      <context-menu type="y">
        <table ref="PaperYTableRef" cellpadding="0" cellspacing="0">
          <tbody>
            <tr
              v-for="(row, rowIndex) in paper.rows"
              :key="rowIndex + 1"
              :data-y="rowIndex + 1"
              :height="row.height"
            >
              <td
                :class="{
                  highlight: isSelected(rowIndex + 1),
                }"
                :data-y="rowIndex + 1"
                @mousedown="handleClick"
              >
                <div class="title-y">{{ rowIndex + 1 }}</div>
                <div class="resize-y" @mousedown.stop="resizeRow"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </context-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import ContextMenu from '/@online-form/views/designer/modules/base/context-menu.vue';
  import { useViewport } from '/@online-form/views/designer/hooks/useViewport';

  const { paper, selection, resizeRow, selectRow } = useSpreadSheet();
  const { scrollY } = useViewport();

  const isSelected = (rowNum: number) => {
    return rowNum >= selection.t && rowNum <= selection.b;
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();

    let currentCell = e.currentTarget as HTMLElement;
    const y1 = Number(currentCell.dataset.y);

    // 右键点击已经选中的列，时不会变更选中
    if (e.button === 2 && isSelected(y1)) {
      return;
    }

    // 先选中点击的列
    selectRow(y1);

    function handleMouseMove(e2) {
      if (e2.target === currentCell) return;
      const pathList = e2.path || (e2.composedPath && e2.composedPath());
      const node = pathList.find((path) => path?.nodeName === 'TD');
      if (!node) return;

      currentCell = node;
      const y2 = Number(node.dataset.y);

      if (Number.isNaN(y2)) return;

      selectRow(Math.min(y1, y2), Math.max(y1, y2));
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
