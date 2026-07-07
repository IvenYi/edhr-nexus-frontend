<template>
  <div class="h-full flex flex-col online-form__designer-panel hosted-properties-panel">
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
        >
          {{ item.title }}
        </a-breadcrumb-item>
      </a-breadcrumb>
      <div v-else class="panel-title">{{ $t('sys.edhr.formAttr') }}</div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <PanelPaper v-if="panelData.type === PanelType.Paper" />
      <template v-else-if="panelData.type === PanelType.Cell">
        <PanelMultiCells v-if="currentMultiCells" />
        <PanelCell v-else />
      </template>
      <PanelPaperWidgetGroup
        v-else-if="[PanelType.PaperFooter, PanelType.PaperHeader].includes(panelData.type!)"
      />
      <PanelPaperWidget
        v-else-if="
          [
            PanelType.PaperWidget,
            PanelType.PaperFooterWidget,
            PanelType.PaperHeaderWidget,
          ].includes(panelData.type!)
        "
        :position="position"
      />
      <div v-else class="hosted-properties-panel__empty">
        {{ $t('sys.onlineForm.componentProperties') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import PanelCell from '/@online-form/views/designer/modules/panel/panel-cell.vue';
  import PanelMultiCells from '/@online-form/views/designer/modules/panel/panel-multi-cells.vue';
  import PanelPaper from '/@online-form/views/designer/modules/panel/panel-paper.vue';
  import PanelPaperWidget from '/@online-form/views/designer/modules/panel/panel-paper-widget.vue';
  import PanelPaperWidgetGroup from '/@online-form/views/designer/modules/panel/panel-paper-widget-group.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType } from '/@online-form/views/designer/enums';

  const { panelData, setPanelData, currentCell, currentMultiCells } = useSpreadSheet();

  const position = computed(() => {
    if (panelData.type === PanelType.PaperWidget) {
      return 'paper';
    }
    if (panelData.type === PanelType.PaperHeaderWidget) {
      return 'header';
    }
    return 'footer';
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
        key: PanelType.Cell,
        title: $t('sys.onlineForm.cell'),
        visible: [PanelType.Cell].includes(panelData.type),
      },
    ].filter((item) => item.visible);
  });

  const handleNav = ({ key }, index: number) => {
    if (index === breadcrumbList.value.length - 1) return;
    setPanelData({
      type: key,
    });
  };
</script>

<style lang="less" scoped>
  .hosted-properties-panel {
    background: #fff;
    height: 100%;
    width: 100%;
    overflow: auto;

    .ant-breadcrumb {
      height: 42px;
      border-bottom: 1px solid #e0e3ea;
      font-size: 12px;
      display: flex;
      align-items: center;
      padding-left: 12px;

      & > span:not(:last-child) :deep(.ant-breadcrumb-link) {
        color: var(--ant-primary-color);
        cursor: pointer;
      }
    }

    .panel-title {
      height: 42px;
      display: flex;
      align-items: center;
      padding-left: 12px;
      border-bottom: 1px solid #e0e3ea;
      font-size: 12px;
      font-weight: 500;
    }

    &__empty {
      padding: 18px 12px;
      color: #8c8f98;
      font-size: 12px;
      line-height: 20px;
    }
  }
</style>
