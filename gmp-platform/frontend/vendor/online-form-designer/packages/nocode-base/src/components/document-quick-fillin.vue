<template>
  <div class="sub-table-quick-fill-btn" @click.stop="openQuickFillModal"> 快速填报 </div>
</template>

<script setup lang="ts" name="document-quick-fillin">
  import { computed } from 'vue';
  import { IModalData, FIELD_TYPE } from '@gct/runtime';
  import { CellType, ComponentTypeEnum } from '../constant';
  import { getSubTableQuickFillInfo } from '../hooks';
  import DocumentQuickFillModal from './document-quick-fill-modal.vue';

  const props = defineProps<{
    subTableFieldId: string;
    mobileTdIdGroups: Map<any, any>;
    widgetCenter: any;
    handleMenuClick: Function;
  }>();

  const fieldColumn = computed(() => {
    const info = getSubTableQuickFillInfo(props.subTableFieldId, props.mobileTdIdGroups);
    if (!info?.mainWidgetIds?.length) return [];

    const allowed = new Set([
      FIELD_TYPE.TEXT,
      FIELD_TYPE.LONG_TEXT,
      FIELD_TYPE.INTEGER,
      FIELD_TYPE.LONG,
      FIELD_TYPE.DOUBLE,
      FIELD_TYPE.DECIMAL,
      FIELD_TYPE.DATE,
      FIELD_TYPE.TIME,
      FIELD_TYPE.DATE_TIME,
      FIELD_TYPE.OPTION,
      FIELD_TYPE.OPTION_MULTI,
      FIELD_TYPE.MATERIAL_NO,
      FIELD_TYPE.RELATED_LOT_NO,
      FIELD_TYPE.SCRAP_MATERIAL_NO,
    ]);

    return info.mainWidgetIds.flatMap((tdId) => {
      const widget = props.widgetCenter?.[tdId];
      if (!widget) return [];

      const { cellWidget, cellValueType } = widget;
      if (cellValueType !== CellType.Field) return [];
      if (!cellWidget || cellWidget.component === ComponentTypeEnum.CombineFields) return [];

      const wProps = cellWidget.props || {};
      const { isFieldModel, field, fieldType, newSpecificConfig } = wProps;

      if (isFieldModel) return [];
      if (!allowed.has(fieldType)) return [];

      return {
        fieldType,
        field,
        name: newSpecificConfig?.newFieldName,
        prop: field,
        newOptions: newSpecificConfig?.newOptions,
      };
    });
  });

  const openQuickFillModal = async () => {
    const res = await gct.openUtil.modal<IModalData>(
      DocumentQuickFillModal,
      { columns: fieldColumn.value },
      { title: '快速填报', width: '1060px' },
    );
    console.log('res', res);
    if (res.ok && res.params && res.params.data.length) {
      props.handleMenuClick?.({
        key: 'insertRowAfter',
        actionValue: {
          upRowNum: 1,
          downRowNum: res.params.data.length,
          data: res.params.data,
        },
      });
    }
  };
</script>

<style scoped lang="less">
  .sub-table-quick-fill-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #5378ff;
    white-space: nowrap;
    position: absolute;
    border-radius: 3px;
    left: 0;
    bottom: -25px;
    z-index: 99;
    line-height: 24px;
    color: #fff;
    font-size: 12px;
    padding: 0 6px;
    cursor: pointer;
  }
</style>
