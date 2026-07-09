<template>
  <div
    class="paper-canvas"
    :style="{
      'padding-left': `${paper.padding.l}mm`,
      'padding-right': `${paper.padding.r}mm`,
      'padding-top': `${paper.padding.t}mm`,
      'padding-bottom': `${paper.padding.b}mm`,
    }"
    @click.stop="setPanelData({ type: PanelType.Paper })"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <div class="paper-canvas__content">
      <drag-box
        v-for="widget in paper.paperWidgets"
        :key="widget.id"
        :initial-layout="normalizedLayout(widget)"
        :resizable="widget.resizable"
        :selected="panelData.type === PanelType.PaperWidget && widget.id === panelData.refId"
        :hover="hoverData.type === PanelType.PaperWidget && widget.id === hoverData.refId"
        type="widget"
        :disabled="sheetReadonly"
        @layout-change="(layout) => handleLayoutChange(layout, widget)"
        @mousedown.stop="setPanelData({ type: PanelType.PaperWidget, refId: widget.id })"
        @mouseenter.stop="setHoverData({ type: PanelType.PaperWidget, refId: widget.id })"
        @mouseleave.stop="setHoverData({ type: PanelType.PaperWidget, refId: undefined })"
      >
        <paper-widget-design :paper-widget="widget" />
      </drag-box>
    </div>
    <padding-line />
  </div>
</template>

<script setup lang="ts">
  import { PanelType } from '/@online-form/views/designer/enums';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { message } from 'ant-design-vue';
  import DragBox from '../base/drag-box.vue';
  import PaddingLine from '../base/padding-line.vue';
  import PaperWidgetDesign from '/@online-form/views/__widgets__/paper-widget-design.vue';
  import { TransferType, useDrop } from '../base/drag/use-drop';

  const { paper, panelData, hoverData, sheetReadonly, setPanelData, setHoverData } =
    useSpreadSheet();

  const normalizedLayout = (widget: PaperWidget.BasicSchema) => ({
    width: widget.layout.width ?? 120,
    height: widget.layout.height ?? 28,
    top: widget.layout.top ?? 0,
    left: widget.layout.left ?? 0,
  });

  const { handleDragOver, handleDrop } = useDrop([TransferType.Widget], {
    onWidgetDrop(widgetMeta, _opts, event) {
      if (sheetReadonly.value || !event) return;
      if (!widgetMeta.dragToPos.includes(PanelType.Paper)) {
        message.warn(`${widgetMeta.name}组件不能拖入纸张画布`);
        return;
      }
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      widgetMeta.layout.left = event.clientX - rect.left - (widgetMeta.layout.width ?? 0) / 2;
      widgetMeta.layout.top = event.clientY - rect.top - (widgetMeta.layout.height ?? 0) / 2;
      if (!paper.value.paperWidgets) paper.value.paperWidgets = [];
      paper.value.paperWidgets.push(widgetMeta);
      setPanelData({ type: PanelType.PaperWidget, refId: widgetMeta.id });
    },
  });

  const handleLayoutChange = (
    layout: PaperWidget.BasicSchema['layout'],
    widget: PaperWidget.BasicSchema,
  ) => {
    Object.assign(widget.layout, layout ?? {});
  };
</script>

<style lang="less" scoped>
  .paper-canvas {
    position: relative;
    min-height: var(--paper-height);
    width: var(--paper-width);
    background: #fff;
    box-shadow: 0 0 4px rgb(0 0 0 / 20%);
    box-sizing: border-box;

    &__content {
      position: relative;
      width: 100%;
      min-height: 100%;
    }
  }
</style>
