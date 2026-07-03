<template>
  <a-col
    v-if="isNewDesigner !== true"
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
        v-if="isWidgetSelected"
        :rootRef="colRef"
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
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { widgetWrapperProps, useWidget } from '/@page-designer/hooks/useWidget';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import suspension from '/@page-designer/components/widget-drag/suspension.vue';

  const props = defineProps(widgetWrapperProps);
  const { setSelectedWidget } = useSelectedWidget();
  const { isWidgetSelected } = useWidget(props);
  const colRef = ref();
  const { wrapperStyle } = useStyle(props.widget);
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  // const selectParentWidget = () => {
  //   setSelectedWidget(props.parentWidget, scope);
  // };
</script>

<style lang="less" scoped>
  .grid-col {
    position: relative;
    box-sizing: border-box;
    // min-height: 32px !important;
    // padding: 12px;
    border: 2px dashed #f3f4f7;
    // outline: transparent dashed 1px;

    .widget-view-action {
      display: flex;
      // position: absolute;
      // z-index: 11;
      // top: -10px;
      // right: 0;
      // bottom: 0;
      align-items: center;
      height: 30px;
      padding: 5px 8px;
      background-color: var(--ant-primary-color);
      line-height: 20px;
      border-radius: 2px 2px 0 0;
      color: #fff;
      cursor: pointer;

      // .opt-icon {
      //   margin: 4px;
      //   font-size: 14px;
      // }
    }
  }

  .is-selected {
    border: var(--ant-primary-color) solid 2px;
    // outline: var(--ant-primary-color) solid 2px;
  }
</style>
