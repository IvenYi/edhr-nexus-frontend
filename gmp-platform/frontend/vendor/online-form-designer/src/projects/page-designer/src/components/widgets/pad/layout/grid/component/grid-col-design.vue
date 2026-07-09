<template>
  <a-col
    v-if="!isNewDesigner"
    :span="widget!.props.span"
    :style="{
      minHeight: `${!widget?.children?.length ? '104px' : 'auto'}`,
    }"
    @click.stop="setSelectedWidget(widget, scope)"
  >
    <div
      ref="colRef"
      class="h100%"
      :class="['grid-col', isWidgetSelected ? 'is-selected' : null]"
      :style="wrapperStyle"
    >
      <drag-widget-group
        :parent-drag-widgets="widget?.children"
        :parentWidget="widget"
        showPlaceholder
      />
      <suspension
        :rootRef="colRef"
        v-if="isWidgetSelected"
        :layout="['upper']"
        :parent-widget="parentWidget"
      />
    </div>
  </a-col>
  <slot
    v-if="isNewDesigner === true"
    :parentWidget="widget"
    :children="widget?.children"
    :config="{ direction: 'horizontal' }"
  ></slot>
</template>

<script setup lang="ts">
  import { inject, ref } from 'vue';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';
  import { SCOPE } from '/@page-designer/enum';
  import { widgetWrapperProps, useWidget } from '/@page-designer/hooks/useWidget';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import suspension from '/@page-designer/components/widget-drag/suspension.vue';

  const props = defineProps(widgetWrapperProps);
  const { setSelectedWidget } = useSelectedWidget();
  const { isWidgetSelected } = useWidget(props);
  const { wrapperStyle } = useStyle(props.widget);
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  const colRef = ref();
</script>

<style lang="less" scoped>
  .grid-col {
    position: relative;
    box-sizing: border-box;
    // min-height: 32px !important;
    // padding: 12px;
    border: 2px dashed #f3f4f7;
    // outline: #ccc dashed 1px;

    .widget-view-action {
      display: flex;
      position: absolute;
      z-index: 11;
      top: -1px;
      right: 0;
      // bottom: 0;
      align-items: center;
      height: 20px;
      padding: 0 4px;
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

  .is-selected {
    border: var(--ant-primary-color) solid 2px;
  }
</style>
