<template>
  <div
    v-if="!isNewDesigner"
    :style="styleAttr"
    :class="[{ 'is-selected': isWidgetSelected }, 'tab-pane-content']"
    :data-placeholder="!widget?.children?.length ? $t('sys.pageDesigner.dragWidgetHere') : ''"
    @click.stop="setSelectedWidget(widget, scope)"
  >
    <drag-widget-group
      :parent-drag-widgets="widget?.children"
      :parentWidget="widget"
      :showPlaceholder="true"
    />
    <div class="widget-view-action" v-if="isWidgetSelected">
      <div class="mask"></div>
      <i class="iconfont icon-fuzujian opt-icon" @click.stop="selectParentWidget"></i>
    </div>
  </div>
  <slot
    v-if="isNewDesigner && widget"
    :parentWidget="widget"
    :children="widget.children"
    :config="{ direction: 'horizontal' }"
  ></slot>
</template>
<script setup lang="ts">
  import { computed, inject } from 'vue';
  import { SCOPE } from '/@page-designer/enum';
  import { widgetWrapperProps, useWidget } from '/@page-designer/hooks/useWidget';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';

  const props = defineProps(widgetWrapperProps);
  const { isWidgetSelected } = useWidget(props);
  const { setSelectedWidget } = useSelectedWidget();
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  const selectParentWidget = () => {
    setSelectedWidget(props.parentWidget, scope);
  };

  const styleAttr = computed(() => {
    const tab = props.widget;
    const { defineMode, color } = (tab?.style?.background as any) || {};
    const bgColor = defineMode === 'system' ? 'var(--van-primary-color)' : color;
    return {
      minHeight: 'inherit',
      backgroundColor: !tab?.children?.length ? '#fafafa' : bgColor || 'transparent',
      height: tab?.style.height ? tab?.style.height + 'px' : 'auto',
      width: tab?.style.width ? tab?.style.width + 'px' : 'auto',
      paddingTop: (tab?.style.paddingTop || 0) + 'px',
      paddingRight: (tab?.style.paddingRight || 0) + 'px',
      paddingBottom: (tab?.style.paddingBottom || 0) + 'px',
      paddingLeft: (tab?.style.paddingLeft || 0) + 'px',
    };
  });
</script>
<style lang="scss" scoped>
  .is-selected {
    border: 2px solid var(--ant-primary-color) !important;
    // background-color: rgb(13 170 156 / 10%) !important;
  }

  .tab-pane-content {
    position: relative;

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
      color: #bfbfbf;
      font-size: 16px;
      pointer-events: none;
    }

    .widget-view-action {
      display: flex;
      position: absolute;
      z-index: 11;
      top: -30px;
      right: -1px;
      // bottom: 0;
      align-items: center;
      height: 30px;
      padding: 5px 8px;
      // padding: 0 4px;
      background-color: var(--ant-primary-color);
      .mask {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.2);
        z-index: -1;
      }

      .iconfont {
        color: #fff;
        font-size: 14px;
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-radius: 2px;
        &:hover {
          background-color: rgba(255, 255, 255, 0.48);
        }
      }

      .opt-icon {
        // margin: 4px;
        // color: var(--ant-primary-color);
        // font-size: 14px;
        // cursor: pointer;
      }
    }
  }
</style>
