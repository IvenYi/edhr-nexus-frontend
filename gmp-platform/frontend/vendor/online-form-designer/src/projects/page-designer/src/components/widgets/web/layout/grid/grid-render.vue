<template>
  <div class="overflow-hidden">
    <a-row
      :gutter="[widget.props.gutter || 0, 0]"
      :style="{
        height: widget.style.height ? `${widget.style.height}px` : 'auto',
      }"
    >
      <template v-for="(col, index) in childrenSpan" :key="col.id">
        <GridColRender
          :widget="col"
          :class="{
            'h100% overflow-y-auto': !!widget.style.height,
            'overflow-y-hidden': !widget.style.height,
          }"
          class="overflow-x-auto"
        >
          <slot :children="col.children"></slot>
        </GridColRender>
      </template>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="gct-grid">
  import { Grid } from '/@page-designer/types/web';
  import { toRefs, computed } from 'vue';
  import { tableWidgetToShow } from '/@web-render/render/Event/Dependency/useDependencyToShow';
  import GridColRender from './component/grid-col-render.vue';

  const props = defineProps<{ widget: Grid }>();
  const { children } = toRefs(props.widget);
  const childrenSpan = computed(() => children.value.filter((i) => !i.props.hidden));
  children.value.forEach((i) => {
    tableWidgetToShow(i, (f) => {
      i.props.hidden = f;
    });
  });
</script>

<style lang="less" scoped></style>
