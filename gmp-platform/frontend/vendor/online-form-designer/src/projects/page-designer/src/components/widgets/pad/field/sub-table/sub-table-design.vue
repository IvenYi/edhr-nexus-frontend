<template>
  <div class="gct-sub-table">
    <van-cell
      class="sub-table-title-area sub-table-button-container"
      center
      title-style="padding-left: 16px"
      :border="false"
    >
      <template #title v-if="widget.props.displayLabelText">
        <div
          class="gct-sub-table--label"
          :class="{ 'van-field__label--required': widget.props.required }"
        >
          {{ widget.props.label || globFieldInfo.label }}
        </div>
      </template>
      <template #right-icon>
        <div v-if="btnGroupWidget?.children?.length" class="pt5px pb5px mr8px">
          <!-- 头部批量按钮 -->
          <groupButtons
            :children="btnGroupWidget.children"
            :parentWidget="widget"
            :visibleButtons="btnGroupWidget.visibleButtons"
          />
        </div>
      </template>
    </van-cell>
    <div
      class="sub-table-fields-area"
      :class="[!tableColumns.length ? 'is-empty' : 'is-data']"
      :data-placeholder="t('sys.pageDesigner.selectSubTableField')"
    >
      <vxeRefTable
        v-if="tableColumns.length"
        :datasource="[{ index: 1 }]"
        :columns="tableColumns"
        :rowDragSort="rowDragSort"
        :operateColumn="operateColumn"
        :tableWidget="widget"
        :editMethods="
          widget.props.editMode === SUB_TABLE_EDIT_MODE.MODAL
            ? SUB_TABLE_EDIT_MODE.INLINE
            : TableEditingMethodEnum.CLICKTOENTEREDITING
        "
        :serialNumber="serialNumber"
        :editMode="editMode"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-sub-table">
  import { inject, computed, toRefs, onMounted, toRef, provide } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { TableEditingMethodEnum, SUB_TABLE_EDIT_MODE } from '/@page-designer/enum';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAsyncFieldConfig } from '/@page-designer/components/widgets/hooks/useAsyncFields';
  import { transformButtons } from './modals/transform';
  import groupButtons from '/@page-designer/components/widgets/pad/__components__/group-buttons/group-buttons-design.vue';
  import { vxeRefTable } from '/@page-designer/components/widgets/pad/data/data-table/component/vxeDesignTable';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const { t } = useI18n();

  const props = defineProps(widgetProps);

  const { editMode, serialNumber, rowDragSort } = toRefs(props.widget.props);

  const { labelFont } = useStyle(props.widget);

  const labelLayout = toRef(() => {
    const width =
      props.widget.props.layout?.label === 'left' && !!props.widget.props.hasLabelWidth
        ? props.widget.props.labelWidth + (props.widget.props.labelType == 'percent' ? '%' : 'px')
        : '';

    return {
      width,
      layout: props.widget.props.layout,
      hasLabelWidth: props.widget.props.hasLabelWidth,
      overLabelDisplay: props.widget.props.overLabelDisplay,
    };
  });

  provide('labelLayout', labelLayout);

  const btnGroupWidget = computed(() => {
    return props.widget.children![2];
  });

  const tableColumns = computed(() => {
    return props.widget.children![3].children;
  });

  /** 操作按钮 */
  const operateColumn = toRef(() => {
    if (props.widget.children![1].children.length) {
      return props.widget.children![1];
    }
  });
  if (operateColumn.value?.id) {
    transformButtons(operateColumn.value?.children);
    operateColumn.value.id = undefined;
  }
  if (btnGroupWidget.value?.props) {
    btnGroupWidget.value.visibleButtons =
      btnGroupWidget.value.visibleButtons || btnGroupWidget.value.props.visibleButtons;
    btnGroupWidget.value.props = undefined;
    btnGroupWidget.value.id = undefined;
    btnGroupWidget.value.key = undefined;
  }
  useAsyncFieldConfig(props.widget);
</script>

<style lang="less" scoped>
  .gct-sub-table {
    width: 100%;
    padding: 16px 0;
    :deep(.ant-form-item) {
      pointer-events: none;

      .van-cel {
        padding: 0 !important;
      }
    }

    .sub-table-title-area.van-cell {
      padding: 0;

      :deep(> .van-cell__title) {
        box-sizing: border-box;
        flex: none;
        width: var(--van-field-label-width);
        margin-right: var(--van-field-label-margin-right);
        color: var(--van-field-label-color);
        text-align: left;
        word-wrap: break-word;

        .gct-sub-table--label {
          color: v-bind('labelFont.color');
          font-size: v-bind('labelFont.fontSize');
          font-style: v-bind('labelFont.fontStyle');
          font-weight: v-bind('labelFont.fontWeight');
          text-align: v-bind('labelFont?.textAlign');
          text-decoration-line: v-bind('labelFont.textDecorationLine');
        }
      }

      :deep(> .van-cell__value) {
        padding: 2px;
        overflow: visible;
      }
    }

    .is-button-container-selected {
      outline: var(--ant-primary-color) solid 2px;
    }

    :deep(.active) {
      background-color: rgb(13 170 156 / 10%);
    }

    .sub-table-fields-area {
      position: relative;
      min-height: 96px;

      &.is-data {
        padding: 8px 16px 0;
        // background-color: #f9f9f9;
        .fields-container {
          // background-color: #fff;
          padding: 1px;
        }
      }

      &.is-empty {
        margin: 8px 16px 0;
        background: #f3f5f7;
        border: 1px dashed #b7bcc6;

        &::before {
          content: attr(data-placeholder);
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: #f9f9f9;
          color: #bfbfbf;
          pointer-events: none;
        }
      }
    }

    .gct-card-footer {
      display: flex;
      padding: 8px 12px;

      .footer-btn-wrap {
        display: flex;
        flex: 1;
        flex-direction: row-reverse;
      }

      .btn-more {
        margin-left: 8px;
        line-height: 32px;
      }
    }
  }

  .sub-table-button-container {
    overflow: visible;
  }

  :deep(.van-cell) {
    background-color: transparent;
    justify-content: space-between;
  }
  :deep(.gct-vue3-dnd-container.is-not-children) {
    background: #f3f5f7;
    border: 1px dashed #b7bcc6;
  }
</style>
