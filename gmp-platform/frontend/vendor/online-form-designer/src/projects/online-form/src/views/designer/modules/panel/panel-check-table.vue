<template>
  <div class="panel-document">
    <div class="pl-12px pr-12px pt-20px pb-20px">
      <form-item
        :label="$t('sys.onlineForm.inspectionTableName')"
        :inline="false"
        class="important-mt-0"
      >
        <template #extra>
          <span v-if="!sheetReadonly" class="color-[#F54547] cursor-pointer" @click="removeTable">
            {{ $t('sys.onlineForm.deleteInspectionTable') }}
          </span>
        </template>
        <span class="color-[#212528] text-12px lh-[18px]">{{ table?.name }}</span>
      </form-item>
      <form-item
        class="mt-16px"
        :label="$t('sys.onlineForm.modelOfInspectionTable')"
        :inline="false"
      >
        <span class="color-[#212528] text-12px lh-[18px]">{{ modelName }}</span>
      </form-item>
    </div>

    <a-collapse
      class="override"
      v-model:activeKey="activeCollapse"
      ghost
      expandIconPosition="right"
    >
      <a-collapse-panel key="1" :header="$t('sys.onlineForm.inspectionTableCell')">
        <CellsDrop
          :cells="cells"
          :transferTypes="[TransferType.Field, TransferType.Widget]"
          :hiddenMergeCells="hiddenMergeCells"
          :showAutoMerge="true"
        />
      </a-collapse-panel>

      <!-- <a-collapse-panel key="2" header="检验项目">
        <a-button v-if="!sheetReadonly" @click="handleAddItems">新增项目</a-button>
        <template v-if="checkTableDataSource">
          <CheckItemCardList
            class="mt-8px"
            :table="table"
            :ds="checkTableDataSource"
            :disabled="sheetReadonly"
          />
        </template>
      </a-collapse-panel> -->
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { useCheckItem } from '/@online-form/views/designer/hooks/useCheckItem';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { ref, computed } from 'vue';
  import { NumColMap } from '/@online-form/views/designer/constants';
  import type { ICell } from '/@online-form/views/designer/types';
  import { TransferType } from '../base/drag/use-drop';
  import CellsDrop from '../base/drag/cells-drop.vue';
  import { PanelType, SubTableType } from '../../enums';
  import { isOverlap } from '/@online-form/views/designer/utils';
  import CheckItemCardList from '/@web-render/views/edhr-application/components/check-item/card-list.vue';

  interface Cell {
    name: string;
    x: number;
    y: number;
    cell: ICell;
  }

  const { paper, panelData, sheetReadonly, removeSubTable, setPanelData, globalSubTables } =
    useSpreadSheet();
  const { addCheckItem, syncDesignLayout } = useCheckItem();
  const { modelMetaMap } = useModelFields();

  const activeCollapse = ref(['1', '2', '3']);
  const hiddenMergeCells = ref<any[]>([]);

  const table = computed(() => {
    return globalSubTables.value?.find((item) => item.id === panelData.refId);
  });

  const checkTableDataSource = computed(() => {
    return table.value?.type === SubTableType.CHECK
      ? paper.value.checkTableDataSource?.find((item) => item.id === table.value?.checkDsId)
      : null;
  });

  const modelName = computed(() => {
    if (!table.value?.model) return;
    return modelMetaMap.value[table.value?.model]?.meta.name;
  });

  const cells = computed(() => {
    const cells: Cell[] = [];
    if (!table.value) return [];
    const { t, l, r, b } = table.value.rowRange!;
    Array(b - t + 1)
      .fill('')
      .forEach((m, i) => {
        Array(r - l + 1)
          .fill('')
          .forEach((n, j) => {
            const x = l + j;
            const y = t + i;

            if (
              table.value!.dgRange &&
              isOverlap(table.value!.dgRange!, { t: y, l: x, r: x, b: y })
            ) {
              hiddenMergeCells.value.push({ x, y });
            }

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

  const handleAddItems = async () => {
    const res = await addCheckItem({
      id: checkTableDataSource.value!.id!,
      data: checkTableDataSource.value?.data ?? [],
    });
    if (res?.ok) {
      syncDesignLayout(table.value!);
    }
  };
</script>
