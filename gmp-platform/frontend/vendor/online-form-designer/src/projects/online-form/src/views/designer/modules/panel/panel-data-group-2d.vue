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
            <span class="readonly-text">（{{ $t('sys.onlineForm.fillDynamicTable') }}）</span>
          </template>
          <div class="flex justify-end">
            <a-switch size="small" :disabled="sheetReadonly" v-model:checked="table!.autoFill" />
          </div>
        </form-item>

        <form-item :label="$t('sys.model.associated_primary_key')" :inline="false">
          <a-select
            size="small"
            class="w-full"
            allowClear
            :disabled="sheetReadonly"
            v-model:value="table.refColField"
            :placeholder="t('sys.chooseTextTip', { name: $t('sys.model.associated_primary_key') })"
          >
            <a-select-option
              v-for="ele in xFields"
              :key="ele.key"
              :value="ele.key"
              :title="ele.name"
            >
              {{ ele.name }}
            </a-select-option>
          </a-select>
        </form-item>
        <form-item
          :label="$t('sys.onlineForm.dynamicTableAssociationEstablishment')"
          :inline="false"
        >
          <a-select
            size="small"
            class="w-full"
            allowClear
            :disabled="sheetReadonly"
            v-model:value="table.refRowField"
            :placeholder="
              t('sys.chooseTextTip', {
                name: $t('sys.onlineForm.dynamicTableAssociationEstablishment'),
              })
            "
          >
            <a-select-option
              v-for="ele in yFields"
              :key="ele.key"
              :value="ele.key"
              :title="ele.name"
            >
              {{ ele.name }}
            </a-select-option>
          </a-select>
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
        <form-item :inline="false">
          <template #label>
            {{ $t('sys.onlineForm.dynamicAssociationCell') }}
            <span
              v-if="!sheetReadonly"
              class="color-[#F54547] float-right cursor-pointer"
              @click="handleRemoveDataGroup"
            >
              {{ $t('sys.onlineForm.deleteDynamicAssociation') }}
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
  import { num2Col, isOverlap } from '/@online-form/views/designer/utils';
  import type { ICell } from '/@online-form/views/designer/types';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { PanelType, SubTableType } from '/@online-form/views/designer/enums';
  import { TransferType } from '../base/drag/use-drop';
  import CellsDrop from '../base/drag/cells-drop.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { CreateType } from '/@/enums/appEnum';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  interface Cell {
    name: string;
    x: number;
    y: number;
    cell: ICell;
  }

  const { paper, panelData, sheetReadonly, setPanelData, removeDataGroup2D, globalSubTables } =
    useSpreadSheet();
  const { modelMetaMap, getFieldMeta } = useModelFields();

  const activeCollapse = ref(['1', '2', '3']);

  const table = computed(() => {
    return globalSubTables.value.find((item) => item.id === panelData.refId)!;
  });

  const xFields = computed(() => {
    return (table.value?.colModel ? modelMetaMap.value[table.value.colModel].fields : []).filter(
      (item) => item.createType === CreateType.USER_DEFINED,
    );
  });

  const yFields = computed(() => {
    return (table.value?.model ? modelMetaMap.value[table.value.model].fields : []).filter(
      (item) => item.createType === CreateType.USER_DEFINED,
    );
  });

  const colCount = computed(() => {
    return table.value.dgRange!.r - table.value.dgRange!.l + 1;
  });

  const rowCount = computed(() => {
    return table.value.dgRange!.b - table.value.dgRange!.t + 1;
  });

  const handleRemoveDataGroup = () => {
    if (table.value?.dgRange) {
      removeDataGroup2D(table.value);
      setPanelData({
        type: table.value.type === SubTableType._2D ? PanelType.DynamicTable : PanelType.CheckTable,
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

            if (isOverlap(table.value.range!, { t: y, l: x, r: x, b: y })) return;

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
