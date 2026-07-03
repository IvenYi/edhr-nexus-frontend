<template>
  <div v-if="currentCell" :class="[ns.b()]">
    <SingleDrop
      v-if="!currentCell.data.multiFields"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @clear="handleClear"
      :icon="singleIcon"
      :label="singleLabel"
      :emptyText="$t('sys.onlineForm.dragFieldOrComponentToBind2')"
      :disabled="sheetReadonly"
    />
    <MultipleDrop
      v-else
      @dragover="handleFieldDragOver"
      @drop="handleDrop"
      :dragText="$t('sys.onlineForm.dragFieldIn')"
      :items="multipleItems"
      v-model:selectedIndex="selectIndex"
      @move="handleMove"
      @remove="handleRemove"
      :disabled="sheetReadonly"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import SingleDrop from '/@online-form/views/designer/modules/base/drag/single-drop.vue';
  import MultipleDrop from '/@online-form/views/designer/modules/base/drag/multiple-drop.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { getFieldIcon } from '/@online-form/utils/field.enum';
  import { TransferType, useDrop } from './use-drop';
  import type { IBindField } from '@gct/nocode-base';

  const ns = {
    b: () => 'gct-panel-cell-drop',
  };
  const CellType = {
    Field: 'Field',
    Widget: 'Widget',
  } as const;

  const {
    currentCell,
    unbindFieldFromCell,
    unbindWidgetFromCell,
    sheetReadonly,
    bindFieldToCell,
    bindWidgetToCell,
    reverseModelingToCell,
  } = useSpreadSheet();

  const { getFieldMeta } = useModelFields();
  const getFieldName = (field: IBindField) => {
    return getFieldMeta(field).name;
  };

  const { handleDragOver, handleDrop } = useDrop(
    [TransferType.Field, TransferType.Widget, TransferType.ReverseModeling],
    {
      onFieldDrop(fieldMeta, _fieldWidget) {
        if (sheetReadonly.value) {
          return;
        }
        bindFieldToCell(fieldMeta, currentCell.value!.x, currentCell.value!.y);
      },
      onWidgetDrop(widgetMeta) {
        if (sheetReadonly.value) {
          return;
        }
        bindWidgetToCell(widgetMeta);
      },
      async onReverseModelingDrop(item) {
        await reverseModelingToCell({
          x: currentCell.value!.x,
          y: currentCell.value!.y,
          item,
        });
      },
    },
  );

  const { handleDragOver: handleFieldDragOver } = useDrop([TransferType.Field]);

  const props = withDefaults(
    defineProps<{
      selectedId?: string;
    }>(),
    {},
  );

  const emit = defineEmits(['update:selectedId']);

  const singleIcon = computed(() => {
    const cellData = currentCell.value?.data;
    if (!cellData) {
      return undefined;
    }
    if (cellData.type === CellType.Field) {
      return getFieldIcon(cellData.fieldMeta!.fieldType!);
    } else if (cellData.type === CellType.Widget) {
      return cellData.paperWidget?.icon;
    }
    return undefined;
  });

  const singleLabel = computed(() => {
    const cellData = currentCell.value?.data;
    if (!cellData) {
      return undefined;
    }
    if (cellData.type === CellType.Field) {
      return getFieldName(cellData.fieldMeta!);
    } else if (cellData.type === CellType.Widget) {
      return cellData.paperWidget?.name;
    }
    return undefined;
  });

  /**
   * 清空单个的字段或者组件
   */
  const handleClear = () => {
    const cellData = currentCell.value?.data;
    if (!cellData) {
      return;
    }
    if (!cellData.multiFields) {
      switch (cellData.type) {
        case CellType.Field:
          unbindFieldFromCell(currentCell.value.x, currentCell.value.y);
          break;
        case CellType.Widget:
          unbindWidgetFromCell(currentCell.value.x, currentCell.value.y);
          break;
        default:
          break;
      }
    }
  };

  const multipleItems = computed(() => {
    const cellData = currentCell.value?.data;
    if (!cellData || !cellData.multiFields || !cellData.multiFieldsContent) {
      return undefined;
    }
    return cellData.multiFieldsContent.map((item) => {
      return {
        label: getFieldName(item.fieldMeta!)!,
        icon: getFieldIcon(item.fieldMeta!.fieldType!) as string,
      };
    });
  });

  const selectIndex = computed({
    get() {
      const index = currentCell.value?.data?.multiFieldsContent?.findIndex(
        (item) => item.id === props.selectedId,
      );
      return index === -1 ? undefined : index;
    },
    set(v: number | undefined) {
      emit(
        'update:selectedId',
        v === undefined ? undefined : currentCell.value!.data!.multiFieldsContent![v]?.id,
      );
    },
  });

  const handleMove = (args: { newIndex: number; oldIndex: number }) => {
    const arr = currentCell.value!.data.multiFieldsContent!;
    const el = arr.splice(args.oldIndex, 1);
    arr.splice(args.newIndex, 0, ...el);
  };

  const handleRemove = (index: number) => {
    const id = currentCell.value!.data.multiFieldsContent![index].id;
    unbindFieldFromCell(currentCell.value?.x, currentCell.value?.y, id);
    if (currentCell.value!.data.multiFieldsContent!.length === 0) {
      emit('update:selectedId');
    }
  };
</script>

<style lang="scss" scoped>
  @include b(panel-cell-drop) {
  }
</style>
