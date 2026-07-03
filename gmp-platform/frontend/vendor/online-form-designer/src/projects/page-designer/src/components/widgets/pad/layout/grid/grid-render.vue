<template>
  <van-row
    :gutter="[widget.props.gutter || 0, 0]"
    :style="{ height: widget.style.height ? `${widget.style.height}px` : 'auto', overflow: widget.style.height ? 'auto' : '' }"
  >
    <!-- <van-col :span="col.props.span" v-for="(col, index) in childrenSpan" :key="col.id">
      <slot :children="col.children"></slot>
    </van-col> -->
    <template v-for="(col, index) in childrenSpan" :key="col.id">
      <GridColRender :widget="col">
        <slot :children="col.children"></slot>
      </GridColRender>
    </template>
  </van-row>
</template>

<script setup lang="ts" name="gct-grid">
  import { Grid } from '/@page-designer/types/mobile';
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
