<template>
  <div class="panel-cell">
    <a-collapse
      class="override"
      v-model:activeKey="activeCollapse"
      ghost
      expandIconPosition="right"
    >
      <a-collapse-panel key="1" :header="$t('sys.designView.form.baseAttribute')">
        <form-item :label="$t('sys.onlineForm.cell')" class="important-mt-0">
          <span class="pl-4px font-500">
            {{ currentMultiCells?.from }}:{{ currentMultiCells?.to }}</span
          >
        </form-item>
        <form-item :label="$t('sys.onlineForm.cellContent')" :inline="false">
          <CellsDrop
            :cells="cells"
            :transferTypes="[TransferType.Field, TransferType.Widget]"
            :isFreeCombination="true"
          />
        </form-item>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { TransferType } from '../base/drag/use-drop';
  import CellsDrop from '../base/drag/cells-drop.vue';
  import { NumColMap } from '/@online-form/views/designer/constants';
  import type { ICell } from '/@online-form/views/designer/types';

  interface Cell {
    name: string;
    x: number;
    y: number;
    cell: ICell;
  }

  const activeCollapse = ref(['1', '2', '3', '4', '5']);

  const { paper, currentMultiCells } = useSpreadSheet();

  const cells = computed(() => {
    const cells: Cell[] = [];
    if (!currentMultiCells.value) return [];
    const { t, l, r, b } = currentMultiCells.value.range;
    Array(b - t + 1)
      .fill('')
      .forEach((m, i) => {
        Array(r - l + 1)
          .fill('')
          .forEach((n, j) => {
            const x = l + j;
            const y = t + i;

            const mc = (paper.value.mergedCells ?? []).find(
              (e) => e.t <= y && e.b >= y && e.l <= x && e.r >= x,
            );
            const mcTl = mc?.t === y && mc.l === x;

            if (!mc || (mc && mcTl)) {
              cells.push({
                x,
                y,
                name: `${NumColMap[x]}${y}`,
                cell: paper.value.cells[y - 1][x - 1],
              });
            }
          });
      });
    return cells;
  });
</script>

<style lang="less" scoped></style>
