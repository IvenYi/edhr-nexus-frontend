<template>
  <div class="panel-fixed-table">
    <a-collapse
      class="override"
      v-model:activeKey="activeCollapse"
      ghost
      expandIconPosition="right"
    >
      <a-collapse-panel key="1" :header="$t('sys.designView.form.baseAttribute')">
        <form-item :label="$t('sys.onlineForm.cell')">
          <span class="readonly-text">{{ `${cellRangeStr.from}:  ${cellRangeStr.to}` }}</span>
          <span
            v-if="!sheetReadonly"
            class="color-[#F54547] cursor-pointer float-right"
            @click="removeTable"
          >
            {{ $t('sys.onlineForm.deleteFixedTable') }}
          </span>
        </form-item>
        <form-item :label="$t('sys.onlineForm.fixedTableName')">
          <span class="readonly-text">{{ table?.name }}</span>
        </form-item>
        <form-item :label="$t('sys.onlineForm.modelOfFixedTable')">
          <span class="readonly-text">{{ modelName }}</span>
        </form-item>
        <a-row>
          <a-col :span="12">
            <form-item :label="$t('sys.onlineForm.numberOfRows')">
              <span class="readonly-text">{{ rowCount }}</span>
            </form-item>
          </a-col>
          <a-col :span="12">
            <form-item :label="$t('sys.onlineForm.numberOfColumns')">
              <span class="readonly-text">{{ colCount }}</span>
            </form-item>
          </a-col>
        </a-row>

        <div class="mt-12px text-12px color-[#252525]">
          {{ $t('sys.onlineForm.currentlyFixed') }}
          <span class="color-[#3168EC]">{{ validCellCount }}</span>
          {{ $t('sys.onlineForm.cells') }}
        </div>

        <form-item
          v-if="cells.length"
          :label="$t('sys.onlineForm.dataGroupingCell')"
          :inline="false"
        >
          <template #extra>
            <span
              v-if="!sheetReadonly"
              class="color-[#F54547] cursor-pointer"
              @click="handleRemoveDataGroup"
            >
              {{ $t('sys.onlineForm.deleteDataGrouping') }}
            </span>
          </template>
          <CellsDrop :cells="cells" :transferTypes="[TransferType.Field, TransferType.Widget]" />
        </form-item>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { ref, computed } from 'vue';
  import { NumColMap } from '/@online-form/views/designer/constants';
  import { isOverlap, num2Col } from '/@online-form/views/designer/utils';
  import { TransferType } from '../base/drag/use-drop';
  import CellsDrop from '../base/drag/cells-drop.vue';

  import type { ICell } from '/@online-form/views/designer/types';
  import { PanelType } from '../../enums';

  interface Cell {
    name: string;
    x: number;
    y: number;
    cell: ICell;
  }

  const { paper, panelData, sheetReadonly, removeSubTable, removeDataGroup, setPanelData } =
    useSpreadSheet();
  const { modelMetaMap } = useModelFields();

  const activeCollapse = ref(['1', '2', '3']);

  const table = computed(() => {
    return paper.value.fixedTables!.find((item) => item.id === panelData.refId)!;
  });

  const modelName = computed(() => {
    if (!table.value.model) return;
    return modelMetaMap.value[table.value.model]?.meta.name;
  });

  const colCount = computed(() => {
    return table.value.range.r - table.value.range.l + 1;
  });

  const rowCount = computed(() => {
    return table.value.range.b - table.value.range.t + 1;
  });

  const validCellCount = computed(() => {
    const mergedCells = paper.value.mergedCells.filter((item) =>
      isOverlap(item, table.value?.range),
    );
    const mergedCellsCount = mergedCells.reduce((total, item) => {
      total += (item.b - item.t + 1) * (item.r - item.l + 1);
      return total;
    }, 0);
    return colCount.value * rowCount.value - mergedCellsCount + mergedCells.length;
  });

  const cellRangeStr = computed(() => {
    const { t, l, r, b } = table.value.range;
    return {
      from: `${num2Col(l)}${t}`,
      to: `${num2Col(r)}${b}`,
    };
  });

  const cells = computed(() => {
    const cells: Cell[] = [];
    if (!table.value || !table.value.dgRange) return [];

    const { t, l, r, b } = table.value.dgRange!;
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

  const removeTable = () => {
    removeSubTable(table.value!);
    setPanelData({ type: PanelType.Paper });
  };

  const handleRemoveDataGroup = () => {
    removeDataGroup(table.value);
  };
</script>

<style lang="less" scoped>
  .panel-fixed-table {
    :deep(.ant-form-item-control-input) {
      min-height: unset;
      line-height: 18px;
    }
    .readonly-text {
      margin-left: 6px;
      color: #666666;
      font-size: 12px;
      white-space: break-spaces;
    }
  }
</style>
