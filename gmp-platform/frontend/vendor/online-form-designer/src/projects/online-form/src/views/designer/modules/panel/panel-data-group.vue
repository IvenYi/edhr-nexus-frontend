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
        <form-item>
          <template #label>
            {{ $t('sys.onlineForm.referenceFilling') }}
            <span class="readonly-text">（{{ $t('sys.onlineForm.fillFixedTable') }}）</span>
          </template>
          <div class="flex justify-end">
            <a-switch size="small" :disabled="sheetReadonly" v-model:checked="table!.autoFill" />
          </div>
        </form-item>

        <form-item :label="$t('sys.onlineForm.fillingDirection')" :inline="false" class="">
          <SelectEx
            show-mode="icon-label"
            icon-type="custom"
            style-type="buttons"
            :disabled="sheetReadonly"
            class="w-full"
            :options="[
              { label: $t('sys.onlineForm.horizontalFilling'), value: 'x' },
              { label: $t('sys.onlineForm.verticalFilling'), value: 'y' },
            ]"
            v-model:value="table!.fillDirection"
          />
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
        <form-item :label="$t('sys.onlineForm.dataGroupingCell')" :inline="false">
          <template #label>
            {{ $t('sys.onlineForm.dataGroupingCell') }}
            <span
              v-if="!sheetReadonly"
              class="color-[#F54547] float-right cursor-pointer"
              @click="handleRemoveDataGroup"
              >{{ $t('sys.onlineForm.deleteDataGrouping') }}</span
            >
          </template>
          <CellsDrop
            :cells="cells"
            :transferTypes="[TransferType.Field, TransferType.Widget]"
            :show-auto-merge="table.fillDirection === 'y'"
          />
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
  import type { ICell } from '/@online-form/views/designer/types';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { PanelType } from '/@online-form/views/designer/enums';
  import { TransferType } from '../base/drag/use-drop';
  import CellsDrop from '../base/drag/cells-drop.vue';

  interface Cell {
    name: string;
    x: number;
    y: number;
    cell: ICell;
  }

  const { paper, panelData, sheetReadonly, setPanelData, removeDataGroup } = useSpreadSheet();

  const activeCollapse = ref(['1', '2', '3']);

  const table = computed(() => {
    return paper.value!.fixedTables!.find((item) => item.id === panelData.refId)!;
  });

  const colCount = computed(() => {
    return table.value.dgRange!.r - table.value.dgRange!.l + 1;
  });

  const rowCount = computed(() => {
    return table.value.dgRange!.b - table.value.dgRange!.t + 1;
  });

  const handleRemoveDataGroup = () => {
    if (table.value?.dgRange) {
      removeDataGroup(table.value);
      //回退到 固定表
      setPanelData({
        type: PanelType.FixedTable,
        refId: panelData.refId,
      });
    }
  };

  const groupRange = computed(() => {
    if (!table.value) return;
    const { t, l, r, b } = table.value.dgRange!;
    return `${num2Col(l)}${t}:  ${num2Col(r)}${b}`;
  });

  const cells = computed(() => {
    const cells: Cell[] = [];
    if (!table.value) return [];
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
              const cell = paper.value.cells[y - 1][x - 1];
              cell.fillDirection = table.value.fillDirection;
              cells.push({
                x,
                y,
                name: `${NumColMap[x]}${y}`,
                cell,
              });
            }
          });
      });
    return cells;
  });
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
