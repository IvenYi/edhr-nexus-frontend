<template>
  <div :class="`paper-${position}`" @click="goPanel" @dragover="handleDragOver" @drop="handleDrop">
    <span class="tip">{{ areaConfigMap[position].tip }}</span>

    <drag-box
      v-for="w in areaConfigMap[position].widgets"
      :key="w.id"
      :initial-layout="w.layout"
      :resizable="w.resizable"
      :selected="
        [PanelType.PaperHeaderWidget, PanelType.PaperFooterWidget].includes(panelData.type) &&
        w.id === panelData.refId
      "
      :hover="
        [PanelType.PaperHeaderWidget, PanelType.PaperFooterWidget].includes(hoverData.type) &&
        w.id === hoverData.refId
      "
      type="widget"
      :allow-leave="false"
      :disabled="sheetReadonly"
      @layout-change="(layout) => handleLayoutChange(layout, w)"
      @mousedown.stop="
        () => {
          handleWidgetClick(w);
        }
      "
      @mouseenter.stop="
        () => {
          handleWidgetHover(w);
        }
      "
      @mouseleave.stop="handleWidgetLeave"
      @click.stop="() => {}"
    >
      <component :is="widgetDesignMap[w.type]" :widget="w" :position="position" />
    </drag-box>
  </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import DragBox from '/@online-form/views/designer/modules/base/drag-box.vue';
  import { PanelType } from '/@online-form/views/designer/enums';
  import { asyncImportWidgetDesign } from '/@online-form/views/__widgets__';
  import { computed } from 'vue';
  import { message } from 'ant-design-vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
  import { TransferType, useDrop } from '../base/drag/use-drop';

  const props = defineProps<{
    position: 'header' | 'footer';
  }>();

  const { paper, panelData, setPanelData, hoverData, setHoverData, sheetReadonly, addPaperWidget } =
    useSpreadSheet();
  const widgetDesignMap = asyncImportWidgetDesign();

  const areaConfigMap = computed(() => {
    return {
      header: {
        tip: $t('sys.onlineForm.headerSetting'),
        widgets: paper.value.paperHeaderWidgets,
        panel: PanelType.PaperHeader,
        widgetPanel: PanelType.PaperHeaderWidget,
      },
      footer: {
        tip: $t('sys.onlineForm.footerSetting'),
        widgets: paper.value.paperFooterWidgets,
        panel: PanelType.PaperFooter,
        widgetPanel: PanelType.PaperFooterWidget,
      },
    };
  });

  const { handleDragOver, handleDrop } = useDrop([TransferType.Widget], {
    onWidgetDrop(widgetMeta) {
      if (sheetReadonly.value) {
        return;
      }
      if (
        widgetMeta.dragToPos.includes(PanelType.PaperHeader) ||
        widgetMeta.dragToPos.includes(PanelType.PaperFooter)
      ) {
        addPaperWidget(props.position, widgetMeta);
      } else {
        message.warn(`${widgetMeta.name}组件不能拖入页眉页脚`);
      }
    },
  });

  const goPanel = () =>
    setPanelData({
      type: areaConfigMap.value[props.position].panel,
    });

  const handleWidgetClick = (w: PaperWidget.BasicSchema) => {
    setPanelData({
      type: areaConfigMap.value[props.position].widgetPanel,
      refId: w.id,
    });
  };

  const handleWidgetHover = (w: PaperWidget.BasicSchema) => {
    setHoverData({
      type: areaConfigMap.value[props.position].widgetPanel,
      refId: w.id,
    });
  };

  const handleWidgetLeave = () => {
    setHoverData({
      type: areaConfigMap.value[props.position].widgetPanel,
      refId: undefined,
    });
  };

  const handleLayoutChange = (layout: any, widget: PaperWidget.BasicSchema) => {
    Object.assign(widget.layout, layout ?? {});
  };
</script>

<style></style>
