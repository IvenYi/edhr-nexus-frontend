<template>
  <div class="panel-document">
    <div class="pl-12px pr-12px pt-20px pb-20px">
      <form-item
        :label="$t('sys.onlineForm.dynamicTableName')"
        :inline="false"
        class="important-mt-0"
      >
        <template #extra>
          <span v-if="!sheetReadonly" class="color-[#F54547] cursor-pointer" @click="removeTable">
            {{
              table?.type === SubTableType._2D
                ? $t('sys.onlineForm.deleteTwoDimensionalTable')
                : $t('sys.onlineForm.deleteDynamicTable')
            }}
          </span>
        </template>
        <span class="color-[#212528] text-12px lh-[18px]">{{ table?.name }}</span>
      </form-item>
      <form-item class="mt-16px" :label="$t('sys.onlineForm.modelOfDynamicTable')" :inline="false">
        <span class="color-[#212528] text-12px lh-[18px]">{{ modelName }}</span>
      </form-item>
    </div>

    <a-collapse
      class="override"
      v-model:activeKey="activeCollapse"
      ghost
      expandIconPosition="right"
    >
      <a-collapse-panel
        key="1"
        :header="table?.type === SubTableType._2D ? '二维表单元格' : '动态表单元格'"
      >
        <CellsDrop
          :cells="cells"
          :transferTypes="[TransferType.Field, TransferType.Widget]"
          :showAutoMerge="table?.type !== SubTableType._2D"
        />
      </a-collapse-panel>

      <a-collapse-panel
        v-if="!(table?.type === SubTableType._2D)"
        key="2"
        :header="$t('sys.onlineForm.dynamicTableConfiguration')"
      >
        <form-item isFirst>
          <template #label>
            <span>{{ $t('sys.onlineForm.quickFilling') }}</span>

            <a-tooltip placement="top">
              <template #title>
                <div>
                  {{ $t('sys.onlineForm.afterEnablingCanQuicklyAddDynamicTableDataInPopup') }}
                </div>
              </template>
              <i class="iconfont icon-assist ml-2px text-14px! leading-1 cursor-pointer"></i>
            </a-tooltip>
          </template>
          <div class="flex justify-end">
            <a-switch size="small" v-model:checked="table!.quickFill" />
          </div>
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
  import type { ICell } from '/@online-form/views/designer/types';
  import { TransferType } from '../base/drag/use-drop';
  import CellsDrop from '../base/drag/cells-drop.vue';
  import { PanelType, SubTableType } from '../../enums';

  interface Cell {
    name: string;
    x: number;
    y: number;
    cell: ICell;
  }

  const { paper, panelData, sheetReadonly, removeSubTable, setPanelData } = useSpreadSheet();
  const { modelMetaMap } = useModelFields();

  const activeCollapse = ref(['1', '2', '3']);

  const table = computed(() => {
    return paper.value.dynamicTables?.find((item) => item.id === panelData.refId);
  });

  const modelName = computed(() => {
    if (!table.value?.model) return;
    return modelMetaMap.value[table.value?.model]?.meta.name;
  });

  const cells = computed(() => {
    const cells: Cell[] = [];
    if (!table.value) return [];
    const { t, l, r, b } = table.value.range;
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
</script>
