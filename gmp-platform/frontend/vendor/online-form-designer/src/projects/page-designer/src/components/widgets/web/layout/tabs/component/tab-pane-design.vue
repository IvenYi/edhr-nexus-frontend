<template>
  <div
    v-if="!isNewDesigner"
    :style="styleAttr"
    :class="[{ 'is-selected': isWidgetSelected }, 'tab-pane-content']"
    @click.stop="setSelectedWidget(widget, scope)"
  >
    <drag-widget-group
      :parent-drag-widgets="widget?.children"
      :parentWidget="widget"
      :show-placeholder="true"
    />
    <div class="widget-view-action" v-if="isWidgetSelected">
      <i class="iconfont icon-fuzujian opt-icon" @click.stop="selectParentWidget"></i>
    </div>
  </div>
  <div v-if="isNewDesigner && widget" :style="styleAttr">
    <slot
      :parentWidget="widget"
      :children="widget.children"
      :config="{ direction: 'horizontal' }"
    ></slot>
  </div>
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
    return {
      minHeight: 'inherit',
      backgroundColor: !tab?.children?.length
        ? '#fafafa'
        : tab?.style.backgroundColor || 'transparent',
      height: tab?.style.height ? tab?.style.height + 'px' : 'auto',
      width: tab?.style.width ? tab?.style.width + 'px' : 'auto',
      paddingTop: (tab?.style.paddingTop || 0) + 'px',
      paddingRight: (tab?.style.paddingRight || 0) + 'px',
      paddingBottom: (tab?.style.paddingBottom || 0) + 'px',
      paddingLeft: (tab?.style.paddingLeft || 0) + 'px',
    };
  });
</script>
<style lang="less" scoped>
  .is-selected {
    border: 1px solid var(--ant-primary-color) !important;
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
      // display: flex;
      position: absolute;
      z-index: 11;
      top: -21px;
      right: 0;
      bottom: 0;
      align-items: center;
      height: 20px;
      // padding: 0 4px;
      background-color: var(--ant-primary-color-deprecated-f-12);
      line-height: 20px;

      .opt-icon {
        margin: 4px;
        color: var(--ant-primary-color);
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
</style>
