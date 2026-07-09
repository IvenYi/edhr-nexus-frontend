<template>
  <div class="cells-field-drop-wrapper">
    <div v-show="showAutoMerge" class="text-right text-12px px3px">{{
      $t('sys.onlineForm.autoMerge')
    }}</div>
    <div
      v-for="data in cellsList"
      :key="data.cellName"
      :data-name="data.cellName"
      class="dynamic-table-cell__drop-box"
      :class="[data.cellName, 'dynamic-table-cell__drop-box--' + data.cellName]"
      :id="'dynamic-table-cell__drop-box--' + data.cellName"
    >
      <span>{{ data.cellName }}</span>
      <SingleDrop
        v-if="!data.cell.multiFields"
        @dragover="handleDragOver"
        @drop="(event) => handleDrop(event, data)"
        @clear="() => handleClear(data)"
        :icon="data.icon"
        :label="data.label"
        :emptyText="$t('sys.onlineForm.dragFieldOrComponentToBind')"
        :disabled="sheetReadonly"
      />
      <MultipleDrop
        v-else
        @dragover="handleFieldDragOver"
        @drop="(event) => handleDrop(event, data)"
        :dragText="$t('sys.onlineForm.dragFieldIn')"
        :items="data.multipleItems"
        @move="(args) => handleMove(args, data)"
        @remove="(index) => handleRemove(index, data)"
        :disabled="sheetReadonly"
      />
      <div v-show="showMergeSwitch(data)" class="ks-row-middle flex-none! w45px justify-center">
        <a-switch
          :checked="data.cell.fillDirection === 'x' ? data.xAutoMerge : data.autoMerge"
          size="small"
          :disabled="sheetReadonly"
          @change="(v, e) => handleSwitchChange(v, data)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="CellsDrop">
  import { computed } from 'vue';
  import SingleDrop from './single-drop.vue';
  import MultipleDrop from './multiple-drop.vue';
  import { TransferType, useDrop } from './use-drop';
  import { getFieldIcon } from '/@online-form/utils/field.enum';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import type { ICell } from '/@online-form/views/designer/types';
  import type { IBindField } from '@gct/nocode-base';
  import { FIELD_TYPE } from '/@online-form/views/designer/enums/local-field';

  const CellType = {
    Field: 'Field',
    Widget: 'Widget',
  } as const;

  interface Cell {
    name: string;
    x: number;
    y: number;
    cell: ICell;
  }

  interface ICellItem {
    cellName: string;
    cellX: number;
    cellY: number;
    cell: ICell;
    icon: string | undefined;
    label: string | undefined;
    multipleItems: Array<{ icon: string; label: string }> | undefined;
    autoMerge?: boolean;
    xAutoMerge?: boolean;
  }

  const props = defineProps<{
    cells: Cell[];
    transferTypes: TransferType[];
    /** 自由组合情况 */
    isFreeCombination?: boolean;
    showAutoMerge?: boolean;
    /** 需要隐藏合并配置的单元格 */
    hiddenMergeCells?: any[];
  }>();

  const {
    sheetReadonly,
    judgeFieldDragInCell,
    bindFieldToCell,
    bindWidgetToCell,
    unbindFieldFromCell,
    unbindWidgetFromCell,
  } = useSpreadSheet();

  const { getFieldMeta } = useModelFields();

  const { handleDragOver, handleDrop } = useDrop(props.transferTypes, {
    onFieldDrop(fieldMeta, _fieldWidget, opts: ICellItem) {
      if (sheetReadonly.value) {
        return;
      }

      if (props.isFreeCombination) {
        const notDragInCell = judgeFieldDragInCell(fieldMeta, {
          cellX: opts.cellX,
          cellY: opts.cellY,
        });
        if (notDragInCell) return;
      }

      bindFieldToCell(fieldMeta, opts.cellX, opts.cellY);
    },
    onWidgetDrop(widgetMeta, opts: ICellItem) {
      if (sheetReadonly.value) {
        return;
      }

      bindWidgetToCell(widgetMeta, opts.cellX, opts.cellY);
    },
  });

  const { handleDragOver: handleFieldDragOver } = useDrop([TransferType.Field]);

  const getFieldName = (field: IBindField) => {
    return getFieldMeta(field).name;
  };

  const getSingleIcon = (cellInfo: ICell) => {
    if (!cellInfo) {
      return undefined;
    }
    if (cellInfo.type === CellType.Field) {
      return getFieldIcon(cellInfo.fieldMeta!.fieldType!);
    } else if (cellInfo.type === CellType.Widget) {
      return cellInfo.paperWidget?.icon;
    }
    return undefined;
  };

  const getSingleLabel = (cellInfo: ICell) => {
    if (!cellInfo) {
      return undefined;
    }
    if (cellInfo.type === CellType.Field) {
      return getFieldName(cellInfo.fieldMeta!);
    } else if (cellInfo.type === CellType.Widget) {
      return cellInfo.paperWidget?.name;
    }
    return undefined;
  };

  const cellsList = computed<ICellItem[]>(() => {
    return props.cells.map((item) => {
      const cellInfo = item.cell;

      let multipleItems;
      if (cellInfo && cellInfo.multiFields && cellInfo.multiFieldsContent) {
        multipleItems = cellInfo.multiFieldsContent.map((item) => {
          return {
            icon: getFieldIcon(item.fieldMeta!.fieldType!) as string,
            label: getFieldName(item.fieldMeta!)!,
          };
        });
      }
      return {
        cellName: item.name,
        cellX: item.x,
        cellY: item.y,
        cell: item.cell ?? {},
        icon: getSingleIcon(item.cell ?? {}),
        label: getSingleLabel(item.cell ?? {}),
        autoMerge: item.cell.autoMerge || false,
        xAutoMerge: item.cell.fillDirection === 'x' ? item.cell.xAutoMerge || false : undefined,
        multipleItems,
      };
    });
  });

  /**
   * 清空单个的字段或者组件
   */
  const handleClear = (cellItem: ICellItem) => {
    const cellInfo = cellItem?.cell;
    if (!cellInfo) {
      return;
    }
    if (!cellInfo.multiFields) {
      switch (cellInfo.type) {
        case CellType.Field:
          unbindFieldFromCell(cellItem.cellX, cellItem.cellY);
          break;
        case CellType.Widget:
          unbindWidgetFromCell(cellItem.cellX, cellItem.cellY);
          break;
        default:
          break;
      }
    }
  };

  const handleMove = (args: { newIndex: number; oldIndex: number }, cellItem: ICellItem) => {
    const arr = cellItem.cell.multiFieldsContent!;
    const el = arr.splice(args.oldIndex, 1);
    arr.splice(args.newIndex, 0, ...el);
  };

  const handleRemove = (index: number, cellItem: ICellItem) => {
    const id = cellItem.cell.multiFieldsContent![index].id;
    unbindFieldFromCell(cellItem.cellX, cellItem.cellY, id);
  };

  const handleSwitchChange = (val, cellItem: ICellItem) => {
    const cellInfo = cellItem?.cell;
    if (!cellInfo) {
      return;
    }
    cellItem.cell[cellItem.cell.fillDirection === 'x' ? 'xAutoMerge' : 'autoMerge'] = val;
  };

  const showMergeSwitch = (item) => {
    return (
      props.showAutoMerge &&
      item.cell?.fieldMeta &&
      ![
        FIELD_TYPE.IMAGE,
        FIELD_TYPE.ATTACHMENT,
        FIELD_TYPE.SIGNATURE,
        FIELD_TYPE.REPORTER,
        FIELD_TYPE.WAREHOUSE_MANAGER,
      ].includes(item.cell.fieldMeta?.fieldType) &&
      !props.hiddenMergeCells?.find((e) => e.x === item.cellX && e.y === item.cellY)
    );
  };

  // watch(
  //   () => props.showAutoMerge,
  //   (val) => {
  //     if (!val) {
  //       props.cells.forEach((item) => {
  //         item.cell.autoMerge = false;
  //       });
  //     }
  //   },
  // );
</script>

<style lang="less" scoped>
  .cells-field-drop-wrapper {
    .dynamic-table-cell__drop-box {
      height: 100%;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #e8ebf0;
      margin-bottom: 8px;
      display: flex;
      padding: 5px;
      font-size: 12px;
      color: #212528;

      & > span {
        flex: none;
        width: 48px;
        // height: 32px;
        margin-right: 2px;
        line-height: 1em;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        background: #f7f8fa;
        border-radius: 2px 0px 0px 2px;
        padding-right: 8px;
      }

      & > div {
        // background: #f7f8fa;
        // border-radius: 0px 2px 2px 0px;
        // flex: 1;
        // padding: 0 8px;
        // display: flex;
        // align-items: center;
        // height: 100%;
        // padding: 0 8px;
        // line-height: 1em;

        border-radius: 0px 2px 2px 0px;
        flex: 1;
      }
    }
  }
</style>
