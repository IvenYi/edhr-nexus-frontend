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
          <span class="pl-4px font-500"> {{ currentCell?.name }}</span>
        </form-item>
        <form-item :label="$t('sys.onlineForm.compositeField')" v-if="showMultiFieldsConfig">
          <div class="flex justify-end">
            <a-switch
              size="small"
              :disabled="sheetReadonly || disabledCellSize"
              v-model:checked="currentCell!.data.multiFields"
              @change="(c) => toggleMultiFields(currentCell!.x, currentCell!.y, c as any)"
            />
          </div>
        </form-item>
        <form-item :label="$t('sys.onlineForm.textDirection')" :inline="false">
          <a-select
            size="small"
            class="w-full"
            :disabled="sheetReadonly"
            v-model:value="textWritingMode"
          >
            <a-select-option
              v-for="item in TextWritingModeOpts"
              :value="item.value"
              :key="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </form-item>
        <form-item :label="$t('sys.onlineForm.cellContent')" :inline="false">
          <PanelCellDrop v-model:selected-id="activeContentId" />
        </form-item>
      </a-collapse-panel>

      <a-collapse-panel
        v-if="currentCell?.data.type === CellType.Widget"
        key="2"
        :header="$t('sys.onlineForm.componentProperties')"
      >
        <PaperWidgetProps
          :paper-widget="currentCell?.data.paperWidget"
          :is-in-cell="true"
          :disabled="sheetReadonly"
        />
      </a-collapse-panel>
    </a-collapse>
    <template
      v-if="cellBindInfo?.data.type === CellType.Field && cellBindInfo?.data.fieldMeta?.field"
    >
      <FieldConfig
        :key="cellBindInfo.data.fieldMeta.field"
        :field-meta="cellBindInfo.data.fieldMeta"
        :field-widget="cellBindInfo.data.fieldWidget!"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { defineAsyncComponent, ref, computed } from 'vue';
  import { FIELD_TYPE } from '/@online-form/views/designer/enums/local-field';
  import PaperWidgetProps from '/@online-form/views/__widgets__/paper-widget-props.vue';
  import PanelCellDrop from '/@online-form/views/designer/modules/base/drag/panel-cell-drop.vue';
  import { useState } from '../../hooks/useState';

  const FieldConfig = defineAsyncComponent(() => import('../base/field-config.vue'));

  const CellType = {
    Widget: 'Widget',
    Field: 'Field',
  } as const;
  const ImageDisplayModeEnum = {
    ADAPTIVE: 'ADAPTIVE',
  } as const;

  const activeCollapse = ref(['1', '2', '3', '4', '5']);
  // 当前选中的字段内容id
  const activeContentId = ref<string>('');
  const { currentCell, sheetReadonly, isTextOnlineForm, toggleMultiFields, setStyle } =
    useSpreadSheet();
  const { cellStyleValue } = useState();

  const TextWritingModeOpts = [
    {
      label: $t('sys.appDesigner.printDesign.form.landscape'),
      value: 'unset',
    },
    {
      label: $t('sys.onlineForm.vertical'),
      value: 'vertical-lr',
    },
    {
      label: $t('sys.onlineForm.sidewaysRl'),
      value: 'sideways-rl',
    },
    {
      label: $t('sys.onlineForm.sidewaysLr'),
      value: 'sideways-lr',
    },
  ];

  /**
   * 单元格字段绑定数据
   * 1.常规单元格 直接返回
   * 2.组合字段单元格 基于选中的内容id 显示对应的字段组件数据
   */
  const cellBindInfo = computed(() => {
    if (currentCell.value?.data.multiFields) {
      const info = currentCell.value.data.multiFieldsContent?.find(
        (item) => item.id === activeContentId.value,
      );
      if (!info) return null;
      return {
        data: info,
      };
    } else {
      return currentCell.value;
    }
  });

  const showMultiFieldsConfig = computed(() => {
    if (isTextOnlineForm.value) {
      return false;
    }
    return true;
  });

  const disabledCellSize = computed(() => {
    return (
      cellBindInfo.value?.data.type === CellType.Field &&
      cellBindInfo.value?.data.fieldMeta?.field &&
      cellBindInfo.value?.data.fieldMeta?.fieldType === FIELD_TYPE.IMAGE &&
      cellBindInfo.value?.data.fieldWidget?.imageDisplayMode === ImageDisplayModeEnum.ADAPTIVE
    );
  });

  const textWritingMode = computed({
    get() {
      return cellStyleValue.value['writing-mode'] ?? 'unset';
    },
    set(v) {
      setStyle({
        'writing-mode': v,
      });
    },
  });
</script>

<style lang="less" scoped></style>
