<template>
  <div
    v-if="!isNewDesigner"
    class="gct-widget layout-container-design relative box-border overflow-visible"
    :style="{
      'text-align': textAlign,
    }"
  >
    <drag-widget-group
      :style="{ marginLeft: -margin / 2 + 'px', marginRight: -margin / 2 + 'px' }"
      :parent-drag-widgets="widget.children"
      :parentWidget="widget"
      :styleProp="{
        marginLeft: margin / 2 + 'px',
        marginRight: margin / 2 + 'px',
        display: 'inline-block',
      }"
      :show-placeholder="true"
      :data-placeholder="!widget.children?.length ? $t('sys.pageDesigner.dragWidgetHere') : ''"
    />
  </div>
  <LayoutContainerDesign2 v-if="isNewDesigner" v-bind="props">
    <template #default="args">
      <slot v-bind="args"></slot>
    </template>
  </LayoutContainerDesign2>
</template>

<script name="gct-layout-container" setup lang="ts">
  import { toRefs } from 'vue';
  import { LayoutContainer } from '/@page-designer/types/web';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';
  import { LayoutContainerDesign2 } from './layout-container-design2';

  const props = defineProps<{ widget: LayoutContainer; isNewDesigner: boolean }>();
  const { margin, textAlign } = toRefs(props.widget.props);
</script>

<style lang="scss">
  @include b(gct-layout-container-design) {
    height: 100%;
    min-height: 60px;
  }
</style>

<style lang="less" scoped>
  .gct-widget {
    height: 100%;
    min-height: 60px;
    border: 1px solid #f1f1f1;
    // background-color: #fff;
  }

  .layout-container-design {
    position: relative;

    &.is-empty {
      &::before {
        content: attr(data-placeholder);
        display: flex;
        position: absolute;
        align-items: center;
        justify-content: center;
        background-color: #f9f9f9;
        color: #bfbfbf;
        font-size: 16px;
        pointer-events: none;
        inset: 0;
      }
    }
  }
</style>
