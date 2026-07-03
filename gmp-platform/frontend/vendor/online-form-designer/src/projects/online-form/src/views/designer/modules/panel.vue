<template>
  <div class="h-full flex flex-col online-form__designer-panel">
    <div class="flex-none">
      <a-breadcrumb v-if="breadcrumbList.length > 0">
        <template #separator>
          <right-outlined
            :style="{
              fontSize: '12px',
              transform: 'scale(0.9)',
            }"
          />
        </template>

        <a-breadcrumb-item
          v-for="(item, index) in breadcrumbList"
          :key="item.key"
          @click="handleNav(item, index)"
          >{{ item.title }}</a-breadcrumb-item
        >
      </a-breadcrumb>
      <div v-else class="panel-title">{{ $t('sys.edhr.formAttr') }}</div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <!-- 纸张配置 -->
      <panel-paper v-if="panelData.type === PanelType.Paper" />
      <!-- 单元格 -->
      <template v-else-if="panelData.type === PanelType.Cell">
        <panel-multi-cells v-if="currentMultiCells" />
        <panel-cell v-else />
      </template>
      <!-- 页眉页脚 -->
      <panel-paper-widget-group
        v-else-if="[PanelType.PaperFooter, PanelType.PaperHeader].includes(panelData.type!)"
      />
      <!-- 页眉页脚组件 -->
      <panel-paper-widget
        v-else-if="
          [
            PanelType.PaperWidget,
            PanelType.PaperFooterWidget,
            PanelType.PaperHeaderWidget,
          ].includes(panelData.type!)
        "
        :position="position"
      />

      <panel-dynamic-table
        v-else-if="[PanelType.DynamicTable, PanelType._2DTable].includes(panelData.type)"
      />
      <panel-fixed-table v-else-if="panelData.type === PanelType.FixedTable" />
      <panel-data-group v-else-if="panelData.type === PanelType.DataGroup" />
      <PanelDataGroup2D v-else-if="panelData.type === PanelType.DataGroup2D" />
      <panel-table-header v-else-if="panelData.type === PanelType.TableHeader" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import PanelCell from '/@online-form/views/designer/modules/panel/panel-cell.vue';
  import PanelMultiCells from '/@online-form/views/designer/modules/panel/panel-multi-cells.vue';
  import PanelPaper from '/@online-form/views/designer/modules/panel/panel-paper.vue';

  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType, SubTableType } from '/@online-form/views/designer/enums';
  import { computed, defineAsyncComponent } from 'vue';

  const PanelPaperWidget = defineAsyncComponent(
    () => import('/@online-form/views/designer/modules/panel/panel-paper-widget.vue'),
  );
  const PanelPaperWidgetGroup = defineAsyncComponent(
    () => import('/@online-form/views/designer/modules/panel/panel-paper-widget-group.vue'),
  );
  const PanelDynamicTable = defineAsyncComponent(
    () => import('/@online-form/views/designer/modules/panel/panel-dynamic-table.vue'),
  );
  const PanelFixedTable = defineAsyncComponent(
    () => import('/@online-form/views/designer/modules/panel/panel-fixed-table.vue'),
  );
  const PanelDataGroup = defineAsyncComponent(
    () => import('/@online-form/views/designer/modules/panel/panel-data-group.vue'),
  );
  const PanelDataGroup2D = defineAsyncComponent(
    () => import('/@online-form/views/designer/modules/panel/panel-data-group-2d.vue'),
  );
  const PanelTableHeader = defineAsyncComponent(
    () => import('/@online-form/views/designer/modules/panel/panel-table-header.vue'),
  );

  const { panelData, setPanelData, currentCell, currentMultiCells } = useSpreadSheet();

  const position = computed(() => {
    if (panelData.type === PanelType.PaperWidget) {
      return 'paper';
    } else if (panelData.type === PanelType.PaperHeaderWidget) {
      return 'header';
    } else {
      return 'footer';
    }
  });

  const breadcrumbList = computed(() => {
    return [
      {
        key: PanelType.Paper,
        title: $t('sys.edhr.printTypeEnum.FORM'),
        visible: PanelType.Paper !== panelData.type,
      },
      {
        key: PanelType.PaperWidget,
        title: $t('sys.pageDesigner.widget'),
        visible: [PanelType.PaperWidget].includes(panelData.type),
      },
      {
        key: PanelType.PaperHeader,
        title: $t('sys.onlineForm.header'),
        visible: [PanelType.PaperHeader, PanelType.PaperHeaderWidget].includes(panelData.type),
      },
      {
        key: PanelType.PaperFooter,
        title: $t('sys.footer'),
        visible: [PanelType.PaperFooter, PanelType.PaperFooterWidget].includes(panelData.type),
      },
      {
        key: PanelType.PaperHeaderWidget,
        title: $t('sys.pageDesigner.widget'),
        visible: [PanelType.PaperHeaderWidget].includes(panelData.type),
      },
      {
        key: PanelType.PaperFooterWidget,
        title: $t('sys.pageDesigner.widget'),
        visible: [PanelType.PaperFooterWidget].includes(panelData.type),
      },
      {
        key: PanelType.DynamicTable,
        title: $t('sys.onlineForm.subTableType.DEFAULT'),
        visible:
          PanelType.DynamicTable === panelData.type ||
          currentCell.value?.dynamicTable?.type === SubTableType.DEFAULT,
      },
      {
        key: PanelType._2DTable,
        title: $t('sys.onlineForm.subTableType.2D'),
        visible:
          PanelType._2DTable === panelData.type ||
          currentCell.value?.dynamicTable?.type === SubTableType._2D,
      },
      {
        key: PanelType.FixedTable,
        title: $t('sys.onlineForm.subTableType.FIXED'),
        visible:
          [PanelType.FixedTable, PanelType.DataGroup].includes(panelData.type) ||
          currentCell.value?.fixedTable?.type === SubTableType.FIXED,
      },
      {
        key: PanelType.DataGroup,
        title: $t('sys.onlineForm.dataGrouping'),
        visible: PanelType.DataGroup === panelData.type,
      },
      {
        key: PanelType.DataGroup2D,
        title: $t('sys.onlineForm.dynamicAssociation'),
        visible: PanelType.DataGroup2D === panelData.type || !!currentCell.value?.dataGroup2D,
      },
      {
        key: PanelType.Cell,
        title: $t('sys.onlineForm.cell'),
        visible: [PanelType.Cell].includes(panelData.type),
      },
      {
        key: PanelType.TableHeader,
        title: $t('sys.onlineForm.formHeader'),
        visible: [PanelType.TableHeader].includes(panelData.type),
      },
    ].filter((item) => item.visible);
  });

  const handleNav = ({ key }, index: number) => {
    if (index === breadcrumbList.value.length - 1) return;
    if (key === PanelType.DynamicTable || key === PanelType._2DTable) {
      setPanelData({
        type: key,
        refId: currentCell.value?.dynamicTable?.id,
      });
    } else if (key === PanelType.FixedTable || key === PanelType.DataGroup) {
      setPanelData({
        type: key,
        refId: currentCell.value?.fixedTable?.id ?? panelData.refId,
      });
    } else if (key === PanelType.DataGroup2D) {
      setPanelData({
        type: key,
        refId: currentCell.value?.dataGroup2D?.id,
      });
    } else {
      setPanelData({
        type: key,
      });
    }
  };
</script>

<style lang="less" scoped>
  .designer__panel {
    background: #fff;
    border-left: 1px solid #e0e3ea;
    height: 100%;
    width: 100%;
    overflow: auto;
  }

  .ant-breadcrumb {
    height: 42px;
    border-bottom: 1px solid #e0e3ea;
    font-size: 12px;
    display: flex;
    align-items: center;
    padding-left: 12px;

    & > span:not(:last-child) :deep(.ant-breadcrumb-link) {
      cursor: pointer;
    }
  }

  :deep(.ant-collapse) {
    .ant-collapse-header {
      background: #f7f7f7;
      border-top: 1px solid #e0e3ea;
      padding: 7px 12px;
    }
  }

  :deep(.ant-form-item) {
    font-size: 12px;
  }
  :deep(.ant-breadcrumb) {
    font-size: 12px;
  }

  // 上下模式箭头方向
  :deep(.ant-collapse) {
    > .ant-collapse-item {
      &.ant-collapse-item-active {
        > .ant-collapse-header .ant-collapse-arrow {
          svg {
            transform: rotate(-90deg) !important;
          }
        }
      }

      > .ant-collapse-header .ant-collapse-arrow {
        svg {
          transform: rotate(90deg);
        }
      }
    }
  }

  :deep(.ant-input-number) {
    min-width: 0;
  }

  .online-form__designer-panel {
    // ant组件统一压制
    --gct-ant-input-height: 26px;
    --gct-ant-font-size: 12px;
    --gct-ant-font-color: #1a1d23;

    // 继承的字体样式
    font-size: var(--gct-ant-font-size);
    color: var(--gct-ant-font-color);
    :deep(*::placeholder) {
      color: #c6c6c6;
      font-size: var(--gct-ant-font-size);
    }
    // button样式
    :deep(.ant-btn) {
      font-size: var(--gct-ant-font-size);
    }

    // select框
    :deep(.ant-select-single:not(.ant-select-customize-input) .ant-select-selector) {
      height: var(--gct-ant-input-height);
      padding-left: 8px;

      .ant-select-selection-search {
        left: 8px;
      }
    }
    :deep(.ant-select-single:not(.ant-select-customize-input)) {
      .ant-select-selector {
        .ant-select-selection-search-input {
          height: calc(var(--gct-ant-input-height) - 2px);
        }
      }
    }

    :deep(textarea.ant-input) {
      padding-left: 8px;
      padding-right: 8px;
    }
    :deep(.ant-select) {
      font-size: var(--gct-ant-font-size);
      color: var(--gct-ant-font-color);
      .ant-select-selection-item {
        line-height: 24px;
      }

      .ant-select-arrow,
      .ant-select-clear {
        right: 8px;
      }
    }
    :deep(.ant-select-single) {
      // 带搜索的placeholder样式
      .ant-select-selector .ant-select-selection-item,
      .ant-select-selector .ant-select-selection-placeholder {
        line-height: calc(var(--gct-ant-input-height) - 2px);
        padding-right: 18px;
      }
    }
    // input框
    :deep(.ant-input-affix-wrapper) {
      padding: 4px 4px 4px 8px;
      font-size: var(--gct-ant-font-size);
      color: var(--gct-ant-font-color);
      line-height: 1;
      .ant-input {
        font-size: var(--gct-ant-font-size);
        color: var(--gct-ant-font-color);
        line-height: 1;
      }
    }
    // form-item 样式
    :deep(.ant-form-item-control-input) {
      min-height: var(--gct-ant-input-height);
    }
    // switch 样式
    :deep(.ant-switch) {
      height: 14px;
      line-height: 14px;
      min-width: 24px;
      .ant-switch-handle {
        width: 10px;
        height: 10px;
      }
      .ant-switch-inner {
        margin: 0 5px 0 18px;
      }
      &.ant-switch-checked .ant-switch-inner {
        margin: 0 18px 0 5px;
      }
      &.ant-switch-checked .ant-switch-handle {
        left: calc(100% - 12px);
      }
    }
    // 分割线样式
    :deep(.ant-divider) {
      line-height: 1;

      .ant-divider-inner-text {
        padding: 0 8px;
      }
    }
    :deep(.ant-divider-horizontal.ant-divider-with-text) {
      border-top-color: #e0e3eb;
      margin: 0;
      font-size: 12px;
      .ant-divider-inner-text {
        color: #c6c6c6;
        > i {
          font-size: var(--gct-ant-font-size);
        }
      }
    }

    // 空数据样式
    :deep(.ant-empty) {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .ant-empty-image {
        height: 114px;
      }
      .ant-empty-description {
        font-weight: 400;
        font-size: 14px;
        color: #8b8b8b;
      }
    }
  }
</style>
