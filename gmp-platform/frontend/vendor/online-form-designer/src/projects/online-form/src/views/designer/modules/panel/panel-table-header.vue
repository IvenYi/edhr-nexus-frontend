<template>
  <div class="panel-data-group">
    <a-collapse
      class="override"
      v-model:activeKey="activeCollapse"
      ghost
      expandIconPosition="right"
    >
      <a-collapse-panel key="1" :header="$t('sys.designView.form.baseAttribute')">
        <form-item :label="$t('sys.onlineForm.cell')">
          <span class="readonly-text">{{ groupRange }}</span>
        </form-item>
        <form-item :label="$t('sys.onlineForm.renderingMethod')">
          <span class="ml-8px color-[#666] font-bold">
            {{ theadMap.name }}
          </span>
        </form-item>

        <form-item :label="$t('sys.onlineForm.headerCellContent')" :inline="false">
          <template #extra>
            <span
              v-if="!sheetReadonly"
              class="color-[#F54547] cursor-pointer"
              @click="removeHeader"
            >
              {{ $t('sys.onlineForm.deleteHeader') }}
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
  import { ref, computed } from 'vue';
  import { NumColMap } from '/@online-form/views/designer/constants';
  import { num2Col } from '/@online-form/views/designer/utils';
  import type { ICell, IFixedTable, ITable } from '/@online-form/views/designer/types';
  import { TransferType } from '../base/drag/use-drop';
  import CellsDrop from '../base/drag/cells-drop.vue';
  import { PanelType } from '../../enums';

  interface Cell {
    name: string;
    x: number;
    y: number;
    cell: ICell;
  }

  const { paper, panelData, sheetReadonly, removeThead, setPanelData } = useSpreadSheet();

  const activeCollapse = ref(['1', '2', '3']);

  const theadMap = computed(() => {
    if (panelData.refId) {
      const fixedObj = paper.value.fixedTables?.find((item) => item.id === panelData.refId);

      if (fixedObj) {
        return {
          thRange: fixedObj?.thRange,
          name: $t('sys.onlineForm.subTableType.FIXED'),
        };
      }
      const dynObj = paper.value.dynamicTables?.find((item) => item.id === panelData.refId);
      if (dynObj) {
        return {
          thRange: dynObj?.thRange,
          name: $t('sys.onlineForm.subTableType.DEFAULT'),
        };
      }
    }
    return {
      thRange: paper.value.thead?.thRange,
      name: $t('sys.appDesigner.global'),
    };
  });

  const groupRange = computed(() => {
    if (!theadMap.value.thRange) return;
    const { t, l, r, b } = theadMap.value.thRange;
    return `${num2Col(l)}${t}:  ${num2Col(r)}${b}`;
  });

  const cells = computed(() => {
    const cells: Cell[] = [];
    if (!theadMap.value.thRange) return [];
    const { t, l, r, b } = theadMap.value.thRange;
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

  const removeHeader = () => {
    if (panelData.refId) {
      let tableObj: ITable | IFixedTable | undefined;
      tableObj = paper.value.fixedTables?.find((item) => item.id === panelData.refId);

      if (!tableObj) {
        tableObj = paper.value.dynamicTables?.find((item) => item.id === panelData.refId);
      }
      removeThead(tableObj);
    } else {
      removeThead();
    }
    setPanelData({ type: PanelType.Paper });
  };
</script>

<style lang="less" scoped>
  .panel-data-group {
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
