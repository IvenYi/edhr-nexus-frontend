<template>
  <div class="p-12px h-full flex flex-col">
    <div class="text-12px font-500 flex-none">{{ $t('sys.onlineForm.componentList') }}</div>

    <div
      :id="PaperWidgetDropBoxId"
      @dragover="handleDragOver"
      @drop="handleDrop"
      class="drop-box__widget mt-12px flex-1"
    >
      <span v-if="!sheetReadonly"> {{ $t('sys.onlineForm.dragComponentToThisArea') }} </span>

      <div>
        <div
          class="widget-item"
          :class="{
            hover: hoverData.refId === widget.id,
          }"
          v-for="widget in widgetList"
          :key="widget.id"
          @mouseenter.stop="handleWidgetHover(widget)"
          @mouseleave.stop="handleWidgetLeave"
        >
          <div @click="handleWidgetClick(widget)">
            <i class="iconfont" :class="widget.icon"></i>
            <span> {{ widget.name }}</span>
          </div>
          <i
            v-if="!sheetReadonly"
            class="iconfont icon-shanchu2"
            @click.stop="handleRemovePaperWidget(widget.id)"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType } from '/@online-form/views/designer/enums';
  import { PaperWidgetDropBoxId } from '/@online-form/views/designer/constants';
  import { TransferType, useDrop } from '../base/drag/use-drop';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  const {
    paper,
    setPanelData,
    panelData,
    addPaperWidget,
    removePaperWidget,
    hoverData,
    setHoverData,
    sheetReadonly,
  } = useSpreadSheet();

  const info = computed<
    | {
        type: PanelType;
        pos: 'header' | 'footer';
      }
    | undefined
  >(() => {
    if (panelData.type === PanelType.PaperHeader) {
      return {
        type: PanelType.PaperHeaderWidget,
        pos: 'header',
      };
    }

    if (panelData.type === PanelType.PaperFooter) {
      return {
        type: PanelType.PaperFooterWidget,
        pos: 'footer',
      };
    }
  });

  const widgetList = computed(() => {
    if (panelData.type === PanelType.PaperHeader) {
      return paper.value.paperHeaderWidgets;
    }
    if (panelData.type === PanelType.PaperFooter) {
      return paper.value.paperFooterWidgets;
    }
    return [];
  });

  const { handleDragOver, handleDrop } = useDrop([TransferType.Widget], {
    onWidgetDrop(widgetMeta) {
      if (info.value) {
        addPaperWidget(info.value.pos, widgetMeta);
      }
    },
  });

  const handleWidgetClick = (w: PaperWidget.BasicSchema) => {
    if (info.value) {
      setPanelData({
        type: info.value.type,
        refId: w.id,
      });
    }
  };

  const handleWidgetHover = (w: PaperWidget.BasicSchema) => {
    if (info.value) {
      setHoverData({
        type: info.value.type,
        refId: w.id,
      });
    }
  };

  const handleWidgetLeave = () => {
    if (info.value) {
      setHoverData({
        type: info.value.type,
        refId: undefined,
      });
    }
  };

  const handleRemovePaperWidget = (id) => {
    if (info.value) {
      removePaperWidget(info.value.pos, id);
    }
  };
</script>

<style lang="less" scoped>
  .drop-box__widget {
    background: #fbfbfc;
    border-radius: 4px;
    border: 1px dashed #e0e3ea;
    padding: 20px 12px 12px 12px;
    height: 100%;

    & > span {
      font-size: 14px;
      color: #c3c3c3;
      text-align: center;
      display: block;

      & + div:has(div.widget-item) {
        margin-top: 12px;
      }
    }
  }

  .widget-item {
    height: 34px;
    background: #f2f4f7;
    border-radius: 4px;
    padding: 4px 6px 4px;
    display: flex;
    position: relative;
    overflow: hidden;
    &:not(:first-child) {
      margin-top: 8px;
    }

    &:hover,
    &.hover {
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        pointer-events: none;
        background-color: rgba(from var(--ant-primary-color) r g b / 16%);
      }
    }

    & > div {
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #e8ebf0;
      display: flex;
      align-items: center;
      padding: 0 8px;
      color: #212528;
      font-size: 12px;
      height: 100%;
      flex: 1;
      cursor: pointer;

      .iconfont {
        margin-right: 6px;
        color: #797a7d;
      }
    }
    & > .iconfont {
      margin-left: 5px;
      color: #797a7d;
      cursor: pointer;
    }
  }
</style>
