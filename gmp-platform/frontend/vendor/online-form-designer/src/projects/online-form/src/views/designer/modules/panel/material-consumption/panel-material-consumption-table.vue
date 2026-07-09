<template>
  <div class="panel-document">
    <div class="pl-12px pr-12px pt-20px pb-20px">
      <form-item
        :label="$t('sys.edhr.mcTable.materialConsumeTableName')"
        :inline="false"
        class="important-mt-0"
      >
        <template #extra>
          <span v-if="!sheetReadonly" class="color-[#F54547] cursor-pointer" @click="removeTable">
            {{ $t('sys.edhr.mcTable.deleteMaterialConsumeTable') }}
          </span>
        </template>
        <span class="color-[#212528] text-12px lh-[18px]">{{ table?.name }}</span>
      </form-item>
      <form-item
        class="mt-16px"
        :label="$t('sys.edhr.mcTable.materialConsumeTableModel')"
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
      <a-collapse-panel key="1" :header="$t('sys.edhr.mcTable.materialConsumeTableCells')">
        <CellsDrop
          :cells="cells"
          :transferTypes="[TransferType.Field, TransferType.Widget]"
          :showAutoMerge="false"
        />
      </a-collapse-panel>
      <a-collapse-panel
        v-if="config"
        key="2"
        :header="$t('sys.edhr.mcTable.materialConsumeTableConfig')"
      >
        <!-- <form-item isFirst label="上下料模式" class="justify-between">
          <div class="flex justify-end">
            <a-switch
              size="small"
              :disabled="sheetReadonly"
              v-model:checked="config.material_loading_model_enabled_"
            />
          </div>
        </form-item> -->
        <template v-if="!config.material_loading_model_enabled_">
          <form-item
            :inline="false"
            :label="$t('sys.edhr.mcTable.parseRule')"
            class="justify-between"
            required
          >
            <RdoTreeSelect
              v-model="config.barcode_parsing_rules_id_"
              modelKey="em_barcode_parsing_rules"
            />
          </form-item>
          <form-item isFirst :label="$t('sys.edhr.mcTable.personalBom')" class="justify-between">
            <div class="flex justify-end">
              <a-switch
                size="small"
                :disabled="sheetReadonly"
                v-model:checked="config.personal_bom_enabled_"
              />
            </div>
          </form-item>
          <template v-if="config.personal_bom_enabled_">
            <BomEntryEditor v-model:list="config.entries_" />
            <form-item
              isFirst
              :label="$t('sys.edhr.mcTable.sequenceLoading')"
              class="justify-between"
            >
              <div class="flex justify-end">
                <a-switch
                  size="small"
                  :disabled="sheetReadonly"
                  v-model:checked="config.sequence_loading_enabled_"
                />
              </div>
            </form-item>
          </template>
        </template>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { ref, computed, watchEffect } from 'vue';
  import { NumColMap } from '/@online-form/views/designer/constants';
  import type { ICell } from '/@online-form/views/designer/types';
  import { TransferType } from '../../base/drag/use-drop';
  import CellsDrop from '../../base/drag/cells-drop.vue';
  import { PanelType, SubTableType } from '../../../enums';
  import RdoTreeSelect from '/@web-render/views/edhr-application/components/rdo-tree-select/rdo-tree-select.vue';
  import BomEntryEditor from './bom-entry-editor.vue';

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

  const config = computed(() => {
    if (!table.value) return;
    return table.value.mcBomConfig;
  });

  watchEffect(() => {
    if (table.value && !config.value) {
      table.value.mcBomConfig = {
        table_key_: `${table.value.id}:${table.value.field}`,
        material_loading_model_enabled_: false,
        entries_: [],
      };
    }
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
